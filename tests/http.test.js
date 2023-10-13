import { test } from 'node:test';
import assert from 'node:assert/strict';

import { app } from '../dist/app.js';

for (let version of [5, 6, 7]) {
  const requests = [
    {
      path: `/${version}.x/initials/svg`,
      status: 200,
    },
    {
      path: `/${version}.x/initials/svg?size=10`,
      status: 200,
    },
    {
      path: `/${version}.x/initials/svg?size=a`,
      status: 400,
    },
    {
      path: `/${version}.x/initials/svg/size=10`,
      status: 200,
    },
    {
      path: `/${version}.x/initials/svg/size=a`,
      status: 400,
    },
    {
      path: `/${version}.x/initials/svg?backgroundColor=000000,ffffff`,
      status: 200,
    },
    {
      path: `/${version}.x/initials/svg/backgroundColor=000000,ffffff`,
      status: 200,
    },
    {
      path: `/${version}.x/initials/svg?backgroundColor=000000%2Cffffff`,
      status: 200,
    },
    {
      path: `/${version}.x/initials/svg/backgroundColor=000000%2Cffffff`,
      status: 200,
    },
    {
      path: `/${version}.x/initials/schema.json`,
      status: 200,
    },
  ];

  const server = app();

  for (let { path, status } of requests) {
    test(path, async () => {
      const readyApp = await server;
      const response = await readyApp.inject({
        method: 'GET',
        path,
      });

      assert.equal(response.statusCode, status);
    });
  }
}
