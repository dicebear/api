import type { FastifyPluginCallback } from 'fastify';
import type { StyleEntry } from '../types.js';
import { styleRoutes } from './style.js';

type Options = {
  styles: Map<string, StyleEntry>;
};

export const collectionRoutes: FastifyPluginCallback<Options> = (
  app,
  { styles },
  done,
) => {
  app.get('/', async () => ({ styles: [...styles.keys()] }));

  for (const [name, entry] of styles) {
    app.register(styleRoutes, {
      prefix: `/${name}`,
      entry,
    });
  }

  done();
};
