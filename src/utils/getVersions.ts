import { Version } from '../types';
import { config } from '../config';

export async function getVersions(): Promise<Record<string, Version>> {
  const versions: Record<string, Version> = {};

  if (config.versions.includes(5)) {
    versions['5.x'] = {
      core: await import('@dicebear/core-5'),
      collection: (await import('@dicebear/collection-5')).default,
    };
  }

  if (config.versions.includes(6)) {
    versions['6.x'] = {
      core: await import('@dicebear/core-6'),
      collection: (await import('@dicebear/collection-6')).default,
    };
  }

  if (config.versions.includes(7)) {
    versions['7.x'] = {
      core: await import('@dicebear/core-7'),
      collection: (await import('@dicebear/collection-7')).default,
    };
  }

  return versions;
}
