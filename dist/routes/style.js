import { schemaHandler } from '../handler/schema.js';
import { parseQueryString } from '../utils/parseQueryString.js';
import { avatarHandler } from '../handler/avatar.js';
import { config } from '../config.js';
const paramsSchema = {
    format: {
        type: 'string',
        enum: [
            'svg',
            ...(config.png.enabled ? ['png'] : []),
            ...(config.jpeg.enabled ? ['jpg', 'jpeg'] : []),
            ...(config.json.enabled ? ['json'] : []),
        ],
    },
};
export const styleRoutes = (app, { core, style }, done) => {
    const optionsSchema = {
        ...core.schema.properties,
        ...style.schema?.properties,
    };
    app.route({
        method: 'GET',
        url: '/schema.json',
        handler: schemaHandler(optionsSchema),
    });
    app.route({
        method: 'GET',
        url: '/:format',
        schema: {
            querystring: optionsSchema,
            params: paramsSchema,
        },
        handler: avatarHandler(core, style),
    });
    app.route({
        method: 'GET',
        url: '/:format/:options',
        preValidation: async (request) => {
            if (typeof request.params.options === 'string') {
                request.query = parseQueryString(request.params.options);
            }
        },
        schema: {
            querystring: optionsSchema,
            params: paramsSchema,
        },
        handler: avatarHandler(core, style),
    });
    done();
};
