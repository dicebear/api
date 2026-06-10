import type { Style } from '@dicebear/core';
import type { FontLookup } from './utils/fonts.js';

export type QueryLimits = {
  arrayLimit: number;
  parameterLimit: number;
};

declare module 'fastify' {
  interface FastifyInstance {
    fontLookup: FontLookup;
    queryLimits: QueryLimits;
    initialsBlocklist: ReadonlySet<string>;
  }
}

export type StyleEntry = {
  style: Style;
  weightedFields: Set<string>;
};

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
  excludedOptions: string[];
  png: ImageFormatConfig;
  jpeg: ImageFormatConfig;
  webp: ImageFormatConfig;
  avif: ImageFormatConfig;
  json: {
    enabled: boolean;
  };
  definition: {
    enabled: boolean;
  };
  options: {
    enabled: boolean;
  };
  initialsFilter: {
    enabled: boolean;
  };
  cacheControl: {
    avatar: number;
    styles: number;
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
