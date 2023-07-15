import type { JSONSchema7 } from 'json-schema';
import type { ConverterResult } from '@dicebear/converter';

export type ArrayFormats = 'separator' | 'bracket-separator';

export type Routes = `${string}/:style/${string}`[];

export interface Result extends ConverterResult {
  png(options?: ResultConvertOptions): ConverterResult;
  jpeg(options?: ResultConvertOptions): ConverterResult;
  toString(): string;
  toJson?: () => Record<string, unknown>;
}

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
  format?: 'svg' | 'png' | 'jpg' | 'json';
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
  },
  cacheControl: {
    avatar: number; // 1 year
  };
};
