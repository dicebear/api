import { Options } from 'ajv';

export const options: Options = {
  coerceTypes: 'array',
  removeAdditional: true,
  useDefaults: false,
};

export function validate() {}
