import { JSONSchema7 } from 'json-schema';

const schema: JSONSchema7 = {
  $schema: 'http://json-schema.org/draft-07/schema#',
  properties: {
    mood: {
      type: 'array',
      items: {
        type: 'string',
        enum: ['happy', 'sad', 'surprised'],
      },
    },
  },
};

export default schema;
