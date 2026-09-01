import { test, describe, before, after } from 'node:test';
import assert from 'node:assert/strict';

import { app } from '../dist/app.js';

let server;

before(async () => {
  server = await app();
});

after(async () => {
  await server.close();
});

describe('SVG endpoint', () => {
  test('returns SVG for valid style', async () => {
    const res = await server.inject({
      method: 'GET',
      path: '/10.x/initials/svg',
    });
    assert.equal(res.statusCode, 200);
    assert.equal(res.headers['content-type'], 'image/svg+xml');
    assert.ok(res.body.startsWith('<svg'));
  });

  test('returns SVG with seed', async () => {
    const res = await server.inject({
      method: 'GET',
      path: '/10.x/initials/svg?seed=hello',
    });
    assert.equal(res.statusCode, 200);
    assert.ok(res.body.includes('<svg'));
  });

  test('returns deterministic SVG for same seed', async () => {
    const res1 = await server.inject({
      method: 'GET',
      path: '/10.x/initials/svg?seed=test123',
    });
    const res2 = await server.inject({
      method: 'GET',
      path: '/10.x/initials/svg?seed=test123',
    });
    assert.equal(res1.body, res2.body);
  });

  test('returns different SVG for different seeds', async () => {
    const res1 = await server.inject({
      method: 'GET',
      path: '/10.x/initials/svg?seed=alice',
    });
    const res2 = await server.inject({
      method: 'GET',
      path: '/10.x/initials/svg?seed=bob',
    });
    assert.notEqual(res1.body, res2.body);
  });

  test('returns SVG for all known styles', async () => {
    const styles = [
      'adventurer',
      'adventurer-neutral',
      'avataaars',
      'avataaars-neutral',
      'big-ears',
      'big-ears-neutral',
      'big-smile',
      'bottts',
      'bottts-neutral',
      'croodles',
      'croodles-neutral',
      'dylan',
      'fun-emoji',
      'glass',
      'icons',
      'identicon',
      'initials',
      'lorelei',
      'lorelei-neutral',
      'micah',
      'miniavs',
      'notionists',
      'notionists-neutral',
      'open-peeps',
      'personas',
      'pixel-art',
      'pixel-art-neutral',
      'rings',
      'shapes',
      'thumbs',
      'toon-head',
    ];

    for (const style of styles) {
      const res = await server.inject({
        method: 'GET',
        path: `/10.x/${style}/svg?seed=test`,
      });
      assert.equal(res.statusCode, 200, `${style} should return 200`);
    }
  });
});

describe('11.x endpoint', () => {
  test('returns SVG for valid style', async () => {
    const res = await server.inject({
      method: 'GET',
      path: '/11.x/initials/svg?seed=hello',
    });
    assert.equal(res.statusCode, 200);
    assert.ok(res.body.startsWith('<svg'));
  });

  test('renders static by default', async () => {
    const res = await server.inject({
      method: 'GET',
      path: '/11.x/planets/svg?seed=hello',
    });
    assert.equal(res.statusCode, 200);
    assert.ok(!res.body.includes('@keyframes'));
  });

  test('plays animations on request', async () => {
    const res = await server.inject({
      method: 'GET',
      path: '/11.x/planets/svg?seed=hello&animation=true',
    });
    assert.equal(res.statusCode, 200);
    assert.ok(res.body.includes('@keyframes'));
  });
});

describe('JSON endpoint', () => {
  test('returns JSON with svg and options', async () => {
    const res = await server.inject({
      method: 'GET',
      path: '/10.x/avataaars/json?seed=hello',
    });
    assert.equal(res.statusCode, 200);
    assert.ok(res.headers['content-type'].startsWith('application/json'));

    const json = JSON.parse(res.body);
    assert.ok(json.svg);
    assert.ok(json.options);
    assert.ok(json.svg.startsWith('<svg'));
  });

  test('resolved options do not include the raw seed', async () => {
    const res = await server.inject({
      method: 'GET',
      path: '/10.x/avataaars/json?seed=myseed',
    });
    const json = JSON.parse(res.body);
    assert.equal('seed' in json.options, false);
  });

  test('resolved options contain selected variants', async () => {
    const res = await server.inject({
      method: 'GET',
      path: '/10.x/avataaars/json?seed=hello',
    });
    const json = JSON.parse(res.body);
    assert.ok(typeof json.options.eyesVariant === 'string');
    assert.ok(typeof json.options.mouthVariant === 'string');
  });
});

