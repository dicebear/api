import { app } from '../dist/app.js';

const server = await app();

try {
  const [definition, options, sortedLine] = await Promise.all([
    server.inject({ method: 'GET', path: '/10.x/initials/definition.json' }),
    server.inject({ method: 'GET', path: '/10.x/initials/options.json' }),
    // The 10.x line renders through the color shim, which sorts the palettes
    // before building the style. This endpoint has to stay the published file.
    server.inject({ method: 'GET', path: '/10.x/adventurer/definition.json' }),
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
      sortedLine: {
        statusCode: sortedLine.statusCode,
        body: sortedLine.body,
      },
    }),
  );
} finally {
  await server.close();
}
