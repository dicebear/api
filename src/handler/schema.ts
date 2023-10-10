import type { RouteHandlerMethod } from 'fastify';
import type { StyleSchema } from '@dicebear/core';

export function schemaHandler(schema: StyleSchema): RouteHandlerMethod {
  return (request, reply) => {
    reply.header('Content-Type', 'application/json');

    return JSON.stringify(schema, undefined, 2);
  };
}