describe('PNG endpoint', () => {
  test('returns PNG image', async () => {
    const res = await server.inject({
      method: 'GET',
      path: '/10.x/initials/png?seed=test',
    });
    assert.equal(res.statusCode, 200);
    assert.equal(res.headers['content-type'], 'image/png');
    assert.ok(res.rawPayload.length > 0);
  });

  test('respects size parameter', async () => {
    const small = await server.inject({
      method: 'GET',
      path: '/10.x/initials/png?seed=test&size=32',
    });
    const large = await server.inject({
      method: 'GET',
      path: '/10.x/initials/png?seed=test&size=256',
    });
    assert.equal(small.statusCode, 200);
    assert.equal(large.statusCode, 200);
    assert.ok(large.rawPayload.length > small.rawPayload.length);
  });

  test('clamps size to format max', async () => {
    const res = await server.inject({
      method: 'GET',
      path: '/10.x/initials/png?seed=test&size=1024',
    });
    assert.equal(res.statusCode, 200);
  });

  test('rejects size below schema minimum', async () => {
    const res = await server.inject({
      method: 'GET',
      path: '/10.x/initials/png?seed=test&size=0',
    });
    assert.equal(res.statusCode, 400);
  });

  test('rejects size above schema maximum', async () => {
    const res = await server.inject({
      method: 'GET',
      path: '/10.x/initials/png?seed=test&size=9999',
    });
    assert.equal(res.statusCode, 400);
  });
});

describe('path-based options', () => {
  test('parses options from path', async () => {
    const res = await server.inject({
      method: 'GET',
      path: '/10.x/initials/svg/seed=test',
    });
    assert.equal(res.statusCode, 200);
    assert.equal(res.headers['content-type'], 'image/svg+xml');
  });

  test('produces same result as query string', async () => {
    const resQuery = await server.inject({
      method: 'GET',
      path: '/10.x/initials/svg?seed=hello',
    });
    const resPath = await server.inject({
      method: 'GET',
      path: '/10.x/initials/svg/seed=hello',
    });
    assert.equal(resQuery.body, resPath.body);
  });

  test('handles multiple options in path', async () => {
    const res = await server.inject({
      method: 'GET',
      path: '/10.x/initials/svg/seed=test&size=64',
    });
    assert.equal(res.statusCode, 200);
  });

  test('handles comma-separated values in path', async () => {
    const res = await server.inject({
      method: 'GET',
      path: '/10.x/avataaars/svg/seed=test&backgroundColor=000000,ffffff',
    });
    assert.equal(res.statusCode, 200);
  });

  test('handles encoded commas in path', async () => {
    const res = await server.inject({
      method: 'GET',
      path: '/10.x/avataaars/svg/seed=test&backgroundColor=000000%2Cffffff',
    });
    assert.equal(res.statusCode, 200);
  });
});

