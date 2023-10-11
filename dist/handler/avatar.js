import { config } from '../config.js';
export function avatarHandler(core, style) {
    return async (request, reply) => {
        const options = request.query;
        // Validate Size for PNG Format
        if (request.params.format === 'png') {
            options['size'] = options['size']
                ? Math.min(Math.max(options['size'], config.png.size.min), config.png.size.max)
                : config.png.size.default;
        }
        // Validate Size for JPEG Format
        if (request.params.format === 'jpg') {
            options['size'] = options['size']
                ? Math.min(Math.max(options['size'], config.jpeg.size.min), config.jpeg.size.max)
                : config.png.size.default;
        }
        // Define default seed
        options['seed'] = options['seed'] ?? '';
        // Define filename
        reply.header('Content-Disposition', `inline; filename="avatar.${request.params.format}"`);
        // Create avatar
        const avatar = core.createAvatar(style, options);
        reply.header('X-Robots-Tag', 'noindex');
        reply.header('Cache-Control', `max-age=${config.cacheControl.avatar}`);
        switch (request.params.format) {
            case 'svg':
                reply.header('Content-Type', 'image/svg+xml');
                return avatar.toString();
            case 'png':
                reply.header('Content-Type', 'image/png');
                const png = await avatar
                    .png({
                    includeExif: config.png.exif,
                })
                    .toArrayBuffer();
                return Buffer.from(png);
            case 'jpg':
            case 'jpeg':
                reply.header('Content-Type', 'image/jpeg');
                const jpeg = await avatar
                    .jpeg({
                    includeExif: config.jpeg.exif,
                })
                    .toArrayBuffer();
                return Buffer.from(jpeg);
            case 'json':
                reply.header('Content-Type', 'application/json');
                return JSON.stringify(avatar.toJson());
        }
    };
}
