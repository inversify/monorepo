import { afterAll, beforeAll, describe, expect, it } from 'vitest';

import http, { RequestListener } from 'node:http';
import { AddressInfo } from 'node:net';

import { InversifyExpressHttpAdapter } from '@inversifyjs/http-express';
import express from 'express';
import { Container } from 'inversify';

import { Server } from '../../server/models/Server';
import {
  DemoController,
  GlobalErrorFilter,
} from './errorFilterApiGlobalExpress';

describe('Error Filter API (Global - Express 5)', () => {
  let server: Server;

  beforeAll(async () => {
    const container: Container = new Container();
    container.bind(GlobalErrorFilter).toSelf().inSingletonScope();
    container.bind(DemoController).toSelf().inSingletonScope();

    const adapter: InversifyExpressHttpAdapter =
      new InversifyExpressHttpAdapter(container, {
        logger: true,
        useCookies: true,
      });

    adapter.useGlobalFilters(GlobalErrorFilter);

    const application: express.Application = await adapter.build();
    const httpServer: http.Server = http.createServer(
      application as RequestListener,
    );

    await new Promise<void>(
      (resolve: (value: void | PromiseLike<void>) => void) => {
        httpServer.listen(0, '127.0.0.1', () => {
          const address: AddressInfo | string | null = httpServer.address();

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
      statusCode: number;
      error: string;
      message: string;
    } = (await response.json()) as {
      statusCode: number;
      error: string;
      message: string;
    };

    expect(response.status).toBe(404);
    expect(body.statusCode).toBe(404);
    expect(body.error).toBe('Not Found');
    expect(body.message).toBe('Resource not found');
  });

  it('should catch generic errors and return 500', async () => {
    const response: Response = await fetch(
      `http://${server.host}:${server.port.toString()}/demo/generic-error`,
    );
    const body: {
      statusCode: number;
      error: string;
      message: string;
    } = (await response.json()) as {
      statusCode: number;
      error: string;
      message: string;
    };

    expect(response.status).toBe(500);
    expect(body.statusCode).toBe(500);
    expect(body.error).toBe('Internal Server Error');
    expect(body.message).toBe('Unhandled error');
  });

  it('should catch InternalServerErrorHttpResponse without infinite loop', async () => {
    const response: Response = await fetch(
      `http://${server.host}:${server.port.toString()}/demo/internal-server-error`,
    );
    const body: {
      statusCode: number;
      error: string;
      message: string;
    } = (await response.json()) as {
      statusCode: number;
      error: string;
      message: string;
    };

    expect(response.status).toBe(500);
    expect(body.statusCode).toBe(500);
    expect(body.error).toBe('Internal Server Error');
    expect(body.message).toBe('Internal error occurred');
  });
});
