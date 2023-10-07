import type { Config } from './types';

const config: Config = {
  port: parseInt(Bun.env.PORT ?? '3000'),
  address: Bun.env.ADDRESS ?? '0.0.0.0',
  logger: Boolean(Number(Bun.env.LOGGER ?? 1)),
  png: {
    enabled: Boolean(Number(Bun.env.PNG ?? 1)),
    size: {
      min: Number(Bun.env.PNG_SIZE_MIN ?? 1),
      max: Number(Bun.env.PNG_SIZE_MAX ?? 256),
      default: Number(Bun.env.PNG_SIZE_DEFAULT ?? 256),
    },
    exif: Boolean(Number(Bun.env.PNG_EXIF ?? 0)),
  },
  jpeg: {
    enabled: Boolean(Number(Bun.env.JPEG ?? 1)),
    size: {
      min: Number(Bun.env.JPEG_SIZE_MIN ?? 1),
      max: Number(Bun.env.JPEG_SIZE_MAX ?? 256),
      default: Number(Bun.env.JPEG_SIZE_DEFAULT ?? 256),
    },
    exif: Boolean(Number(Bun.env.JPEG_EXIF ?? 0)),
  },
  json: {
    enabled: Boolean(Number(Bun.env.JSON ?? 1)),
  },
  versions: Bun.env.VERSIONS?.split(',').map(Number) ?? [5, 6, 7],
  cacheControl: {
    avatar: Number(Bun.env.CACHE_CONTROL_AVATARS ?? 60 * 60 * 24 * 365),
  },
};

export { config };
