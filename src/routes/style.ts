import type { FastifyPluginCallback } from 'fastify';
import type { JSONSchema7 } from 'json-schema';
import type { Core, Style } from '../types.js';
import { schemaHandler } from '../handler/schema.js';
import { parseQueryString } from '../utils/query-string.js';
import { getSchemaLimits } from '../utils/schema.js';
import { AvatarRequest, avatarHandler } from '../handler/avatar.js';
import { config } from '../config.js';

type Options = {
  core: Core;
  style: Style;
};

const paramsSchema: JSONSchema7 = {
  $schema: 'http://json-schema.org/draft-07/schema#',
  type: 'object',
  properties: {
    format: {
      type: 'string',
      enum: [
        'svg',
        ...(config.png.enabled ? ['png'] : []),
        ...(config.jpeg.enabled ? ['jpg', 'jpeg'] : []),
        ...(config.webp.enabled ? ['webp'] : []),
        ...(config.avif.enabled ? ['avif'] : []),
        ...(config.json.enabled ? ['json'] : []),
      ],
    },
  },
};

// Route patterns for avatar endpoints
const AVATAR_ROUTES = [
  { url: '/:format', hasPathOptions: false },
  { url: '/:format/:options', hasPathOptions: true },
] as const;

export const styleRoutes: FastifyPluginCallback<Options> = (
  app,
  { core, style },
  done,
) => {
  const optionsSchema: JSONSchema7 = {
    $schema: 'http://json-schema.org/draft-07/schema#',
    type: 'object',
    properties: {
      ...core.schema.properties,
      ...style.schema?.properties,
    },
  };

  const { arrayLimit, parameterLimit } = getSchemaLimits(optionsSchema);

  app.route({
    method: 'GET',
    url: '/schema.json',
    handler: schemaHandler(optionsSchema),
  });

  for (const { url, hasPathOptions } of AVATAR_ROUTES) {
    app.route<AvatarRequest>({
      method: 'GET',
      url,
      ...(hasPathOptions && {
        preValidation: async (request) => {
          if (typeof request.params.options === 'string') {
            request.query = parseQueryString(
              request.params.options,
              arrayLimit,
              parameterLimit,
            );
          }
        },
      }),
      schema: {
        querystring: optionsSchema,
        params: paramsSchema,
      },
      handler: avatarHandler(app, core, style),
    });
  }

  done();
};
