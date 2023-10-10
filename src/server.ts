import { config } from './config.js';
import { app } from './app.js';

(async () => {
  const server = await app();

  server.listen(
    {
      port: config.port,
      host: config.host,
    },
    (err) => {
      if (err) {
        server.log.error(err);
        process.exit(1);
      }

      console.info(`Server listening at http://${config.host}:${config.port}`);
    }
  );
})();
