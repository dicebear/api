import { config } from './config.js';
import fastify from 'fastify';
import cors from '@fastify/cors';

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

  await app.register(cors);

  await app.register(versionRoutes, { versions: await getVersions() });

  return app;
};
