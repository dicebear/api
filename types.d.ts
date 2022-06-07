import type { JSONSchema7 } from 'json-schema';
import type { Result } from '@dicebear/core';

export type ArrayFormats = 'separator' | 'bracket-separator';

export type Routes = `${string}/:style/${string}`[];

export type CreateAvatar = (
  style: any,
  options: Record<string, unknown>
) => Result | string;

export type CollectionType = Record<
  string,
  {
    schema: JSONSchema7;
    create: unknown;
  }
>;

export type AvatarRouteParams = {
  format?: 'svg' | 'png' | 'jpg';
  seed?: string;
  options?: unknown;
};

export type Version = {
  createAvatar: CreateAvatar;
  routes: Routes;
  schema: JSONSchema7;
  styles: CollectionType;
  exif?: (style: any) => Record<string, string> | undefined;
};

export type Config = {
  port: number;
  address: string;
  logger: boolean;
  versions: Array<Promise<Version>>;
  png: {
    enabled: boolean;
    size: {
      max: number;
      min: number;
    };
    exif: boolean;
  };
  jpeg: {
    enabled: boolean;
    size: {
      max: number;
      min: number;
    };
    exif: boolean;
  };
  cacheControl: {
    stats: number; // 1 hour
    avatar: number; // 1 year
  };
};
