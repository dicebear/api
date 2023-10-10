import { config } from './config.js';
import fastify from 'fastify';

import { parseQueryString } from './utils/parseQueryString.js';
import { versionRoutes } from './routes/version.js';
import { getVersions } from './utils/getVersions.js';

(async () => {
  const app = fastify({
    logger: config.logger,
    querystringParser: (str) => parseQueryString(str),
    ajv: {
      customOptions: {
        coerceTypes: 'array',
        removeAdditional: true,
        useDefaults: false,
      },
    },
    maxParamLength: 1024,
  });

  app.register(versionRoutes, { versions: await getVersions() });

  app.ready((err) => {
    if (err) throw err;
  });

  try {
    await app.listen({
      port: config.port,
      host: config.host,
    });

    console.info(`Server listening at http://${config.host}:${config.port}`);
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
})();
