import type { FastifyPluginCallback } from 'fastify';
import type { StyleEntry } from '../types.js';
import {
  parseQueryString,
  transformWeightedFields,
} from '../utils/query-string.js';
import { AvatarRequest, avatarHandler } from '../handler/avatar.js';
import { config } from '../config.js';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const optionsSchema = require('@dicebear/schema/options.json');

for (const key of config.excludedOptions) {
  delete optionsSchema.properties[key];
}

const paramsSchema = {
  type: 'object' as const,
  properties: {
    format: {
      type: 'string' as const,
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

const AVATAR_ROUTES = [
  { url: '/:format', hasPathOptions: false },
  { url: '/:format/:options', hasPathOptions: true },
] as const;

type Options = {
  entry: StyleEntry;
};

export const styleRoutes: FastifyPluginCallback<Options> = (
  app,
  { entry },
  done,
) => {
  const { arrayLimit, parameterLimit } = app.queryLimits;

  for (const { url, hasPathOptions } of AVATAR_ROUTES) {
    app.route<AvatarRequest>({
      method: 'GET',
      url,
      preValidation: async (request) => {
        if (hasPathOptions && typeof request.params.options === 'string') {
          request.query = parseQueryString(
            request.params.options,
            arrayLimit,
            parameterLimit,
          );
        }

        transformWeightedFields(
          request.query as Record<string, unknown>,
          entry.weightedFields,
        );
      },
      schema: {
        querystring: optionsSchema,
        params: paramsSchema,
      },
      handler: avatarHandler(app, entry),
    });
  }

  done();
};
