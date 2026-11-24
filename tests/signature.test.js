import { test, describe, before } from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import * as path from 'node:path';

import {
  signUrl,
  verifySignedPath,
  verifySignedUrl,
} from '../dist/utils/signature.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const SECRET = 'secret';
const NOW = 1_700_000_000;
const URL = '/11.x/thumbs/svg?seed=Felix&size=64';

const verify = (url, secrets = [SECRET]) => verifySignedUrl(url, secrets, NOW);

describe('signUrl', () => {
  test('returns the HMAC-SHA256 of the URL as hex', () => {
    // The example from the docs, checked against
    // printf '%s' '/11.x/thumbs/svg?seed=Zo%C3%AB&backgroundColor=b6e3f4,c0aede' |
    //   openssl dgst -sha256 -hmac 0123456789abcdef0123456789abcdef
    assert.equal(
      signUrl(
        '/11.x/thumbs/svg?seed=Zo%C3%AB&backgroundColor=b6e3f4,c0aede',
        '0123456789abcdef0123456789abcdef',
      ),
      'e5e07a3e3f33f3eb6973e0492f767aee9d946e07d2d2631aed94130c56c04d05',
    );
  });
});

describe('verifySignedUrl', () => {
  test('accepts a signed URL', () => {
    assert.deepEqual(verify(`${URL}&sig=${signUrl(URL, SECRET)}`), {
      ok: true,
      expiresAt: null,
    });
  });

  test('accepts one spelling per signature', () => {
    const signature = signUrl(URL, SECRET);

    for (const url of [
      `${URL}&sig=${signature.toUpperCase()}`,
      `${URL}?sig=${signature}`,
      `${URL}&sig=${signature}&`,
      `${URL}&sig=${signature}&sig=${signature}`,
      `/11.x/thumbs/svg?sig=${signature}&seed=Felix&size=64`,
      `/11.x/thumbs/svg?seed=Felix&sig=${signature}&size=64`,
    ]) {
      assert.equal(verify(url).ok, false, url);
    }
  });

  test('treats an earlier sig as a signed parameter', () => {
    const url = '/11.x/thumbs/svg?sig=abc&seed=Felix';

    assert.equal(verify(`${url}&sig=${signUrl(url, SECRET)}`).ok, true);
  });

  test('signs the bare path when there is no other parameter', () => {
    const url = '/11.x/thumbs/svg';

    assert.equal(verify(`${url}?sig=${signUrl(url, SECRET)}`).ok, true);
  });

  test('accepts every configured secret', () => {
    const signed = `${URL}&sig=${signUrl(URL, 'old')}`;

    assert.equal(verify(signed, ['new', 'old']).ok, true);
    assert.equal(verify(signed, ['new']).ok, false);
  });

  test('reports a missing signature', () => {
    assert.deepEqual(verify(URL), { ok: false, reason: 'missing' });
    assert.deepEqual(verify('/11.x/thumbs/svg'), {
      ok: false,
      reason: 'missing',
    });
  });

  test('does not decode the parameter name', () => {
    assert.deepEqual(verify(`${URL}&%73ig=${signUrl(URL, SECRET)}`), {
      ok: false,
      reason: 'missing',
    });
  });

  test('rejects a changed parameter', () => {
    const signature = signUrl(URL, SECRET);

    for (const url of [
      `/11.x/thumbs/svg?seed=Aneka&size=64&sig=${signature}`,
      `/11.x/thumbs/svg?size=64&seed=Felix&sig=${signature}`,
      `/11.x/thumbs/png?seed=Felix&size=64&sig=${signature}`,
      `${URL}&flip=horizontal&sig=${signature}`,
    ]) {
      assert.deepEqual(verify(url), { ok: false, reason: 'invalid' });
    }
  });

  test('rejects a raw # that the router would cut the URL at', () => {
    const url = '/11.x/thumbs/svg?seed=user#1234&size=64';

    assert.deepEqual(verify(`${url}&sig=${signUrl(url, SECRET)}`), {
      ok: false,
      reason: 'invalid',
    });

    const encoded = '/11.x/thumbs/svg?seed=user%231234&size=64';

    assert.equal(verify(`${encoded}&sig=${signUrl(encoded, SECRET)}`).ok, true);
  });

  test('rejects a malformed signature', () => {
    for (const signature of ['', 'abc', 'z'.repeat(64), 'a'.repeat(66)]) {
      assert.deepEqual(verify(`${URL}&sig=${signature}`), {
        ok: false,
        reason: 'invalid',
      });
    }
  });

  test('returns the expiry of a URL that is still valid', () => {
    const url = `${URL}&exp=${NOW + 60}`;

    assert.deepEqual(verify(`${url}&sig=${signUrl(url, SECRET)}`), {
      ok: true,
      expiresAt: NOW + 60,
    });
  });

  test('rejects an expiry without a value', () => {
    const url = `${URL}&exp`;

    assert.deepEqual(verify(`${url}&sig=${signUrl(url, SECRET)}`), {
      ok: false,
      reason: 'invalid-expiry',
    });
  });

  test('rejects an expired URL', () => {
    for (const expiry of [NOW, NOW - 1]) {
      const url = `${URL}&exp=${expiry}`;

      assert.deepEqual(verify(`${url}&sig=${signUrl(url, SECRET)}`), {
        ok: false,
        reason: 'expired',
      });
    }
  });

  test('rejects an expiry that was added or changed afterwards', () => {
    const signature = signUrl(`${URL}&exp=${NOW - 60}`, SECRET);

    assert.deepEqual(verify(`${URL}&exp=${NOW + 60}&sig=${signature}`), {
      ok: false,
      reason: 'invalid',
    });
    assert.deepEqual(verify(`${URL}&sig=${signature}`), {
      ok: false,
      reason: 'invalid',
    });
  });

  test('reads an encoded expiry key', () => {
    for (const key of ['%65xp', '%65%78%70', 'e%78p']) {
      const url = `${URL}&${key}=${NOW - 60}`;

      assert.deepEqual(verify(`${url}&sig=${signUrl(url, SECRET)}`), {
        ok: false,
        reason: 'expired',
      });
    }

    const url = `${URL}&exp=${NOW + 60}&%65xp=${NOW + 60}`;

    assert.deepEqual(verify(`${url}&sig=${signUrl(url, SECRET)}`), {
      ok: false,
      reason: 'invalid-expiry',
    });
  });

  test('leaves an encoded exp inside a query value alone', () => {
    const url = `/11.x/thumbs/svg?seed=Felix%26exp%3D${NOW - 60}`;

    assert.deepEqual(verify(`${url}&sig=${signUrl(url, SECRET)}`), {
      ok: true,
      expiresAt: null,
    });
  });

  test('rejects a malformed or repeated expiry', () => {
    for (const expiry of [
      '',
      'soon',
      '-1',
      '1e12',
      `${(NOW + 60) * 1000}`,
      `${NOW + 60}&exp=1`,
    ]) {
      const url = `${URL}&exp=${expiry}`;

      assert.deepEqual(verify(`${url}&sig=${signUrl(url, SECRET)}`), {
        ok: false,
        reason: 'invalid-expiry',
      });
    }
  });
});