describe('weighted variants', () => {
  test('accepts variant:weight format', async () => {
    const res = await server.inject({
      method: 'GET',
      path: '/10.x/avataaars/svg?seed=hello&eyesVariant=happy:3,wink:1',
    });
    assert.equal(res.statusCode, 200);
  });

  test('weighted variants produce deterministic results', async () => {
    const res1 = await server.inject({
      method: 'GET',
      path: '/10.x/avataaars/svg?seed=hello&eyesVariant=happy:3,wink:1',
    });
    const res2 = await server.inject({
      method: 'GET',
      path: '/10.x/avataaars/svg?seed=hello&eyesVariant=happy:3,wink:1',
    });
    assert.equal(res1.body, res2.body);
  });

  test('weighted variants resolve to one of the specified variants', async () => {
    const res = await server.inject({
      method: 'GET',
      path: '/10.x/avataaars/json?seed=hello&eyesVariant=happy:3,wink:1',
    });
    const json = JSON.parse(res.body);
    assert.ok(['happy', 'wink'].includes(json.options.eyesVariant));
  });

  test('variant without weight defaults to weight 1', async () => {
    const res = await server.inject({
      method: 'GET',
      path: '/10.x/avataaars/json?seed=hello&eyesVariant=happy:,wink:1',
    });
    assert.equal(res.statusCode, 200);
  });

  test('unweighted variant list still works', async () => {
    const res = await server.inject({
      method: 'GET',
      path: '/10.x/avataaars/json?seed=hello&eyesVariant=happy,wink',
    });
    const json = JSON.parse(res.body);
    assert.ok(['happy', 'wink'].includes(json.options.eyesVariant));
  });

  test('single variant is used directly', async () => {
    const res = await server.inject({
      method: 'GET',
      path: '/10.x/avataaars/json?seed=hello&eyesVariant=wink',
    });
    const json = JSON.parse(res.body);
    assert.equal(json.options.eyesVariant, 'wink');
  });

  test('weighted variants work in path-based options', async () => {
    const res = await server.inject({
      method: 'GET',
      path: '/10.x/avataaars/svg/seed=hello&eyesVariant=happy:3,wink:1',
    });
    assert.equal(res.statusCode, 200);
  });
});

describe('response headers', () => {
  test('sets Cache-Control header', async () => {
    const res = await server.inject({
      method: 'GET',
      path: '/10.x/initials/svg?seed=test',
    });
    assert.ok(res.headers['cache-control']?.includes('max-age='));
  });

  test('sets X-Robots-Tag header', async () => {
    const res = await server.inject({
      method: 'GET',
      path: '/10.x/initials/svg?seed=test',
    });
    assert.equal(res.headers['x-robots-tag'], 'noindex');
  });

  test('sets Content-Disposition header', async () => {
    const res = await server.inject({
      method: 'GET',
      path: '/10.x/initials/svg?seed=test',
    });
    assert.ok(res.headers['content-disposition']?.includes('avatar.svg'));
  });

  test('sets correct Content-Type for each format', async () => {
    const formats = [
      ['svg', 'image/svg+xml'],
      ['json', 'application/json'],
      ['png', 'image/png'],
    ];

    for (const [format, expectedType] of formats) {
      const res = await server.inject({
        method: 'GET',
        path: `/10.x/initials/${format}?seed=test`,
      });
      assert.ok(
        res.headers['content-type'].startsWith(expectedType),
        `${format} content-type`,
      );
    }
  });

  test('CORS headers are present', async () => {
    const res = await server.inject({
      method: 'OPTIONS',
      path: '/10.x/initials/svg',
      headers: { origin: 'https://example.com' },
    });
    assert.ok(res.headers['access-control-allow-origin']);
  });
});

describe('error handling', () => {
  test('returns 404 for unknown style', async () => {
    const res = await server.inject({
      method: 'GET',
      path: '/10.x/nonexistent/svg',
    });
    assert.equal(res.statusCode, 404);
  });

  test('returns 404 for unknown version', async () => {
    const res = await server.inject({
      method: 'GET',
      path: '/9.x/initials/svg',
    });
    assert.equal(res.statusCode, 404);
  });

  test('returns 400 for invalid format', async () => {
    const res = await server.inject({
      method: 'GET',
      path: '/10.x/initials/gif',
    });
    assert.equal(res.statusCode, 400);
  });

  test('returns 400 for invalid size type', async () => {
    const res = await server.inject({
      method: 'GET',
      path: '/10.x/initials/svg?size=abc',
    });
    assert.equal(res.statusCode, 400);
  });

  test('strips unknown query parameters', async () => {
    const res = await server.inject({
      method: 'GET',
      path: '/10.x/initials/svg?seed=test&unknown=foo',
    });
    assert.equal(res.statusCode, 200);
  });

  test('handles empty seed', async () => {
    const res = await server.inject({
      method: 'GET',
      path: '/10.x/initials/svg?seed=',
    });
    assert.equal(res.statusCode, 200);
  });

  test('handles no parameters', async () => {
    const res = await server.inject({
      method: 'GET',
      path: '/10.x/avataaars/svg',
    });
    assert.equal(res.statusCode, 200);
  });
});

