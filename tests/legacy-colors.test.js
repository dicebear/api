import { test, describe, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';

import {
  applyLegacyColorOrder,
  contrastColors,
  sortColorValues,
} from '../dist/utils/legacy-colors.js';
import { app } from '../dist/app.js';

const require = createRequire(import.meta.url);

const definition = {
  colors: {
    hair: { values: ['#cccccc', '#000000', '#aaaaaa'] },
    text: { values: ['#ffffff', '#000000'], contrastTo: 'background' },
  },
};

describe('sortColorValues', () => {
  test('sorts a palette', () => {
    const sorted = sortColorValues(definition);

    assert.deepEqual(sorted.colors.hair.values, [
      '#000000',
      '#aaaaaa',
      '#cccccc',
    ]);
  });

  test('leaves a contrastTo palette in its order', () => {
    const sorted = sortColorValues(definition);

    assert.deepEqual(sorted.colors.text.values, ['#ffffff', '#000000']);
  });

  test('does not touch the definition it was given', () => {
    sortColorValues(definition);

    assert.deepEqual(definition.colors.hair.values, [
      '#cccccc',
      '#000000',
      '#aaaaaa',
    ]);
  });
});

describe('applyLegacyColorOrder', () => {
  const contrast = contrastColors(definition);

  test('finds the colors behind a contrastTo', () => {
    assert.deepEqual([...contrast], ['text']);
  });

  test('pins a pinned palette to two gradient stops', () => {
    const options = applyLegacyColorOrder(
      { hairColorOrder: 'fixed' },
      contrast,
    );

    assert.equal(options.hairColorOrder, 'fixed');
    assert.equal(options.hairColorFillStops, 2);
  });

  test('keeps a stop count the caller asked for', () => {
    const options = applyLegacyColorOrder(
      { hairColorOrder: 'fixed', hairColorFillStops: 5 },
      contrast,
    );

    assert.equal(options.hairColorFillStops, 5);
  });

  test('drops the pin on a contrastTo color, which 10 ignored', () => {
    const options = applyLegacyColorOrder(
      { textColorOrder: 'fixed' },
      contrast,
    );

    assert.equal('textColorOrder' in options, false);
    assert.equal('textColorFillStops' in options, false);
  });

  test('leaves colors the caller supplied alone', () => {
    const options = applyLegacyColorOrder(
      {
        hairColorOrder: 'fixed',
        hairColor: ['#123456', '#654321'],
        textColorOrder: 'fixed',
        textColor: ['#123456'],
      },
      contrast,
    );

    assert.equal(options.hairColorOrder, 'fixed');
    assert.equal('hairColorFillStops' in options, false);
    assert.equal(options.textColorOrder, 'fixed');
  });

  test('ignores the default order', () => {
    const options = applyLegacyColorOrder(
      { hairColorOrder: 'random' },
      contrast,
    );

    assert.deepEqual(options, { hairColorOrder: 'random' });
  });
});

describe('10.x colors over the current core', () => {
  let server;

  before(async () => {
    server = await app();
  });

  after(async () => {
    await server.close();
  });

  const get = async (path) => {
    const res = await server.inject({ method: 'GET', path });
    assert.equal(res.statusCode, 200, path);

    return res.body;
  };

  test('a pinned palette starts at its lowest color, as in 10', async () => {
    const values = require('@dicebear/styles-10/adventurer.json').colors.skin
      .values;
    const lowest = [...values].sort()[0];

    assert.notEqual(values[0], lowest, 'palette is unsorted in the package');

    const svg = await get(
      '/10.x/adventurer/svg?seed=Alice&skinColorOrder=fixed',
    );

    assert.ok(svg.includes(lowest), `expected ${lowest} in the avatar`);
  });

  test('the 11.x line takes the palette as the definition lists it', async () => {
    const first = require('@dicebear/styles-11/adventurer.json').colors.skin
      .values[0];

    const svg = await get(
      '/11.x/adventurer/svg?seed=Alice&skinColorOrder=fixed',
    );

    assert.ok(svg.includes(first), `expected ${first} in the avatar`);
  });

  test('a contrastTo color ignores the pin on 10.x', async () => {
    const path = '/10.x/initials/svg?seed=Alice';

    assert.equal(
      await get(`${path}&textColorOrder=fixed`),
      await get(path),
      'pinning a contrastTo color must not change the avatar',
    );
  });
});
