import fastify from 'fastify';
import qs from 'qs';
import deepmerge from 'deepmerge';

import config from '../config';
import routes from './routes';

const app = fastify({
  logger: true,
  querystringParser: (str) => qs.parse(str),
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
