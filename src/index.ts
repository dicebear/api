import 'make-promises-safe';
import v44 from '@dicebear/avatars-api-4.4';
import v45 from '@dicebear/avatars-api-4.5';
import v46 from '@dicebear/avatars-api-4.6';
import v47 from '@dicebear/avatars-api-4.7';
import statsAction from './actions/stats';
import fastify from 'fastify';
import qs from 'qs';
import serve from 'fastify-static';
import path from 'path';

const port = process.env.PORT || 3000;
const app = fastify({
  logger: true,
  querystringParser: (str) => qs.parse(str),
  ajv: {
    customOptions: {
      coerceTypes: 'array',
      removeAdditional: true,
      useDefaults: false,
    },
  },
});

app.get('/stats.json', statsAction);
app.register(serve, {
  root: path.join(__dirname, 'public'),
});
app.register(v44, { prefix: '/4.4' });
app.register(v45, { prefix: '/4.5' });
app.register(v46, { prefix: '/4.6' });
app.register(v47, { prefix: '/4.7' });
app.register(v47);

app.listen(port, '0.0.0.0', (err, address) => {
  if (err) {
    app.log.error(err.message);
    process.exit(1);
  }

  app.log.info(`server listening on ${address}`);
});