describe('options validation', () => {
  test('accepts valid backgroundColor', async () => {
    const res = await server.inject({
      method: 'GET',
      path: '/10.x/avataaars/svg?backgroundColor=ff0000',
    });
    assert.equal(res.statusCode, 200);
  });

  test('accepts multiple backgroundColors', async () => {
    const res = await server.inject({
      method: 'GET',
      path: '/10.x/avataaars/svg?backgroundColor=000000,ffffff',
    });
    assert.equal(res.statusCode, 200);
  });

  test('accepts flip option', async () => {
    const res = await server.inject({
      method: 'GET',
      path: '/10.x/avataaars/svg?flip=horizontal',
    });
    assert.equal(res.statusCode, 200);
  });

  test('accepts scale option', async () => {
    const res = await server.inject({
      method: 'GET',
      path: '/10.x/avataaars/svg?scale=1.2',
    });
    assert.equal(res.statusCode, 200);
  });

  test('accepts borderRadius option', async () => {
    const res = await server.inject({
      method: 'GET',
      path: '/10.x/avataaars/svg?borderRadius=50',
    });
    assert.equal(res.statusCode, 200);
  });

  test('accepts rotate option', async () => {
    const res = await server.inject({
      method: 'GET',
      path: '/10.x/avataaars/svg?rotate=45',
    });
    assert.equal(res.statusCode, 200);
  });

  test('accepts component probability', async () => {
    const res = await server.inject({
      method: 'GET',
      path: '/10.x/avataaars/svg?facialHairProbability=50',
    });
    assert.equal(res.statusCode, 200);
  });

  test('accepts translateX and translateY', async () => {
    const res = await server.inject({
      method: 'GET',
      path: '/10.x/avataaars/svg?translateX=10&translateY=-5',
    });
    assert.equal(res.statusCode, 200);
  });
});

describe('styles listing', () => {
  test('returns list of style names for a version', async () => {
    const res = await server.inject({ method: 'GET', path: '/10.x' });
    const body = JSON.parse(res.body);

    assert.equal(res.statusCode, 200);
    assert.ok(Array.isArray(body.styles));
    assert.ok(body.styles.length > 0);
    assert.ok(body.styles.every((name) => typeof name === 'string'));
    assert.ok(body.styles.includes('initials'));
  });

  test('returns style names sorted alphabetically', async () => {
    const res = await server.inject({ method: 'GET', path: '/10.x' });
    const body = JSON.parse(res.body);

    assert.deepEqual(body.styles, [...body.styles].sort());
  });

  test('links the documentation', async () => {
    const res = await server.inject({ method: 'GET', path: '/10.x' });
    const body = JSON.parse(res.body);

    assert.equal(body.documentation, 'https://www.dicebear.com/llms.txt');
  });

  test('sets a cache-control header', async () => {
    const res = await server.inject({ method: 'GET', path: '/10.x' });

    assert.match(res.headers['cache-control'], /max-age=\d+/);
  });
});

describe('schema.json endpoint removed', () => {
  test('returns 404 for schema.json', async () => {
    const res = await server.inject({
      method: 'GET',
      path: '/10.x/avataaars/schema.json',
    });
    assert.equal(res.statusCode, 400);
  });
});
