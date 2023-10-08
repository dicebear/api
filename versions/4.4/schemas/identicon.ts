import { JSONSchema7 } from 'json-schema';

const schema: JSONSchema7 = {
  $schema: 'http://json-schema.org/draft-07/schema#',
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
    colorLevel: {
      type: 'integer',
      enum: [50, 100, 200, 300, 400, 500, 600, 700, 800, 900],
    },
  },
};

export default schema;
