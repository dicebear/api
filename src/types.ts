import type { Style, Result, StyleSchema, StyleOptions } from '@dicebear/core';

export type Core = {
  createAvatar: (style: Style<any>, options?: StyleOptions<any>) => Result;
  schema: StyleSchema;
};

export type Version = {
  core: Core;
  collection: Record<string, Style<any>>;
};

export type Config = {
  port: number;
  host: string;
  logger: boolean;
  versions: number[];
  png: {
    enabled: boolean;
    size: {
      max: number;
      min: number;
      default: number;
    };
    exif: boolean;
  };
  jpeg: {
    enabled: boolean;
    size: {
      max: number;
      min: number;
      default: number;
    };
    exif: boolean;
  };
  json: {
    enabled: boolean;
  };
  cacheControl: {
    avatar: number;
  };
};
