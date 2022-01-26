import fastify from 'fastify';
import * as qs from 'qs';
import deepmerge from 'deepmerge';

import config from '../config.js';
import routes from './routes.js';

const app = fastify({
  logger: true,
  querystringParser: (str) => qs.parse(str, { comma: true }),
  ajv: {
    customOptions: {
      coerceTypes: 'array',
      removeAdditional: true,
      useDefaults: false,
    },
  },
});

const start = async () => {
  app.addHook<{ Querystring: any }>('preValidation', async (request) => {
    if (request.query && request.query.options) {
      request.query = deepmerge(request.query.options, request.query);
    }
  });

  await app.register(routes);

  app.ready((err) => {
    if (err) throw err;
  });

  try {
    await app.listen(config.port, config.address);
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
};
start();
