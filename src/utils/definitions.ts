import { Style, OptionsDescriptor } from '@dicebear/core';
import { createRequire } from 'node:module';
import * as path from 'node:path';
import * as fs from 'node:fs';
import type { StyleEntry } from '../types.js';
import { contrastColors, sortColorValues } from './legacy-colors.js';

const require = createRequire(import.meta.url);

/**
 * Version lines whose avatars have to keep the color behavior of the 10 core.
 * See utils/legacy-colors.ts.
 */
const LEGACY_COLOR_VERSIONS = 10;

export function loadDefinitions(version: number): Map<string, StyleEntry> {
  const definitionsDir = path.dirname(
    require.resolve(`@dicebear/styles-${version}/initials.json`),
  );
  const styles = new Map<string, StyleEntry>();

  for (const file of fs.readdirSync(definitionsDir)) {
    if (!file.endsWith('.min.json')) continue;

    const name = file.replace('.min.json', '');
    const body = fs.readFileSync(path.join(definitionsDir, file), 'utf-8');
    const definition = JSON.parse(body);
    const legacy = version <= LEGACY_COLOR_VERSIONS;
    const style = new Style(legacy ? sortColorValues(definition) : definition);
    const descriptor = new OptionsDescriptor(style).toJSON();

    const weightedFields = new Set<string>();

    for (const [key, field] of Object.entries(descriptor)) {
      if (field.type === 'enum' && field.weighted) {
        weightedFields.add(key);
      }
    }

    styles.set(
      name,
      legacy
        ? {
            style,
            weightedFields,
            legacyColors: contrastColors(definition),
            // The sorted palette is a rendering detail. What this endpoint
            // hands out stays the file the style package ships.
            definitionBody: body,
          }
        : { style, weightedFields },
    );
  }

  return styles;
}
