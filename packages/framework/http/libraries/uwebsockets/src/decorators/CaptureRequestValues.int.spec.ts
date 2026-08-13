import { afterAll, beforeAll, describe, expect, it, vitest } from 'vitest';

import {
  Controller,
  createCustomParameterDecorator,
  type CustomParameterDecoratorHandlerOptions,
  Get,
} from '@inversifyjs/http-core';
import { type Logger } from '@inversifyjs/logger';
import { Container } from 'inversify';
import {
  type HttpRequest,
  type HttpResponse,
  type TemplatedApp,
  type us_listen_socket,
  us_socket_local_port,
} from 'uWebSockets.js';

import { InversifyUwebSocketsHttpAdapter } from '../adapter/InversifyUwebSocketsHttpAdapter.js';
import { CaptureRequestValues } from './CaptureRequestValues.js';

interface Server {
  host: string;
  port: number;
  shutdown: () => Promise<void>;
}

interface CapturedRequestValuesResponse {
  allParams: Record<string, string | undefined>;
  header: string | string[] | undefined;
  method: string;
  query: unknown;
  url: string;
}

function buildLoggerMock(): Logger {
  return {
    debug: vitest.fn(),
    error: vitest.fn(),
    http: vitest.fn(),
    info: vitest.fn(),
    log: vitest.fn(),
    silly: vitest.fn(),
    verbose: vitest.fn(),
    warn: vitest.fn(),
  };
}

async function buildUwebSocketsServer(container: Container): Promise<Server> {
  const adapter: InversifyUwebSocketsHttpAdapter =
    new InversifyUwebSocketsHttpAdapter(container, {
      logger: buildLoggerMock(),
    });

  const application: TemplatedApp = await adapter.build();

  return new Promise<Server>(
    (
      resolve: (value: Server) => void,
      reject: (reason?: unknown) => void,
    ): void => {
      application.listen(
        '127.0.0.1',
        0,
        (socket: us_listen_socket | false): void => {
          if (socket === false) {
            reject(new Error('Unable to listen on a free port'));

            return;
          }

          resolve({
            host: '127.0.0.1',
            port: us_socket_local_port(socket),
            shutdown: async (): Promise<void> => {
              application.close();
            },
          });
        },
      );
    },
  );
}

const readCapturedUrlAfterAwait: () => ParameterDecorator =
  (): ParameterDecorator =>
    createCustomParameterDecorator(
      async (
        request: HttpRequest,
        _response: HttpResponse,
        options: CustomParameterDecoratorHandlerOptions<
          HttpRequest,
          HttpResponse
        >,
      ): Promise<{ url: string }> => {
        await Promise.resolve();

        return {
          url: options.getUrl(request),
        };
      },
    );

const readCapturedValuesAfterAwait: () => ParameterDecorator =
  (): ParameterDecorator =>
    createCustomParameterDecorator(
      async (
        request: HttpRequest,
        _response: HttpResponse,
        options: CustomParameterDecoratorHandlerOptions<
          HttpRequest,
          HttpResponse
        >,
      ): Promise<CapturedRequestValuesResponse> => {
        await Promise.resolve();

        return {
          allParams: {
            storeId: options.getParams(request, 'storeId') as
              string | undefined,
            userId: options.getParams(request, 'userId') as string | undefined,
          },
          header: options.getHeaders(request, 'x-request-id'),
          method: options.getMethod(request),
          query: options.getQuery(request),
          url: options.getUrl(request),
        };
      },
    );

describe(CaptureRequestValues, () => {
  describe('having a GET controller method that captures url without query', () => {
    let server: Server;

    beforeAll(async () => {
      @Controller('/resources')
      class TestController {
        @CaptureRequestValues({
          url: true,
        })
        @Get()
        public async listResources(
          @readCapturedUrlAfterAwait()
          capturedRequestValues: Pick<CapturedRequestValuesResponse, 'url'>,
        ): Promise<Pick<CapturedRequestValuesResponse, 'url'>> {
          return {
            url: capturedRequestValues.url,
          };
        }
      }

      const container: Container = new Container();

      container.bind(TestController).toSelf().inSingletonScope();

      server = await buildUwebSocketsServer(container);
    });

    afterAll(async () => {
      await server.shutdown();
    });

    describe('when sending a request with a query string', () => {
      let response: Response;
      let responseBody: Pick<CapturedRequestValuesResponse, 'url'>;

      beforeAll(async () => {
        response = await fetch(
          `http://${server.host}:${server.port.toString()}/resources?source=captured`,
        );

        responseBody = (await response.json()) as Pick<
          CapturedRequestValuesResponse,
          'url'
        >;
      });

      it('should return an OK response', () => {
        expect(response.status).toBe(200);
      });

      it('should return the url including the query string after an await', () => {
        expect(responseBody).toStrictEqual({
          url: '/resources?source=captured',
        });
      });
    });
  });

  describe('having a GET controller method that captures headers, method, params, query and url', () => {
    let server: Server;

    beforeAll(async () => {
      @Controller('/stores/:storeId/users')
      class TestController {
        @CaptureRequestValues({
          headers: true,
          method: true,
          params: ['storeId', 'userId'],
          query: true,
          url: true,
        })
        @Get('/:userId/profile')
        public async getUserProfile(
          @readCapturedValuesAfterAwait()
          capturedRequestValues: CapturedRequestValuesResponse,
        ): Promise<CapturedRequestValuesResponse> {
          return capturedRequestValues;
        }
      }

      const container: Container = new Container();

      container.bind(TestController).toSelf().inSingletonScope();

      server = await buildUwebSocketsServer(container);
    });

    afterAll(async () => {
      await server.shutdown();
    });

    describe('when sending two consecutive requests with different values', () => {
      let firstResponse: Response;
      let firstResponseBody: CapturedRequestValuesResponse;
      let secondResponse: Response;
      let secondResponseBody: CapturedRequestValuesResponse;

      beforeAll(async () => {
        firstResponse = await fetch(
          `http://${server.host}:${server.port.toString()}/stores/store-1/users/user-1/profile?source=first&page=1`,
          {
            headers: {
              'x-request-id': 'request-1',
            },
          },
        );

        firstResponseBody =
          (await firstResponse.json()) as CapturedRequestValuesResponse;

        secondResponse = await fetch(
          `http://${server.host}:${server.port.toString()}/stores/store-2/users/user-2/profile?source=second&page=2`,
          {
            headers: {
              'x-request-id': 'request-2',
            },
          },
        );

        secondResponseBody =
          (await secondResponse.json()) as CapturedRequestValuesResponse;
      });

      it('should return an OK response for the first request', () => {
        expect(firstResponse.status).toBe(200);
      });

      it('should return the first request captured values after an await', () => {
        expect(firstResponseBody).toStrictEqual({
          allParams: {
            storeId: 'store-1',
            userId: 'user-1',
          },
          header: 'request-1',
          method: 'GET',
          query: {
            page: '1',
            source: 'first',
          },
          url: '/stores/store-1/users/user-1/profile?source=first&page=1',
        });
      });

      it('should return an OK response for the second request', () => {
        expect(secondResponse.status).toBe(200);
      });

      it('should return the second request captured values without leaking the first request', () => {
        expect(secondResponseBody).toStrictEqual({
          allParams: {
            storeId: 'store-2',
            userId: 'user-2',
          },
          header: 'request-2',
          method: 'GET',
          query: {
            page: '2',
            source: 'second',
          },
          url: '/stores/store-2/users/user-2/profile?source=second&page=2',
        });
      });
    });
  });
});
