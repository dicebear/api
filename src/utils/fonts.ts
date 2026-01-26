import path from 'path';
import { Font } from '../types.js';
import { fileURLToPath } from 'url';

const __dirname = fileURLToPath(new URL('.', import.meta.url));
const FONTS_DIR = path.join(__dirname, '../../fonts');
const TEXT_NODE_REGEX = /<text.*?>(.*?)<\/text>/gs;

type SortedFont = {
  fontPath: string;
  ranges: [number, number][]; // Sorted by start value
};

/**
 * FontLookup provides optimized font resolution using binary search.
 * Create once at app startup and reuse for all requests.
 */
export class FontLookup {
  private fonts: SortedFont[];

  constructor(fonts: Font[]) {
    // Pre-compute font paths and sort ranges for binary search
    this.fonts = fonts.map((font) => ({
      fontPath: path.join(FONTS_DIR, font.font),
      ranges: [...font.ranges].sort((a, b) => a[0] - b[0]),
    }));
  }

  /**
   * Binary search to check if a character code is covered by any range in a font.
   * Returns true if found, false otherwise.
   */
  private hasCharCode(ranges: [number, number][], charCode: number): boolean {
    let left = 0;
    let right = ranges.length - 1;

    while (left <= right) {
      const mid = (left + right) >>> 1;
      const [start, end] = ranges[mid];

      if (charCode < start) {
        right = mid - 1;
      } else if (charCode > end) {
        left = mid + 1;
      } else {
        return true;
      }
    }

    return false;
  }

  /**
   * Find the first font that covers the given character code.
   * Maintains priority order from the original fonts array.
   */
  findFont(charCode: number): string | undefined {
    for (const font of this.fonts) {
      if (this.hasCharCode(font.ranges, charCode)) {
        return font.fontPath;
      }
    }
    return undefined;
  }

  /**
   * Get all required font paths for rendering text in an SVG.
   * Uses binary search for O(fonts × log(ranges)) instead of O(fonts × ranges).
   */
  getRequiredFonts(svg: string): string[] {
    const requiredFonts = new Set<string>();

    // Reset regex lastIndex since we're reusing a global regex
    TEXT_NODE_REGEX.lastIndex = 0;

    let match;
    while ((match = TEXT_NODE_REGEX.exec(svg)) !== null) {
      const text = match[1];

      for (const char of text) {
        const fontPath = this.findFont(char.charCodeAt(0));
        if (fontPath) {
          requiredFonts.add(fontPath);
        }
      }
    }

    return [...requiredFonts];
  }
}
