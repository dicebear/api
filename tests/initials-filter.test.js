import { test, describe, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import * as path from 'node:path';
import { readFileSync } from 'node:fs';

import { app } from '../dist/app.js';
import { filterInitialsSvg } from '../dist/utils/initials-filter.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const BLOCKLIST = new Set(
  JSON.parse(
    readFileSync(
      path.join(__dirname, '../data/initials-blocklist.json'),
      'utf-8',
    ),
  ),
);

let server;
let blockedSeed;
let blockedSingleSeed;
let expectedMask;

before(async () => {
  server = await app();

  // Pick blocklist entries that round-trip through `Initials.fromSeed()`
  // (its match regex is `\p{L}[\p{L}\p{M}]*`) so the entry, used as seed,
  // renders verbatim into the avatar's `<text>` element. We pick both a
  // 2-codepoint entry (for the `initials` style, which renders both) and
  // a 1-codepoint entry (for `initial-face`, which only renders the
  // first character).
  for (const entry of BLOCKLIST) {
    if (!/^\p{L}+$/u.test(entry)) continue;

    const length = [...entry].length;

    if (length === 2 && !blockedSeed) blockedSeed = entry;
    else if (length === 1 && !blockedSingleSeed) blockedSingleSeed = entry;

    if (blockedSeed && blockedSingleSeed) break;
  }

  assert.ok(blockedSeed, 'expected at least one 2-codepoint usable entry');
  assert.ok(blockedSingleSeed, 'expected at least one 1-codepoint usable entry');

  expectedMask = '*'.repeat([...blockedSeed].length);
});

after(async () => {
  await server.close();
});

describe('filterInitialsSvg', () => {
  const wrap = (text) =>
    `<svg xmlns="http://www.w3.org/2000/svg"><text x="50%" y="50%" text-anchor="middle">${text}</text></svg>`;

  test('returns SVG unchanged when no <text> matches the blocklist', () => {
    const svg = wrap('AB');
    assert.equal(filterInitialsSvg(svg, BLOCKLIST), svg);
  });

  test('replaces blocked <text> content with one asterisk per codepoint', () => {
    const svg = wrap(blockedSeed);
    const result = filterInitialsSvg(svg, BLOCKLIST);
    assert.ok(result.includes(`>${expectedMask}</text>`));
    assert.ok(!result.includes(`>${blockedSeed}</text>`));
  });

  test('returns SVG unchanged when there is no <text> element at all', () => {
    const svg = '<svg xmlns="http://www.w3.org/2000/svg"><circle r="10"/></svg>';
    assert.equal(filterInitialsSvg(svg, BLOCKLIST), svg);
  });

  test('does not match <textPath>', () => {
    const svg = `<svg><textPath href="#p">${blockedSeed}</textPath></svg>`;
    assert.equal(filterInitialsSvg(svg, BLOCKLIST), svg);
  });

  test('replaces every matching <text> in the SVG', () => {
    const svg = `<svg><text>${blockedSeed}</text><text>OK</text><text>${blockedSeed}</text></svg>`;
    const result = filterInitialsSvg(svg, BLOCKLIST);
    assert.equal(result.split(`>${expectedMask}</text>`).length - 1, 2);
    assert.ok(result.includes('>OK</text>'));
  });
});

