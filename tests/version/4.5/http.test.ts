import { test } from 'uvu';
import * as assert from 'uvu/assert';

import { core } from '../../../src/core.js';

const requests = {
  '/4.5/v2/initials/.svg': {
    status: 200,
  },
  '/4.5/v2/initials/seed.svg': {
    status: 200,
  },
  '/4.5/api/initials/.svg': {
    status: 200,
  },
  '/4.5/api/initials/seed.svg': {
    status: 200,
  },
  '/4.5/initials/svg': {
    status: 200,
  },
  '/4.5/initials/png': {
    status: 200,
  },
  '/4.5/initials/png?width=10': {
    status: 200,
  },
  '/4.5/initials/png?width=a': {
    status: 400,
  },
};

const app = core({
  logger: false,
});

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
