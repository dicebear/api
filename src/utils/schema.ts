import { config } from '../config.js';
import type { StyleEntry } from '../types.js';

const BASE_OPTION_COUNT = 12;
const OPTIONS_PER_COMPONENT = 5;
const OPTIONS_PER_COLOR = 4;

export function getQueryLimits(allVersionStyles: Map<string, StyleEntry>[]): {
  arrayLimit: number;
  parameterLimit: number;
} {
  let arrayLimit = config.queryString.arrayLimitMin;
  let parameterLimit = config.queryString.parameterLimitMin;

  for (const styles of allVersionStyles) {
    for (const { style } of styles.values()) {
      const componentCount = style.components().size;
      const colorCount = style.colors().size + 1;
      // Every animation name adds a switch and a speed option.
      const animationCount = style.animationNames().length * 2;
      const total =
        BASE_OPTION_COUNT +
        componentCount * OPTIONS_PER_COMPONENT +
        colorCount * OPTIONS_PER_COLOR +
        animationCount;
      parameterLimit = Math.max(parameterLimit, total);

      for (const [, component] of style.components()) {
        arrayLimit = Math.max(arrayLimit, component.variants().size);
      }

      for (const [, color] of style.colors()) {
        arrayLimit = Math.max(arrayLimit, color.values().length);
      }
    }
  }

  return { arrayLimit, parameterLimit };
}
