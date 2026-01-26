import { test, describe } from 'node:test';
import assert from 'node:assert/strict';

import { FontLookup } from '../dist/utils/fonts.js';

const mockFonts = [
  {
    font: 'latin.ttf',
    ranges: [
      [65, 90],
      [97, 122],
    ], // A-Z, a-z
  },
  {
    font: 'numbers.ttf',
    ranges: [[48, 57]], // 0-9
  },
];

describe('FontLookup.findFont', () => {
  const lookup = new FontLookup(mockFonts);

  test('returns font path when character is within range', () => {
    // 'A' has char code 65
    assert.ok(lookup.findFont(65)?.endsWith('latin.ttf'));
    // 'Z' has char code 90
    assert.ok(lookup.findFont(90)?.endsWith('latin.ttf'));
    // 'M' has char code 77
    assert.ok(lookup.findFont(77)?.endsWith('latin.ttf'));
  });

  test('returns undefined when character is outside all ranges', () => {
    // '!' has char code 33
    assert.equal(lookup.findFont(33), undefined);
    // '@' has char code 64
    assert.equal(lookup.findFont(64), undefined);
  });

  test('handles edge cases at range boundaries', () => {
    // 'A' is at start of range [65, 90]
    assert.ok(lookup.findFont(65)?.endsWith('latin.ttf'));
    // 'Z' is at end of range [65, 90]
    assert.ok(lookup.findFont(90)?.endsWith('latin.ttf'));
    // Just outside range
    assert.equal(lookup.findFont(64), undefined);
    assert.equal(lookup.findFont(91), undefined);
  });

  test('returns correct font for different character sets', () => {
    // Latin lowercase 'a' = 97
    assert.ok(lookup.findFont(97)?.endsWith('latin.ttf'));
    // Number '0' = 48
    assert.ok(lookup.findFont(48)?.endsWith('numbers.ttf'));
    // Number '9' = 57
    assert.ok(lookup.findFont(57)?.endsWith('numbers.ttf'));
  });
});

describe('FontLookup.getRequiredFonts', () => {
  const lookup = new FontLookup(mockFonts);

  test('returns empty array when no text nodes in SVG', () => {
    const svg = '<svg><rect /></svg>';
    const result = lookup.getRequiredFonts(svg);
    assert.deepEqual(result, []);
  });

  test('returns empty array for empty text node', () => {
    const svg = '<svg><text></text></svg>';
    const result = lookup.getRequiredFonts(svg);
    assert.deepEqual(result, []);
  });

  test('finds font for Latin characters', () => {
    const svg = '<svg><text>Hello</text></svg>';
    const result = lookup.getRequiredFonts(svg);
    assert.equal(result.length, 1);
    assert.ok(result[0].endsWith('latin.ttf'));
  });

  test('finds font for numeric characters', () => {
    const svg = '<svg><text>123</text></svg>';
    const result = lookup.getRequiredFonts(svg);
    assert.equal(result.length, 1);
    assert.ok(result[0].endsWith('numbers.ttf'));
  });

  test('finds multiple fonts when needed', () => {
    const svg = '<svg><text>Hello123</text></svg>';
    const result = lookup.getRequiredFonts(svg);
    assert.equal(result.length, 2);
  });

  test('handles multiple text nodes', () => {
    const svg = '<svg><text>ABC</text><text>123</text></svg>';
    const result = lookup.getRequiredFonts(svg);
    assert.equal(result.length, 2);
  });

  test('does not duplicate fonts', () => {
    const svg = '<svg><text>ABC</text><text>DEF</text></svg>';
    const result = lookup.getRequiredFonts(svg);
    assert.equal(result.length, 1);
    assert.ok(result[0].endsWith('latin.ttf'));
  });

  test('handles text nodes with attributes', () => {
    const svg = '<svg><text x="10" y="20" fill="black">Test</text></svg>';
    const result = lookup.getRequiredFonts(svg);
    assert.equal(result.length, 1);
    assert.ok(result[0].endsWith('latin.ttf'));
  });

  test('returns empty array when no matching font found', () => {
    const svg = '<svg><text>!</text></svg>'; // '!' is char code 33, not in our mock ranges
    const result = lookup.getRequiredFonts(svg);
    assert.deepEqual(result, []);
  });
});

describe('FontLookup binary search', () => {
  test('handles unsorted ranges correctly', () => {
    // Ranges are intentionally unsorted - FontLookup should sort them
    const fonts = [
      {
        font: 'test.ttf',
        ranges: [
          [200, 250],
          [65, 90],
          [100, 150],
        ],
      },
    ];
    const lookup = new FontLookup(fonts);

    // All should be found despite unsorted input
    assert.ok(lookup.findFont(65)?.endsWith('test.ttf'));
    assert.ok(lookup.findFont(90)?.endsWith('test.ttf'));
    assert.ok(lookup.findFont(100)?.endsWith('test.ttf'));
    assert.ok(lookup.findFont(150)?.endsWith('test.ttf'));
    assert.ok(lookup.findFont(200)?.endsWith('test.ttf'));
    assert.ok(lookup.findFont(250)?.endsWith('test.ttf'));

    // Outside ranges
    assert.equal(lookup.findFont(64), undefined);
    assert.equal(lookup.findFont(91), undefined);
    assert.equal(lookup.findFont(99), undefined);
    assert.equal(lookup.findFont(151), undefined);
  });

  test('maintains font priority order', () => {
    // First font should win when ranges overlap
    const fonts = [
      {
        font: 'primary.ttf',
        ranges: [[65, 90]],
      },
      {
        font: 'fallback.ttf',
        ranges: [[65, 122]], // Overlaps with primary
      },
    ];
    const lookup = new FontLookup(fonts);

    // 'A' (65) is in both fonts, primary should win
    assert.ok(lookup.findFont(65)?.endsWith('primary.ttf'));

    // 'a' (97) is only in fallback
    assert.ok(lookup.findFont(97)?.endsWith('fallback.ttf'));
  });
});
