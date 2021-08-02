import { Style, StyleOptions, schema as coreSchema } from '@dicebear/avatars';
import type { FastifyPluginCallback } from 'fastify';
import mergeAllOf from 'json-schema-merge-allof';

import type { Params } from '../types/params';
import paramsSchema from '../schemas/params.json';
import createAvatar from './createAvatar';

export default function createRoutes<O extends {}>(name: string, style: Style<O>): FastifyPluginCallback {
  return async (app) => {
    let schema = mergeAllOf(
      {
        allOf: [coreSchema, style.schema],
        additionalItems: true,
      },
      { ignoreAdditionalProperties: true }
    );

    schema = JSON.parse(JSON.stringify(schema).replace(/"type":"boolean"/g, '"type":["boolean","number"]'));

    // Route without seed
    app.get<{ Querystring: StyleOptions<O> & { options?: StyleOptions<O> }; Params: Params }>(
      `/:prefix/${name}/.:format`,
      { schema: { querystring: schema, params: paramsSchema } },
      async (request, reply) => createAvatar(reply, style, '', request.query, request.params.format)
    );

    // Route with seed
    app.get<{ Querystring: StyleOptions<O> & { options?: StyleOptions<O> }; Params: Params }>(
      `/:prefix/${name}/:seed(^.*(?=\.(svg))).:format`,
      { schema: { querystring: schema, params: paramsSchema } },
      async (request, reply) => {
        return createAvatar(reply, style, request.params.seed ?? '', request.query, request.params.format);
      }
    );
  };
}
