import { kebabCase } from 'change-case';
import { styleRoutes } from './style.js';
export const collectionRoutes = (app, { version }, done) => {
    for (const [prefix, style] of Object.entries(version.collection)) {
        app.register(styleRoutes, {
            prefix: `/${kebabCase(prefix)}`,
            core: version.core,
            style,
        });
    }
    done();
};
