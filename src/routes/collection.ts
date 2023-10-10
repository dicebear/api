import type { FastifyPluginCallback } from 'fastify';
import type { Version } from '../types.js';
import { kebabCase } from 'change-case';
import { styleRoutes } from './style.js';

type Options = {
  version: Version;
};

export const collectionRoutes: FastifyPluginCallback<Options> = (
  app,
  { version },
  done
) => {
  for (const [prefix, style] of Object.entries(version.collection)) {
    app.register(styleRoutes, {
      prefix: `/${kebabCase(prefix)}`,
      core: version.core,
      style,
    });
  }

  done();
};
