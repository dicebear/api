import { test, describe } from 'node:test';
import assert from 'node:assert/strict';

import {
  parseQueryString,
  transformWeightedFields,
} from '../dist/utils/query-string.js';

// Helper to create expected objects with null prototype (matching parseQueryString output)
function expected(obj) {
  const result = Object.create(null);

  for (const [key, value] of Object.entries(obj)) {
    result[key] = value;
  }

  return result;
}

describe('parseQueryString', () => {
  test('parses simple key-value pairs', () => {
    const result = parseQueryString('size=10');
    assert.deepEqual(result, expected({ size: ['10'] }));
  });

  test('parses multiple key-value pairs', () => {
    const result = parseQueryString('size=10&seed=test');
    assert.deepEqual(result, expected({ size: ['10'], seed: ['test'] }));
  });

  test('parses comma-separated values as arrays', () => {
    const result = parseQueryString('backgroundColor=000000,ffffff');
    assert.deepEqual(
      result,
      expected({ backgroundColor: ['000000', 'ffffff'] }),
    );
  });

  test('treats URL-encoded commas (%2C) as literal, not as separators', () => {
    const result = parseQueryString('backgroundColor=000000%2Cffffff');
    assert.deepEqual(result, expected({ backgroundColor: ['000000,ffffff'] }));
  });

  test('keeps seed with commas as string (not array)', () => {
    const result = parseQueryString('seed=hello,world');
    assert.deepEqual(result, expected({ seed: ['hello,world'] }));
  });

  test('keeps seed with encoded commas as string', () => {
    const result = parseQueryString('seed=hello%2Cworld');
    assert.deepEqual(result, expected({ seed: ['hello,world'] }));
  });

  test('filters out empty values', () => {
    const result = parseQueryString('colors=red,,blue');
    assert.deepEqual(result, expected({ colors: ['red', 'blue'] }));
  });

  test('excludes empty string values', () => {
    const result = parseQueryString('name=');
    assert.deepEqual(result, expected({ name: [] }));
  });

  test('returns empty object for empty string', () => {
    const result = parseQueryString('');
    assert.deepEqual(result, expected({}));
  });

  test('handles multiple values for same key', () => {
    const result = parseQueryString('color=red,green,blue');
    assert.deepEqual(result, expected({ color: ['red', 'green', 'blue'] }));
  });

  test('wraps single values in array', () => {
    const result = parseQueryString('flip=true');
    assert.deepEqual(result, expected({ flip: ['true'] }));
  });

  test('handles numeric values as strings', () => {
    const result = parseQueryString('size=128&rotate=90');
    assert.deepEqual(result, expected({ size: ['128'], rotate: ['90'] }));
  });

  test('handles special characters in seed', () => {
    const result = parseQueryString('seed=test@123!');
    assert.deepEqual(result, expected({ seed: ['test@123!'] }));
  });

  test('handles empty seed value', () => {
    const result = parseQueryString('seed=');
    assert.deepEqual(result, expected({ seed: [''] }));
  });

  test('handles array notation with brackets', () => {
    const result = parseQueryString(
      'backgroundColor[]=000000&backgroundColor[]=ffffff',
    );
    assert.deepEqual(
      result,
      expected({ backgroundColor: ['000000', 'ffffff'] }),
    );
  });

  test('handles array notation with single value', () => {
    const result = parseQueryString('backgroundColor[]=000000');
    assert.deepEqual(result, expected({ backgroundColor: ['000000'] }));
  });

  test('handles array notation with empty value', () => {
    const result = parseQueryString('backgroundColor[]=');
    assert.deepEqual(result, expected({ backgroundColor: [] }));
  });

  test('handles array notation with mixed empty and non-empty values', () => {
    const result = parseQueryString(
      'backgroundColor[]=000000&backgroundColor[]=&backgroundColor[]=ffffff',
    );
    assert.deepEqual(
      result,
      expected({ backgroundColor: ['000000', 'ffffff'] }),
    );
  });

  test('handles indexed array notation', () => {
    const result = parseQueryString(
      'backgroundColor[0]=000000&backgroundColor[1]=ffffff',
    );
    assert.deepEqual(
      result,
      expected({ backgroundColor: ['000000', 'ffffff'] }),
    );
  });

  test('respects custom arrayLimit for indexed arrays', () => {
    // With arrayLimit=5, up to 5 indexed elements parse as a proper array
    const params = Array.from(
      { length: 5 },
      (_, i) => `color[${i}]=val${i}`,
    ).join('&');
    const result = parseQueryString(params, 5);

    assert.ok(Array.isArray(result['color']));
    assert.equal(result['color'].length, 5);
  });

  test('throws when parameterLimit is exceeded', () => {
    assert.throws(() => parseQueryString('a=1&b=2&c=3', 100, 1), {
      name: 'QueryStringRangeError',
    });
  });

  test('does not throw when within parameterLimit', () => {
    const result = parseQueryString('a=1', 100, 1);

    assert.equal(Object.keys(result).length, 1);
  });
});

