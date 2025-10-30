import { afterAll, beforeAll, describe, expect, it } from 'vitest';

import { AddressInfo } from 'node:net';

import { serve, ServerType } from '@hono/node-server';
import { InversifyHonoHttpAdapter } from '@inversifyjs/http-hono';
import { Hono } from 'hono';
import { Container } from 'inversify';

import { Server } from '../../server/models/Server';
import { DemoController, GlobalErrorFilter } from './errorFilterApiGlobalHono';

describe('Error Filter API (Global - Hono)', () => {
  let server: Server;

  beforeAll(async () => {
    const container: Container = new Container();
    container.bind(GlobalErrorFilter).toSelf().inSingletonScope();
    container.bind(DemoController).toSelf().inSingletonScope();

    const adapter: InversifyHonoHttpAdapter = new InversifyHonoHttpAdapter(
      container,
      { logger: true },
    );

    adapter.useGlobalFilters(GlobalErrorFilter);

    const application: Hono = await adapter.build();

    await new Promise<void>(
      (resolve: (value: void | PromiseLike<void>) => void) => {
        const httpServer: ServerType = serve(
          {
            fetch: application.fetch,
            hostname: '0.0.0.0',
            port: 0,
          },
          (info: AddressInfo) => {
            server = {
              host: info.address,
              port: info.port,
              shutdown: async (): Promise<void> => {
                await new Promise<void>(
                  (
                    resolve: (value: void | PromiseLike<void>) => void,
                    reject: (reason?: unknown) => void,
                  ) => {
                    httpServer.close((error: Error | undefined) => {
                      if (error !== undefined) {
                        reject(error);
                      } else {
                        resolve();
                      }
                    });
                  },
                );
              },
            };

            resolve();
          },
        );
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
