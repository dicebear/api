import { JSONSchema7 } from 'json-schema';

const schema: JSONSchema7 = {
  $schema: 'http://json-schema.org/draft-07/schema#',
  properties: {
    hues: {
      type: 'array',
      items: {
        type: 'integer',
        minimum: 0,
        maximum: 360,
      },
    },
    colorLightness: {
      type: 'array',
      minItems: 2,
      maxItems: 2,
      items: {
        type: 'number',
        minimum: 0,
        maximum: 100,
      },
    },
    grayscaleLightness: {
      type: 'array',
      minItems: 2,
      maxItems: 2,
      items: {
        type: 'number',
        minimum: 0,
        maximum: 100,
      },
    },
    colorSaturation: {
      type: 'integer',
      minimum: 0,
      maximum: 100,
    },
    grayscaleSaturation: {
      type: 'integer',
      minimum: 0,
      maximum: 100,
    },
  },
};

export default schema;
