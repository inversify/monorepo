import { describe, expect, it } from 'vitest';

import { Container } from 'inversify';

import { buildExpressServer } from '../../server/adapter/express/actions/buildExpressServer';
import { buildExpress4Server } from '../../server/adapter/express4/actions/buildExpress4Server';
import { buildFastifyServer } from '../../server/adapter/fastify/actions/buildFastifyServer';
import { buildHonoServer } from '../../server/adapter/hono/actions/buildHonoServer';
import { Server } from '../../server/models/Server';
import { Content, ContentController } from './decoratorApiPost';

describe.each<[(container: Container) => Promise<Server>]>([
  [buildExpress4Server],
  [buildExpressServer],
  [buildFastifyServer],
  [buildHonoServer],
])('Decorator API (Post)', () => {
  it('should handle requests', async () => {
    const container: Container = new Container();
    container.bind(ContentController).toSelf().inSingletonScope();

    const server: Server = await buildExpressServer(container);

    const response: Response = await fetch(
      `http://${server.host}:${server.port.toString()}/content`,
      {
        body: JSON.stringify({ content: 'foo' }),
        headers: { 'content-type': 'application/json' },
        method: 'POST',
      },
    );
    const responseBody: Content = (await response.json()) as Content;

    const expectedContent: Content = {
      content: 'foo',
    };

    expect(responseBody).toStrictEqual(expectedContent);

    await server.shutdown();
  });
});
