<h1><img src="https://dicebear.com/logo-readme.svg" width="28" /> DiceBear API</h1>

Self-host the DiceBear avatar API for privacy-by-design and commercial use. Built on [Fastify](https://fastify.io/).

[Playground](https://dicebear.com/playground/) |
[Documentation](https://dicebear.com/guides/host-the-http-api-yourself/) |
[Docker Hub](https://hub.docker.com/r/dicebear/api)

## Getting Started

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

Requires [Node.js](https://nodejs.org/).

```sh
git clone git@github.com:dicebear/api.git
cd api

npm install
npm run build
npm start
```

## Environment Variables

| Variable                           | Default     | Description                                                |
| ---------------------------------- | ----------- | ---------------------------------------------------------- |
| `PORT`                             | `3000`      | Port to listen on.                                         |
| `HOST`                             | `0.0.0.0`   | Host to bind to (all IPv4 addresses by default).           |
| `LOGGER`                           | `0`         | Enable request logger (1 = on, 0 = off).                   |
| `WORKERS`                          | `1`         | Number of Node.js worker threads.                          |
| `VERSIONS`                         | `10`        | Comma-separated list of supported DiceBear major versions. |
| `CACHE_CONTROL_AVATARS`            | `31536000`  | Cache duration for avatar responses in seconds (1 year).   |
| `CACHE_CONTROL_STYLES`             | `3600`      | Cache duration for the styles listing in seconds (1 hour). |
| `PNG`                              | `1`         | Enable the PNG endpoint (1 = on, 0 = off).                 |
| `PNG_SIZE_MIN`                     | `1`         | Minimum allowed PNG size in px.                            |
| `PNG_SIZE_MAX`                     | `256`       | Maximum allowed PNG size in px.                            |
| `PNG_SIZE_DEFAULT`                 | `128`       | Default PNG size in px.                                    |
| `PNG_EXIF`                         | `1`         | Enable EXIF metadata for PNG (1 = on, 0 = off).            |
| `JPEG`                             | `1`         | Enable the JPEG endpoint (1 = on, 0 = off).                |
| `JPEG_SIZE_MIN`                    | `1`         | Minimum allowed JPEG size in px.                           |
| `JPEG_SIZE_MAX`                    | `256`       | Maximum allowed JPEG size in px.                           |
| `JPEG_SIZE_DEFAULT`                | `128`       | Default JPEG size in px.                                   |
| `JPEG_EXIF`                        | `1`         | Enable EXIF metadata for JPEG (1 = on, 0 = off).           |
| `WEBP`                             | `1`         | Enable the WebP endpoint (1 = on, 0 = off).                |
| `WEBP_SIZE_MIN`                    | `1`         | Minimum allowed WebP size in px.                           |
| `WEBP_SIZE_MAX`                    | `256`       | Maximum allowed WebP size in px.                           |
| `WEBP_SIZE_DEFAULT`                | `128`       | Default WebP size in px.                                   |
| `WEBP_EXIF`                        | `1`         | Enable EXIF metadata for WebP (1 = on, 0 = off).           |
| `AVIF`                             | `1`         | Enable the AVIF endpoint (1 = on, 0 = off).                |
| `AVIF_SIZE_MIN`                    | `1`         | Minimum allowed AVIF size in px.                           |
| `AVIF_SIZE_MAX`                    | `256`       | Maximum allowed AVIF size in px.                           |
| `AVIF_SIZE_DEFAULT`                | `128`       | Default AVIF size in px.                                   |
| `AVIF_EXIF`                        | `1`         | Enable EXIF metadata for AVIF (1 = on, 0 = off).           |
| `JSON`                             | `1`         | Enable the JSON endpoint (1 = on, 0 = off).                |
| `DEFINITION`                       | `0`         | Enable the per-style `/definition.json` endpoint serving the raw style definition (1 = on, 0 = off). |
| `OPTIONS`                          | `0`         | Enable the per-style `/options.json` endpoint serving the options descriptor (1 = on, 0 = off). |
| `INITIALS_FILTER`                  | `1`         | Replace blocked text in rendered avatars with `*` (1 = on, 0 = off). |
| `QUERY_STRING_ARRAY_LIMIT_MIN`     | `20`        | Minimum number of values allowed per array parameter.      |
| `EXCLUDED_OPTIONS`                 | `idRandomization,fontFamily,fontWeight,title` | Comma-separated list of option names to exclude.           |
| `QUERY_STRING_PARAMETER_LIMIT_MIN` | `100`       | Minimum number of query string parameters allowed.         |

> [!NOTE]
> The `*_EXIF` variables require [Perl](https://www.npmjs.com/package/exiftool-vendored#installation) and [procps](https://www.npmjs.com/package/exiftool-vendored#this-package-requires-procps) to be installed.

## Sponsors

Advertisement: Many thanks to our sponsors who provide us with free or discounted products.

<a href="https://bunny.net/" target="_blank" rel="noopener noreferrer">
    <picture>
        <source media="(prefers-color-scheme: dark)" srcset="https://www.dicebear.com/sponsors/bunny-light.svg">
        <source media="(prefers-color-scheme: light)" srcset="https://www.dicebear.com/sponsors/bunny-dark.svg">
        <img alt="bunny.net" src="https://www.dicebear.com/sponsors/bunny-dark.svg" height="64">
    </picture>
</a>
