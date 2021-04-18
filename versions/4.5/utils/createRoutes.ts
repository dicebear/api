import type { SpriteCollection, Options } from '@dicebear/avatars';
import type { JSONSchema7 } from 'json-schema';
import type { FastifyPluginCallback } from 'fastify';
import mergeAllOf from 'json-schema-merge-allof';

import type { Params } from '../types/params';
import paramsSchema from '../schemas/params.json';
import createAvatar from './createAvatar';
import coreSchema from '../schemas/core.json';

export default function createRoutes<O, Q extends O & Options & { options?: O & Options }>(
  name: string,
  style: SpriteCollection<O>,
  styleSchema: JSONSchema7
): FastifyPluginCallback {
  let schema = mergeAllOf(
    {
      allOf: [coreSchema as JSONSchema7, styleSchema],
      additionalItems: true,
    },
    { ignoreAdditionalProperties: true }
  );

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
