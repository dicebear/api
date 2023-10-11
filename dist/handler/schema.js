export function schemaHandler(properties) {
    return (request, reply) => {
        const schema = {
            $schema: 'http://json-schema.org/draft-07/schema#',
            type: 'object',
            properties: properties,
        };
        reply.header('Content-Type', 'application/json');
        return JSON.stringify(schema, undefined, 2);
    };
}
