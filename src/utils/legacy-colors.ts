import type { StyleDefinition } from '@dicebear/core';

/**
 * DiceBear 10 color behavior, reproduced on top of the current core.
 *
 * The API renders every version prefix with one core, the newest one. Between
 * 10 and 11 the core changed what `{color}ColorOrder: 'fixed'` does with a
 * style's own palette:
 *
 *  - 10 deduplicated the palette and sorted it by code point, 11 takes it in
 *    the order the definition lists it.
 *  - 10 left a gradient at its default of two stops, 11 fills it with the
 *    whole palette.
 *  - 10 ignored `fixed` for a color with `contrastTo` and kept sorting those
 *    candidates by contrast, 11 skips that sort under `fixed`.
 *
 * None of this shows without `{color}ColorOrder`, because the shuffle behind
 * the default `random` sorts its candidates on its own, and none of it applies
 * to colors the caller passes in: those were verbatim in 10 already.
 *
 * The three points above are undone in two places. {@link sortColorValues}
 * rewrites the palette once, at load. {@link applyLegacyColorOrder} rewrites
 * the options of a request.
 */

/** Names of the colors a style resolves through `contrastTo`. */
export type ContrastColors = ReadonlySet<string>;

export function contrastColors(definition: StyleDefinition): ContrastColors {
  const names = new Set<string>();

  for (const [name, color] of Object.entries(definition.colors ?? {})) {
    if (color.contrastTo) {
      names.add(name);
    }
  }

  return names;
}

/**
 * Sorts every palette the way the 10 core sorted it before drawing.
 *
 * Colors with a `contrastTo` are left alone. The core skips the shuffle for
 * those, so their definition order reaches the avatar with the default
 * options as well, and sorting them would change the ordinary avatars this
 * shim exists to keep stable.
 */
export function sortColorValues(definition: StyleDefinition): StyleDefinition {
  // The definition type is deeply readonly, so the clone is reshaped here
  // rather than mutated through it.
  const copy = structuredClone(definition) as {
    colors?: Record<string, { values?: string[]; contrastTo?: string }>;
  };

  for (const color of Object.values(copy.colors ?? {})) {
    if (Array.isArray(color.values) && !color.contrastTo) {
      color.values = [...color.values].sort();
    }
  }

  return copy as StyleDefinition;
}

/**
 * Rewrites the color options of one request into the ones that make the
 * current core answer like the 10 core did.
 *
 * Only touches a color that is pinned with `fixed` and takes its candidates
 * from the style, never one the caller supplied colors for.
 */
export function applyLegacyColorOrder(
  options: Record<string, unknown>,
  contrast: ContrastColors,
): Record<string, unknown> {
  for (const key of Object.keys(options)) {
    if (!key.endsWith('ColorOrder')) continue;
    if (options[key] !== 'fixed') continue;

    const name = key.slice(0, -'ColorOrder'.length);

    if (options[`${name}Color`] !== undefined) continue;

    if (contrast.has(name)) {
      delete options[key];
    } else if (options[`${name}ColorFillStops`] === undefined) {
      options[`${name}ColorFillStops`] = 2;
    }
  }

  return options;
}
