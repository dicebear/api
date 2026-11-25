import type {
  FastifyPluginCallback,
  FastifyReply,
  FastifyRequest,
} from 'fastify';
import type { StyleEntry } from '../types.js';
import {
  parseQueryString,
  transformWeightedFields,
} from '../utils/query-string.js';
import { AvatarRequest, avatarHandler } from '../handler/avatar.js';
import {
  SignatureFailure,
  SignatureResult,
  verifySignedPath,
  verifySignedUrl,
} from '../utils/signature.js';
import { config } from '../config.js';
import { OptionsDescriptor } from '@dicebear/core';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const optionsSchema = require('@dicebear/schema/options.json');

for (const key of config.excludedOptions) {
  delete optionsSchema.properties[key];
}

const paramsSchema = {
  type: 'object' as const,
  properties: {
    format: {
      type: 'string' as const,
      enum: [
        'svg',
        ...(config.png.enabled ? ['png'] : []),
        ...(config.jpeg.enabled ? ['jpg', 'jpeg'] : []),
        ...(config.webp.enabled ? ['webp'] : []),
        ...(config.avif.enabled ? ['avif'] : []),
        ...(config.json.enabled ? ['json'] : []),
      ],
    },
  },
};

const FORMATS: ReadonlySet<string> = new Set(
  paramsSchema.properties.format.enum,
);

/**
 * A path whose format segment is no format, such as `foo` or a
 * `definition.json` that is switched off, does not exist. Without this hook
 * the params schema would turn it into a 400 that blames the request.
 */
async function unknownFormat(request: FastifyRequest, reply: FastifyReply) {
  const { format } = request.params as { format?: string };

  if (format === undefined || !FORMATS.has(format)) {
    reply.callNotFound();

    return reply;
  }
}

const AVATAR_ROUTES = [
  { url: '/:format', hasPathOptions: false },
  { url: '/:format/:options', hasPathOptions: true },
] as const;

const SIGNATURE_MESSAGES: Record<SignatureFailure, string> = {
  missing: 'Missing signature.',
  invalid: 'Invalid signature.',
  'invalid-expiry': 'Invalid expiry.',
  expired: 'Signature expired.',
  'unexpected-query': 'Query string not allowed next to path options.',
};

type SignatureCheck = (
  rawUrl: string,
  secrets: readonly string[],
) => SignatureResult;

/**
 * Whether the request carries options in a path segment. A slash before the
 * query string, as in `/svg/?seed=Felix`, matches the path route with an
 * empty segment, and those options are still in the query string.
 */
function hasPathOptionSegment(request: FastifyRequest): boolean {
  const { options } = request.params as { options?: unknown };

  return typeof options === 'string' && options !== '';
}

function signatureHook(verify: (request: FastifyRequest) => SignatureCheck) {
  return async (request: FastifyRequest, reply: FastifyReply) => {
    const result = verify(request)(request.url, config.signing.secrets);

    if (!result.ok) {
      return reply.status(403).header('Cache-Control', 'no-store').send({
        statusCode: 403,
        error: 'Forbidden',
        message: SIGNATURE_MESSAGES[result.reason],
      });
    }

    request.expiresAt = result.expiresAt;
  };
}

/** Both parameters belong to the signature, not to the avatar options. */
function removeSignatureParameters(query: Record<string, unknown>) {
  delete query.sig;
  delete query.exp;
}

type Options = {
  entry: StyleEntry;
};

export const styleRoutes: FastifyPluginCallback<Options> = (
  app,
  { entry },
  done,
) => {
  const { arrayLimit, parameterLimit } = app.queryLimits;

  if (config.definition.enabled) {
    const body =
      entry.definitionBody ?? JSON.stringify(entry.style.definition());

    app.get('/definition.json', (_request, reply) => {
      reply
        .header('Cache-Control', `max-age=${config.cacheControl.styles}`)
        .type('application/json; charset=utf-8')
        .send(body);
    });
  }

  if (config.options.enabled) {
    const descriptor = new OptionsDescriptor(entry.style).toJSON();

    for (const key of config.excludedOptions) {
      delete descriptor[key];
    }

    const body = JSON.stringify(descriptor);

    app.get('/options.json', (_request, reply) => {
      reply
        .header('Cache-Control', `max-age=${config.cacheControl.styles}`)
        .type('application/json; charset=utf-8')
        .send(body);
    });
  }

  for (const { url, hasPathOptions } of AVATAR_ROUTES) {
    app.route<AvatarRequest>({
      method: 'GET',
      url,
      onRequest: [
        unknownFormat,
        ...(config.signing.secrets.length > 0
          ? [
              signatureHook((request) =>
                hasPathOptions && hasPathOptionSegment(request)
                  ? verifySignedPath
                  : verifySignedUrl,
              ),
            ]
          : []),
      ],
      preValidation: async (request) => {
        if (hasPathOptions && hasPathOptionSegment(request)) {
          request.query = parseQueryString(
            request.params.options as string,
            arrayLimit,
            parameterLimit,
          );
        }

        if (config.signing.secrets.length > 0) {
          removeSignatureParameters(request.query as Record<string, unknown>);
        }

        transformWeightedFields(
          request.query as Record<string, unknown>,
          entry.weightedFields,
        );
      },
      schema: {
        querystring: optionsSchema,
        params: paramsSchema,
      },
      handler: avatarHandler(app, entry),
    });
  }

  done();
};
