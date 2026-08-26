# Changelog

All notable changes to the DiceBear API will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to
[Semantic Versioning](https://semver.org/spec/v2.0.0.html).

This repository is the self-hostable HTTP API for DiceBear, published as a Docker
image on [Docker Hub](https://hub.docker.com/r/dicebear/api). The package itself
is private and unpublished. The version lives only in the Git tag, and the
[`docker.yml`](.github/workflows/docker.yml) workflow builds the image on every
`v*` tag. Versions track the API's own release line (`4.x`), independently of the
DiceBear library.

## [Unreleased]

## [4.13.0] - 2026-08-26

### Added

- 6 new avatar styles, which takes the API from 55 to 61: Cameo, Gaze, Marbles,
  Shadows, Slice and Stack. They come from `@dicebear/styles` 10.6.0. The API
  reads its style list from that package at boot, so the new styles appear on
  the existing endpoints without a configuration change.

### Changed

- Updated `@dicebear/styles-10` to `^10.6.0` (was `^10.6.0-rc.2`).

### Fixed

- Voxel Art no longer draws stray light and dark edges across hair and faces,
  shadows land on the shape below them instead of on the background, and arms
  and hands are no longer buried under clothing. In Voxel Bot the shadow below
  the torso now covers the legs instead of the full width of the body. Both
  fixes come from `@dicebear/styles` 10.6.0, so a few shapes look different.

## [4.13.0-rc.1] - 2026-08-26

## [4.12.1] - 2026-08-18

### Changed

- Refreshed `package-lock.json` within the existing version ranges.
  `@dicebear/core` and `@dicebear/converter` now resolve to `10.6.1` (was
  `10.6.0`). The core release drops empty wrapper elements from the SVG output.
  In `notionists` such a wrapper sits inside a mask, and AndroidSVG takes the
  mask size from the wrapper's bounding box, which an empty group does not
  have, so the whole file failed to render in Android gallery apps.
  `bottts-neutral`, `clay`, `critters`, `notionists`, and `squircles` were
  affected. The rendered image does not change. `fastify` resolves to `5.12.1`
  (was `5.12.0`).

## [4.12.0] - 2026-08-16

### Added

- 3 new avatar styles, which takes the API from 52 to 55: Cutouts, Line Face
  and Patchwork. They come from `@dicebear/styles` 10.5.0. The API reads its
  style list from that package at boot, so the new styles appear on the
  existing endpoints without a configuration change.
- Color parameters for the linework of nine styles, from the same release.
  Adventurer, Adventurer Neutral, Croodles, Croodles Neutral, Notionists,
  Notionists Neutral and Open Peeps take `inkColor`, Lorelei takes
  `outlineColor`, and Toon Head takes `strokeColor`. Adventurer and Adventurer
  Neutral also split the face into groups of their own, among them `eyesColor`,
  `lipsColor` and `teethColor`. The API derives its query parameters from each
  definition, so these arrived with the package.
- `notEqualTo` on the color fields of `/options.json`, new in `@dicebear/core`
  10.6.0. It names the color groups a group has to differ from and sits next to
  the existing `contrastTo`, so a client that picks its own colors can apply the
  same constraints as the renderer. `thumbs`, for one, keeps its shape out of
  the background color that way. The endpoint still needs `OPTIONS=1`.

### Changed

- Updated `@dicebear/styles-10` to `^10.5.0` (was `^10.5.0-rc.1`).
- Updated `@dicebear/core` and `@dicebear/converter` to `^10.6.0` (was
  `^10.5.0`).

## [4.12.0-rc.1] - 2026-08-15

## [4.11.0] - 2026-08-09

### Added

- 2 new avatar styles, which takes the API from 50 to 52: Voxel Art and Voxel
  Bot. They come from `@dicebear/styles` 10.4.0. The API reads its style list
  from that package at boot, so the new styles appear on the existing
  endpoints without a configuration change.
- The `*ColorOrder` option, new in `@dicebear/core` 10.5.0, as a query
  parameter on the avatar endpoints. With `fixed`, colors passed via a
  `*Color` option keep exactly the given order: gradient fills apply them as
  stops from first to last, and solid fills always use the first color. The
  default `random` keeps the previous behavior, where the PRNG shuffles the
  colors before use. `@dicebear/schema` 1.4.0 validates the new parameter.

### Changed

- Updated `@dicebear/styles-10` to `^10.4.0` (was `^10.3.0`).
- Updated `@dicebear/core` and `@dicebear/converter` to `^10.5.0` (was
  `^10.4.0`). `@dicebear/schema` now resolves to `1.4.0` (was `1.3.0`) within
  the unchanged `^1.3.0` range.

## [4.11.0-rc.1] - 2026-08-09

## [4.10.0] - 2026-08-01

### Added

- 13 new avatar styles, which takes the API from 37 to 50: Blobs, Clay,
  Constellation, Critters, Landscape, Loops, Moods, Pixelbot, Planets, Sprouts,
  Squircles, Waves, and Weave. They come from `@dicebear/styles` 10.3.0. The
  API reads its style list from that package at boot, so the new styles appear
  on the existing endpoints without a configuration change.

### Changed

- Updated `@dicebear/core` and `@dicebear/converter` to `^10.4.0` (was
  `^10.4.0-rc.2`) and `@dicebear/styles-10` to `^10.3.0` (was `^10.3.0-rc.3`).

## [4.10.0-rc.2] - 2026-07-31

## [4.10.0-rc.1] - 2026-07-31

## [4.9.1] - 2026-07-29

### Changed

- Refreshed `package-lock.json` within the existing version ranges.
  `@dicebear/core` and `@dicebear/converter` now resolve to `10.3.2` (was
  `10.3.0`). This picks up the converter fix that keeps text nodes, CDATA
  sections, and deep nesting intact. `@dicebear/schema` resolves to `1.3.0`
  (was `1.2.0`). Transitive dependencies moved as well, among them `fastify`
  (`5.10.0`) and `sharp` (`0.35.3`).

## [4.9.0] - 2026-06-13

### Changed

- Updated `@dicebear/core` and `@dicebear/converter` to `^10.3.0` (was
  `^10.2.0`).

## [4.8.0] - 2026-06-10

### Added

- New per-style endpoints `/{version}.x/{style}/definition.json` (raw style
  definition) and `/{version}.x/{style}/options.json` (options descriptor,
  without the options listed in `EXCLUDED_OPTIONS`). Both are disabled by
  default and can be enabled individually via the new `DEFINITION` and
  `OPTIONS` environment variables.

## [4.7.0] - 2026-06-06

### Added

- The version root endpoint (e.g. `/10.x`) now returns the list of available
  style names as `{ "styles": [...] }`, sorted alphabetically, so clients can
  discover supported styles. The response is cached via the new
  `CACHE_CONTROL_STYLES` environment variable (default 1 hour).

## [4.6.0] - 2026-06-03

### Changed

- Updated `@dicebear/styles-10` to `^10.1.0` (was `^10.0.0`), which fixes the
  Lorelei mouth showing through beard variants and the Rings shape rendering.
- Updated `@dicebear/schema` to `^1.1.0` (was `^1.0.0`).

[Unreleased]: https://github.com/dicebear/api/compare/v4.13.0...HEAD
[4.13.0]: https://github.com/dicebear/api/compare/v4.13.0-rc.1...v4.13.0
[4.13.0-rc.1]: https://github.com/dicebear/api/compare/v4.12.1...v4.13.0-rc.1
[4.12.1]: https://github.com/dicebear/api/compare/v4.12.0...v4.12.1
[4.12.0]: https://github.com/dicebear/api/compare/v4.12.0-rc.1...v4.12.0
[4.12.0-rc.1]: https://github.com/dicebear/api/compare/v4.11.0...v4.12.0-rc.1
[4.11.0]: https://github.com/dicebear/api/compare/v4.11.0-rc.1...v4.11.0
[4.11.0-rc.1]: https://github.com/dicebear/api/compare/v4.10.0...v4.11.0-rc.1
[4.10.0]: https://github.com/dicebear/api/compare/v4.10.0-rc.2...v4.10.0
[4.10.0-rc.2]: https://github.com/dicebear/api/compare/v4.10.0-rc.1...v4.10.0-rc.2
[4.10.0-rc.1]: https://github.com/dicebear/api/compare/v4.9.1...v4.10.0-rc.1
[4.9.1]: https://github.com/dicebear/api/compare/v4.9.0...v4.9.1
[4.9.0]: https://github.com/dicebear/api/compare/v4.8.0...v4.9.0
[4.8.0]: https://github.com/dicebear/api/compare/v4.7.0...v4.8.0
[4.7.0]: https://github.com/dicebear/api/compare/v4.6.0...v4.7.0
[4.6.0]: https://github.com/dicebear/api/compare/v4.5.2...v4.6.0
