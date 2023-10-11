import { collectionRoutes } from './collection.js';
export const versionRoutes = (app, { versions }, done) => {
    for (const [prefix, version] of Object.entries(versions)) {
        app.register(collectionRoutes, {
            prefix: `/${prefix}`,
            version,
        });
    }
    done();
};
