import { app } from '../dist/app.js';

const server = await app();

try {
  const [definition, options] = await Promise.all([
    server.inject({ method: 'GET', path: '/10.x/initials/definition.json' }),
    server.inject({ method: 'GET', path: '/10.x/initials/options.json' }),
  ]);

  process.stdout.write(
    JSON.stringify({
      definition: {
        statusCode: definition.statusCode,
        contentType: definition.headers['content-type'],
        cacheControl: definition.headers['cache-control'],
        body: definition.body,
      },
      options: {
        statusCode: options.statusCode,
        contentType: options.headers['content-type'],
        cacheControl: options.headers['cache-control'],
        body: options.body,
      },
    }),
  );
} finally {
  await server.close();
}
