import { JSONSchema7 } from 'json-schema';

const schema: JSONSchema7 = {
  $schema: 'http://json-schema.org/draft-07/schema#',
  properties: {
    colorful: {
      type: ['boolean', 'number'],
    },
    deterministic: {
      type: ['boolean', 'number'],
    },
  },
};

export default schema;
