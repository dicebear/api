import type { FastifyPluginCallback } from 'fastify';
import type { StyleEntry } from '../types.js';
import { styleRoutes } from './style.js';
import { config } from '../config.js';

type Options = {
  styles: Map<string, StyleEntry>;
};

/**
 * Fastify plugin for registering collection-level routes.
 * Registers a GET endpoint to retrieve a sorted list of style names,
 * and sub-routes for each style using the styleRoutes plugin.
 */
export const collectionRoutes: FastifyPluginCallback<Options> = (
  app,
  { styles },
  done,
) => {
  const styleNames = [...styles.keys()].sort();

  app.get(
    '/',
    {
      schema: {
        response: {
          200: {
            type: 'object',
            properties: {
              styles: { type: 'array', items: { type: 'string' } },
            },
            required: ['styles'],
          },
        },
      },
    },
    async (_request, reply) => {
      reply.header('Cache-Control', `max-age=${config.cacheControl.styles}`);

      return { styles: styleNames };
    },
  );

  for (const [name, entry] of styles) {
    app.register(styleRoutes, {
      prefix: `/${name}`,
      entry,
    });
  }

  done();
};
