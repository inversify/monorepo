import { afterAll, beforeAll, describe, expect, it } from 'vitest';

import {
  OpenApi3Dot1ExternalDocumentationObject,
  OpenApi3Dot1Object,
  OpenApi3Dot1OperationObject,
} from '@inversifyjs/open-api-types/v3Dot1';
import { Container } from 'inversify';

import { buildExpressServer } from '../../../server/adapter/express/actions/buildExpressServer';
import { Server } from '../../../server/models/Server';
import { ExternalDocsController } from './decoratorApiOasExternalDocs';

describe.each<[(container: Container) => Promise<Server>]>([
  [buildExpressServer],
])(
  'Decorator API (OasExternalDocs)',
  (buildServer: (container: Container) => Promise<Server>) => {
    let server: Server;

    beforeAll(async () => {
      const container: Container = new Container();
      container.bind(ExternalDocsController).toSelf().inSingletonScope();

      server = await buildServer(container);
    });

    afterAll(async () => {
      await server.shutdown();
    });

    it('should add external docs to operation', async () => {
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
      expect(operation?.externalDocs).toStrictEqual({
        description: 'Find more info here',
        url: 'https://example.com/docs',
      } satisfies OpenApi3Dot1ExternalDocumentationObject);
    });
  },
);
