import type { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import type { RequestFormat, StyleEntry } from '../types.js';
import { Avatar } from '@dicebear/core';
import { config, IMAGE_FORMATS } from '../config.js';
import { toJpeg, toPng, toWebp, toAvif } from '@dicebear/converter';

export type AvatarRequest = {
  Params: {
    format: RequestFormat;
    options?: string;
  };
  Querystring: Record<string, unknown>;
};

const FORMAT_CONVERTERS = {
  png: toPng,
  jpg: toJpeg,
  jpeg: toJpeg,
  webp: toWebp,
  avif: toAvif,
} as const;

export function avatarHandler(app: FastifyInstance, entry: StyleEntry) {
  return async (
    request: FastifyRequest<AvatarRequest>,
    reply: FastifyReply,
  ) => {
    const options = request.query;
    const format = request.params.format;

    const formatMeta = IMAGE_FORMATS[format];
    const formatConfig = formatMeta ? config[formatMeta.configKey] : undefined;

    if (formatConfig) {
      options['size'] = options['size']
        ? Math.min(
            Math.max(options['size'] as number, formatConfig.size.min),
            formatConfig.size.max,
          )
        : formatConfig.size.default;
    }

    options['seed'] = options['seed'] ?? '';

    reply.header('Content-Disposition', `inline; filename="avatar.${format}"`);

    const avatar = new Avatar(entry.style, options);

    reply.header('X-Robots-Tag', 'noindex');
    reply.header('Cache-Control', `max-age=${config.cacheControl.avatar}`);

    if (format === 'svg') {
      reply.header('Content-Type', 'image/svg+xml');
      return avatar.toString();
    }

    if (format === 'json') {
      reply.header('Content-Type', 'application/json');
      return JSON.stringify(avatar.toJSON());
    }

    const converter =
      FORMAT_CONVERTERS[format as keyof typeof FORMAT_CONVERTERS];

    if (converter && formatConfig) {
      const svgString = avatar.toString();
      const fonts = app.fontLookup.getRequiredFonts(svgString);

      reply.header('Content-Type', formatMeta!.contentType);
      const result = await converter(svgString, {
        size: options['size'] as number,
        includeExif: formatConfig.exif,
        fonts,
      }).toArrayBuffer();

      return Buffer.from(result);
    }
  };
}
