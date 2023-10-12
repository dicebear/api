import { Version } from '../types.js';
import { config } from '../config.js';

export async function getVersions(): Promise<Record<string, Version>> {
  const versions: Record<string, Version> = {};

  if (config.versions.includes(5)) {
    versions['5.x'] = await import('@dicebear/api-5');
  }

  if (config.versions.includes(6)) {
    versions['6.x'] = await import('@dicebear/api-6');
  }

  if (config.versions.includes(7)) {
    versions['7.x'] = await import('@dicebear/api-7');
  }

  return versions;
}
