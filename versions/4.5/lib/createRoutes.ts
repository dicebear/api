import type { SpriteCollection, Options } from '@dicebear/avatars';
import type { JSONSchema7 } from 'json-schema';
import type { FastifyPluginCallback } from 'fastify';

import type { Params } from '../types/params';
import paramsSchema from '../schemas/params.json';
import createAvatar from '../lib/createAvatar';

export default function createRoutes<O, Q extends O & Options & { options?: O & Options }>(
  name: string,
  style: SpriteCollection<O>,
  schema: JSONSchema7
): FastifyPluginCallback {
  return async (app) => {
    // Route without seed
    app.get<{ Querystring: Q; Params: Params }>(
      `/:prefix/${name}/.:format`,
      { schema: { querystring: schema, params: paramsSchema } },
      async (request, reply) => createAvatar(reply, style, '', request.query, request.params.format)
    );

    // Route with seed
    app.get<{ Querystring: Q; Params: Params }>(
      `/:prefix/${name}/:seed(^.*(?=\.(svg))).:format`,
      { schema: { querystring: schema, params: paramsSchema } },
      async (request, reply) =>
        createAvatar(reply, style, request.params.seed ?? '', request.query, request.params.format)
    );
  };
}
