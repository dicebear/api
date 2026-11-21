import { connect } from 'node:net';

import { app } from '../dist/app.js';
import { config } from '../dist/config.js';
import { signUrl } from '../dist/utils/signature.js';

const [current, previous] = config.signing.secrets;
const now = Math.floor(Date.now() / 1000);

const sign = (url, secret = current) =>
  `${url}${url.includes('?') ? '&' : '?'}sig=${signUrl(url, secret)}`;

// The path variant carries `sig` as the last option of the path segment. With
// `encode`, the segment is encoded as a whole, like in the Gravatar recipe.
const signPath = (prefix, options, encode = false) => {
  const sig = signUrl(`${prefix}/${options}`, current);
  const segment = options ? `${options}&sig=${sig}` : `sig=${sig}`;

  return `${prefix}/${encode ? encodeURIComponent(segment) : segment}`;
};

const server = await app();

const cases = {
  signed: sign('/10.x/initials/svg?seed=Felix'),
  signedWithoutQuery: sign('/10.x/initials/svg'),
  signedPath: signPath('/10.x/initials/svg', 'seed=Felix'),
  signedPathEncoded: signPath('/10.x/initials/svg', 'seed=Felix', true),
  signedPathWithoutOptions: signPath('/10.x/initials/svg', ''),
  signedPathPng: signPath('/10.x/initials/png', 'seed=Felix&size=32', true),
  pathWithQuerySignature: sign('/10.x/initials/svg/seed=Felix'),
  pathWithExtraQuery: `${signPath('/10.x/initials/svg', 'seed=Felix')}?size=64`,
  pathNotExpired: signPath(
    '/10.x/initials/svg',
    `seed=Felix&exp=${now + 60}`,
    true,
  ),
  pathExpired: signPath('/10.x/initials/svg', `seed=Felix&exp=${now - 60}`),
  pathEncodedExpiryKey: signPath(
    '/10.x/initials/svg',
    `seed=Felix&%65xp=${now - 60}`,
    true,
  ),
  pathMalformedExpiry: signPath(
    '/10.x/initials/svg',
    `seed=Felix&exp=${now * 1000}`,
    true,
  ),
  signedWithPreviousSecret: sign('/10.x/initials/svg?seed=Felix', previous),
  signedWithUnknownSecret: sign('/10.x/initials/svg?seed=Felix', 'other'),
  signedJson: sign('/11.x/initials/json?seed=Felix'),
  unsigned: '/10.x/initials/svg?seed=Felix',
  tampered: sign('/10.x/initials/svg?seed=Felix').replace('Felix', 'Aneka'),
  notExpired: sign(`/10.x/initials/svg?seed=Felix&exp=${now + 60}`),
  expired: sign(`/10.x/initials/svg?seed=Felix&exp=${now - 60}`),
  malformedExpiry: sign(`/10.x/initials/svg?seed=Felix&exp=${now * 1000}`),
  encodedExpiryKey: sign(`/10.x/initials/svg?seed=Felix&%65xp=${now - 60}`),
  encodedExpiryInSeed: sign(
    `/10.x/initials/svg?seed=Felix%26exp%3D${now - 60}`,
  ),
  invalidOption: sign('/10.x/initials/svg?size=abc'),
  health: '/health',
  styles: '/10.x',
};

try {
  const result = { maxAge: config.cacheControl.avatar };

  for (const [name, path] of Object.entries(cases)) {
    const res = await server.inject({ method: 'GET', path });

    result[name] = {
      statusCode: res.statusCode,
      cacheControl: res.headers['cache-control'],
      body: res.body,
    };
  }

  const head = await server.inject({ method: 'HEAD', path: cases.unsigned });

  result.unsignedHead = { statusCode: head.statusCode };

  // A raw `#` only reaches the router over a real socket. `inject` and every
  // HTTP client drop or encode it first.
  await server.listen({ port: 0, host: '127.0.0.1' });

  const { port } = server.server.address();

  const requestRaw = (target) =>
    new Promise((resolve, reject) => {
      const socket = connect(port, '127.0.0.1', () => {
        socket.write(
          `GET ${target} HTTP/1.1\r\nHost: localhost\r\nConnection: close\r\n\r\n`,
        );
      });

      let response = '';

      socket.setEncoding('utf-8');
      socket.on('data', (chunk) => (response += chunk));
      socket.on('error', reject);
      socket.on('end', () => {
        resolve({
          statusCode: Number(response.slice(9, 12)),
          body: response.slice(response.indexOf('\r\n\r\n') + 4),
        });
      });
    });

  result.rawFragmentPath = await requestRaw(
    signPath('/10.x/initials/svg', 'seed=AB#CD&size=32'),
  );
  result.rawFragmentQuery = await requestRaw(
    sign('/10.x/initials/svg?seed=AB#CD&size=32'),
  );

  process.stdout.write(JSON.stringify(result));
} finally {
  await server.close();
}
