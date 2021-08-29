import { Style, createAvatar as coreCreateAvatar, StyleOptions } from '@dicebear/avatars';
import { FastifyReply } from 'fastify';

export default async function createAvatar<O extends {}>(
  reply: FastifyReply,
  style: Style<O>,
  seed: string,
  options: StyleOptions<O>,
  format: 'svg'
) {
  let svg = coreCreateAvatar(style, { ...options, seed });

  reply.header('Cache-Control', `max-age=${60 * 60 * 24 * 365}`);

  switch (format) {
    case 'svg':
      reply.header('Content-Type', 'image/svg+xml');

      return svg;
  }
}
