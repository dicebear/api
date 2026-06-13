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

[Unreleased]: https://github.com/dicebear/api/compare/v4.9.0...HEAD
[4.9.0]: https://github.com/dicebear/api/compare/v4.8.0...v4.9.0
[4.8.0]: https://github.com/dicebear/api/compare/v4.7.0...v4.8.0
[4.7.0]: https://github.com/dicebear/api/compare/v4.6.0...v4.7.0
[4.6.0]: https://github.com/dicebear/api/compare/v4.5.2...v4.6.0
