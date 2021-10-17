import type { FastifyPluginCallback } from 'fastify';
import deepmerge from 'deepmerge';

import * as collection from '@dicebear/collection';

import { createRoutes } from './utils/createRoutes';
import { camelCaseToKebabCase } from './utils/camelCaseToKebabCase';

const api: FastifyPluginCallback = async (app) => {
  app.addHook<{ Querystring: any }>('preValidation', async (request) => {
    if (request.query && request.query.options) {
      request.query = deepmerge(request.query.options, request.query);
    }

    delete request.query.base64;
    delete request.query.dataUri;
  });

  Object.keys(collection).forEach((key) => {
    const style = collection[key as keyof typeof collection];

    app.register(createRoutes(camelCaseToKebabCase(key), style));
  });
};

export default api;
