import { JSONSchema7 } from 'json-schema';

const schema: JSONSchema7 = {
  type: 'object',
  $schema: 'http://json-schema.org/draft-07/schema#',
  definitions: {
    radius: {
      type: 'integer',
      minimum: 0,
      maximum: 50,
    },
    size: {
      type: 'integer',
      minimum: 1,
    },
    margin: {
      type: 'integer',
      minimum: 0,
      maximum: 25,
    },
    background: {
      oneOf: [
        {
          type: 'string',
          pattern:
            '^#([a-fA-F0-9]{3}|[a-fA-F0-9]{4}|[a-fA-F0-9]{6}|[a-fA-F0-9]{8})+$',
        },
        {
          type: 'string',
          enum: ['transparent'],
        },
      ],
    },
  },
  properties: {
    radius: {
      $ref: '#/definitions/radius',
    },
    r: {
      $ref: '#/definitions/radius',
    },
    width: {
      $ref: '#/definitions/size',
    },
    w: {
      $ref: '#/definitions/size',
    },
    height: {
      $ref: '#/definitions/size',
    },
    h: {
      $ref: '#/definitions/size',
    },
    margin: {
      $ref: '#/definitions/margin',
    },
    m: {
      $ref: '#/definitions/margin',
    },
    background: {
      $ref: '#/definitions/background',
    },
    b: {
      $ref: '#/definitions/background',
    },
  },
};

export default schema;
