import { afterAll, beforeAll, describe, expect, it, vitest } from 'vitest';

import {
  Body,
  Controller,
  createCustomParameterDecorator,
  type CustomParameterDecoratorHandlerOptions,
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

import { InversifyUwebSocketsHttpAdapter } from '../adapter/InversifyUwebSocketsHttpAdapter.js';
import { RequestValueKind } from '../models/RequestValueKind.js';
import { CaptureRequestValues } from './CaptureRequestValues.js';

interface Server {
  host: string;
  port: number;
  shutdown: () => Promise<void>;
}

interface CapturedRequestValuesResponse {
  allParams: Record<string, string>;
  body: unknown;
  bodyParameter: unknown;
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

const readCapturedValuesAfterBody: () => ParameterDecorator =
  (): ParameterDecorator =>
    createCustomParameterDecorator(
      async (
        request: HttpRequest,
        response: HttpResponse,
        options: CustomParameterDecoratorHandlerOptions<
          HttpRequest,
          HttpResponse
        >,
      ): Promise<Omit<CapturedRequestValuesResponse, 'bodyParameter'>> => {
        const body: unknown = await options.getBody(request, response);

        return {
          allParams: options.getParams(request) as Record<string, string>,
          body,
          header: options.getHeaders(request, 'x-request-id'),
          method: options.getMethod(request),
          query: options.getQuery(request),
          url: options.getUrl(request),
        };
      },
    );

describe(CaptureRequestValues, () => {
  describe('having a POST controller method that captures body, headers, method, params, query and url', () => {
    let server: Server;

    beforeAll(async () => {
      @Controller('/stores/:storeId/users')
      class TestController {
        @CaptureRequestValues([
          RequestValueKind.Body,
          RequestValueKind.Headers,
          RequestValueKind.Method,
          RequestValueKind.Params,
          RequestValueKind.Query,
          RequestValueKind.Url,
        ])
        @Post('/:userId/audit')
        public async createUserAudit(
          @readCapturedValuesAfterBody()
          capturedRequestValues: Omit<
            CapturedRequestValuesResponse,
            'bodyParameter'
          >,
          @Body() body: unknown,
        ): Promise<CapturedRequestValuesResponse> {
          return {
            ...capturedRequestValues,
            bodyParameter: body,
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

    describe('when sending two consecutive requests with different values', () => {
      let firstResponse: Response;
      let firstResponseBody: CapturedRequestValuesResponse;
      let secondResponse: Response;
      let secondResponseBody: CapturedRequestValuesResponse;

      beforeAll(async () => {
        firstResponse = await fetch(
          `http://${server.host}:${server.port.toString()}/stores/store-1/users/user-1/audit?source=first&page=1`,
          {
            body: JSON.stringify({ action: 'login' }),
            headers: {
              'content-type': 'application/json',
              'x-request-id': 'request-1',
            },
            method: 'POST',
          },
        );

        firstResponseBody =
          (await firstResponse.json()) as CapturedRequestValuesResponse;

        secondResponse = await fetch(
          `http://${server.host}:${server.port.toString()}/stores/store-2/users/user-2/audit?source=second&page=2`,
          {
            body: JSON.stringify({ action: 'logout' }),
            headers: {
              'content-type': 'application/json',
              'x-request-id': 'request-2',
            },
            method: 'POST',
          },
        );

        secondResponseBody =
          (await secondResponse.json()) as CapturedRequestValuesResponse;
      });

      it('should return an OK response for the first request', () => {
        expect(firstResponse.status).toBe(200);
      });

      it('should return the first request captured values after the body is read', () => {
        expect(firstResponseBody).toStrictEqual({
          allParams: {
            storeId: 'store-1',
            userId: 'user-1',
          },
          body: { action: 'login' },
          bodyParameter: { action: 'login' },
          header: 'request-1',
          method: 'POST',
          query: {
            page: '1',
            source: 'first',
          },
          url: '/stores/store-1/users/user-1/audit?source=first&page=1',
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
          body: { action: 'logout' },
          bodyParameter: { action: 'logout' },
          header: 'request-2',
          method: 'POST',
          query: {
            page: '2',
            source: 'second',
          },
          url: '/stores/store-2/users/user-2/audit?source=second&page=2',
        });
      });
    });
  });
});
