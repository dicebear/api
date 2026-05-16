import { Style, OptionsDescriptor } from '@dicebear/core';
import { createRequire } from 'node:module';
import * as path from 'node:path';
import * as fs from 'node:fs';
import type { StyleEntry } from '../types.js';

const require = createRequire(import.meta.url);

export function loadDefinitions(version: number): Map<string, StyleEntry> {
  const definitionsDir = path.dirname(
    require.resolve(`@dicebear/styles-${version}/initials.json`),
  );
  const styles = new Map<string, StyleEntry>();

  for (const file of fs.readdirSync(definitionsDir)) {
    if (!file.endsWith('.min.json')) continue;

    const name = file.replace('.min.json', '');
    const definition = JSON.parse(
      fs.readFileSync(path.join(definitionsDir, file), 'utf-8'),
    );
    const style = new Style(definition);
    const descriptor = new OptionsDescriptor(style).toJSON();

    const weightedFields = new Set<string>();

    for (const [key, field] of Object.entries(descriptor)) {
      if (field.type === 'enum' && field.weighted) {
        weightedFields.add(key);
      }
    }

    styles.set(name, { style, weightedFields });
  }

  return styles;
}