describe('verifySignedPath', () => {
  const PREFIX = '/11.x/thumbs/png/';
  const verifyPath = (url) => verifySignedPath(url, [SECRET], NOW);

  // Signs the options as the API reads them and appends `sig` to them. With
  // `encode`, the whole segment is encoded, as the Gravatar recipe does it.
  const signPath = (options, { encode = false, secret = SECRET } = {}) => {
    const sig = signUrl(`${PREFIX}${options}`, secret);
    const segment = options ? `${options}&sig=${sig}` : `sig=${sig}`;

    return `${PREFIX}${encode ? encodeURIComponent(segment) : segment}`;
  };

  test('accepts a signed path', () => {
    assert.deepEqual(verifyPath(signPath('seed=Felix&size=64')), {
      ok: true,
      expiresAt: null,
    });
  });

  test('accepts the encoded segment of the Gravatar recipe', () => {
    const url = signPath('seed=Felix&size=64', { encode: true });

    assert.ok(url.includes('seed%3DFelix%26size%3D64%26sig%3D'));
    assert.equal(verifyPath(url).ok, true);
  });

  test('signs the decoded options, however the client encodes them', () => {
    const sig = signUrl(`${PREFIX}seed=Zoë`, SECRET);

    for (const segment of [
      `seed=Zo%C3%AB&sig=${sig}`,
      `seed%3DZo%C3%AB%26sig%3D${sig}`,
    ]) {
      // The router decodes the segment once, so `Zo%C3%AB` arrives as `Zoë`.
      assert.equal(verifyPath(`${PREFIX}${segment}`).ok, true, segment);
    }
  });

  test('accepts a signature without other options', () => {
    assert.equal(verifyPath(signPath('')).ok, true);
  });

  test('reports a missing signature', () => {
    assert.deepEqual(verifyPath(`${PREFIX}seed=Felix`), {
      ok: false,
      reason: 'missing',
    });
  });

  test('ignores a signature in the query string', () => {
    const url = `${PREFIX}seed=Felix`;

    assert.deepEqual(verifyPath(`${url}?sig=${signUrl(url, SECRET)}`), {
      ok: false,
      reason: 'missing',
    });
  });

  test('rejects a query string next to a signed path', () => {
    for (const query of ['?size=64', '?']) {
      assert.deepEqual(verifyPath(`${signPath('seed=Felix')}${query}`), {
        ok: false,
        reason: 'unexpected-query',
      });
    }
  });

  test('rejects a raw # that the router would cut the path at', () => {
    // Unencoded, the router reads `seed=user` and drops the rest.
    assert.deepEqual(verifyPath(signPath('seed=user#1234&size=64')), {
      ok: false,
      reason: 'invalid',
    });

    assert.equal(
      verifyPath(signPath('seed=user#1234&size=64', { encode: true })).ok,
      true,
    );
  });

  test('rejects a changed option or another style', () => {
    const url = signPath('seed=Felix');

    for (const changed of [
      url.replace('Felix', 'Aneka'),
      url.replace('/thumbs/', '/lorelei/'),
      url.replace('/png/', '/jpg/'),
      url.replace('seed=Felix&', 'seed=Felix&size=64&'),
    ]) {
      assert.deepEqual(
        verifyPath(changed),
        { ok: false, reason: 'invalid' },
        changed,
      );
    }
  });

  test('accepts one spelling per signature', () => {
    const sig = signUrl(`${PREFIX}seed=Felix`, SECRET);

    for (const url of [
      `${PREFIX}seed=Felix&sig=${sig.toUpperCase()}`,
      `${PREFIX}sig=${sig}&seed=Felix`,
      `${PREFIX}seed=Felix&sig=${sig}&`,
    ]) {
      assert.equal(verifyPath(url).ok, false, url);
    }
  });

  test('reads the expiry from the path', () => {
    assert.deepEqual(verifyPath(signPath(`seed=Felix&exp=${NOW + 60}`)), {
      ok: true,
      expiresAt: NOW + 60,
    });

    // `%65xp` is only left for the query parser when the segment is encoded
    // as a whole. Unencoded, the router already turns it into `exp`.
    for (const [options, encode] of [
      [`seed=Felix&exp=${NOW - 60}`, false],
      [`seed=Felix&exp=${NOW - 60}`, true],
      [`seed=Felix&%65xp=${NOW - 60}`, true],
    ]) {
      assert.deepEqual(
        verifyPath(signPath(options, { encode })),
        { ok: false, reason: 'expired' },
        `${options} ${encode}`,
      );
    }
  });

  test('rejects a malformed or repeated expiry in the path', () => {
    for (const options of [
      `seed=Felix&exp=${(NOW + 60) * 1000}`,
      `seed=Felix&exp=${NOW + 60}&exp=${NOW + 60}`,
      'seed=Felix&exp',
    ]) {
      assert.deepEqual(
        verifyPath(signPath(options, { encode: true })),
        { ok: false, reason: 'invalid-expiry' },
        options,
      );
    }
  });
});

