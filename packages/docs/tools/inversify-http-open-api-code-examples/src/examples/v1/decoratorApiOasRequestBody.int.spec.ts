import { afterAll, beforeAll, describe, expect, it } from 'vitest';

import {
  type OpenApi3Dot1Object,
  type OpenApi3Dot1ReferenceObject,
  type OpenApi3Dot1RequestBodyObject,
} from '@inversifyjs/open-api-types/v3Dot1';
import { Container } from 'inversify';

import { buildExpressServer } from '../../server/adapter/express/actions/buildExpressServer.js';
import { type Server } from '../../server/models/Server.js';
import { BodyController } from './decoratorApiOasRequestBody.js';

describe.each<[(container: Container) => Promise<Server>]>([
  [buildExpressServer],
])(
  'Decorator API (Body)',
  (buildServer: (container: Container) => Promise<Server>) => {
    let server: Server;

    beforeAll(async () => {
      const container: Container = new Container();
      container.bind(BodyController).toSelf().inSingletonScope();

      server = await buildServer(container);
    });

    afterAll(async () => {
      await server.shutdown();
    });

    it('should read JSON body', async () => {
      const response: Response = await fetch(
        `http://${server.host}:${server.port.toString()}/docs/spec`,
        {
          headers: { 'content-type': 'application/json' },
          method: 'GET',
        },
      );
      const docsSpecResponseBody: OpenApi3Dot1Object =
        (await response.json()) as OpenApi3Dot1Object;

      const requestBodyDocs:
        | OpenApi3Dot1RequestBodyObject
        | OpenApi3Dot1ReferenceObject
        | undefined =
        docsSpecResponseBody.paths?.['/messages']?.post?.requestBody;

      expect(requestBodyDocs).toBeDefined();
      expect(requestBodyDocs).toStrictEqual({
        content: {
          'application/json': {
            schema: {
              properties: {
                message: { type: 'string' },
              },
              required: ['message'],
              type: 'object',
            },
          },
        },
      });
    });
  },
);
