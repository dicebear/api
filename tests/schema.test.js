import { test, describe } from 'node:test';
import assert from 'node:assert/strict';

import { getQueryLimits } from '../dist/utils/schema.js';

// Minimal mock that mimics Style's public API
function mockStyle({ components = {}, colors = {}, animations = [] }) {
  return {
    style: {
      animationNames: () => animations,
      components: () =>
        new Map(
          Object.entries(components).map(([name, variantCount]) => [
            name,
            {
              variants: () =>
                new Map(
                  Array.from({ length: variantCount }, (_, i) => [`v${i}`, {}]),
                ),
            },
          ]),
        ),
      colors: () =>
        new Map(
          Object.entries(colors).map(([name, valueCount]) => [
            name,
            {
              values: () =>
                Array.from({ length: valueCount }, (_, i) => `#${i}`),
            },
          ]),
        ),
    },
    weightedFields: new Set(),
  };
}

describe('getQueryLimits', () => {
  test('returns config minimums for empty input', () => {
    const result = getQueryLimits([]);
    assert.equal(result.arrayLimit, 20);
    assert.equal(result.parameterLimit, 100);
  });

  test('returns config minimums for styles with few options', () => {
    const styles = new Map([
      ['simple', mockStyle({ components: { eyes: 3 }, colors: { skin: 5 } })],
    ]);
    const result = getQueryLimits([styles]);

    // 12 base + 1*5 components + 2*4 colors(skin+bg) = 12+5+8 = 25 < 100 min
    assert.equal(result.parameterLimit, 100);
    // max(3 variants, 5 colors) = 5 < 20 min
    assert.equal(result.arrayLimit, 20);
  });

  test('computes parameterLimit from components and colors', () => {
    // 12 base + 10*5 + 6*4 = 12 + 50 + 24 = 86 < 100 min
    const smallStyle = mockStyle({
      components: Object.fromEntries(
        Array.from({ length: 10 }, (_, i) => [`comp${i}`, 2]),
      ),
      colors: Object.fromEntries(
        Array.from({ length: 5 }, (_, i) => [`color${i}`, 3]),
      ),
    });
    // 12 base + 20*5 + 11*4 = 12 + 100 + 44 = 156 > 100 min
    const largeStyle = mockStyle({
      components: Object.fromEntries(
        Array.from({ length: 20 }, (_, i) => [`comp${i}`, 2]),
      ),
      colors: Object.fromEntries(
        Array.from({ length: 10 }, (_, i) => [`color${i}`, 3]),
      ),
    });

    const styles = new Map([
      ['small', smallStyle],
      ['large', largeStyle],
    ]);
    const result = getQueryLimits([styles]);
    assert.equal(result.parameterLimit, 156);
  });

  test('computes arrayLimit from max variant count', () => {
    const styles = new Map([
      ['style1', mockStyle({ components: { eyes: 5, mouth: 30 }, colors: {} })],
      ['style2', mockStyle({ components: { hair: 10 }, colors: {} })],
    ]);
    const result = getQueryLimits([styles]);
    assert.equal(result.arrayLimit, 30);
  });

  test('computes arrayLimit from max color value count', () => {
    const styles = new Map([
      ['style1', mockStyle({ components: {}, colors: { skin: 25, hair: 15 } })],
    ]);
    const result = getQueryLimits([styles]);
    assert.equal(result.arrayLimit, 25);
  });

  test('takes max across multiple version maps', () => {
    const v10 = new Map([
      ['small', mockStyle({ components: { a: 5 }, colors: {} })],
    ]);
    const v11 = new Map([
      ['big', mockStyle({ components: { a: 50 }, colors: {} })],
    ]);

    const result = getQueryLimits([v10, v11]);
    assert.equal(result.arrayLimit, 50);
  });

  test('counts background as extra color', () => {
    // 0 components, 2 defined colors + 1 background = 3 colors
    // 12 base + 0 + 3*4 = 24
    const styles = new Map([
      ['style', mockStyle({ components: {}, colors: { skin: 3, hair: 3 } })],
    ]);
    const result = getQueryLimits([styles]);

    // parameterLimit won't exceed 100 min, but let's verify the formula with a larger example
    // 12 base + 0 components + (20 colors + 1 bg) * 4 = 12 + 84 = 96 < 100
    const manyColors = Object.fromEntries(
      Array.from({ length: 20 }, (_, i) => [`c${i}`, 3]),
    );
    const styles2 = new Map([
      ['style', mockStyle({ components: {}, colors: manyColors })],
    ]);
    const result2 = getQueryLimits([styles2]);
    assert.equal(result2.parameterLimit, 100); // 96 < 100 min

    // 12 base + 0 + (25 colors + 1 bg) * 4 = 12 + 104 = 116 > 100
    const evenMoreColors = Object.fromEntries(
      Array.from({ length: 25 }, (_, i) => [`c${i}`, 3]),
    );
    const styles3 = new Map([
      ['style', mockStyle({ components: {}, colors: evenMoreColors })],
    ]);
    const result3 = getQueryLimits([styles3]);
    assert.equal(result3.parameterLimit, 116);
  });

  test('adds two parameters per animation name', () => {
    const many = mockStyle({
      components: Object.fromEntries(
        Array.from({ length: 20 }, (_, i) => [`c${i}`, 1]),
      ),
      animations: ['blink', 'sway'],
    });
    const { parameterLimit } = getQueryLimits([new Map([['many', many]])]);

    // 12 base + 20*5 components + 1*4 colors(bg) + 2 animations * 2 = 120
    assert.equal(parameterLimit, 120);
  });
});
