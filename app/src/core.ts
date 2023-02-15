import fastify from 'fastify';

import config from '../config.js';
import routes from './routes.js';
import * as qs from './utils/query-string.js';

export const core = async () => {
  const app = fastify({
    logger: config.logger,
    querystringParser: (str: string) => qs.parse(str),
    ajv: {
      customOptions: {
        coerceTypes: 'array',
        removeAdditional: true,
        useDefaults: false,
        strictTypes: false,
      },
    },
    maxParamLength: 1024,
  });

  await app.register(routes);

  app.ready((err) => {
    if (err) throw err;
  });

  return app;
};
