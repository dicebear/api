import type { FastifyPluginCallback } from 'fastify';
import type { Version } from '../types.js';
import { collectionRoutes } from './collection.js';

type Options = {
  versions: Record<string, Version>;
};

export const versionRoutes: FastifyPluginCallback<Options> = (
  app,
  { versions },
  done
) => {
  for (const [prefix, version] of Object.entries(versions)) {
    app.register(collectionRoutes, {
      prefix: `/${prefix}`,
      version,
    });
  }

  done();
};
