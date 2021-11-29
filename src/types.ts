import { JSONSchema7 } from 'json-schema';

export type CreateAvatar = (
  style: unknown,
  options: Record<string, unknown>
) => string;

export type CollectionType = Record<
  string,
  {
    schema: JSONSchema7;
    create: unknown;
  }
>;

export type AvatarRouteParams = {
  format?: 'svg' | 'png';
  seed?: string;
};

export type Version = {
  createAvatar: CreateAvatar;
  routes: string[];
  schema: JSONSchema7;
  styles: CollectionType;
};

export type Config = {
  port: string;
  address: string;
  versions: Array<Promise<Version>>;
  png: {
    size: {
      max: string;
      min: string;
    };
  };
  cacheControl: {
    stats: string; // 1 hour
    avatar: string; // 1 year
  };
};
