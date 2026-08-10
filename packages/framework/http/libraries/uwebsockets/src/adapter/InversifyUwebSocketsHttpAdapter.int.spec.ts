import { afterAll, beforeAll, describe, expect, it, vitest } from 'vitest';

import {
  Body,
  CatchError,
  Controller,
  createCustomParameterDecorator,
  type CustomParameterDecoratorHandlerOptions,
  Get,
  NotFoundHttpResponse,
  Post,
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

import { CaptureRequestValues } from '../decorators/CaptureRequestValues.js';
import { UseRequestTransformers } from '../decorators/UseRequestTransformers.js';
import { type RequestTransformer } from '../models/RequestTransformer.js';
import { type UwebSocketsErrorFilter } from '../models/UwebSocketsErrorFilter.js';
import { InversifyUwebSocketsHttpAdapter } from './InversifyUwebSocketsHttpAdapter.js';

interface Server {
  host: string;
  port: number;
  shutdown: () => Promise<void>;
}

interface RequestValuesResponse {
  allParams: Record<string, string>;
  body: unknown;
  header: string | string[] | undefined;
  method: string;
  query: unknown;
  url: string;
}

class TransformerError extends Error {}

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

async function waitForNextTask(): Promise<void> {
  return new Promise<void>((resolve: () => void): void => {
    setTimeout(resolve, 1);
  });
}

async function buildUwebSocketsServer(
  container: Container,
  setUpAdapter?: (adapter: InversifyUwebSocketsHttpAdapter) => void,
): Promise<Server> {
  const adapter: InversifyUwebSocketsHttpAdapter =
    new InversifyUwebSocketsHttpAdapter(container, {
      logger: buildLoggerMock(),
    });

  setUpAdapter?.(adapter);

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

const readRequestValuesAfterAwait: () => ParameterDecorator =
  (): ParameterDecorator =>
    createCustomParameterDecorator(
      async (
        request: HttpRequest,
        response: HttpResponse,
        options: CustomParameterDecoratorHandlerOptions<
          HttpRequest,
          HttpResponse
        >,
      ): Promise<RequestValuesResponse> => {
        await waitForNextTask();

        return {
          allParams: options.getParams(request) as Record<string, string>,
          body: await options.getBody(request, response),
          header: options.getHeaders(request, 'x-request-transformers'),
          method: options.getMethod(request),
          query: options.getQuery(request),
          url: options.getUrl(request),
        };
      },
    );

const readMethodAfterAwait: () => ParameterDecorator = (): ParameterDecorator =>
  createCustomParameterDecorator(
    async (
      request: HttpRequest,
      _response: HttpResponse,
      options: CustomParameterDecoratorHandlerOptions<
        HttpRequest,
        HttpResponse
      >,
    ): Promise<string> => {
      await waitForNextTask();

      return options.getMethod(request);
    },
  );

const readUrlAfterAwait: () => ParameterDecorator = (): ParameterDecorator =>
  createCustomParameterDecorator(
    async (
      request: HttpRequest,
      _response: HttpResponse,
      options: CustomParameterDecoratorHandlerOptions<
        HttpRequest,
        HttpResponse
      >,
    ): Promise<string> => {
      await waitForNextTask();

      return options.getUrl(request);
    },
  );

describe(InversifyUwebSocketsHttpAdapter, () => {
  describe('having a controller method with @CaptureRequestValues', () => {
    let server: Server;

    beforeAll(async () => {
      @Controller('/captured/:tenantId')
      class TestController {
        @CaptureRequestValues([
          'body',
          'headers',
          'method',
          'params',
          'query',
          'url',
        ])
        @Post('/users/:userId')
        public async post(
          @readRequestValuesAfterAwait() requestValues: RequestValuesResponse,
          @Body() body: unknown,
        ): Promise<RequestValuesResponse & { bodyParameter: unknown }> {
          return { ...requestValues, bodyParameter: body };
        }
      }

      const container: Container = new Container();

      container.bind(TestController).toSelf().inSingletonScope();

      server = await buildUwebSocketsServer(container);
    });

    afterAll(async () => {
      await server.shutdown();
    });

    describe('when sending a request to the endpoint', () => {
      let response: Response;
      let responseBody: RequestValuesResponse & { bodyParameter: unknown };

      beforeAll(async () => {
        response = await fetch(
          `http://${server.host}:${server.port.toString()}/captured/tenant-1/users/user-1?first=1&second=2`,
          {
            body: JSON.stringify({ name: 'warrior' }),
            headers: {
              'content-type': 'application/json',
              'x-request-transformers': 'captured',
            },
            method: 'POST',
          },
        );

        responseBody = (await response.json()) as RequestValuesResponse & {
          bodyParameter: unknown;
        };
      });

      it('should return an OK response', () => {
        expect(response.status).toBe(200);
      });

      it('should serve the captured method after an await', () => {
        expect(responseBody.method).toBe('POST');
      });

      it('should serve the captured headers after an await', () => {
        expect(responseBody.header).toBe('captured');
      });

      it('should serve all the captured route params after an await', () => {
        expect(responseBody.allParams).toStrictEqual({
          tenantId: 'tenant-1',
          userId: 'user-1',
        });
      });

      it('should serve the captured query after an await', () => {
        expect(responseBody.query).toStrictEqual({
          first: '1',
          second: '2',
        });
      });

      it('should serve the captured url after an await', () => {
        expect(responseBody.url).toBe(
          '/captured/tenant-1/users/user-1?first=1&second=2',
        );
      });

      it('should reuse the captured body on every body read', () => {
        expect(responseBody.body).toStrictEqual({ name: 'warrior' });
        expect(responseBody.bodyParameter).toStrictEqual({ name: 'warrior' });
      });
    });
  });

  describe('having a controller method without @CaptureRequestValues', () => {
    let server: Server;

    beforeAll(async () => {
      @Controller('/not-captured/:tenantId')
      class TestController {
        @Post('/users/:userId')
        public async post(
          @readMethodAfterAwait() method: string,
        ): Promise<string> {
          return method;
        }
      }

      const container: Container = new Container();

      container.bind(TestController).toSelf().inSingletonScope();

      server = await buildUwebSocketsServer(container);
    });

    afterAll(async () => {
      await server.shutdown();
    });

    describe('when sending a request to the endpoint', () => {
      let response: Response;

      beforeAll(async () => {
        response = await fetch(
          `http://${server.host}:${server.port.toString()}/not-captured/tenant-1/users/user-1`,
          {
            body: JSON.stringify({ name: 'warrior' }),
            headers: {
              'content-type': 'application/json',
            },
            method: 'POST',
          },
        );

        await response.text();
      });

      it('should return an internal server error response, since the native request cannot be read after an await', () => {
        expect(response.status).toBe(500);
      });
    });
  });

  describe('having a controller method with @UseRequestTransformers', () => {
    let server: Server;

    beforeAll(async () => {
      const buildUrlSuffixTransformer: (
        suffix: string,
      ) => RequestTransformer = (suffix: string): RequestTransformer => {
        return (request: HttpRequest): HttpRequest => {
          const url: string = `${request.getUrl()}${suffix}`;

          return {
            getQuery: (): string => '',
            getUrl: (): string => url,
          } as unknown as HttpRequest;
        };
      };

      @Controller('/transformed')
      class TestController {
        @UseRequestTransformers(
          buildUrlSuffixTransformer('/first'),
          buildUrlSuffixTransformer('/second'),
        )
        @Get()
        public async get(@readUrlAfterAwait() url: string): Promise<string> {
          return url;
        }
      }

      const container: Container = new Container();

      container.bind(TestController).toSelf().inSingletonScope();

      server = await buildUwebSocketsServer(container);
    });

    afterAll(async () => {
      await server.shutdown();
    });

    describe('when sending a request to the endpoint', () => {
      let responseBody: string;

      beforeAll(async () => {
        const response: Response = await fetch(
          `http://${server.host}:${server.port.toString()}/transformed`,
        );

        responseBody = await response.text();
      });

      it('should compose the transformers in registration order', () => {
        expect(responseBody).toBe('/transformed/first/second');
      });
    });
  });

  describe('having a controller method with a throwing request transformer and a route error filter', () => {
    let server: Server;

    beforeAll(async () => {
      @CatchError(TransformerError)
      class TestErrorFilter implements UwebSocketsErrorFilter {
        public catch(
          _error: unknown,
          _request: HttpRequest,
          response: HttpResponse,
        ): void {
          response.cork((): void => {
            response.writeStatus('404 Not Found');
            response.end(JSON.stringify({ message: 'transformer failed' }));
          });
        }
      }

      const requestTransformer: RequestTransformer = (): HttpRequest => {
        throw new TransformerError('Transformer error');
      };

      @Controller('/throwing-transformer')
      class TestController {
        @UseRequestTransformers(requestTransformer)
        @Get()
        public async get(): Promise<string> {
          throw new NotFoundHttpResponse();
        }
      }

      const container: Container = new Container();

      container.bind(TestErrorFilter).toSelf().inSingletonScope();
      container.bind(TestController).toSelf().inSingletonScope();

      server = await buildUwebSocketsServer(
        container,
        (adapter: InversifyUwebSocketsHttpAdapter): void => {
          adapter.useGlobalFilters(TestErrorFilter);
        },
      );
    });

    afterAll(async () => {
      await server.shutdown();
    });

    describe('when sending a request to the endpoint', () => {
      let response: Response;
      let responseBody: { message: string };

      beforeAll(async () => {
        response = await fetch(
          `http://${server.host}:${server.port.toString()}/throwing-transformer`,
        );

        responseBody = (await response.json()) as { message: string };
      });

      it('should handle the error with the error filter', () => {
        expect(response.status).toBe(404);
        expect(responseBody).toStrictEqual({ message: 'transformer failed' });
      });
    });
  });
});
