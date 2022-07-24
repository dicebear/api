import qs from 'query-string';
import { ArrayFormats } from '../../../types';

export function parse(str: string): Record<string, unknown> {
  const arrayFormats: ArrayFormats[] = ['separator', 'bracket-separator'];
  const result = Object.create(null);

  for (const arrayFormat of arrayFormats) {
    const values = qs.parse(str, { arrayFormat });

    for (const key of Object.keys(values)) {
      const isValidKey = /^[a-z]+$/i.test(key);
      const isUndefinedKey = undefined === result[key];
      const isArrayValue = Array.isArray(values[key]);

      if (isValidKey && (isUndefinedKey || isArrayValue)) {
        result[key] = values[key];
      }
    }
  }

  return result;
}