describe('initials filter via HTTP', () => {
  test('clean latin seed renders initials verbatim', async () => {
    const res = await server.inject({
      method: 'GET',
      path: '/10.x/initials/svg?seed=Alice Bob',
    });
    assert.equal(res.statusCode, 200);
    assert.match(res.body, /<text\b[^>]*>AB<\/text>/);
    assert.ok(!/<text\b[^>]*>\*<\/text>/.test(res.body));
  });

  test('clean CJK seed renders both characters', async () => {
    const res = await server.inject({
      method: 'GET',
      path: '/10.x/initials/svg?seed=明天',
    });
    assert.equal(res.statusCode, 200);
    assert.match(res.body, /<text\b[^>]*>明天<\/text>/);
  });

  test('blocked seed is replaced with asterisks of matching length', async () => {
    const res = await server.inject({
      method: 'GET',
      path: `/10.x/initials/svg?seed=${encodeURIComponent(blockedSeed)}`,
    });
    assert.equal(res.statusCode, 200);
    assert.ok(res.body.includes(`>${expectedMask}</text>`));
    assert.ok(
      !res.body.includes(`>${blockedSeed}</text>`),
      'original initials must not appear in response',
    );
  });

  test('blocked seed still produces deterministic output', async () => {
    const path = `/10.x/initials/svg?seed=${encodeURIComponent(blockedSeed)}`;
    const a = await server.inject({ method: 'GET', path });
    const b = await server.inject({ method: 'GET', path });
    assert.equal(a.body, b.body);
  });

  test('filter applies to initial-face', async () => {
    const res = await server.inject({
      method: 'GET',
      path: `/10.x/initial-face/svg?seed=${encodeURIComponent(blockedSingleSeed)}`,
    });
    assert.equal(res.statusCode, 200);
    assert.match(res.body, /<text\b[^>]*>\*<\/text>/);
    assert.ok(!res.body.includes(`>${blockedSingleSeed}</text>`));
  });

  test('filter is a no-op for styles that render no text', async () => {
    const res = await server.inject({
      method: 'GET',
      path: `/10.x/icons/svg?seed=${encodeURIComponent(blockedSeed)}`,
    });
    assert.equal(res.statusCode, 200);
    assert.ok(!/<text\b[^>]*>\*+<\/text>/.test(res.body));
  });

  test('blocked seed renders a valid PNG', async () => {
    const res = await server.inject({
      method: 'GET',
      path: `/10.x/initials/png?seed=${encodeURIComponent(blockedSeed)}`,
    });
    assert.equal(res.statusCode, 200);
    assert.equal(res.headers['content-type'], 'image/png');
    assert.ok(res.rawPayload.length > 0);
    // PNG magic bytes: 89 50 4E 47
    assert.equal(res.rawPayload[0], 0x89);
    assert.equal(res.rawPayload[1], 0x50);
    assert.equal(res.rawPayload[2], 0x4e);
    assert.equal(res.rawPayload[3], 0x47);
  });

  test('blocked seed JSON response has filtered svg', async () => {
    const res = await server.inject({
      method: 'GET',
      path: `/10.x/initials/json?seed=${encodeURIComponent(blockedSeed)}`,
    });
    assert.equal(res.statusCode, 200);
    const json = JSON.parse(res.body);
    assert.ok(json.svg.includes(`>${expectedMask}</text>`));
    assert.ok(!json.svg.includes(`>${blockedSeed}</text>`));
  });
});

describe('INITIALS_FILTER=0 disables the filter', () => {
  test('blocked seed renders verbatim when env var is 0', () => {
    // The config module reads `process.env.INITIALS_FILTER` once at load
    // time, so a different value can only be observed in a fresh Node
    // process. Spawn a tiny helper that boots the app with the flag off
    // and reports the response body.
    const helper = path.join(__dirname, '_initials-filter-disabled.run.mjs');
    const result = spawnSync(
      process.execPath,
      [helper, '--seed', blockedSeed],
      {
        env: { ...process.env, INITIALS_FILTER: '0' },
        encoding: 'utf-8',
      },
    );

    assert.equal(
      result.status,
      0,
      `child exited with ${result.status}: ${result.stderr}`,
    );

    const payload = JSON.parse(result.stdout);
    assert.equal(payload.statusCode, 200);
    assert.ok(
      payload.body.includes(`>${blockedSeed}</text>`),
      'original initials must be present when filter is disabled',
    );
    assert.ok(
      !/<text\b[^>]*>\*+<\/text>/.test(payload.body),
      'asterisk replacement must not appear when filter is disabled',
    );
  });
});
