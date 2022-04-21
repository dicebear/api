<h1 align="center"><img src="https://avatars.dicebear.com/api/male/seed.svg?mood=happy" width="124" /> <br />DiceBear Avatars API</h1>
<p align="center"><strong>DiceBear Avatars API build on <a href="https://fastify.io/" target="_blank">fastify</a></strong></p>

## Start application

```bash
git clone git@github.com:dicebear/api.git
cd api

npm install
npm start
```

## Environment variables

### PORT

- Default: `3000`

### ADDRESS

- Default: `0.0.0.0`

### ENABLE_LOGGER

- Default: `1`

### ENABLE_PNG

- Default: `1`

### PNG_SIZE_MIN

- Default: `1`

### PNG_SIZE_MAX

- Default: `256`

### ENABLE_PNG_EXIF

- Default: `0`
- Requirements:
  - Perl (https://www.npmjs.com/package/exiftool-vendored#installation)
  - procps (https://www.npmjs.com/package/exiftool-vendored#user-content-this-package-requires-procps)

### ENABLE_VERSION_4_4

- Default: `1`

### ENABLE_VERSION_4_5

- Default: `1`

### ENABLE_VERSION_4_6

- Default: `1`

### ENABLE_VERSION_4_7

- Default: `1`

### ENABLE_VERSION_4_8

- Default: `1`

### ENABLE_VERSION_4_9

- Default: `1`

### ENABLE_VERSION_4_10

- Default: `1`

### ENABLE_VERSION_5_0

- Default: `1`

### CACHE_CONTROL_STATS

- Default: `3600` (1 hour)

### CACHE_CONTROL_AVATARS

- Default: `31536000` (1 year)
