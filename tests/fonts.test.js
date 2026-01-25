import { test, describe } from 'node:test';
import assert from 'node:assert/strict';

import {
  isCharacterInUnicodeRange,
  getRequiredFonts,
} from '../dist/utils/fonts.js';

describe('isCharacterInUnicodeRange', () => {
  test('returns true when character is within range', () => {
    // 'A' has char code 65
    assert.equal(isCharacterInUnicodeRange('A', [65, 90]), true);
    assert.equal(isCharacterInUnicodeRange('Z', [65, 90]), true);
    assert.equal(isCharacterInUnicodeRange('M', [65, 90]), true);
  });

  test('returns false when character is outside range', () => {
    // 'a' has char code 97
    assert.equal(isCharacterInUnicodeRange('a', [65, 90]), false);
    // '@' has char code 64
    assert.equal(isCharacterInUnicodeRange('@', [65, 90]), false);
  });

  test('handles edge cases at range boundaries', () => {
    // Test exact boundaries
    assert.equal(isCharacterInUnicodeRange('A', [65, 65]), true);
    assert.equal(isCharacterInUnicodeRange('B', [65, 65]), false);
  });

  test('handles Unicode characters', () => {
    // German umlaut 'ä' has char code 228
    assert.equal(isCharacterInUnicodeRange('ä', [0, 255]), true);
    assert.equal(isCharacterInUnicodeRange('ä', [0, 100]), false);
  });
});

describe('getRequiredFonts', () => {
  const mockFonts = [
    {
      font: 'latin.ttf',
      ranges: [[65, 90], [97, 122]], // A-Z, a-z
    },
    {
      font: 'numbers.ttf',
      ranges: [[48, 57]], // 0-9
    },
  ];

  test('returns empty array when no text nodes in SVG', () => {
    const svg = '<svg><rect /></svg>';
    const result = getRequiredFonts(svg, mockFonts);
    assert.deepEqual(result, []);
  });

  test('returns empty array for empty text node', () => {
    const svg = '<svg><text></text></svg>';
    const result = getRequiredFonts(svg, mockFonts);
    assert.deepEqual(result, []);
  });

  test('finds font for Latin characters', () => {
    const svg = '<svg><text>Hello</text></svg>';
    const result = getRequiredFonts(svg, mockFonts);
    assert.equal(result.length, 1);
    assert.ok(result[0].endsWith('latin.ttf'));
  });

  test('finds font for numeric characters', () => {
    const svg = '<svg><text>123</text></svg>';
    const result = getRequiredFonts(svg, mockFonts);
    assert.equal(result.length, 1);
    assert.ok(result[0].endsWith('numbers.ttf'));
  });

  test('finds multiple fonts when needed', () => {
    const svg = '<svg><text>Hello123</text></svg>';
    const result = getRequiredFonts(svg, mockFonts);
    assert.equal(result.length, 2);
  });

  test('handles multiple text nodes', () => {
    const svg = '<svg><text>ABC</text><text>123</text></svg>';
    const result = getRequiredFonts(svg, mockFonts);
    assert.equal(result.length, 2);
  });

  test('does not duplicate fonts', () => {
    const svg = '<svg><text>ABC</text><text>DEF</text></svg>';
    const result = getRequiredFonts(svg, mockFonts);
    assert.equal(result.length, 1);
    assert.ok(result[0].endsWith('latin.ttf'));
  });

  test('handles text nodes with attributes', () => {
    const svg = '<svg><text x="10" y="20" fill="black">Test</text></svg>';
    const result = getRequiredFonts(svg, mockFonts);
    assert.equal(result.length, 1);
    assert.ok(result[0].endsWith('latin.ttf'));
  });

  test('returns empty array when no matching font found', () => {
    const svg = '<svg><text>!</text></svg>'; // '!' is char code 33, not in our mock ranges
    const result = getRequiredFonts(svg, mockFonts);
    assert.deepEqual(result, []);
  });
});
