import { config } from './config.js';
import fastify from 'fastify';

import { parseQueryString } from './utils/parseQueryString.js';
import { versionRoutes } from './routes/version.js';
import { getVersions } from './utils/getVersions.js';

export const app = async () => {
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

  return app;
};
