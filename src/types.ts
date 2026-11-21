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

  interface FastifyRequest {
    /**
     * Unix time in seconds at which a signed URL stops being valid, or `null`
     * when the request carries no expiry.
     */
    expiresAt: number | null;
  }
}

export type StyleEntry = {
  style: Style;
  weightedFields: Set<string>;
  /**
   * Names of the colors with a `contrastTo`, and the definition as published,
   * both set for the version lines that render through the 10 color shim.
   */
  legacyColors?: ReadonlySet<string>;
  definitionBody?: string;
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
  'svg' | 'png' | 'jpg' | 'jpeg' | 'webp' | 'avif' | 'json';

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
  signing: {
    secrets: string[];
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
