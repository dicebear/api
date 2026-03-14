import { JSONSchema7 } from 'json-schema';
import { FontLookup } from './utils/fonts.js';

declare module 'fastify' {
  interface FastifyInstance {
    fonts: Font[];
    fontLookup: FontLookup;
  }
}

// DiceBear styles are dynamically loaded modules with no shared TypeScript interface.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type Style = any;

export type Core = {
  createAvatar: (
    style: Style,
    options?: Record<string, unknown>,
  ) => {
    toString: () => string;
    toJson: () => {
      svg: string;
      extra: Record<string, unknown>;
    };
  };
  schema: JSONSchema7;
};

export type Version = {
  core: Core;
  collection: Record<string, Style>;
};

// Generic types for image format configuration
export type SizeConfig = {
  min: number;
  max: number;
  default: number;
};

export type ImageFormatConfig = {
  enabled: boolean;
  size: SizeConfig;
  exif: boolean;
};

export type ImageFormat = 'png' | 'jpeg' | 'webp' | 'avif';
export type RequestFormat =
  | 'svg'
  | 'png'
  | 'jpg'
  | 'jpeg'
  | 'webp'
  | 'avif'
  | 'json';

export type Config = {
  port: number;
  host: string;
  logger: boolean;
  workers: number;
  versions: number[];
  png: ImageFormatConfig;
  jpeg: ImageFormatConfig;
  webp: ImageFormatConfig;
  avif: ImageFormatConfig;
  json: {
    enabled: boolean;
  };
  cacheControl: {
    avatar: number;
  };
  queryString: {
    arrayLimitMin: number;
    parameterLimitMin: number;
  };
};

export type Font = {
  font: string;
  ranges: [number, number][];
};
