import { renderAsync } from '@resvg/resvg-js';
import { FastifyPluginCallback } from 'fastify';
import { JSONSchema7 } from 'json-schema';
import mergeAllOf from 'json-schema-merge-allof';
import { paramCase } from 'param-case';
import { adjustPngOptions } from '../utils/adjustPngOptions';

type Options = {
  alias: string;
  core: {
    schema: JSONSchema7;
    createAvatar: (style: unknown, options: unknown) => string;
  };
  collection: Record<
    string,
    {
      schema: JSONSchema7;
    }
  >;
};

const paramsSchema: JSONSchema7 = {
  $schema: 'http://json-schema.org/draft-07/schema#',
  type: 'object',
  properties: {
    format: {
      type: 'string',
      enum: ['svg', 'png'],
    },
  },
  required: ['format'],
};

const propertiesOverrideSchema: JSONSchema7 = {
  $schema: 'http://json-schema.org/draft-07/schema#',
  type: 'object',
  properties: {
    base64: false,
    dataUri: false,
  },
};

const plugin: FastifyPluginCallback<Options> = async (app, { core, collection, alias }) => {
  for (const key in collection) {
    if (false === collection.hasOwnProperty(key)) {
      continue;
    }

    const style = collection[key];

    let schema = mergeAllOf(
      {
        allOf: [core.schema, style.schema, propertiesOverrideSchema],
        additionalItems: true,
      },
      { ignoreAdditionalProperties: true }
    );

    app.get<{ Params: { format: 'svg' | 'png' } }>(
      `/${paramCase(key)}/:format`,
      {
        schema: { querystring: schema, params: paramsSchema, tags: [`v${alias}`] },
      },
      async (request, reply) => {
        let options: any = request.query;
        const format = request.params.format;

        // Validate Size for PNG Format
        if (format === 'png') {
          options = adjustPngOptions(options);
        }

        // Define default seed
        options['seed'] = options['seed'] ?? '';

        // Create avatar
        const svg = core.createAvatar(style, options);

        reply.header('Cache-Control', `max-age=${60 * 60 * 24 * 365}`);

        switch (format) {
          case 'svg':
            reply.header('Content-Type', 'image/svg+xml');

            return svg;

          case 'png':
            const png = await renderAsync(svg, {
              font: {
                loadSystemFonts: key === 'identicon',
              },
            });

            reply.header('Content-Type', 'image/png');

            return png;
        }
      }
    );
  }
};

export default plugin;
