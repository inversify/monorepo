import { afterAll, beforeAll, describe, expect, it } from 'vitest';

import { OpenApi3Dot1Object } from '@inversifyjs/open-api-types/v3Dot1';
import { Container } from 'inversify';

import { buildExpressServer } from '../../../server/adapter/express/actions/buildExpressServer';
import { Server } from '../../../server/models/Server';
import { UserController } from './decoratorApiOasSchemaWithController';

describe.each<[(container: Container) => Promise<Server>]>([
  [buildExpressServer],
])(
  'Decorator API (OasSchema)',
  (buildServer: (container: Container) => Promise<Server>) => {
    let server: Server;

    beforeAll(async () => {
      const container: Container = new Container();
      container.bind(UserController).toSelf().inSingletonScope();

      server = await buildServer(container);
    });

    afterAll(async () => {
      await server.shutdown();
    });

    it('should generate schema definitions', async () => {
      const response: Response = await fetch(
        `http://${server.host}:${server.port.toString()}/docs/spec`,
        {
          headers: { 'content-type': 'application/json' },
          method: 'GET',
        },
      );
      const docsSpecResponseBody: OpenApi3Dot1Object =
        (await response.json()) as OpenApi3Dot1Object;

      expect(docsSpecResponseBody.components?.schemas).toBeDefined();
      expect(docsSpecResponseBody.components?.schemas?.['User']).toBeDefined();
      expect(
        docsSpecResponseBody.components?.schemas?.['CreateUserRequest'],
      ).toBeDefined();
    });
  },
);
