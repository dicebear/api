import fastify from 'fastify';
import * as qs from 'qs';
import deepmerge from 'deepmerge';
import isNumber from 'is-number';

import config from '../config.js';
import routes from './routes.js';

type Options = {
  logger?: boolean;
};

export const core = async ({ logger = config.logger }: Options) => {
  const app = fastify({
    logger,
    querystringParser: (str) =>
      qs.parse(str, {
        comma: true,
        decoder: (str, defaultDecoder, charset) => {
          return isNumber(str)
            ? parseFloat(str)
            : defaultDecoder(str, undefined, charset);
        },
      }),
    ajv: {
      customOptions: {
        coerceTypes: 'array',
        removeAdditional: true,
        useDefaults: false,
      },
    },
  });

  app.addHook<{ Querystring: any }>('preValidation', async (request) => {
    if (request.query && request.query.options) {
      request.query = deepmerge(request.query.options, request.query);
    }
  });

  await app.register(routes);

  app.ready((err) => {
    if (err) throw err;
  });

  return app;
};
