import { FastifyPluginCallback } from 'fastify';

import avatar from './actions/avatar.js';
import config from '../config.js';

const plugin: FastifyPluginCallback = async (app) => {
  for (const version of config.versions) {
    const {
      createAvatar,
      routes,
      schema,
      styles,
      exif = undefined,
    } = await version;

    app.register(avatar, {
      createAvatar,
      routes,
      schema,
      styles,
      exif,
    });
  }
};

export default plugin;