describe('signed URLs (disabled by default)', () => {
  // Run in a child process without SIGNING_SECRETS, so a variable set in the
  // shell that runs the tests does not change the outcome.
  const script = `
    import { app } from './dist/app.js';
    import { config } from './dist/config.js';

    const server = await app();
    const res = await server.inject({
      method: 'GET',
      path: '/10.x/initials/svg?seed=Felix&exp=1&sig=abc',
    });

    process.stdout.write(JSON.stringify({
      secrets: config.signing.secrets,
      maxAge: config.cacheControl.avatar,
      statusCode: res.statusCode,
      cacheControl: res.headers['cache-control'],
    }));

    await server.close();
  `;

  let payload;

  before(() => {
    const env = { ...process.env };

    delete env.SIGNING_SECRETS;

    const result = spawnSync(
      process.execPath,
      ['--input-type=module', '-e', script],
      { cwd: path.join(__dirname, '..'), env, encoding: 'utf-8' },
    );

    assert.equal(
      result.status,
      0,
      `child exited with ${result.status}: ${result.stderr}`,
    );

    payload = JSON.parse(result.stdout);
  });

  test('no secret is configured', () => {
    assert.deepEqual(payload.secrets, []);
  });

  test('sig and exp are dropped like any unknown parameter', () => {
    assert.equal(payload.statusCode, 200);
    assert.equal(payload.cacheControl, `max-age=${payload.maxAge}`);
  });
});

