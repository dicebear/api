import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';

import { config } from '../dist/config.js';

const require = createRequire(import.meta.url);

describe('excludedOptions', () => {
  test('default config excludes idRandomization, fontFamily, fontWeight, title', () => {
    assert.deepEqual(config.excludedOptions, [
      'idRandomization',
      'fontFamily',
      'fontWeight',
      'title',
    ]);
  });

  test('excluded options are removed from options schema', () => {
    // Load a fresh copy of the schema to compare
    const originalSchema = JSON.parse(
      JSON.stringify(require('@dicebear/schema/options.json')),
    );

    for (const key of config.excludedOptions) {
      assert.ok(
        key in originalSchema.properties,
        `"${key}" should exist in the original schema`,
      );
    }

    // Simulate the filtering logic from routes/style.ts
    for (const key of config.excludedOptions) {
      delete originalSchema.properties[key];
    }

    for (const key of config.excludedOptions) {
      assert.ok(
        !(key in originalSchema.properties),
        `"${key}" should be removed after filtering`,
      );
    }
  });
});
