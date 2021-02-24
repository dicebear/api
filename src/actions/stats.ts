import axios from 'axios';
import { FastifyReply, FastifyRequest } from 'fastify';

const handler = async (request: FastifyRequest, reply: FastifyReply) => {
  reply
    .headers({
      'Cache-Control': `max-age=${60 * 60}`,
    })
    .send({ data: await github() });
};

export default handler;

async function github() {
  let response = await axios.get('https://api.github.com/repos/dicebear/avatars', {
    headers: {
      Accept: 'application/vnd.github.v3+json',
      'User-Agent': 'Dicebear-Avatars',
    },
  });

  return {
    stars: response.data.stargazers_count,
  };
}
