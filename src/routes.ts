import { FastifyPluginCallback } from 'fastify';

import stats from './actions/stats';
import avatar from './actions/avatar';
import config from '../config';

const plugin: FastifyPluginCallback = async (app) => {
  await app.register(stats);

  for (const version of config.versions) {
    const { createAvatar, routes, schema, styles } = await version;

    app.register(avatar, {
      createAvatar,
      routes,
      schema,
      styles,
    });
  }
};

export default plugin;
