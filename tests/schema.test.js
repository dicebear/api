import { test, describe } from 'node:test';
import assert from 'node:assert/strict';

import {
  getSchemaLimits,
  getVersionsQueryLimits,
} from '../dist/utils/schema.js';

describe('getSchemaLimits', () => {
  test('returns zero limits for empty schema', () => {
    assert.deepEqual(getSchemaLimits({}), { parameterLimit: 0, arrayLimit: 0 });
  });

  test('counts all properties as parameterLimit', () => {
    const result = getSchemaLimits({
      properties: {
        seed: { type: 'string' },
        size: { type: 'number' },
        flip: { type: 'boolean' },
      },
    });

    assert.equal(result.parameterLimit, 3);
    assert.equal(result.arrayLimit, 0);
  });

  test('returns max enum length for array property', () => {
    const result = getSchemaLimits({
      properties: {
        hair: {
          type: 'array',
          items: { type: 'string', enum: ['short', 'long', 'bun'] },
        },
      },
    });

    assert.equal(result.arrayLimit, 3);
  });

  test('returns max enum length across multiple array properties', () => {
    const result = getSchemaLimits({
      properties: {
        hair: {
          type: 'array',
          items: { type: 'string', enum: ['short', 'long'] },
        },
        eyes: {
          type: 'array',
          items: { type: 'string', enum: ['open', 'closed', 'squint', 'wink'] },
        },
      },
    });

    assert.equal(result.arrayLimit, 4);
  });

  test('ignores array properties without enum', () => {
    const result = getSchemaLimits({
      properties: {
        tags: { type: 'array', items: { type: 'string' } },
      },
    });

    assert.equal(result.arrayLimit, 0);
  });

  test('ignores non-array properties for arrayLimit', () => {
    const result = getSchemaLimits({
      properties: {
        backgroundColor: { type: 'string', enum: ['red', 'blue', 'green'] },
      },
    });

    assert.equal(result.arrayLimit, 0);
    assert.equal(result.parameterLimit, 1);
  });
});

describe('getVersionsQueryLimits', () => {
  test('returns configured minimums for empty versions', () => {
    const result = getVersionsQueryLimits({});

    assert.equal(result.arrayLimit, 20);
    assert.equal(result.parameterLimit, 100);
  });

  test('merges core and style schema without double-counting overlapping properties', () => {
    // Use 80 core + 80 style props with 30 overlapping → 130 unique (> config min of 100)
    const coreProps = Object.fromEntries(
      Array.from({ length: 80 }, (_, i) => [`prop${i}`, { type: 'string' }]),
    );
    const styleProps = Object.fromEntries([
      // 30 overlapping with core (prop0..prop29)
      ...Array.from({ length: 30 }, (_, i) => [`prop${i}`, { type: 'string' }]),
      // 50 unique
      ...Array.from({ length: 50 }, (_, i) => [`hair${i}`, { type: 'string' }]),
    ]);
    const versions = {
      '9.x': {
        core: { schema: { properties: coreProps } },
        collection: { style1: { schema: { properties: styleProps } } },
      },
    };
    const result = getVersionsQueryLimits(versions);

    // 80 core + 50 unique style = 130 merged (not 160 with double-counting)
    assert.equal(result.parameterLimit, 130);
  });

  test('takes maximum arrayLimit across all styles', () => {
    const versions = {
      '9.x': {
        core: { schema: { properties: {} } },
        collection: {
          styleA: {
            schema: {
              properties: {
                hair: {
                  type: 'array',
                  items: { type: 'string', enum: ['a', 'b'] },
                },
              },
            },
          },
          styleB: {
            schema: {
              properties: {
                eyes: {
                  type: 'array',
                  items: {
                    type: 'string',
                    enum: ['a', 'b', 'c', 'd', 'e'],
                  },
                },
              },
            },
          },
        },
      },
    };
    const result = getVersionsQueryLimits(versions);

    assert.equal(result.arrayLimit, 20); // minimum applies, actual max enum is 5
  });

  test('exceeds minimum when enum is larger than 100', () => {
    const largeEnum = Array.from({ length: 150 }, (_, i) => `item${i}`);
    const versions = {
      '9.x': {
        core: { schema: { properties: {} } },
        collection: {
          icons: {
            schema: {
              properties: {
                icon: {
                  type: 'array',
                  items: { type: 'string', enum: largeEnum },
                },
              },
            },
          },
        },
      },
    };
    const result = getVersionsQueryLimits(versions);

    assert.equal(result.arrayLimit, 150);
  });

  test('takes maximum parameterLimit across all versions and styles', () => {
    // Use property counts that exceed the config minimum of 100
    const smallProps = Object.fromEntries(
      Array.from({ length: 10 }, (_, i) => [`prop${i}`, { type: 'string' }]),
    );
    const largeProps = Object.fromEntries(
      Array.from({ length: 120 }, (_, i) => [`prop${i}`, { type: 'string' }]),
    );
    const versions = {
      '8.x': {
        core: { schema: { properties: smallProps } },
        collection: { styleA: { schema: { properties: smallProps } } },
      },
      '9.x': {
        core: { schema: { properties: {} } },
        collection: { styleB: { schema: { properties: largeProps } } },
      },
    };
    const result = getVersionsQueryLimits(versions);

    // 8.x: 10+10 unique = 20; 9.x: 0+120 = 120 → max is 120
    assert.equal(result.parameterLimit, 120);
  });

  test('handles styles without a schema', () => {
    const versions = {
      '9.x': {
        core: { schema: { properties: { seed: { type: 'string' } } } },
        collection: {
          styleWithoutSchema: {},
        },
      },
    };

    assert.doesNotThrow(() => getVersionsQueryLimits(versions));
  });
});
