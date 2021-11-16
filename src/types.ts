import * as v4 from '@dicebear/core-4.10';
import * as v5 from '@dicebear/core-5.0';
import { JSONSchema7 } from 'json-schema';

export type CoreType = {
  schema: JSONSchema7;
  createAvatar: (style: any, options: any) => string;
};

export type CollectionType = Record<
  string,
  {
    schema: JSONSchema7;
  }
>;

export type VersionsType = Array<{
  aliases: string[];
  core: CoreType;
  collection: CollectionType;
}>;
