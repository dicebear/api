<h1><img src="https://www.dicebear.com/logo-readme.svg" width="28" /> DiceBear API</h1>

Run the [DiceBear](https://www.dicebear.com/) avatar service on your own infrastructure. One container turns a seed string into an avatar in 61 styles and five image formats, with no database and no calls to anyone else's servers.

[Playground](https://www.dicebear.com/playground/) |
[Documentation](https://www.dicebear.com/guides/host-the-http-api-yourself/) |
[Docker Hub](https://hub.docker.com/r/dicebear/api)

```sh
docker run --tmpfs /run --tmpfs /tmp -p 3000:3000 dicebear/api:4
```

```
http://localhost:3000/10.x/thumbs/svg?seed=Felix
```

## Why self-host?

Avatar seeds are usually usernames, email addresses, or user IDs. On your own instance, those identifiers stay on your servers and your users' browsers never contact a third party. That keeps privacy reviews short and works just as well in air-gapped environments.

The public API at `api.dicebear.com` is a shared service; your own instance has whatever capacity you give it. Avatars are generated deterministically, so the same seed always returns the same image and every response can be cached aggressively. Put a CDN in front and most requests won't reach the container at all.

The project is MIT licensed, including commercial use.

## What's inside

- 61 avatar styles by various artists; try them all in the [playground](https://www.dicebear.com/playground/)
- SVG, PNG, JPEG, WebP, and AVIF output, plus a JSON endpoint for programmatic use
- Every customization option of the DiceBear library as query parameters, validated against the official schema
- Bundled Noto Sans fonts, so the initials style also renders CJK and Thai characters
- Artist and license information embedded as EXIF metadata in raster images
- Built on [Fastify](https://fastify.io/) with optional worker threads, CORS enabled out of the box

## Endpoints

| Endpoint                                | Description                                       |
| --------------------------------------- | ------------------------------------------------- |
| `GET /10.x`                             | List of available styles                          |
| `GET /10.x/{style}/svg`                 | Avatar as SVG                                     |
| `GET /10.x/{style}/{png,jpg,webp,avif}` | Avatar as raster image                            |
| `GET /10.x/{style}/json`                | Avatar as JSON                                    |
| `GET /10.x/{style}/definition.json`     | Raw style definition (opt-in via `DEFINITION`)    |
| `GET /10.x/{style}/options.json`        | Options descriptor (opt-in via `OPTIONS`)         |
| `GET /health`                           | Health check for load balancers and orchestrators |

The version prefix follows the `VERSIONS` variable; DiceBear 10 is enabled by default. All options from the [style documentation](https://www.dicebear.com/styles/) work as query parameters:

```
http://localhost:3000/10.x/lorelei/png?seed=Felix&size=96&backgroundColor=b6e3f4&radius=50
```

## Getting started

### With Docker

```sh
docker run --tmpfs /run --tmpfs /tmp -p 3000:3000 -i -t dicebear/api:4
```

Or with `docker-compose.yml`:

```yaml
services:
  dicebear:
    image: dicebear/api:4
    restart: always
    ports:
      - '3000:3000'
    tmpfs:
      - '/run'
      - '/tmp'
```

### Without Docker

Requires [Node.js](https://nodejs.org/) 22 or newer.

```sh
git clone git@github.com:dicebear/api.git
cd api

npm install
npm run build
npm start
```

## Environment variables

| Variable                           | Default                                       | Description                                                                                          |
| ---------------------------------- | --------------------------------------------- | ---------------------------------------------------------------------------------------------------- |
| `PORT`                             | `3000`                                        | Port to listen on.                                                                                   |
| `HOST`                             | `0.0.0.0`                                     | Host to bind to (all IPv4 addresses by default).                                                     |
| `LOGGER`                           | `0`                                           | Enable request logger (1 = on, 0 = off).                                                             |
| `WORKERS`                          | `1`                                           | Number of Node.js worker threads.                                                                    |
| `VERSIONS`                         | `10`                                          | Comma-separated list of supported DiceBear major versions.                                           |
| `CACHE_CONTROL_AVATARS`            | `31536000`                                    | Cache duration for avatar responses in seconds (1 year).                                             |
| `CACHE_CONTROL_STYLES`             | `3600`                                        | Cache duration for the styles listing in seconds (1 hour).                                           |
| `PNG`                              | `1`                                           | Enable the PNG endpoint (1 = on, 0 = off).                                                           |
| `PNG_SIZE_MIN`                     | `1`                                           | Minimum allowed PNG size in px.                                                                      |
| `PNG_SIZE_MAX`                     | `256`                                         | Maximum allowed PNG size in px.                                                                      |
| `PNG_SIZE_DEFAULT`                 | `128`                                         | Default PNG size in px.                                                                              |
| `PNG_EXIF`                         | `1`                                           | Enable EXIF metadata for PNG (1 = on, 0 = off).                                                      |
| `JPEG`                             | `1`                                           | Enable the JPEG endpoint (1 = on, 0 = off).                                                          |
| `JPEG_SIZE_MIN`                    | `1`                                           | Minimum allowed JPEG size in px.                                                                     |
| `JPEG_SIZE_MAX`                    | `256`                                         | Maximum allowed JPEG size in px.                                                                     |
| `JPEG_SIZE_DEFAULT`                | `128`                                         | Default JPEG size in px.                                                                             |
| `JPEG_EXIF`                        | `1`                                           | Enable EXIF metadata for JPEG (1 = on, 0 = off).                                                     |
| `WEBP`                             | `1`                                           | Enable the WebP endpoint (1 = on, 0 = off).                                                          |
| `WEBP_SIZE_MIN`                    | `1`                                           | Minimum allowed WebP size in px.                                                                     |
| `WEBP_SIZE_MAX`                    | `256`                                         | Maximum allowed WebP size in px.                                                                     |
| `WEBP_SIZE_DEFAULT`                | `128`                                         | Default WebP size in px.                                                                             |
| `WEBP_EXIF`                        | `1`                                           | Enable EXIF metadata for WebP (1 = on, 0 = off).                                                     |
| `AVIF`                             | `1`                                           | Enable the AVIF endpoint (1 = on, 0 = off).                                                          |
| `AVIF_SIZE_MIN`                    | `1`                                           | Minimum allowed AVIF size in px.                                                                     |
| `AVIF_SIZE_MAX`                    | `256`                                         | Maximum allowed AVIF size in px.                                                                     |
| `AVIF_SIZE_DEFAULT`                | `128`                                         | Default AVIF size in px.                                                                             |
| `AVIF_EXIF`                        | `1`                                           | Enable EXIF metadata for AVIF (1 = on, 0 = off).                                                     |
| `JSON`                             | `1`                                           | Enable the JSON endpoint (1 = on, 0 = off).                                                          |
| `DEFINITION`                       | `0`                                           | Enable the per-style `/definition.json` endpoint serving the raw style definition (1 = on, 0 = off). |
| `OPTIONS`                          | `0`                                           | Enable the per-style `/options.json` endpoint serving the options descriptor (1 = on, 0 = off).      |
| `INITIALS_FILTER`                  | `1`                                           | Replace blocked text in rendered avatars with `*` (1 = on, 0 = off).                                 |
| `QUERY_STRING_ARRAY_LIMIT_MIN`     | `20`                                          | Minimum number of values allowed per array parameter.                                                |
| `EXCLUDED_OPTIONS`                 | `idRandomization,fontFamily,fontWeight,title` | Comma-separated list of option names to exclude.                                                     |
| `QUERY_STRING_PARAMETER_LIMIT_MIN` | `100`                                         | Minimum number of query string parameters allowed.                                                   |

> [!NOTE]
> The `*_EXIF` variables require [Perl](https://www.npmjs.com/package/exiftool-vendored#installation) and [procps](https://www.npmjs.com/package/exiftool-vendored#this-package-requires-procps) to be installed.

## Contributing

Bug reports and pull requests are welcome; see [CONTRIBUTING.md](./CONTRIBUTING.md). If your change affects the public HTTP surface, please open an issue first.

## Sponsors

Advertisement: Many thanks to our sponsors who provide us with free or discounted products.

<a href="https://bunny.net/" target="_blank" rel="noopener noreferrer">
    <picture>
        <source media="(prefers-color-scheme: dark)" srcset="https://www.dicebear.com/sponsors/bunny-light.svg">
        <source media="(prefers-color-scheme: light)" srcset="https://www.dicebear.com/sponsors/bunny-dark.svg">
        <img alt="bunny.net" src="https://www.dicebear.com/sponsors/bunny-dark.svg" height="64">
    </picture>
</a>
