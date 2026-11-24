import qs from 'qs';

import { config } from '../config.js';

export class QueryStringRangeError extends Error {
  statusCode = 400;
  code = 'FST_ERR_VALIDATION';

  constructor(message: string) {
    super(message);
    this.name = 'QueryStringRangeError';
  }
}

/** Decodes one key or value the way qs does, keeping it raw when malformed. */
function decodeComponent(raw: string): string {
  const spaced = raw.replace(/\+/g, ' ');

  try {
    return decodeURIComponent(spaced);
  } catch {
    return spaced;
  }
}

/**
 * Takes the `seed` parameters out of a query string. A seed is free text, so
 * its commas are not list separators, and qs must not count them against the
 * array limit: a seed with a few hundred commas is still a valid seed.
 */
function splitSeed(str: string): { rest: string; seeds: string[] } {
  const rest: string[] = [];
  const seeds: string[] = [];

  for (const part of str.split('&')) {
    if (part === '') {
      continue;
    }

    const separator = part.indexOf('=');
    const key = separator === -1 ? part : part.slice(0, separator);

    if (decodeComponent(key) === 'seed') {
      seeds.push(
        separator === -1 ? '' : decodeComponent(part.slice(separator + 1)),
      );
    } else {
      rest.push(part);
    }
  }

  return { rest: rest.join('&'), seeds };
}

export function parseQueryString(
  str: string,
  arrayLimit = config.queryString.arrayLimitMin,
  parameterLimit = config.queryString.parameterLimitMin,
): Record<string, unknown> {
  const result = Object.create(null);

  const { rest, seeds } = splitSeed(str);
  let parsed;

  try {
    if (
      rest.split('&').filter(Boolean).length + seeds.length >
      parameterLimit
    ) {
      throw new RangeError(
        `Parameter limit exceeded. Only ${parameterLimit} parameter${parameterLimit === 1 ? '' : 's'} allowed.`,
      );
    }

    parsed = qs.parse(rest, {
      comma: true,
      plainObjects: true,
      arrayLimit,
      parameterLimit,
      throwOnLimitExceeded: true,
      depth: 0,
    });
  } catch (error) {
    if (error instanceof RangeError) {
      throw new QueryStringRangeError(error.message);
    }

    throw error;
  }

  if (seeds.length > 0) {
    // Repeated seeds were joined with a comma before, keep that.
    parsed.seed = seeds.join(',');
  }

  for (const key of Object.keys(parsed)) {
    // Lists are comma separated. With `depth: 0` a bracketed key such as
    // `backgroundColor[]` or `animationSpeed[blink]` stays a literal key that
    // matches no option, so reject it here instead of dropping it silently.
    if (key.includes('[') || key.includes(']')) {
      throw new QueryStringRangeError(
        `Bracket notation is not supported in "${key}". Separate list values with a comma instead.`,
      );
    }

    let value = parsed[key];

    // A seed could be parsed as an array due to commas. In this case convert back to a string.
    if (key === 'seed' && Array.isArray(value)) {
      value = value.join(',');
    }

    // Only add non-empty values
    if (Array.isArray(value)) {
      result[key] = value.filter((v) => v !== '');
    } else if (value !== '' || key === 'seed') {
      result[key] = [value];
    } else {
      result[key] = [];
    }
  }

  return result;
}

export function transformWeightedFields(
  query: Record<string, unknown>,
  weightedFields: Set<string>,
): void {
  for (const key of weightedFields) {
    const value = query[key];
    if (!Array.isArray(value)) continue;

    const hasWeights = value.some(
      (v: unknown) => typeof v === 'string' && v.includes(':'),
    );
    if (!hasWeights) continue;

    const result: Record<string, number> = Object.create(null);

    for (const pair of value) {
      if (typeof pair !== 'string') continue;
      const [name, weight] = pair.split(':');

      if (name) {
        result[name.trim()] = weight !== undefined ? Number(weight) : 1;
      }
    }

    query[key] = result;
  }
}
