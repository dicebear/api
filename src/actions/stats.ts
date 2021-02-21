import { RequestHandler } from 'express';
import axios from 'axios';

const handler: RequestHandler = async (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Cache-Control', `max-age=${60 * 60}`);

  res.json({ data: await github() });
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
