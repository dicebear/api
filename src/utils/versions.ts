import { Version } from '../types.js';
import { config } from '../config.js';

export async function getVersions(): Promise<Record<string, Version>> {
  const versions: Record<string, Version> = {};

  for (let versionNum = 5; versionNum <= 9; versionNum++) {
    if (config.versions.includes(versionNum)) {
      versions[`${versionNum}.x`] = await import(`@dicebear/api-${versionNum}`);
    }
  }

  return versions;
}
