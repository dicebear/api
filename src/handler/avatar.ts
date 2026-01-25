import type { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import type { Core, RequestFormat } from '../types.js';
import { config, IMAGE_FORMATS } from '../config.js';
import { toJpeg, toPng, toWebp, toAvif } from '@dicebear/converter';
import { getRequiredFonts } from '../utils/fonts.js';

export type AvatarRequest = {
  Params: {
    format: RequestFormat;
    options?: Record<string, any>;
  };
  Querystring: Record<string, any>;
};

// Map format names to converter functions
const FORMAT_CONVERTERS = {
  png: toPng,
  jpg: toJpeg,
  jpeg: toJpeg,
  webp: toWebp,
  avif: toAvif,
} as const;

export function avatarHandler(app: FastifyInstance, core: Core, style: any) {
  return async (
    request: FastifyRequest<AvatarRequest>,
    reply: FastifyReply
  ) => {
    const options = request.query;
    const format = request.params.format;

    // Validate and apply size constraints for image formats
    const formatMeta = IMAGE_FORMATS[format];
    if (formatMeta) {
      const formatConfig = config[formatMeta.configKey];
      options['size'] = options['size']
        ? Math.min(Math.max(options['size'], formatConfig.size.min), formatConfig.size.max)
        : formatConfig.size.default;
    }

    // Define default seed
    options['seed'] = options['seed'] ?? '';

    // Define filename
    reply.header('Content-Disposition', `inline; filename="avatar.${format}"`);

    // Create avatar
    const avatar = core.createAvatar(style, options);

    reply.header('X-Robots-Tag', 'noindex');
    reply.header('Cache-Control', `max-age=${config.cacheControl.avatar}`);

    // Handle SVG format
    if (format === 'svg') {
      reply.header('Content-Type', 'image/svg+xml');
      return avatar.toString();
    }

    // Handle JSON format
    if (format === 'json') {
      reply.header('Content-Type', 'application/json');
      return JSON.stringify(avatar.toJson());
    }

    // Handle image formats (png, jpg, jpeg, webp, avif)
    const converter = FORMAT_CONVERTERS[format as keyof typeof FORMAT_CONVERTERS];
    if (converter && formatMeta) {
      const formatConfig = config[formatMeta.configKey];

      // Cache SVG string and fonts (called once instead of multiple times)
      const svgString = avatar.toString();
      const fonts = getRequiredFonts(svgString, app.fonts);

      reply.header('Content-Type', formatMeta.contentType);
      const result = await converter(svgString, {
        includeExif: formatConfig.exif,
        fonts,
      }).toArrayBuffer();

      return Buffer.from(result);
    }
  };
}
