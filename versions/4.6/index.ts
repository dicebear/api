import type { FastifyPluginCallback } from 'fastify';
import deepmerge from 'deepmerge';

import * as male from '@dicebear/avatars-male-sprites';
import * as female from '@dicebear/avatars-female-sprites';
import * as human from '@dicebear/avatars-human-sprites';
import * as avataaars from '@dicebear/avatars-avataaars-sprites';
import * as bottts from '@dicebear/avatars-bottts-sprites';
import * as gridy from '@dicebear/avatars-gridy-sprites';
import * as identicon from '@dicebear/avatars-identicon-sprites';
import * as initials from '@dicebear/avatars-initials-sprites';
import * as jdenticon from '@dicebear/avatars-jdenticon-sprites';
import * as micah from '@dicebear/micah';

import createRoutes from './utils/createRoutes';

const api: FastifyPluginCallback = async (app) => {
  app.addHook<{ Querystring: any }>('preValidation', async (request) => {
    if (request.query && request.query.options) {
      request.query = deepmerge(request.query.options, request.query);
    }

    delete request.query.base64;
    delete request.query.dataUri;
  });

  app.register(createRoutes('male', male));
  app.register(createRoutes('female', female));
  app.register(createRoutes('human', human));
  app.register(createRoutes('avataaars', avataaars));
  app.register(createRoutes('bottts', bottts));
  app.register(createRoutes('gridy', gridy));
  app.register(createRoutes('identicon', identicon));
  app.register(createRoutes('initials', initials));
  app.register(createRoutes('jdenticon', jdenticon));
  app.register(createRoutes('micah', micah));
};

export default api;
