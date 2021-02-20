import { RequestHandler } from 'express';

const handler: RequestHandler = async (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Cache-Control', `max-age=${60 * 60}`);

  res.json({ data: await github() });
};

export default handler;

async function github() {
  let headers = new Headers({
    Accept: 'application/vnd.github.v3+json',
    'User-Agent': 'Dicebear-Avatars',
  });

  let response = await fetch('https://api.github.com/repos/dicebear/avatars', {
    method: 'get',
    headers: headers,
  });

  let json = await response.json();

  return {
    stars: json.stargazers_count,
  };
}
