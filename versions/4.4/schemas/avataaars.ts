import { JSONSchema7 } from 'json-schema';

const schema: JSONSchema7 = {
  $schema: 'http://json-schema.org/draft-07/schema#',
  definitions: {
    chance: {
      type: 'integer',
      minimum: 0,
      maximum: 100,
    },
    color: {
      type: 'array',
      items: {
        type: 'string',
        enum: [
          'black',
          'blue',
          'gray',
          'heather',
          'pastel',
          'pink',
          'red',
          'white',
        ],
      },
    },
    hairColor: {
      type: 'array',
      items: {
        type: 'string',
        enum: [
          'auburn',
          'black',
          'blonde',
          'brown',
          'pastel',
          'platinum',
          'red',
          'gray',
        ],
      },
    },
  },
  properties: {
    style: {
      type: 'string',
      enum: ['transparent', 'circle'],
    },
    mode: {
      type: 'string',
      enum: ['include', 'exclude'],
    },
    top: {
      type: 'array',
      items: {
        type: 'string',
        enum: ['longHair', 'shortHair', 'eyepatch', 'hat', 'hijab', 'turban'],
      },
    },
    topChance: {
      $ref: '#/definitions/chance',
    },
    hatColor: {
      $ref: '#/definitions/color',
    },
    hairColor: {
      $ref: '#/definitions/hairColor',
    },
    accessories: {
      type: 'array',
      items: {
        type: 'string',
        enum: [
          'kurt',
          'prescription01',
          'prescription02',
          'round',
          'sunglasses',
          'wayfarers',
        ],
      },
    },
    accessoriesChance: {
      $ref: '#/definitions/chance',
    },
    accessoriesColor: {
      $ref: '#/definitions/color',
    },
    facialHair: {
      type: 'array',
      items: {
        type: 'string',
        enum: [
          'medium',
          'light',
          'majestic',
          'fancy',
          'magnum',
          'pastel',
          'gray',
        ],
      },
    },
    facialHairChance: {
      $ref: '#/definitions/chance',
    },
    facialHairColor: {
      $ref: '#/definitions/hairColor',
    },
    clothes: {
      type: 'array',
      items: {
        type: 'string',
        enum: ['blazer', 'sweater', 'shirt', 'hoodie', 'overall'],
      },
    },
    clothesColor: {
      $ref: '#/definitions/color',
    },
    eyes: {
      type: 'array',
      items: {
        type: 'string',
        enum: [
          'close',
          'cry',
          'default',
          'dizzy',
          'roll',
          'happy',
          'hearts',
          'side',
          'squint',
          'surprised',
          'wink',
          'winkWacky',
        ],
      },
    },
    eyebrow: {
      type: 'array',
      items: {
        type: 'string',
        enum: [
          'angry',
          'default',
          'flat',
          'raised',
          'sad',
          'unibrow',
          'up',
          'frown',
        ],
      },
    },
    mouth: {
      type: 'array',
      items: {
        type: 'string',
        enum: [
          'concerned',
          'default',
          'disbelief',
          'eating',
          'grimace',
          'sad',
          'scream',
          'serious',
          'smile',
          'tongue',
          'twinkle',
          'vomit',
        ],
      },
    },
    skin: {
      type: 'array',
      items: {
        type: 'string',
        enum: [
          'tanned',
          'yellow',
          'pale',
          'light',
          'brown',
          'darkBrown',
          'black',
        ],
      },
    },
  },
};

export default schema;
