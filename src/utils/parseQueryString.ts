import qs from 'qs';

export function parseQueryString(str: string): Record<string, unknown> {
  const result = Object.create(null);
  // @see https://github.com/dicebear/dicebear/issues/382
  const preparedStr = str.replaceAll('%2C', ',');
  const parsed = qs.parse(preparedStr, {
    comma: true,
    plainObjects: true,
    depth: 1,
  });

  for (const key of Object.keys(parsed)) {
    let value = parsed[key];

    // A seed could be parsed as an array due to commas. In this case convert back to a string.
    if (key === 'seed' && Array.isArray(value)) {
      value = value.join(',');
    }

    // Only add non-empty values
    if (Array.isArray(value)) {
      result[key] = value.filter((v) => v !== '');
    } else if (value !== '') {
      result[key] = [value];
    }
  }

  return result;
}
