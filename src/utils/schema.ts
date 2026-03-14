import { JSONSchema7 } from 'json-schema';
import { config } from '../config.js';
import { Version } from '../types.js';

/**
 * Returns the global query string parsing limits across all loaded versions.
 * The configured minimums account for array options whose values are not enumerated
 * in the schema (e.g. backgroundColor).
 */
export function getVersionsQueryLimits(versions: Record<string, Version>): {
  arrayLimit: number;
  parameterLimit: number;
} {
  let arrayLimit = config.queryString.arrayLimitMin;
  let parameterLimit = config.queryString.parameterLimitMin;

  for (const version of Object.values(versions)) {
    const coreProperties = version.core.schema.properties;

    for (const style of Object.values(version.collection)) {
      const merged = getSchemaLimits({
        properties: {
          ...coreProperties,
          ...style.schema?.properties,
        },
      });

      arrayLimit = Math.max(arrayLimit, merged.arrayLimit);
      parameterLimit = Math.max(parameterLimit, merged.parameterLimit);
    }
  }

  return { arrayLimit, parameterLimit };
}

/**
 * Returns the query string parsing limits derived from a schema:
 * - parameterLimit: number of properties (max distinct keys)
 * - arrayLimit: max enum values in any array-type property
 */
export function getSchemaLimits(schema: JSONSchema7): {
  parameterLimit: number;
  arrayLimit: number;
} {
  let arrayLimit = 0;
  let parameterLimit = 0;

  for (const prop of Object.values(schema.properties ?? {})) {
    parameterLimit++;

    if (
      typeof prop === 'object' &&
      prop.type === 'array' &&
      typeof prop.items === 'object' &&
      !Array.isArray(prop.items) &&
      Array.isArray((prop.items as JSONSchema7).enum)
    ) {
      arrayLimit = Math.max(
        arrayLimit,
        (prop.items as JSONSchema7).enum!.length,
      );
    }
  }

  return { parameterLimit, arrayLimit };
}
