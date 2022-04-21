import { FastifyPluginCallback } from 'fastify';
import { JSONSchema7 } from 'json-schema';

// @ts-ignore
import mergeAllOf from 'json-schema-merge-allof';
import { paramCase } from 'param-case';
import config from '../../config.js';
import { AvatarRouteParams, Version } from '../../../types.js';
import { adjustPngOptions } from '../utils/adjust-png-options.js';
import * as license from '../utils/license.js';
import { toFormat } from '@dicebear/converter';

type Options = Version;

const paramsSchema: JSONSchema7 = {
  $schema: 'http://json-schema.org/draft-07/schema#',
  type: 'object',
  properties: {
    seed: {
      type: 'string',
    },
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

const plugin: FastifyPluginCallback<Options> = async (
  app,
  { createAvatar, routes, schema, styles }
) => {
  for (const [styleName, style] of Object.entries(styles)) {
    // Skip private values
    if (styleName[0] === '_' || styleName === 'default') {
      continue;
    }

    // Combine core schema with style schema.
    let queryStringSchema = mergeAllOf(
      {
        allOf: [schema, style.schema, propertiesOverrideSchema],
        additionalItems: true,
      },
      { ignoreAdditionalProperties: true }
    );

    // Create handler for all routes
    for (const route of routes) {
      // Replace ':style' in Route with style name.
      const parsedRoute = route.replace(':style', paramCase(styleName));

      // Create GET handler
      app.get<{ Params: AvatarRouteParams }>(
        parsedRoute,
        {
          schema: { querystring: queryStringSchema, params: paramsSchema },
        },
        async (request, reply) => {
          let options: any = request.query;

          const format = request.params.format ?? 'svg';

          // Validate Size for PNG Format
          if (format === 'png') {
            options = adjustPngOptions(options);
          }

          // Define default seed
          options['seed'] = request.params.seed ?? options['seed'] ?? '';

          // Create avatar
          const svg = createAvatar(style, options).toString();

          reply.header(
            'Cache-Control',
            `max-age=${config.cacheControl.avatar}`
          );

          switch (format) {
            case 'svg':
              reply.header('Content-Type', 'image/svg+xml');

              return svg;

            case 'png':
              if (false === config.png.enabled) {
                reply.status(404);

                return;
              }

              reply.header('Content-Type', 'image/png');

              const exif = config.png.exif
                ? license.exif(styleName)
                : undefined;

              let result = await toFormat(svg, format, exif).toArrayBuffer();

              return Buffer.from(result);
          }
        }
      );
    }
  }
};

export default plugin;
