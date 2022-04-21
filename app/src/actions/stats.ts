import axios from 'axios';
import { FastifyPluginCallback, FastifyReply, FastifyRequest } from 'fastify';
import config from '../../config.js';

const plugin: FastifyPluginCallback = async (app) => {
  app.get(
    '/stats.json',
    async (request: FastifyRequest, reply: FastifyReply) => {
      const response = await axios.get(
        'https://api.github.com/repos/dicebear/dicebear',
        {
          headers: {
            Accept: 'application/vnd.github.v3+json',
            'User-Agent': 'DiceBear',
          },
        }
      );

      const data = {
        stars: response.data.stargazers_count,
      };

      reply
        .headers({
          'Cache-Control': `max-age=${config.cacheControl.stats}`,
        })
        .send({ data: data });
    }
  );
};

export default plugin;
