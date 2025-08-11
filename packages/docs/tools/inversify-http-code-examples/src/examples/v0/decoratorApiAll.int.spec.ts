import { describe, expect, it } from 'vitest';

import { Container } from 'inversify';

import { buildExpressServer } from '../../server/adapter/express/actions/buildExpressServer';
import { buildExpress4Server } from '../../server/adapter/express4/actions/buildExpress4Server';
import { buildFastifyServer } from '../../server/adapter/fastify/actions/buildFastifyServer';
import { buildHonoServer } from '../../server/adapter/hono/actions/buildHonoServer';
import { Server } from '../../server/models/Server';
import { ContentController } from './decoratorApiAll';

describe.each<[(container: Container) => Promise<Server>]>([
  [buildExpress4Server],
  [buildExpressServer],
  [buildFastifyServer],
  [buildHonoServer],
])('Decorator API (All)', () => {
  it('should handle requests', async () => {
    const container: Container = new Container();
    container.bind(ContentController).toSelf().inSingletonScope();

    const server: Server = await buildExpressServer(container);

    const methods: ReadonlyArray<string> = [
      'GET',
      'POST',
      'PUT',
      'DELETE',
      'PATCH',
      'OPTIONS',
      'HEAD',
    ];

    for (const method of methods) {
      const response: Response = await fetch(
        `http://${server.host}:${server.port.toString()}/content?content=foo`,
        { method },
      );

      expect(response.status).toBeLessThan(300);
      expect(response.status).toBeGreaterThanOrEqual(200);
    }

    await server.shutdown();
  });
});
