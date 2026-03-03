import type { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import type { Core, RequestFormat } from '../types.js';
import { config, IMAGE_FORMATS } from '../config.js';
import { toJpeg, toPng, toWebp, toAvif } from '@dicebear/converter';

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
    reply: FastifyReply,
  ) => {
    const options = request.query;
    const format = request.params.format;

    // Get format metadata and config once (reused for size constraints and conversion)
    const formatMeta = IMAGE_FORMATS[format];
    const formatConfig = formatMeta ? config[formatMeta.configKey] : undefined;

    // Validate and apply size constraints for image formats
    if (formatConfig) {
      options['size'] = options['size']
        ? Math.min(
            Math.max(options['size'], formatConfig.size.min),
            formatConfig.size.max,
          )
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
    const converter =
      FORMAT_CONVERTERS[format as keyof typeof FORMAT_CONVERTERS];
    if (converter && formatConfig) {
      const svgString = avatar.toString();
      const fonts = app.fontLookup.getRequiredFonts(svgString);

      reply.header('Content-Type', formatMeta!.contentType);
      const result = await converter(svgString, {
        size: options['size'],
        includeExif: formatConfig.exif,
        fonts,
      }).toArrayBuffer();

      return Buffer.from(result);
    }
  };
}