describe('transformWeightedFields', () => {
  const weighted = new Set(['eyesVariant', 'mouthVariant']);

  test('converts variant:weight arrays to objects', () => {
    const query = { eyesVariant: ['happy:3', 'wink:1'] };
    transformWeightedFields(query, weighted);
    assert.deepEqual(query.eyesVariant, { happy: 3, wink: 1 });
  });

  test('weight is 0 when empty after colon', () => {
    // 'happy:'.split(':') → ['happy', ''], Number('') → 0
    const query = { eyesVariant: ['happy:', 'wink:2'] };
    transformWeightedFields(query, weighted);
    assert.deepEqual(query.eyesVariant, { happy: 0, wink: 2 });
  });

  test('defaults weight to 1 when no colon', () => {
    const query = { eyesVariant: ['happy:1', 'wink'] };
    transformWeightedFields(query, weighted);
    assert.deepEqual(query.eyesVariant, { happy: 1, wink: 1 });
  });

  test('leaves non-weighted fields unchanged', () => {
    const query = { size: ['128'], eyesVariant: ['happy:2', 'wink:1'] };
    transformWeightedFields(query, weighted);
    assert.deepEqual(query.size, ['128']);
    assert.deepEqual(query.eyesVariant, { happy: 2, wink: 1 });
  });

  test('leaves arrays without colons unchanged for weighted fields', () => {
    const query = { eyesVariant: ['happy', 'wink'] };
    transformWeightedFields(query, weighted);
    assert.deepEqual(query.eyesVariant, ['happy', 'wink']);
  });

  test('does not transform non-array values', () => {
    const query = { eyesVariant: 'happy:2' };
    transformWeightedFields(query, weighted);
    assert.equal(query.eyesVariant, 'happy:2');
  });

  test('handles empty array', () => {
    const query = { eyesVariant: [] };
    transformWeightedFields(query, weighted);
    assert.deepEqual(query.eyesVariant, []);
  });

  test('handles empty weighted fields set', () => {
    const query = { eyesVariant: ['happy:2', 'wink:1'] };
    transformWeightedFields(query, new Set());
    assert.deepEqual(query.eyesVariant, ['happy:2', 'wink:1']);
  });

  test('handles missing keys gracefully', () => {
    const query = { seed: ['test'] };
    transformWeightedFields(query, weighted);
    assert.deepEqual(query, { seed: ['test'] });
  });

  test('trims whitespace from variant names', () => {
    const query = { eyesVariant: [' happy :2', ' wink :1'] };
    transformWeightedFields(query, weighted);
    assert.deepEqual(query.eyesVariant, { happy: 2, wink: 1 });
  });

  test('handles multiple weighted fields', () => {
    const query = {
      eyesVariant: ['happy:3', 'wink:1'],
      mouthVariant: ['smile:2', 'frown:1'],
    };
    transformWeightedFields(query, weighted);
    assert.deepEqual(query.eyesVariant, { happy: 3, wink: 1 });
    assert.deepEqual(query.mouthVariant, { smile: 2, frown: 1 });
  });

  test('detects weighted format when at least one element has colon', () => {
    const query = { eyesVariant: ['happy', 'wink:2'] };
    transformWeightedFields(query, weighted);
    assert.deepEqual(query.eyesVariant, { happy: 1, wink: 2 });
  });
});
