import { test } from 'uvu';
import * as assert from 'uvu/assert';

import { core } from '../../../src/core.js';

const requests = {
  '/4.4/v2/initials/.svg': {
    status: 200,
  },
  '/4.4/v2/initials/seed.svg': {
    status: 200,
  },
  '/4.4/api/initials/.svg': {
    status: 200,
  },
  '/4.4/api/initials/seed.svg': {
    status: 200,
  },
  '/4.4/initials/svg': {
    status: 200,
  },
  '/4.4/initials/png': {
    status: 200,
  },
  '/4.4/initials/png?width=10': {
    status: 200,
  },
  '/4.4/initials/png?width=a': {
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
