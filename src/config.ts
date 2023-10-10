import { Config } from './types';

export const config: Config = {
  port: Number(process.env.PORT ?? 3000),
  host: process.env.HOST ?? 'localhost',
  logger: Boolean(Number(process.env.LOGGER)),
  png: {
    enabled: Boolean(Number(process.env.PNG)),
    size: {
      min: Number(process.env.PNG_SIZE_MIN ?? 1),
      max: Number(process.env.PNG_SIZE_MAX ?? 256),
      default: Number(process.env.PNG_SIZE_DEFAULT ?? 128),
    },
    exif: Boolean(Number(process.env.PNG_EXIF)),
  },
  jpeg: {
    enabled: Boolean(Number(process.env.JPEG)),
    size: {
      min: Number(process.env.JPEG_SIZE_MIN ?? 1),
      max: Number(process.env.JPEG_SIZE_MAX ?? 256),
      default: Number(process.env.JPEG_SIZE_DEFAULT ?? 128),
    },
    exif: Boolean(Number(process.env.JPEG_EXIF)),
  },
  json: {
    enabled: Boolean(Number(process.env.JSON)),
  },
  versions: process.env.VERSIONS?.split(',').map(Number) ?? [5, 6, 7],
  cacheControl: {
    avatar: Number(process.env.CACHE_CONTROL_AVATARS ?? 60 * 60 * 24 * 365),
  },
};
