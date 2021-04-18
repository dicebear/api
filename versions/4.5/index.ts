import type { FastifyPluginCallback } from 'fastify';
import type { JSONSchema7 } from 'json-schema';
import deepmerge from 'deepmerge';

import maleStyles from '@dicebear/avatars-male-sprites';
import femaleStyles from '@dicebear/avatars-female-sprites';
import humanStyles from '@dicebear/avatars-human-sprites';
import avataaarsStyles from '@dicebear/avatars-avataaars-sprites';
import botttsStyles from '@dicebear/avatars-bottts-sprites';
import gridyStyles from '@dicebear/avatars-gridy-sprites';
import identiconStyles from '@dicebear/avatars-identicon-sprites';
import initialsStyles from '@dicebear/avatars-initials-sprites';
import jdenticonStyles from '@dicebear/avatars-jdenticon-sprites';

import maleSchema from './schemas/male.json';
import femaleSchema from './schemas/female.json';
import humanSchema from './schemas/human.json';
import avataaarsSchema from './schemas/avataaars.json';
import botttsSchema from './schemas/bottts.json';
import gridySchema from './schemas/gridy.json';
import identiconSchema from './schemas/identicon.json';
import initialsSchema from './schemas/initials.json';
import jdenticonSchema from './schemas/jdenticon.json';

import createRoutes from './utils/createRoutes';

const api: FastifyPluginCallback = async (app) => {
  app.addHook<{ Querystring: any }>('preValidation', async (request) => {
    if (request.query && request.query.options) {
      request.query = deepmerge(request.query.options, request.query);
    }

    delete request.query.base64;
    delete request.query.dataUri;
  });

  app.register(createRoutes('male', maleStyles, maleSchema as JSONSchema7));
  app.register(createRoutes('female', femaleStyles, femaleSchema as JSONSchema7));
  app.register(createRoutes('human', humanStyles, humanSchema as JSONSchema7));
  app.register(createRoutes('avataaars', avataaarsStyles, avataaarsSchema as JSONSchema7));
  app.register(createRoutes('bottts', botttsStyles, botttsSchema as JSONSchema7));
  app.register(createRoutes('gridy', gridyStyles, gridySchema as JSONSchema7));
  app.register(createRoutes('identicon', identiconStyles, identiconSchema as JSONSchema7));
  app.register(createRoutes('initials', initialsStyles, initialsSchema as JSONSchema7));
  app.register(createRoutes('jdenticon', jdenticonStyles, jdenticonSchema as JSONSchema7));
};

export default api;
