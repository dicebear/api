import { test, describe } from 'node:test';
import assert from 'node:assert/strict';

import { loadDefinitions } from '../dist/utils/definitions.js';

describe('loadDefinitions', () => {
  test('loads all styles for version 10', () => {
    const styles = loadDefinitions(10);
    assert.ok(styles.size > 0, 'should load at least one style');
    assert.ok(styles.has('initials'), 'should include initials');
    assert.ok(styles.has('avataaars'), 'should include avataaars');
  });

  test('loads all styles for version 11', () => {
    const styles = loadDefinitions(11);
    assert.ok(styles.size > 0, 'should load at least one style');
    assert.ok(styles.has('initials'), 'should include initials');
    assert.ok(styles.has('planets'), 'should include planets');
  });

  test('each entry has a style and weightedFields', () => {
    const styles = loadDefinitions(10);

    for (const [name, entry] of styles) {
      assert.ok(entry.style, `${name} should have a style`);
      assert.ok(
        entry.weightedFields instanceof Set,
        `${name} should have weightedFields as Set`,
      );
    }
  });

  test('style has components and colors', () => {
    const styles = loadDefinitions(10);
    const avataaars = styles.get('avataaars');

    assert.ok(
      avataaars.style.components().size > 0,
      'avataaars should have components',
    );
    assert.ok(
      avataaars.style.colors().size > 0,
      'avataaars should have colors',
    );
  });

  test('weightedFields contains variant fields', () => {
    const styles = loadDefinitions(10);
    const avataaars = styles.get('avataaars');

    assert.ok(
      avataaars.weightedFields.has('eyesVariant'),
      'should have eyesVariant',
    );
    assert.ok(
      avataaars.weightedFields.has('mouthVariant'),
      'should have mouthVariant',
    );
    assert.ok(!avataaars.weightedFields.has('seed'), 'should not have seed');
    assert.ok(!avataaars.weightedFields.has('size'), 'should not have size');
  });

  test('style names are kebab-case', () => {
    const styles = loadDefinitions(10);

    for (const name of styles.keys()) {
      assert.match(name, /^[a-z][a-z0-9-]*$/, `${name} should be kebab-case`);
    }
  });

  test('throws for unknown version', () => {
    assert.throws(() => loadDefinitions(999), {
      code: 'MODULE_NOT_FOUND',
    });
  });
});
