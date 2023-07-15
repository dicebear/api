import { FastifyPluginCallback } from 'fastify';
import { JSONSchema7 } from 'json-schema';
import * as qs from '../utils/query-string.js';

// @ts-ignore
import mergeAllOf from 'json-schema-merge-allof';
import { paramCase } from 'param-case';
import config from '../../config.js';
import { AvatarRouteParams, Version } from '../../../types.js';
import { applyMaxSize } from '../utils/apply-max-size.js';
import { toFormat } from '@dicebear/converter';

type Options = Version;

const paramsSchema = (options: JSONSchema7): JSONSchema7 => {
  const { definitions, ...restOptions } = options;

  return {
    $schema: 'http://json-schema.org/draft-07/schema#',
    type: 'object',
    definitions: definitions,
    properties: {
      seed: {
        type: 'string',
      },
      format: {
        type: 'string',
        enum: ['svg', 'png', 'jpg', 'json', 'schema.json'],
      },
      options: restOptions,
    },
    required: ['format'],
  };
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
  { createAvatar, routes, schema, styles, exif = undefined }
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
          preValidation: async (request) => {
            if (typeof request.params.options === 'string') {
              request.params.options = qs.parse(request.params.options);
            }
          },
          schema: {
            querystring: queryStringSchema,
            params: paramsSchema(queryStringSchema),
          },
        },
        async (request, reply) => {
          const format = request.params.format ?? 'svg';

          if (format === 'schema.json') {
            reply.header('Content-Type', 'application/json');

            return JSON.stringify(queryStringSchema, undefined, 2);
          }

          let options: any = request.params.options || request.query;

          // Validate Size for PNG Format
          if (format === 'png') {
            options = applyMaxSize(
              options,
              config.png.size.min,
              config.png.size.max,
              config.png.size.default
            );
          }

          // Validate Size for JPEG Format
          if (format === 'jpg') {
            options = applyMaxSize(
              options,
              config.jpeg.size.min,
              config.jpeg.size.max,
              config.jpeg.size.default
            );
          }

          // Define default seed
          options['seed'] = request.params.seed ?? options['seed'] ?? '';

          // Define filename
          const filename = `${styleName}.${format}`;

          reply.header('Content-Disposition', `inline; filename="${filename}"`);

          // Create avatar
          const avatar = createAvatar(style, options);

          reply.header('X-Robots-Tag', 'noindex');
          reply.header(
            'Cache-Control',
            `max-age=${config.cacheControl.avatar}`
          );

          if (format)
            switch (format) {
              case 'svg':
                reply.header('Content-Type', 'image/svg+xml');

                return avatar.toString();

              case 'png':
                if (false === config.png.enabled) {
                  reply.status(404);
                  reply.send();

                  return;
                }

                reply.header('Content-Type', 'image/png');

                var result = await toFormat(
                  avatar.toString(),
                  'png',
                  config.png.exif && exif ? exif(style) : undefined
                ).toArrayBuffer();

                return Buffer.from(result);

              case 'jpg':
                if (false === config.jpeg.enabled) {
                  reply.status(404);
                  reply.send();

                  return;
                }

                reply.header('Content-Type', 'image/jpeg');

                var result = await toFormat(
                  avatar.toString(),
                  'jpeg',
                  config.jpeg.exif && exif ? exif(style) : undefined
                ).toArrayBuffer();

                return Buffer.from(result);

              case 'json':
                if (typeof avatar !== 'object' || !avatar.toJson || false === config.json.enabled) {
                  reply.status(404);
                  reply.send();

                  return;
                }

                reply.header('Content-Type', 'application/json');

                return JSON.stringify(avatar.toJson());
            }
        }
      );
    }
  }
};

export default plugin;
