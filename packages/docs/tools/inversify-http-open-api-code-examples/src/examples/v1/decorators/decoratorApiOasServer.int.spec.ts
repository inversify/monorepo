import { afterAll, beforeAll, describe, expect, it } from 'vitest';

import {
  OpenApi3Dot1Object,
  OpenApi3Dot1OperationObject,
  OpenApi3Dot1ServerObject,
} from '@inversifyjs/open-api-types/v3Dot1';
import { Container } from 'inversify';

import { buildExpressServer } from '../../../server/adapter/express/actions/buildExpressServer';
import { Server } from '../../../server/models/Server';
import { ServerController } from './decoratorApiOasServer';

describe.each<[(container: Container) => Promise<Server>]>([
  [buildExpressServer],
])(
  'Decorator API (OasServer)',
  (buildServer: (container: Container) => Promise<Server>) => {
    let server: Server;

    beforeAll(async () => {
      const container: Container = new Container();
      container.bind(ServerController).toSelf().inSingletonScope();

      server = await buildServer(container);
    });

    afterAll(async () => {
      await server.shutdown();
    });

    it('should add server information to operation', async () => {
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

      expect(operation?.servers).toBeDefined();
      expect(operation?.servers).toHaveLength(1);

      const operationServer: OpenApi3Dot1ServerObject = operation
        ?.servers?.[0] as OpenApi3Dot1ServerObject;

      expect(operationServer).toStrictEqual({
        description: 'Production server for this endpoint',
        url: 'https://api.example.com',
      });
    });
  },
);
