import { Config, ImageFormatConfig, ImageFormat } from './types.js';

function createImageFormatConfig(envPrefix: string): ImageFormatConfig {
  return {
    enabled: Boolean(Number(process.env[envPrefix] ?? 1)),
    size: {
      min: Number(process.env[`${envPrefix}_SIZE_MIN`] ?? 1),
      max: Number(process.env[`${envPrefix}_SIZE_MAX`] ?? 256),
      default: Number(process.env[`${envPrefix}_SIZE_DEFAULT`] ?? 128),
    },
    exif: Boolean(Number(process.env[`${envPrefix}_EXIF`] ?? 1)),
  };
}

export const config: Config = {
  port: Number(process.env.PORT ?? 3000),
  host: process.env.HOST ?? '0.0.0.0',
  logger: Boolean(Number(process.env.LOGGER ?? 0)),
  workers: Number(process.env.WORKERS ?? 1),
  png: createImageFormatConfig('PNG'),
  jpeg: createImageFormatConfig('JPEG'),
  webp: createImageFormatConfig('WEBP'),
  avif: createImageFormatConfig('AVIF'),
  json: {
    enabled: Boolean(Number(process.env.JSON ?? 1)),
  },
  definition: {
    enabled: Boolean(Number(process.env.DEFINITION ?? 0)),
  },
  options: {
    enabled: Boolean(Number(process.env.OPTIONS ?? 0)),
  },
  initialsFilter: {
    enabled: Boolean(Number(process.env.INITIALS_FILTER ?? 1)),
  },
  versions: process.env.VERSIONS?.split(',').map(Number) ?? [10],
  cacheControl: {
    avatar: Number(process.env.CACHE_CONTROL_AVATARS ?? 60 * 60 * 24 * 365),
    styles: Number(process.env.CACHE_CONTROL_STYLES ?? 60 * 60),
  },
  excludedOptions: (
    process.env.EXCLUDED_OPTIONS ??
    'idRandomization,fontFamily,fontWeight,title'
  )
    .split(',')
    .filter(Boolean),
  queryString: {
    arrayLimitMin: Number(process.env.QUERY_STRING_ARRAY_LIMIT_MIN ?? 20),
    parameterLimitMin: Number(
      process.env.QUERY_STRING_PARAMETER_LIMIT_MIN ?? 100,
    ),
  },
};

export const IMAGE_FORMATS: Record<
  string,
  { configKey: ImageFormat; contentType: string }
> = {
  png: { configKey: 'png', contentType: 'image/png' },
  jpg: { configKey: 'jpeg', contentType: 'image/jpeg' },
  jpeg: { configKey: 'jpeg', contentType: 'image/jpeg' },
  webp: { configKey: 'webp', contentType: 'image/webp' },
  avif: { configKey: 'avif', contentType: 'image/avif' },
};
