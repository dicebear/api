import { Version } from '../types.js';
import { config } from '../config.js';

export async function getVersions(): Promise<Record<string, Version>> {
  const versions: Record<string, Version> = {};

  for (const versionNum of config.versions) {
    versions[`${versionNum}.x`] = await import(`@dicebear/api-${versionNum}`);
  }

  return versions;
}
