import { JSONSchema7 } from 'json-schema';

const schema: JSONSchema7 = {
  $schema: 'http://json-schema.org/draft-07/schema#',
  definitions: {
    colorLevel: {
      type: 'integer',
      enum: [50, 100, 200, 300, 400, 500, 600, 700, 800, 900],
    },
    chance: {
      type: 'integer',
      minimum: 0,
      maximum: 100,
    },
  },
  properties: {
    colors: {
      type: 'array',
      items: {
        type: 'string',
        enum: [
          'amber',
          'blue',
          'blueGrey',
          'brown',
          'cyan',
          'deepOrange',
          'deepPurple',
          'green',
          'grey',
          'indigo',
          'lightBlue',
          'lightGreen',
          'lime',
          'orange',
          'pink',
          'purple',
          'red',
          'teal',
          'yellow',
        ],
      },
    },
    colorful: {
      type: ['boolean', 'number'],
    },
    primaryColorLevel: {
      $ref: '#/definitions/colorLevel',
    },
    secondaryColorLevel: {
      $ref: '#/definitions/colorLevel',
    },
    textureChance: {
      $ref: '#/definitions/chance',
    },
    mouthChance: {
      $ref: '#/definitions/chance',
    },
    sidesChance: {
      $ref: '#/definitions/chance',
    },
    topChange: {
      $ref: '#/definitions/chance',
    },
  },
};

export default schema;
