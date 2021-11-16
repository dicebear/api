import fastify from 'fastify';
import swagger from 'fastify-swagger';
import qs from 'query-string';

import routes from './routes';

const port = process.env.PORT || 3000;
const app = fastify({
  logger: true,
  querystringParser: (str) =>
    qs.parse(str, {
      arrayFormat: 'comma',
    }),
  ajv: {
    customOptions: {
      coerceTypes: 'array',
      removeAdditional: true,
      useDefaults: false,
    },
  },
});

const start = async () => {
  app.register(swagger, {
    routePrefix: '/docs',
    hideUntagged: true,
    swagger: {
      info: {
        title: 'DiceBear API',
        description:
          '[Privacy Policy](https://avatars.dicebear.com/legal/privacy-policy) | [Legal Notice / Impressum](https://avatars.dicebear.com/legal/legal-notice)',
        version: '5.0.0',
      },
      produces: ['image/svg+xml', 'image/png'],
      externalDocs: {
        url: 'https://dicebear.com',
        description: 'Find more info here',
      },
    },
    uiConfig: {
      docExpansion: 'none',
    },
    exposeRoute: true,
  });

  await app.register(routes);

  app.ready((err) => {
    if (err) throw err;
    app.swagger();
  });

  try {
    await app.listen(port, '0.0.0.0');
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
};
start();
