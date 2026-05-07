import { app } from '../dist/app.js';

const seedFlagIndex = process.argv.indexOf('--seed');
const seed = seedFlagIndex !== -1 ? process.argv[seedFlagIndex + 1] : '';

const server = await app();

try {
  const res = await server.inject({
    method: 'GET',
    path: `/10.x/initials/svg?seed=${encodeURIComponent(seed)}`,
  });

  process.stdout.write(
    JSON.stringify({ statusCode: res.statusCode, body: res.body }),
  );
} finally {
  await server.close();
}
