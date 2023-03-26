import { test } from 'uvu';
import * as assert from 'uvu/assert';

import { core } from '../../../src/core.js';

const requests = {
  '/6.x/v2/initials/.svg': {
    status: 404,
  },
  '/6.x/v2/initials/seed.svg': {
    status: 404,
  },
  '/6.x/api/initials/.svg': {
    status: 404,
  },
  '/6.x/api/initials/seed.svg': {
    status: 404,
  },
  '/6.x/initials/svg': {
    status: 200,
  },
  '/6.x/initials/png': {
    status: 200,
  },
  '/6.x/initials/png?size=10': {
    status: 200,
  },
  '/6.x/initials/png?size=a': {
    status: 400,
  },
};

const app = core();

for (let [url, expect] of Object.entries(requests)) {
  test(url, async () => {
    const readyApp = await app;
    const response = await readyApp.inject({
      method: 'GET',
      url,
    });

    assert.equal(response.statusCode, expect.status);
  });
}

test.run();
