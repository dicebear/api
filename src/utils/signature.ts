import { createHmac, timingSafeEqual } from 'node:crypto';

export type SignatureFailure =
  'missing' | 'invalid' | 'invalid-expiry' | 'expired';

export type SignatureResult =
  | { ok: true; expiresAt: number | null }
  | { ok: false; reason: SignatureFailure };

// The signature is lowercase hex and always the last parameter. With options
// in the query string, that leaves one spelling per signed URL. Each extra
// spelling would be another URL that passes for the same avatar, which lets a
// single leaked URL miss a cache as often as someone likes. The path variant
// is the exception: it signs the decoded segment, so it works however a
// client such as Gravatar encodes it, and any percent-encoded spelling of a
// signed path passes as well. That still renders only the avatar that was
// signed, but a CDN in front sees a new cache key for each spelling.
//
// The URL itself is split with indexOf and lastIndexOf, without a regular
// expression, so a long URL costs linear time. Only the short parts below go
// through one, anchored at both ends.
const SIGNATURE_PATTERN = /^[0-9a-f]{64}$/;

// Ten digits reach the year 2286 and keep millisecond timestamps out, which
// would otherwise pass as an expiry tens of thousands of years away.
const EXPIRY_PATTERN = /^\d{1,10}$/;

function decode(value: string): string {
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
}

/**
 * Finds the `exp` values the way the query parser will see them. It decodes
 * each key, with `+` as a space, so `%65xp` counts as `exp` too.
 */
function findExpiries(parameters: string): string[] {
  const expiries: string[] = [];

  for (const segment of parameters.split('&')) {
    const separator = segment.indexOf('=');
    const key = separator === -1 ? segment : segment.slice(0, separator);

    if (decode(key.replace(/\+/g, ' ')) === 'exp') {
      expiries.push(separator === -1 ? '' : segment.slice(separator + 1));
    }
  }

  return expiries;
}

function digest(url: string, secret: string): Buffer {
  return createHmac('sha256', secret).update(url).digest();
}

/**
 * Signs a path with its options, such as `/11.x/thumbs/svg?seed=Felix` or
 * `/11.x/thumbs/png/seed=Felix`. The result goes into the `sig` parameter.
 */
export function signUrl(url: string, secret: string): string {
  return digest(url, secret).toString('hex');
}

function check(
  signedUrl: string,
  signature: string,
  parameters: string,
  secrets: readonly string[],
  now: number,
): SignatureResult {
  if (!SIGNATURE_PATTERN.test(signature)) {
    return { ok: false, reason: 'invalid' };
  }

  const provided = Buffer.from(signature, 'hex');

  let matches = false;

  // Every secret is tried, so the timing does not tell which one matched.
  for (const secret of secrets) {
    if (timingSafeEqual(digest(signedUrl, secret), provided)) {
      matches = true;
    }
  }

  if (!matches) {
    return { ok: false, reason: 'invalid' };
  }

  const expiries = findExpiries(parameters);
  const [expiry] = expiries;

  if (expiry === undefined) {
    return { ok: true, expiresAt: null };
  }

  // The expiry is covered by the signature, so a malformed one is a mistake
  // of whoever signed the URL. Refuse it instead of guessing.
  if (expiries.length > 1 || !EXPIRY_PATTERN.test(expiry)) {
    return { ok: false, reason: 'invalid-expiry' };
  }

  const expiresAt = Number(expiry);

  if (now >= expiresAt) {
    return { ok: false, reason: 'expired' };
  }

  return { ok: true, expiresAt };
}

/**
 * Checks a URL that carries its options in the query string. The signed
 * string is everything in front of `sig`, in the order and encoding the client
 * sent, so nothing has to be normalized on either side.
 */
export function verifySignedUrl(
  rawUrl: string,
  secrets: readonly string[],
  now = Math.floor(Date.now() / 1000),
): SignatureResult {
  const queryStart = rawUrl.indexOf('?');

  if (queryStart === -1) {
    return { ok: false, reason: 'missing' };
  }

  // The first parameter follows the `?` and every later one a `&`, so the
  // last parameter starts after whichever of the two comes last.
  const lastSeparator = Math.max(queryStart, rawUrl.lastIndexOf('&'));

  if (!rawUrl.startsWith('sig=', lastSeparator + 1)) {
    return { ok: false, reason: 'missing' };
  }

  return check(
    rawUrl.slice(0, lastSeparator),
    rawUrl.slice(lastSeparator + 5),
    lastSeparator === queryStart
      ? ''
      : rawUrl.slice(queryStart + 1, lastSeparator),
    secrets,
    now,
  );
}

/**
 * Checks a URL that carries its options in the last path segment, such as
 * `/11.x/thumbs/png/seed=Felix&sig=…`. This form exists for clients that drop
 * the query string, Gravatar among them, so `sig` and `exp` live in that
 * segment too. The router decodes the segment before the options are read,
 * and the signature covers that decoded form. Whether a client sends `seed=`
 * or `seed%3D` makes no difference.
 */
export function verifySignedPath(
  rawUrl: string,
  secrets: readonly string[],
  now = Math.floor(Date.now() / 1000),
): SignatureResult {
  const queryStart = rawUrl.indexOf('?');
  const path = queryStart === -1 ? rawUrl : rawUrl.slice(0, queryStart);
  const segmentStart = path.lastIndexOf('/') + 1;
  const options = decode(path.slice(segmentStart));
  const lastSeparator = options.lastIndexOf('&');

  if (!options.startsWith('sig=', lastSeparator + 1)) {
    return { ok: false, reason: 'missing' };
  }

  // The API ignores the query string on this route, so nothing in it could be
  // signed. Accepting one anyway would give every URL endless spellings.
  if (queryStart !== -1) {
    return { ok: false, reason: 'invalid' };
  }

  const parameters =
    lastSeparator === -1 ? '' : options.slice(0, lastSeparator);

  return check(
    path.slice(0, segmentStart) + parameters,
    options.slice(lastSeparator + 5),
    parameters,
    secrets,
    now,
  );
}
