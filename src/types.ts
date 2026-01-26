import { JSONSchema7 } from 'json-schema';
import { FontLookup } from './utils/fonts.js';

declare module 'fastify' {
  interface FastifyInstance {
    fonts: Font[];
    fontLookup: FontLookup;
  }
}

export type Core = {
  createAvatar: (
    style: any,
    options?: any
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
  collection: Record<string, any>;
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
export type RequestFormat = 'svg' | 'png' | 'jpg' | 'jpeg' | 'webp' | 'avif' | 'json';

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
};

export type Font = {
  font: string;
  ranges: [number, number][];
};
