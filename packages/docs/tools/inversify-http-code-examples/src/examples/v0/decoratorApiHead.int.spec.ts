import { afterAll, beforeAll, describe, expect, it } from 'vitest';

import { Container } from 'inversify';

import { buildExpressServer } from '../../server/adapter/express/actions/buildExpressServer';
import { buildExpress4Server } from '../../server/adapter/express4/actions/buildExpress4Server';
import { buildFastifyServer } from '../../server/adapter/fastify/actions/buildFastifyServer';
import { buildUwebSocketsJsServer } from '../../server/adapter/uWebSocketsJs/actions/buildUwebSocketsJsServer';
import { Server } from '../../server/models/Server';
import { ContentController } from './decoratorApiHead';

describe.each<[(container: Container) => Promise<Server>]>([
  [buildExpress4Server],
  [buildExpressServer],
  [buildFastifyServer],
  [buildUwebSocketsJsServer],
])(
  'Decorator API (Head)',
  (buildServer: (container: Container) => Promise<Server>) => {
    let server: Server;

    beforeAll(async () => {
      const container: Container = new Container();
      container.bind(ContentController).toSelf().inSingletonScope();

      server = await buildServer(container);
    });

    afterAll(async () => {
      await server.shutdown();
    });

    it('should handle requests', async () => {
      const response: Response = await fetch(
        `http://${server.host}:${server.port.toString()}/content`,
        { method: 'HEAD' },
      );

      expect(response.status).toBe(200);
      expect(response.headers.get('custom-content-header')).toBe('sample');
    });
  },
);
