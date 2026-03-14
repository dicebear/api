import { config } from './config.js';
import fastify from 'fastify';
import cors from '@fastify/cors';

import {
  parseQueryString,
  QueryStringRangeError,
} from './utils/query-string.js';
import { getVersionsQueryLimits } from './utils/schema.js';
import { versionRoutes } from './routes/version.js';
import { getVersions } from './utils/versions.js';
import { Font } from './types.js';
import { FontLookup } from './utils/fonts.js';
import { fileURLToPath } from 'url';
import { promises as fs } from 'fs';
import * as path from 'path';

const __dirname = fileURLToPath(new URL('.', import.meta.url));

export const app = async () => {
  const versions = await getVersions();

  const { arrayLimit, parameterLimit } = getVersionsQueryLimits(versions);
  const app = fastify({
    logger: config.logger,
    ajv: {
      customOptions: {
        coerceTypes: 'array',
        removeAdditional: true,
        useDefaults: false,
      },
    },
    routerOptions: {
      maxParamLength: 1024,
      querystringParser: (str) => {
        try {
          return parseQueryString(str, arrayLimit, parameterLimit);
        } catch (error) {
          if (error instanceof QueryStringRangeError) {
            return { _error: error };
          }
          throw error;
        }
      },
    },
  });

  const fonts = JSON.parse(
    await fs.readFile(path.join(__dirname, '../fonts/fonts.json'), 'utf-8'),
  ) as Font[];

  app.decorate('fontLookup', new FontLookup(fonts));

  app.addHook('onRequest', (request, reply, done) => {
    const query = request.query as Record<string, unknown>;
    if (query._error instanceof QueryStringRangeError) {
      const { statusCode, code, message } = query._error;
      reply.status(statusCode).send({
        statusCode,
        code,
        error: 'Bad Request',
        message,
      });
      return;
    }
    done();
  });

  await app.register(cors);

  await app.register(versionRoutes, { versions });

  return app;
};
