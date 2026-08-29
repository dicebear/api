# Contributing

Thanks for taking the time to contribute to the DiceBear API.

This repository is the self-hostable HTTP API for DiceBear: a
[Fastify](https://fastify.io/) server that exposes avatar rendering over
HTTP and ships as a Docker image on
[Docker Hub](https://hub.docker.com/r/dicebear/api). User-facing hosting
instructions live in the [README](./README.md) and in the docs at
[Host the API yourself](https://www.dicebear.com/recipes/self-host-the-http-api/).

## Before you start

- Bug fixes and small improvements: open a pull request.
- Anything that changes the public HTTP surface (new query parameters,
  response format changes, new/removed endpoints, header changes): open
  an issue first. People self-host this API in production, so breaking
  changes need a migration path.
- Security issues go privately to <contact@dicebear.com>; see the
  [DiceBear security policy](https://github.com/dicebear/.github/blob/main/SECURITY.md).
  Never file a public issue for a vulnerability.
- Contributors follow the
  [DiceBear Code of Conduct](https://github.com/dicebear/.github/blob/main/CODE_OF_CONDUCT.md).

## Requirements

- [Node.js](https://nodejs.org/) 22 or newer (see `engines.node` in
  `package.json`)
- For end-to-end container testing: [Docker](https://www.docker.com/) or
  a compatible runtime
- `*_EXIF` writes require Perl and `procps` on the host. The Docker
  image already has them; on a bare machine you may need to install
  them if you want to exercise the EXIF paths.

## Local setup

```sh
git clone https://github.com/dicebear/api.git
cd api
npm install
```

`npm install` runs the `predev` / `prebuild` hook once via `tsx` to build
the font bundle into `fonts/`. If you ever see font-related load errors,
re-run:

```sh
npx tsx ./scripts/build-fonts.ts
```

## Scripts

| Script             | What it does                                             |
| ------------------ | -------------------------------------------------------- |
| `npm run dev`      | Starts the server with `tsx --watch` for instant reloads |
| `npm run build`    | Type-checks and compiles TypeScript into `dist/`         |
| `npm start`        | Runs the compiled server from `dist/`                    |
| `npm test`         | Runs the Node test runner against `tests/*.js`           |
| `npm run lint`     | Runs ESLint over `src/`                                  |
| `npm run lint:fix` | Runs ESLint with `--fix`                                 |
| `npm run format`   | Runs Prettier across the repo                            |

## Project layout

```
src/
├── server.ts      # Entry point: wires config, workers, graceful shutdown
├── app.ts         # Fastify app factory (also used by tests)
├── config.ts      # Reads env vars, validates, exposes typed config
├── routes/        # HTTP routes (JSON, SVG, raster formats, metadata)
├── handler/       # Shared request handlers used by the routes
└── utils/         # Helpers (cache headers, content negotiation, etc.)
tests/
├── http.test.js           # End-to-end HTTP checks via Fastify's inject()
├── definitions.test.js    # Style listing and metadata endpoints
├── excluded-options.test.js
├── fonts.test.js
├── query-string.test.js
└── schema.test.js
fonts/          # Generated font bundle (checked-in for determinism)
scripts/        # Build helpers (build-fonts.ts)
Dockerfile      # Production image
```

## Running the server locally

```sh
npm run dev
```

The server listens on `http://localhost:3000` by default. Adjust via the
environment variables listed in the [README](./README.md#environment-variables).

Once it's up, smoke-test with a style known to be registered:

```sh
curl -s 'http://localhost:3000/10.x/thumbs/svg?seed=ping' | head -c 200
```

## Writing tests

Tests use `node --test` against the Fastify instance returned by
`app()` from `src/app.ts` (no real socket is opened; requests go through
`fastify.inject`). When you add a route or change response shape, extend
the matching file under `tests/`. Keep fixtures tiny: tests must be fast
enough to run on every push.

Tests don't need Docker. CI runs the exact same command as
`npm test`.

## Dockerfile changes

If you change `Dockerfile`, also run a local build:

```sh
docker build -t dicebear/api:dev .
docker run --tmpfs /run --tmpfs /tmp -p 3000:3000 --rm dicebear/api:dev
```

The `docker.yml` workflow publishes the image to Docker Hub on tag
pushes; it should not need manual intervention. Avoid breaking the
multi-arch build or the image will fail to publish on release.

## Code style

- Prettier handles formatting (`.prettierrc`); `npm run format` is the
  safety net.
- ESLint with typescript-eslint governs the TS side. Fix errors before
  you open a PR; warnings are fine but please leave a note if you're
  ignoring one on purpose.
- TypeScript is `strict`. Prefer narrow types over `any` / `unknown`
  casts; if you genuinely need one, comment why.
- Route handlers live in `src/routes/`, shared helpers in
  `src/handler/` or `src/utils/`. Don't add business logic to
  `server.ts`.

## Releasing (maintainers only)

Record user-facing changes under the `## [Unreleased]` heading in
[`CHANGELOG.md`](./CHANGELOG.md) as you merge them. To cut a release, run:

```sh
scripts/version.sh <version>   # e.g. 4.5.3 or 4.6.0-rc.1
git push && git push --tags
```

`scripts/version.sh` promotes the changelog's `[Unreleased]` section to a
dated `## [<version>]` heading, refreshes the compare links, then creates
the commit and the `v<version>` tag. Unlike the `schema` and `styles`
repos, this package is private and unpublished, so there is no manifest
`version` field to bump. The Git tag is the single source of truth.

Pushing the tag triggers the
[`docker.yml`](.github/workflows/docker.yml) workflow, which builds and
pushes the multi-arch image to Docker Hub. The `test.yml` workflow runs
on every push / PR and must stay green.

## Licensing

By opening a pull request you agree that your contribution is released
under the repository's [MIT license](./LICENSE).
