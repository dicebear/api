import fastify from 'fastify';
import swagger from 'fastify-swagger';

import routes from './routes';

const port = process.env.PORT || 3000;
const app = fastify({
  logger: true,
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
      schemes: ['https'],
    },
    uiConfig: {},
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
