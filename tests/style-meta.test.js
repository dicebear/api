import { test, describe, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
import * as path from 'node:path';

import { app } from '../dist/app.js';
import { config } from '../dist/config.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const require = createRequire(import.meta.url);

let server;

before(async () => {
  server = await app();
});

after(async () => {
  await server.close();
});

describe('definition.json and options.json endpoints (disabled by default)', () => {
  test('definition.json is not served by default', async () => {
    const res = await server.inject({
      method: 'GET',
      path: '/10.x/initials/definition.json',
    });

    assert.equal(res.statusCode, 400);
  });

  test('options.json is not served by default', async () => {
    const res = await server.inject({
      method: 'GET',
      path: '/10.x/initials/options.json',
    });

    assert.equal(res.statusCode, 400);
  });
});

describe('definition.json and options.json endpoints (enabled via env)', () => {
  const helper = path.join(__dirname, '_style-meta-enabled.run.mjs');

  let payload;

  before(() => {
    const result = spawnSync(process.execPath, [helper], {
      env: { ...process.env, DEFINITION: '1', OPTIONS: '1' },
      encoding: 'utf-8',
    });

    assert.equal(
      result.status,
      0,
      `child exited with ${result.status}: ${result.stderr}`,
    );

    payload = JSON.parse(result.stdout);
  });

  test('definition.json stays the file the style package ships', () => {
    const { statusCode, body } = payload.sortedLine;
    assert.equal(statusCode, 200);

    const published = require('@dicebear/styles-10/adventurer.json');
    const served = JSON.parse(body);

    assert.deepEqual(served.colors.skin.values, published.colors.skin.values);
  });

  test('definition.json returns the style definition', () => {
    const { statusCode, contentType, cacheControl, body } = payload.definition;

    assert.equal(statusCode, 200);
    assert.match(contentType, /^application\/json/);
    assert.equal(cacheControl, `max-age=${config.cacheControl.styles}`);

    const definition = JSON.parse(body);
    assert.ok(definition.meta, 'definition must contain meta');
    assert.ok(definition.components, 'definition must contain components');
  });

  test('options.json returns the options descriptor', () => {
    const { statusCode, contentType, cacheControl, body } = payload.options;

    assert.equal(statusCode, 200);
    assert.match(contentType, /^application\/json/);
    assert.equal(cacheControl, `max-age=${config.cacheControl.styles}`);

    const descriptor = JSON.parse(body);
    assert.equal(descriptor.seed?.type, 'string');
    assert.equal(descriptor.backgroundColor?.type, 'color');
  });

  test('options.json omits excluded options', () => {
    const descriptor = JSON.parse(payload.options.body);

    for (const key of config.excludedOptions) {
      assert.ok(!(key in descriptor), `"${key}" must not be served`);
    }
  });
});
