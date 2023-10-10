import { FastifyPluginCallback } from 'fastify';
import { Style, StyleSchema } from '@dicebear/core';
import { Core, CreateAvatar, Version } from '../types';

type Options = {
  core: Core;
  style: Style<any>;
};

const plugin: FastifyPluginCallback<Options> = function avatar(
  app,
  { core, style }
) {
  app.get();
};
