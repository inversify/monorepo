import { afterAll, beforeAll, describe, expect, it } from 'vitest';

import {
  OpenApi3Dot1Object,
  OpenApi3Dot1OperationObject,
  OpenApi3Dot1ResponseObject,
} from '@inversifyjs/open-api-types/v3Dot1';
import { Container } from 'inversify';

import { buildExpressServer } from '../../../server/adapter/express/actions/buildExpressServer';
import { Server } from '../../../server/models/Server';
import { ResponseController } from './decoratorApiOasResponse';

describe.each<[(container: Container) => Promise<Server>]>([
  [buildExpressServer],
])(
  'Decorator API (OasResponse)',
  (buildServer: (container: Container) => Promise<Server>) => {
    let server: Server;

    beforeAll(async () => {
      const container: Container = new Container();
      container.bind(ResponseController).toSelf().inSingletonScope();

      server = await buildServer(container);
    });

    afterAll(async () => {
      await server.shutdown();
    });

    it('should add response documentation to operation', async () => {
      const response: Response = await fetch(
        `http://${server.host}:${server.port.toString()}/docs/spec`,
        {
          headers: { 'content-type': 'application/json' },
          method: 'GET',
        },
      );
      const docsSpecResponseBody: OpenApi3Dot1Object =
        (await response.json()) as OpenApi3Dot1Object;

      const operation: OpenApi3Dot1OperationObject | undefined =
        docsSpecResponseBody.paths?.['/messages']?.get;

      expect(operation).toBeDefined();
      expect(operation?.responses).toBeDefined();

      const okResponse: OpenApi3Dot1ResponseObject = operation?.responses?.[
        '200'
      ] as OpenApi3Dot1ResponseObject;

      expect(okResponse).toStrictEqual({
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
        description: 'Successful response',
      });

      const notFoundResponse: OpenApi3Dot1ResponseObject = operation
        ?.responses?.['404'] as OpenApi3Dot1ResponseObject;

      expect(notFoundResponse).toStrictEqual({
        content: {
          'application/json': {
            schema: {
              properties: {
                error: { type: 'string' },
              },
              required: ['error'],
              type: 'object',
            },
          },
        },
        description: 'Message not found',
      });
    });
  },
);
