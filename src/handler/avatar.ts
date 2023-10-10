import type { RouteHandlerMethod } from 'fastify';
import { JSONSchema7, JSONSchema7Definition } from 'json-schema';

export function avatarHandler(
  properties: Record<string, JSONSchema7Definition>
): RouteHandlerMethod {
  return (request, reply) => {
    const schema: JSONSchema7 = {
      $schema: 'http://json-schema.org/draft-07/schema#',
      type: 'object',
      properties: properties,
    };

    reply.header('Content-Type', 'application/json');

    return JSON.stringify(schema, undefined, 2);
  };
}
