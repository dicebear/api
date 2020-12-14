import { Router } from 'tiny-request-router';
import avatarAction from './actions/avatar';
import statsAction from './actions/stats';
import * as qs from 'qs';

const router = new Router();
router.get('/:version/(api|v2)/:style/:seed.svg', avatarAction);
router.get('/:version/(api|v2)/:style/.svg', avatarAction);
router.get('/:version/stats.json', statsAction);

type WorkerEvent = {
  request: Request;
  respondWith: (response: Response | Promise<Response>) => void;
};

addEventListener<any>('fetch', (event: WorkerEvent) => {
  const request = event.request;
  const { pathname, search } = new URL(request.url);

  const match = router.match(request.method as any, pathname);
  const queryString = qs.parse(search.slice(1));

  if (match) {
    event.respondWith(match.handler(match.params, queryString));
  } else {
    event.respondWith(
      new Response('404 Not Found', {
        status: 404,
      })
    );
  }
});
