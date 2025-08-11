import { describe, expect, it } from 'vitest';

import { Container } from 'inversify';

import { buildExpressServer } from '../../server/adapter/express/actions/buildExpressServer';
import { Server } from '../../server/models/Server';
import { Content, ContentController } from './getController';

describe('it should build an express server', () => {
  it('should handle requests', async () => {
    const container: Container = new Container();
    container.bind(ContentController).toSelf().inSingletonScope();

    const server: Server = await buildExpressServer(container);

    const response: Response = await fetch(
      `http://${server.host}:${server.port.toString()}/content?content=foo`,
    );
    const responseBody: Content = (await response.json()) as Content;

    const expectedContent: Content = {
      content: 'foo',
    };

    expect(responseBody).toStrictEqual(expectedContent);

    await server.shutdown();
  });
});
