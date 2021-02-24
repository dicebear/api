import Avatars, { SpriteCollection, Options } from '@dicebear/avatars';
import { FastifyReply } from 'fastify';

import sharp from 'sharp';

export default async function createAvatar<O>(
  reply: FastifyReply,
  style: SpriteCollection<O>,
  seed: string,
  options: O & Options,
  format: 'svg' | 'png'
) {
  if (format === 'png') {
    let size = options['w'] || options['width'] || options['h'] || options['height'];
    let secureSize = typeof size === 'string' ? parseInt(size) : 0;

    delete options['w'];
    delete options['width'];
    delete options['h'];
    delete options['height'];

    options['w'] = (secureSize <= 0 || secureSize > 256 ? 256 : secureSize).toString();
    options['h'] = options['w'];
  }

  let avatars = new Avatars(style);
  let svg = avatars.create(seed, options);

  reply.header('Cache-Control', `max-age=${60 * 60 * 24 * 365}`);

  switch (format) {
    case 'svg':
      reply.header('Content-Type', 'image/svg+xml');

      return svg;

    case 'png':
      const png = await sharp(Buffer.from(svg)).png().toBuffer();

      reply.header('Content-Type', 'image/png');

      return png;
  }
}
