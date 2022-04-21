import * as collection from '@dicebear/collection';
import type { Style, Exif } from '@dicebear/core';
import { license } from '@dicebear/core';

export function exif(styleName: string): Exif | undefined {
  // @ts-ignore
  const style = collection[styleName] as Style<any> | undefined;

  if (undefined === style) {
    return undefined;
  }

  return license.exif(style);
}
