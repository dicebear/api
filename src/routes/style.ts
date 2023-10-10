import type { FastifyPluginCallback } from 'fastify';
import type { Style, StyleSchema } from '@dicebear/core';
import type { Core } from '../types.js';
import { schemaHandler } from '../handler/schema.js';
import { parseQueryString } from '../utils/parseQueryString.js';
import { JSONSchema7Definition } from 'json-schema';
import { avatarHandler } from '../handler/avatar.js';

type Options = {
  core: Core;
  style: Style<any>;
};

export const styleRoutes: FastifyPluginCallback<Options> = (
  app,
  { core, style },
  done
) => {
  const optionsSchema: Record<string, JSONSchema7Definition> = {
    ...core.schema.properties,
    ...style.schema?.properties,
  };

  const paramsSchema: Record<string, JSONSchema7Definition> = {
    format: {
      type: 'string',
      enum: ['svg', 'png', 'jpg', 'json'],
    },
  };

  app.route({
    method: 'GET',
    url: '/schema.json',
    handler: schemaHandler(optionsSchema),
  });

  app.route({
    method: 'GET',
    url: '/:format',
    schema: {
      querystring: optionsSchema,
      params: paramsSchema,
    },
    handler: avatarHandler(optionsSchema),
  });

  app.route<{ Params: { options: string | StyleSchema } }>({
    method: 'GET',
    url: '/:format/:options',
    preValidation: async (request) => {
      if (typeof request.params.options === 'string') {
        request.query = parseQueryString(request.params.options);
      }
    },
    schema: {
      querystring: optionsSchema,
      params: paramsSchema,
    },
    handler: avatarHandler(optionsSchema),
  });

  done();
};
