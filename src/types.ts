import type { Style, Result, StyleSchema, StyleOptions } from '@dicebear/core';

export type Version = {
  core: {
    createAvatar: (style: Style<any>, options?: StyleOptions<any>) => Result;
    schema: StyleSchema;
  };
  collection: Record<string, Style<any>>;
};

export type Config = {
  port: number;
  address: string;
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
