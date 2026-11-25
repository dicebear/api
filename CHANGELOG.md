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

DiceBear 11 under `/11.x/`, next to `/10.x/`. Compared to 4.13.0: 63 styles
with Cats and Dogs, animations on SVG requests (`animation`, `${name}Animation`,
`animationSpeed`, `animationDelay`, `animationRespectReducedMotion`), the
`tags` filter for 35 character styles, and signed URLs for self-hosted
instances. `/10.x/` draws the same avatars as before. The release candidate
entries below have the details.

### Changed

- `animationMotionQuery` is now called `animationRespectReducedMotion`, as in
  `@dicebear/core` 11.0.0-rc.4 and `@dicebear/schema` 3.0.0-rc.1. Like any
  unknown parameter, the old name is dropped, so such URLs get the animation
  CSS inside the media query again. Replace `animationMotionQuery=false` with
  `animationRespectReducedMotion=false`.

### Fixed

- A slash before the query string, as in `/11.x/thumbs/svg/?seed=Felix`, threw
  the options away, so every seed got the same avatar. The options are read
  from the query string now, and a signed URL of that form is checked like one
  without the slash.
- Characters outside the Basic Multilingual Plane, such as `𠮷`, found no font
  in PNG, JPEG, WebP and AVIF, so the initials rendered as empty boxes. The
  font lookup uses the full code point now.
- A 400 from the query parser, such as the one for bracket notation, carried no
  CORS headers, so a browser reported a CORS error instead of the message.
- A seed with more than 146 commas returned a 400 for the array limit. Commas
  in a seed are text, so they no longer count against it.
- A path with an unknown format, such as `/11.x/lorelei/gif` or a
  `definition.json` that is switched off, returned a 400 that blamed the
  request. It returns a 404 now.
- A CORS preflight listed `POST` among the allowed methods, which the API does
  not serve. It lists `GET` and `HEAD` only.

## [4.14.0-rc.6] - 2026-11-24

### Changed

- Updated the 11.x styles to `@dicebear/styles` `^11.0.0-rc.4` (was
  `^11.0.0-rc.3`). The `tags` option now filters the variants of 35 character
  styles, Dogs is rebuilt with new parts, and Big Ears links to The Visual
  Team's Figma profile.

## [4.14.0-rc.5] - 2026-11-21

### Added

- `SIGNING_SECRETS` turns on signed URLs. The avatar endpoints then only answer
  URLs that end in a `sig` parameter with the HMAC-SHA256 of the path and query
  string in front of it, and answer an unsigned or wrongly signed one with a
  `403`. Requests the API turns down before the signature check, such as one
  with too many parameters, keep their `400`. URLs with the options in the path,
  which Gravatar needs, carry `sig` in that path segment, and the signature
  covers the decoded segment. An optional `exp` parameter gives a URL an expiry
  and caps `Cache-Control` at it. Several comma-separated secrets are accepted
  at once, so a key can be rotated without breaking the URLs already handed out.
  Every secret needs at least 32 characters, and the API refuses to start with a
  shorter one. A secret cannot contain a comma. Without the variable, or with
  an empty one, nothing changes.

## [4.14.0-rc.4] - 2026-11-15

### Added

- `animationMotionQuery=false` leaves the `prefers-reduced-motion` media query
  out of the animation CSS, so SVG renderers that ignore media queries, such as
  the SVG libraries of native apps, play the animations. The option comes with
  `@dicebear/core` 11.0.0-rc.3 and `@dicebear/schema` 2.1.0, and the API widens
  its parameter budget by one for it.

### Changed

- SVG responses carry a `data-dicebear-component` attribute on every component
  `<use>`, on every version prefix, as `@dicebear/core` 11.0.0-rc.3 renders it.
  The images stay the same.

## [4.14.0-rc.3] - 2026-09-07

## [4.14.0-rc.2] - 2026-09-07

### Fixed

- **The 10.x routes keep the color behavior of DiceBear 10.** The API renders
  every version prefix with one core, the newest one, and between 10 and 11 the
  core changed what `{color}ColorOrder=fixed` does with a style's own palette:
  10 sorted the palette, left a gradient at two stops and ignored the pin for a
  color with `contrastTo`, while 11 takes the palette in definition order,
  fills a gradient with all of it and skips the contrast sort. On `/10.x` the
  palettes are now sorted at load and the pinning options are rewritten per
  request, so those URLs answer as they did under core 10. Without the pin
  nothing changes, and `definition.json` still serves the file the style
  package ships.

### Added

- A switch, a speed and a delay option per animation, such as
  `orbitAnimation=false`, `orbitAnimationSpeed=0.5` and `orbitAnimationDelay=2`,
  which win over `animation`, `animationSpeed` and the new `animationDelay` for
  that animation. `animationDelay=0,5` starts every seed at its own moment.
  They come with `@dicebear/core` 11.0.0-rc.2 and `@dicebear/schema` 2.0, the
  API only widens its parameter budget for them.

### Changed

- Updated `@dicebear/schema` to `^2.0.0` (was `^1.6.1`), which validates the
  animation options and the boolean `animation`.
- Updated `@dicebear/styles` on `/11.x` to `^11.0.0-rc.2` (was `^11.0.0-rc.1`).
- Bracket notation in query strings now returns a 400 with a message that
  names the offending parameter. `backgroundColor[]=000000` and
  `animationSpeed[orbit]=2` used to be parsed, the first as a list and the
  second into a shape the schema then rejected, but neither form was ever
  documented. Lists are comma separated, as in `backgroundColor=000000,ffffff`.
  Clients that serialise arrays with brackets by default, such as Axios, need
  to switch to comma lists.

## [4.14.0-rc.1] - 2026-09-01

### Added

- The `/11.x` endpoints, served from `@dicebear/styles` 11.0.0-rc.1 and
  enabled by default next to `/10.x`. The 11 line carries the declarative
  animations, so `animation=true` (or a list of animation names) on an SVG
  request returns a moving avatar, and `animationSpeed` sets the pace. Without
  the option the output is static, and raster formats always are.

### Changed

- Updated `@dicebear/core` to `^11.0.0-rc.1` (was `^10.6.0`). It renders the
  10 line byte-identical, so `/10.x` responses do not change.
- Updated `@dicebear/schema` to `^1.6.1` (was `^1.3.0`), which adds the two
  animation options to the query validation.

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

[Unreleased]: https://github.com/dicebear/api/compare/v4.14.0-rc.6...HEAD
[4.14.0-rc.6]: https://github.com/dicebear/api/compare/v4.14.0-rc.5...v4.14.0-rc.6
[4.14.0-rc.5]: https://github.com/dicebear/api/compare/v4.14.0-rc.4...v4.14.0-rc.5
[4.14.0-rc.4]: https://github.com/dicebear/api/compare/v4.14.0-rc.3...v4.14.0-rc.4
[4.14.0-rc.3]: https://github.com/dicebear/api/compare/v4.14.0-rc.2...v4.14.0-rc.3
[4.14.0-rc.2]: https://github.com/dicebear/api/compare/v4.14.0-rc.1...v4.14.0-rc.2
[4.14.0-rc.1]: https://github.com/dicebear/api/compare/v4.13.0...v4.14.0-rc.1
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
