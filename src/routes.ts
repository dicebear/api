import { FastifyPluginCallback } from 'fastify';

import stats from './actions/stats';
import avatar from './actions/avatar';
import { CoreType, VersionsType } from './types';

const plugin: FastifyPluginCallback = async (app) => {
  await app.register(stats);

  const versions: VersionsType = [
    {
      aliases: ['5.x', '5.0'],
      core: await import('@dicebear/core-5.0'),
      // @ts-ignore
      collection: await import('@dicebear/collection-5.0'),
    },
    {
      aliases: ['4.x', '4.10'],
      core: await import('@dicebear/core-4.10'),
      // @ts-ignore
      collection: await import('@dicebear/collection-4.10'),
    },
    {
      aliases: ['4.9'],
      core: await import('@dicebear/core-4.9'),
      // @ts-ignore
      collection: await import('@dicebear/collection-4.9'),
    },
    {
      aliases: ['4.8'],
      core: await import('@dicebear/core-4.8'),
      // @ts-ignore
      collection: await import('@dicebear/collection-4.8'),
    },
    {
      aliases: ['4.7'],
      core: await import('@dicebear/core-4.7'),
      // @ts-ignore
      collection: await import('@dicebear/collection-4.7'),
    },
  ];

  for (const { aliases, core, collection } of versions) {
    for (const alias of aliases) {
      app.register(avatar, {
        prefix: `/${alias}`,
        alias,
        core,
        collection,
      });
    }
  }
};

export default plugin;
