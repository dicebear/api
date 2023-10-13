import { Config } from './types.js';

export const config: Config = {
  port: Number(process.env.PORT ?? 3000),
  host: process.env.HOST ?? '0.0.0.0',
  logger: Boolean(Number(process.env.LOGGER) ?? 0),
  png: {
    enabled: Boolean(Number(process.env.PNG ?? 1)),
    size: {
      min: Number(process.env.PNG_SIZE_MIN ?? 1),
      max: Number(process.env.PNG_SIZE_MAX ?? 256),
      default: Number(process.env.PNG_SIZE_DEFAULT ?? 128),
    },
    exif: Boolean(Number(process.env.PNG_EXIF ?? 1)),
  },
  jpeg: {
    enabled: Boolean(Number(process.env.JPEG ?? 1)),
    size: {
      min: Number(process.env.JPEG_SIZE_MIN ?? 1),
      max: Number(process.env.JPEG_SIZE_MAX ?? 256),
      default: Number(process.env.JPEG_SIZE_DEFAULT ?? 128),
    },
    exif: Boolean(Number(process.env.JPEG_EXIF ?? 1)),
  },
  json: {
    enabled: Boolean(Number(process.env.JSON ?? 1)),
  },
  versions: process.env.VERSIONS?.split(',').map(Number) ?? [5, 6, 7],
  cacheControl: {
    avatar: Number(process.env.CACHE_CONTROL_AVATARS ?? 60 * 60 * 24 * 365),
  },
};
