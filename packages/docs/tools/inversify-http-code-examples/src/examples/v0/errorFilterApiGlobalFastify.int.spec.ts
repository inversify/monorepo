import { afterAll, beforeAll, describe, expect, it } from 'vitest';

import { AddressInfo } from 'node:net';

import { InversifyFastifyHttpAdapter } from '@inversifyjs/http-fastify';
import { FastifyInstance } from 'fastify';
import { Container } from 'inversify';

import { Server } from '../../server/models/Server';
import {
  DemoController,
  GlobalErrorFilter,
} from './errorFilterApiGlobalFastify';

describe('Error Filter API (Global - Fastify)', () => {
  let server: Server;

  beforeAll(async () => {
    const container: Container = new Container();
    container.bind(GlobalErrorFilter).toSelf().inSingletonScope();
    container.bind(DemoController).toSelf().inSingletonScope();

    const adapter: InversifyFastifyHttpAdapter =
      new InversifyFastifyHttpAdapter(container, {
        logger: true,
        useCookies: true,
      });

    adapter.useGlobalFilters(GlobalErrorFilter);

    const application: FastifyInstance = await adapter.build();

    await application.listen({ host: '0.0.0.0', port: 0 });

    const address: AddressInfo | string | null = application.server.address();

    if (address === null || typeof address === 'string') {
      throw new Error('Failed to get server address');
    }

    server = {
      host: address.address,
      port: address.port,
      shutdown: async (): Promise<void> => {
        await new Promise<void>(
          (
            resolve: (value: void | PromiseLike<void>) => void,
            reject: (reason?: unknown) => void,
          ) => {
            application.close().then(
              () => {
                resolve();
              },
              (err: unknown) => {
                if (err === undefined) {
                  resolve();
                } else {
                  // eslint-disable-next-line @typescript-eslint/prefer-promise-reject-errors
                  reject(err);
                }
              },
            );
          },
        );
      },
    };
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
