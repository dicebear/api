import { config } from './config.js';
import fastify from 'fastify';
import cors from '@fastify/cors';

import {
  parseQueryString,
  QueryStringRangeError,
} from './utils/query-string.js';
import { getQueryLimits } from './utils/schema.js';
import { collectionRoutes } from './routes/collection.js';
import { loadDefinitions } from './utils/definitions.js';
import { Font } from './types.js';
import { FontLookup } from './utils/fonts.js';
import { fileURLToPath } from 'url';
import { promises as fs } from 'fs';
import * as path from 'path';

const __dirname = fileURLToPath(new URL('.', import.meta.url));

export const app = async () => {
  const versionMap = new Map<number, ReturnType<typeof loadDefinitions>>();

  for (const version of config.versions) {
    versionMap.set(version, loadDefinitions(version));
  }

  const { arrayLimit, parameterLimit } = getQueryLimits([
    ...versionMap.values(),
  ]);

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

  const [fontsRaw, blocklistRaw] = await Promise.all([
    fs.readFile(path.join(__dirname, '../fonts/fonts.json'), 'utf-8'),
    fs.readFile(
      path.join(__dirname, '../data/initials-blocklist.json'),
      'utf-8',
    ),
  ]);

  const fonts = JSON.parse(fontsRaw) as Font[];
  const initialsBlocklist = JSON.parse(blocklistRaw) as string[];

  app.decorate('fontLookup', new FontLookup(fonts));
  app.decorate('queryLimits', { arrayLimit, parameterLimit });
  app.decorate('initialsBlocklist', new Set(initialsBlocklist));

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

      return done();
    }

    done();
  });

  await app.register(cors);

  app.get('/health', async () => ({ status: 'ok' }));

  for (const [version, styles] of versionMap) {
    await app.register(collectionRoutes, {
      prefix: `/${version}.x`,
      styles,
    });
  }

  return app;
};
