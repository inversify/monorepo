import { afterAll, beforeAll, describe, expect, it } from 'vitest';

import { InversifyUwebSocketsHttpAdapter } from '@inversifyjs/http-uwebsockets';
import { Container } from 'inversify';
import { us_socket_local_port } from 'uWebSockets.js';

import { Server } from '../../server/models/Server';
import {
  DemoController,
  GlobalErrorFilter,
} from './errorFilterApiGlobalUwebsockets';

describe('Error Filter API (Global - uWebSockets.js)', () => {
  let server: Server;

  beforeAll(async () => {
    const container: Container = new Container();
    container.bind(GlobalErrorFilter).toSelf().inSingletonScope();
    container.bind(DemoController).toSelf().inSingletonScope();

    const adapter: InversifyUwebSocketsHttpAdapter =
      new InversifyUwebSocketsHttpAdapter(container, { logger: true });

    adapter.useGlobalFilters(GlobalErrorFilter);

    // eslint-disable-next-line @typescript-eslint/typedef
    const application = await adapter.build();

    await new Promise<void>(
      (resolve: (value: void | PromiseLike<void>) => void) => {
        // eslint-disable-next-line @typescript-eslint/typedef
        application.listen('127.0.0.1', 0, (socket) => {
          server = {
            host: '127.0.0.1',
            port: us_socket_local_port(socket),
            shutdown: async (): Promise<void> => {
              application.close();
            },
          };

          resolve();
        });
      },
    );
  });

  afterAll(async () => {
    await server.shutdown();
  });

  it('should catch HttpResponse and return appropriate status', async () => {
    const response: Response = await fetch(
      `http://${server.host}:${server.port.toString()}/demo/http-response`,
    );
    const body: {
      message: string;
    } = (await response.json()) as {
      message: string;
    };

    expect(response.status).toBe(404);
    expect(body.message).toBe('Resource not found');
  });

  it('should catch generic errors and return 500', async () => {
    const response: Response = await fetch(
      `http://${server.host}:${server.port.toString()}/demo/generic-error`,
    );
    const body: {
      message: string;
    } = (await response.json()) as {
      message: string;
    };

    expect(response.status).toBe(500);
    expect(body.message).toBe('Unhandled error');
  });

  it('should catch InternalServerErrorHttpResponse without infinite loop', async () => {
    const response: Response = await fetch(
      `http://${server.host}:${server.port.toString()}/demo/internal-server-error`,
    );
    const body: {
      message: string;
    } = (await response.json()) as {
      message: string;
    };

    expect(response.status).toBe(500);
    expect(body.message).toBe('Internal error occurred');
  });
});
