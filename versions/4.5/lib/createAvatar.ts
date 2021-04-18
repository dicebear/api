import Avatars, { SpriteCollection, Options } from '@dicebear/avatars';
import { FastifyReply } from 'fastify';

export default async function createAvatar<O>(
  reply: FastifyReply,
  style: SpriteCollection<O>,
  seed: string,
  options: O & Options,
  format: 'svg'
) {
  let avatars = new Avatars(style);
  let svg = avatars.create(seed, options);

  reply.header('Cache-Control', `max-age=${60 * 60 * 24 * 365}`);

  switch (format) {
    case 'svg':
      reply.header('Content-Type', 'image/svg+xml');

      return svg;
  }
}
