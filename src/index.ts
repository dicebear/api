import v44 from '@dicebear/avatars-api-4.4';
import v45 from '@dicebear/avatars-api-4.5';
import 'make-promises-safe';
import statsAction from './actions/stats';
import fastify from 'fastify';
import qs from 'qs';

const port = process.env.PORT || 3000;
const app = fastify({
  logger: true,
  querystringParser: (str) => qs.parse(str),
  ajv: {
    customOptions: {
      coerceTypes: 'array',
      removeAdditional: true,
      useDefaults: true,
    },
  },
});

app.get('/:version/stats.json', statsAction);
app.register(v44, { prefix: '/4.4' });
app.register(v45, { prefix: '/4.5' });

app.listen(port, (err, address) => {
  if (err) {
    app.log.error(err.message);
    process.exit(1);
  }

  app.log.info(`server listening on ${address}`);
});