describe('SIGNING_SECRETS', () => {
  const load = (secrets) =>
    spawnSync(
      process.execPath,
      ['--input-type=module', '-e', "await import('./dist/config.js')"],
      {
        cwd: path.join(__dirname, '..'),
        env: { ...process.env, SIGNING_SECRETS: secrets },
        encoding: 'utf-8',
      },
    );

  test('refuses to start with a secret under 32 characters', () => {
    for (const [secrets, tooShort] of [
      ['short', 'short'],
      [`${'a'.repeat(32)},${'b'.repeat(31)}`, 'b'.repeat(31)],
    ]) {
      const result = load(secrets);

      assert.notEqual(result.status, 0);
      assert.match(result.stderr, /needs at least 32 characters/);
      assert.ok(!result.stderr.includes(tooShort), 'must not print the secret');
    }
  });

  test('starts with secrets of 32 characters', () => {
    assert.equal(load(`${'a'.repeat(32)}, ${'b'.repeat(40)}`).status, 0);
    assert.equal(load('').status, 0);
  });
});

describe('signed URLs (enabled via env)', () => {
  const helper = path.join(__dirname, '_signature-enabled.run.mjs');

  let payload;

  before(() => {
    const result = spawnSync(process.execPath, [helper], {
      env: {
        ...process.env,
        SIGNING_SECRETS: `${'current'.padEnd(32, '-')}, ${'previous'.padEnd(32, '-')},`,
      },
      encoding: 'utf-8',
    });

    assert.equal(
      result.status,
      0,
      `child exited with ${result.status}: ${result.stderr}`,
    );

    payload = JSON.parse(result.stdout);
  });

  test('serves a signed URL', () => {
    for (const name of [
      'signed',
      'signedWithoutQuery',
      'signedSlashBeforeQuery',
      'signedJson',
      'signedPath',
      'signedPathEncoded',
      'signedPathWithoutOptions',
      'signedPathPng',
    ]) {
      assert.equal(payload[name].statusCode, 200, name);
    }

    assert.equal(payload.signed.cacheControl, `max-age=${payload.maxAge}`);
    assert.equal(payload.signedPath.body, payload.signed.body);
    assert.equal(payload.signedPathEncoded.body, payload.signed.body);
    assert.equal(payload.signedSlashBeforeQuery.body, payload.signed.body);
  });

  test('refuses a path variant signed the query string way', () => {
    assert.equal(payload.pathWithQuerySignature.statusCode, 403);
    assert.equal(
      JSON.parse(payload.pathWithQuerySignature.body).message,
      'Missing signature.',
    );
    assert.equal(payload.pathWithExtraQuery.statusCode, 403);
    assert.equal(
      JSON.parse(payload.pathWithExtraQuery.body).message,
      'Query string not allowed next to path options.',
    );
  });

  test('refuses a raw # in a signed URL', () => {
    for (const name of ['rawFragmentPath', 'rawFragmentQuery']) {
      assert.equal(payload[name].statusCode, 403, name);
      assert.match(payload[name].body, /Invalid signature\./, name);
    }
  });

  test('reads the expiry of the path variant', () => {
    const { statusCode, cacheControl } = payload.pathNotExpired;
    const maxAge = Number(/^max-age=(\d+)$/.exec(cacheControl)?.[1]);

    assert.equal(statusCode, 200);
    assert.ok(maxAge > 0 && maxAge <= 60, `unexpected ${cacheControl}`);

    for (const name of ['pathExpired', 'pathEncodedExpiryKey']) {
      assert.equal(payload[name].statusCode, 403, name);
      assert.equal(
        JSON.parse(payload[name].body).message,
        'Signature expired.',
      );
    }
  });

  test('accepts the previous secret during a rotation', () => {
    assert.equal(payload.signedWithPreviousSecret.statusCode, 200);
    assert.equal(payload.signedWithUnknownSecret.statusCode, 403);
  });

  test('refuses a URL without a signature', () => {
    const { statusCode, cacheControl, body } = payload.unsigned;

    assert.equal(statusCode, 403);
    assert.equal(cacheControl, 'no-store');
    assert.deepEqual(JSON.parse(body), {
      statusCode: 403,
      error: 'Forbidden',
      message: 'Missing signature.',
    });
    assert.equal(payload.unsignedHead.statusCode, 403);
  });

  test('refuses a URL that was changed after signing', () => {
    assert.equal(payload.tampered.statusCode, 403);
    assert.equal(
      JSON.parse(payload.tampered.body).message,
      'Invalid signature.',
    );
  });

  test('caps the cache duration at the expiry', () => {
    const { statusCode, cacheControl } = payload.notExpired;
    const maxAge = Number(/^max-age=(\d+)$/.exec(cacheControl)?.[1]);

    assert.equal(statusCode, 200);
    assert.ok(maxAge > 0 && maxAge <= 60, `unexpected ${cacheControl}`);
  });

  test('refuses an expired URL', () => {
    assert.equal(payload.expired.statusCode, 403);
    assert.equal(payload.expired.cacheControl, 'no-store');
    assert.equal(
      JSON.parse(payload.expired.body).message,
      'Signature expired.',
    );
  });

  test('refuses a malformed expiry', () => {
    for (const name of ['malformedExpiry', 'pathMalformedExpiry']) {
      assert.equal(payload[name].statusCode, 403, name);
      assert.equal(JSON.parse(payload[name].body).message, 'Invalid expiry.');
    }
  });

  test('reads an encoded expiry key like the query parser does', () => {
    const { statusCode, body } = payload.encodedExpiryKey;

    assert.equal(statusCode, 403);
    assert.equal(JSON.parse(body).message, 'Signature expired.');
  });

  test('treats an encoded exp inside the seed as part of the seed', () => {
    assert.equal(payload.encodedExpiryInSeed.statusCode, 200);
  });

  test('still validates the options of a signed URL', () => {
    assert.equal(payload.invalidOption.statusCode, 400);
  });

  test('leaves the health check and the style listing open', () => {
    assert.equal(payload.health.statusCode, 200);
    assert.equal(payload.styles.statusCode, 200);
  });
});
