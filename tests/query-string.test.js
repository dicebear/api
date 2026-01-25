import { test, describe } from 'node:test';
import assert from 'node:assert/strict';

import { parseQueryString } from '../dist/utils/query-string.js';

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

  test('handles URL-encoded commas (%2C)', () => {
    const result = parseQueryString('backgroundColor=000000%2Cffffff');
    assert.deepEqual(
      result,
      expected({ backgroundColor: ['000000', 'ffffff'] }),
    );
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
});
