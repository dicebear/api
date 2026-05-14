import qs from 'qs';

import { config } from '../config.js';

export class QueryStringRangeError extends Error {
  statusCode = 400;
  code = 'FST_ERR_VALIDATION';

  constructor(message: string) {
    super(message);
    this.name = 'QueryStringRangeError';
  }
}

export function parseQueryString(
  str: string,
  arrayLimit = config.queryString.arrayLimitMin,
  parameterLimit = config.queryString.parameterLimitMin,
): Record<string, unknown> {
  const result = Object.create(null);

  let parsed;

  try {
    parsed = qs.parse(str, {
      comma: true,
      plainObjects: true,
      arrayLimit,
      parameterLimit,
      throwOnLimitExceeded: true,
      depth: 1,
    });
  } catch (error) {
    if (error instanceof RangeError) {
      throw new QueryStringRangeError(error.message);
    }

    throw error;
  }

  for (const key of Object.keys(parsed)) {
    let value = parsed[key];

    // A seed could be parsed as an array due to commas. In this case convert back to a string.
    if (key === 'seed' && Array.isArray(value)) {
      value = value.join(',');
    }

    // Only add non-empty values
    if (Array.isArray(value)) {
      result[key] = value.filter((v) => v !== '');
    } else if (value !== '' || key === 'seed') {
      result[key] = [value];
    } else {
      result[key] = [];
    }
  }

  return result;
}

export function transformWeightedFields(
  query: Record<string, unknown>,
  weightedFields: Set<string>,
): void {
  for (const key of weightedFields) {
    const value = query[key];
    if (!Array.isArray(value)) continue;

    const hasWeights = value.some(
      (v: unknown) => typeof v === 'string' && v.includes(':'),
    );
    if (!hasWeights) continue;

    const result: Record<string, number> = {};

    for (const pair of value) {
      if (typeof pair !== 'string') continue;
      const [name, weight] = pair.split(':');

      if (name) {
        result[name.trim()] = weight !== undefined ? Number(weight) : 1;
      }
    }

    query[key] = result;
  }
}
