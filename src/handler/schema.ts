import type { RouteHandlerMethod } from 'fastify';
import { JSONSchema7 } from 'json-schema';

export function schemaHandler(schema: JSONSchema7): RouteHandlerMethod {
  return (request, reply) => {
    reply.header('Content-Type', 'application/json');

    return JSON.stringify(schema, undefined, 2);
  };
}
