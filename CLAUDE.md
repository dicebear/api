# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

DiceBear API is a Fastify-based HTTP API for generating avatars. It serves multiple versions of the DiceBear library (5.x through 9.x) simultaneously, enabling backwards compatibility for consumers.

## Commands

```bash
# Development (builds fonts, then runs with hot reload)
npm run dev

# Build for production
npm run build

# Start production server (requires build first)
npm start

# Run tests (requires build first)
npm test

# Run a single test file
node --test tests/http.test.js
```

## Architecture

### Multi-Version Support
The API uses npm workspaces to maintain multiple DiceBear library versions side-by-side:
- `versions/5.x/` through `versions/9.x/` - Each contains a package.json that pins specific `@dicebear/core` and `@dicebear/collection` versions
- Versions are loaded dynamically via `src/utils/versions.ts` based on the `VERSIONS` env var
- Routes are prefixed by version: `/:version/:style/:format` (e.g., `/9.x/avataaars/svg`)

### Route Structure
```
src/routes/version.ts   → Registers routes for each enabled version
src/routes/collection.ts → Registers routes for each avatar style in a version
src/routes/style.ts     → Defines the actual endpoints (/:format, /:format/:options, /schema.json)
```

### Request Flow
1. Request hits `/:version/:style/:format` or `/:version/:style/:format/:options`
2. Query string parsing via `src/utils/query-string.ts` (supports both `?key=value` and path-based `/key=value`)
3. Options validated against combined JSON Schema from core + style
4. `src/handler/avatar.ts` creates avatar using the appropriate DiceBear version
5. Format conversion (PNG, JPEG, WebP, AVIF) via `@dicebear/converter`

### Font System
- `scripts/build-fonts.ts` - Pre-build script that extracts TTF fonts from @fontsource packages
- Fonts are used for rendering text in raster formats (initials style, etc.)
- Font selection based on Unicode ranges in `fonts/fonts.json`

## Configuration

All configuration is via environment variables (see `src/config.ts`):
- `PORT`, `HOST`, `WORKERS` - Server settings
- `VERSIONS` - Comma-separated list of versions to enable (default: 5,6,7,8,9)
- `PNG`, `JPEG`, `WEBP`, `AVIF`, `JSON` - Enable/disable output formats (0/1)
- `*_SIZE_MIN`, `*_SIZE_MAX`, `*_SIZE_DEFAULT` - Size constraints per format
- `*_EXIF` - Include EXIF metadata in raster formats
