import { afterAll, beforeAll, describe, expect, it } from 'vitest';

import { type AddressInfo } from 'node:net';

import { serve, type ServerType } from '@hono/node-server';
import { ApplyMiddleware, Controller, Get, Post } from '@inversifyjs/http-core';
import { type Context, type Hono, type HonoRequest, type Next } from 'hono';
import { Container, injectable } from 'inversify';

import { type HonoMiddleware } from '../models/HonoMiddleware.js';
import { InversifyHonoHttpAdapter } from './InversifyHonoHttpAdapter.js';

export interface Server {
  host: string;
  port: number;
  shutdown: () => Promise<void>;
}

export async function buildHonoServer(container: Container): Promise<Server> {
  const adapter: InversifyHonoHttpAdapter = new InversifyHonoHttpAdapter(
    container,
    { logger: true },
  );

  const application: Hono = await adapter.build();

  return new Promise<Server>(
    (resolve: (value: Server | PromiseLike<Server>) => void) => {
      const httpServer: ServerType = serve(
        {
          fetch: application.fetch,
          hostname: '0.0.0.0',
          port: 0,
        },
        (info: AddressInfo) => {
          const server: Server = {
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

          resolve(server);
        },
      );
    },
  );
}

describe(InversifyHonoHttpAdapter, () => {
  describe('having a hono http server with two endpoints in the same path and a middleware for a single path method', () => {
    let server: Server;

    beforeAll(async () => {
      @injectable()
      class TestMiddleware implements HonoMiddleware {
        public async execute(
          _request: HonoRequest,
          context: Context,
          next: Next,
        ): Promise<undefined> {
          context.header('x-test-middleware', 'test-middleware');

          await next();

          return undefined;
        }
      }

      @Controller('/test')
      class TestController {
        @Get()
        public async get(): Promise<string> {
          return 'test';
        }

        @ApplyMiddleware(TestMiddleware)
        @Post()
        public async post(): Promise<string> {
          return 'test';
        }
      }

      const container: Container = new Container();

      container.bind(TestMiddleware).toSelf().inSingletonScope();
      container.bind(TestController).toSelf().inSingletonScope();

      server = await buildHonoServer(container);
    });

    afterAll(async () => {
      await server.shutdown();
    });

    describe('when sending a GET request to the endpoint', () => {
      let response: Response;

      beforeAll(async () => {
        response = await fetch(
          `http://${server.host}:${server.port.toString()}/test`,
          {
            method: 'GET',
          },
        );
      });

      it('should not execute the middleware', async () => {
        expect(response.headers.get('x-test-middleware')).toBeNull();
      });
    });

    describe('when sending a POST request to the endpoint', () => {
      let response: Response;

      beforeAll(async () => {
        response = await fetch(
          `http://${server.host}:${server.port.toString()}/test`,
          {
            method: 'POST',
          },
        );
      });

      it('should execute the middleware', async () => {
        expect(response.headers.get('x-test-middleware')).toBe(
          'test-middleware',
        );
      });
    });
  });
});
