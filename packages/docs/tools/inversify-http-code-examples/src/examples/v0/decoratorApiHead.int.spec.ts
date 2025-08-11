import { describe, expect, it } from 'vitest';

import { Container } from 'inversify';

import { buildExpressServer } from '../../server/adapter/express/actions/buildExpressServer';
import { buildExpress4Server } from '../../server/adapter/express4/actions/buildExpress4Server';
import { buildFastifyServer } from '../../server/adapter/fastify/actions/buildFastifyServer';
import { buildHonoServer } from '../../server/adapter/hono/actions/buildHonoServer';
import { Server } from '../../server/models/Server';
import { ContentController } from './decoratorApiHead';

describe.each<[(container: Container) => Promise<Server>]>([
  [buildExpress4Server],
  [buildExpressServer],
  [buildFastifyServer],
  [buildHonoServer],
])('Decorator API (Head)', () => {
  it('should handle requests', async () => {
    const container: Container = new Container();
    container.bind(ContentController).toSelf().inSingletonScope();

    const server: Server = await buildExpressServer(container);

    const response: Response = await fetch(
      `http://${server.host}:${server.port.toString()}/content`,
      { method: 'HEAD' },
    );

    expect(response.status).toBe(200);

    await server.shutdown();
  });
});
