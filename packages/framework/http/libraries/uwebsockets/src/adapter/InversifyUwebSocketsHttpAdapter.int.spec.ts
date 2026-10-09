import { afterAll, beforeAll, describe, expect, it } from 'vitest';

import {
  Body,
  Controller,
  type EventSink,
  Get,
  type Guard,
  type HttpInstrumentationEvent,
  Post,
  Query,
  SetHeader,
  UseGuard,
} from '@inversifyjs/http-core';
import { Container } from 'inversify';
import {
  type HttpRequest,
  type TemplatedApp,
  type us_listen_socket,
  us_socket_local_port,
} from 'uWebSockets.js';

import { type UwebSocketsHttpAdapterOptions } from '../models/UwebSocketsHttpAdapterOptions.js';
import { InversifyUwebSocketsHttpAdapter } from './InversifyUwebSocketsHttpAdapter.js';

function requireEvent<TType extends HttpInstrumentationEvent['type']>(
  events: readonly HttpInstrumentationEvent[],
  type: TType,
): Extract<HttpInstrumentationEvent, { type: TType }> {
  const event: HttpInstrumentationEvent | undefined = events.find(
    (candidate: HttpInstrumentationEvent): boolean => candidate.type === type,
  );

  if (event === undefined || event.type !== type) {
    throw new Error(`Missing ${type} event`);
  }

  return event as Extract<HttpInstrumentationEvent, { type: TType }>;
}

class RecordingSink implements EventSink<HttpInstrumentationEvent> {
  public readonly events: HttpInstrumentationEvent[] = [];

  public emit(event: HttpInstrumentationEvent): void {
    this.events.push(event);
  }
}

class AllowGuard implements Guard<HttpRequest> {
  public activate(): boolean {
    return true;
  }
}

class DenyGuard implements Guard<HttpRequest> {
  public activate(): boolean {
    return false;
  }
}

interface Server {
  host: string;
  port: number;
  shutdown: () => void;
}

async function buildUwebSocketsServer(
  container: Container,
  httpAdapterOptions?: UwebSocketsHttpAdapterOptions,
): Promise<Server> {
  const adapter: InversifyUwebSocketsHttpAdapter =
    new InversifyUwebSocketsHttpAdapter(container, {
      logger: true,
      ...httpAdapterOptions,
    });

  const application: TemplatedApp = await adapter.build();

  return new Promise<Server>(
    (
      resolve: (value: Server | PromiseLike<Server>) => void,
      reject: (reason?: unknown) => void,
    ) => {
      application.listen(
        '127.0.0.1',
        0,
        (listenSocket: us_listen_socket | false) => {
          if (listenSocket === false) {
            reject(new Error('Failed to listen'));

            return;
          }

          resolve({
            host: '127.0.0.1',
            port: us_socket_local_port(listenSocket),
            shutdown: (): void => {
              application.close();
            },
          });
        },
      );
    },
  );
}

describe(InversifyUwebSocketsHttpAdapter, () => {
  describe('having a uWebSockets http server with endpoints returning the request query and body', () => {
    let server: Server;

    beforeAll(async () => {
      @Controller('/test')
      class TestController {
        @Get()
        public async get(
          @Query() query: Record<string, unknown>,
        ): Promise<Record<string, unknown>> {
          return query;
        }

        @Post()
        public async post(
          @Body() body: Record<string, unknown>,
        ): Promise<Record<string, unknown>> {
          return body;
        }
      }

      const container: Container = new Container();

      container.bind(TestController).toSelf().inSingletonScope();

      server = await buildUwebSocketsServer(container);
    });

    afterAll(() => {
      server.shutdown();
    });

    describe('when sending a GET request with query keys from Object.prototype', () => {
      let response: Response;

      beforeAll(async () => {
        response = await fetch(
          `http://${server.host}:${server.port.toString()}/test?name=Ann&toString=x&constructor=y`,
          {
            method: 'GET',
          },
        );
      });

      it('should return the query values', async () => {
        await expect(response.json()).resolves.toStrictEqual({
          constructor: 'y',
          name: 'Ann',
          toString: 'x',
        });
      });
    });

    describe('when sending a POST request with an urlencoded body with keys from Object.prototype', () => {
      let response: Response;

      beforeAll(async () => {
        response = await fetch(
          `http://${server.host}:${server.port.toString()}/test`,
          {
            body: 'name=Ann&toString=x&constructor=y',
            headers: {
              'content-type': 'application/x-www-form-urlencoded',
            },
            method: 'POST',
          },
        );
      });

      it('should return the body values', async () => {
        await expect(response.json()).resolves.toStrictEqual({
          constructor: 'y',
          name: 'Ann',
          toString: 'x',
        });
      });
    });

    describe('when sending a GET request with a repeated query key from Object.prototype and a __proto__ key', () => {
      let response: Response;

      beforeAll(async () => {
        response = await fetch(
          `http://${server.host}:${server.port.toString()}/test?toString=x&toString=y&__proto__=z`,
          {
            method: 'GET',
          },
        );
      });

      it('should return the query values', async () => {
        await expect(response.json()).resolves.toStrictEqual({
          ['__proto__']: 'z',
          toString: ['x', 'y'],
        });
      });
    });

    describe('when sending a POST request with an urlencoded body with a repeated key from Object.prototype and a __proto__ key', () => {
      let response: Response;

      beforeAll(async () => {
        response = await fetch(
          `http://${server.host}:${server.port.toString()}/test`,
          {
            body: 'toString=x&toString=y&__proto__=z',
            headers: {
              'content-type': 'application/x-www-form-urlencoded',
            },
            method: 'POST',
          },
        );
      });

      it('should return the body values', async () => {
        await expect(response.json()).resolves.toStrictEqual({
          ['__proto__']: 'z',
          toString: ['x', 'y'],
        });
      });
    });
  });

  describe('.build', () => {
    describe('having instrumentation sinks', () => {
      let sink: RecordingSink;
      let server: Server;

      beforeAll(async () => {
        @Controller('/items')
        @UseGuard(AllowGuard)
        class ItemsController {
          @SetHeader('x-audit', '1')
          @Get()
          public get(@Query({ name: 'q' }) query: string): string {
            return query;
          }
        }

        @Controller('/secret')
        @UseGuard(DenyGuard)
        class SecretController {
          @Get()
          public get(): string {
            return 'hidden';
          }
        }

        const container: Container = new Container();

        container.bind(AllowGuard).toSelf().inSingletonScope();
        container.bind(DenyGuard).toSelf().inSingletonScope();
        container.bind(ItemsController).toSelf().inSingletonScope();
        container.bind(SecretController).toSelf().inSingletonScope();
        sink = new RecordingSink();
        server = await buildUwebSocketsServer(container, {
          instrumentation: [sink],
          logger: false,
        });
      });

      afterAll(() => {
        server.shutdown();
      });

      describe('when a request is served', () => {
        let statusCode: number;
        let body: string;

        beforeAll(async () => {
          sink.events.length = 0;

          const response: Response = await fetch(
            `http://${server.host}:${server.port.toString()}/items?q=hero`,
            {
              headers: {
                authorization: 'secret',
                'x-api-key': 'key-1',
              },
            },
          );

          statusCode = response.status;
          body = await response.text();
        });

        it('should record redacted request headers and the response status', () => {
          const started: Extract<
            HttpInstrumentationEvent,
            { type: 'http.request.started' }
          > = requireEvent(sink.events, 'http.request.started');
          const sent: Extract<
            HttpInstrumentationEvent,
            { type: 'http.response.sent' }
          > = requireEvent(sink.events, 'http.response.sent');

          expect(statusCode).toBe(200);
          expect(body).toBe('hero');
          expect(started).toMatchObject({
            headers: {
              authorization: '[redacted]',
              'x-api-key': '[redacted]',
            },
            method: 'GET',
            type: 'http.request.started',
            url: '/items?q=hero',
          });
          expect(sent).toMatchObject({
            aborted: false,
            headers: {
              'x-audit': '1',
            },
            statusCode: 200,
            type: 'http.response.sent',
          });
        });

        it('should nest the controller inside the request', () => {
          const started: Extract<
            HttpInstrumentationEvent,
            { type: 'http.request.started' }
          > = requireEvent(sink.events, 'http.request.started');
          const sent: Extract<
            HttpInstrumentationEvent,
            { type: 'http.response.sent' }
          > = requireEvent(sink.events, 'http.response.sent');
          const controllerExecuted: Extract<
            HttpInstrumentationEvent,
            { type: 'http.controller.executed' }
          > = requireEvent(sink.events, 'http.controller.executed');

          expect(controllerExecuted.parentExecutionId).toBe(
            started.executionId,
          );
          expect(controllerExecuted.startedAt).toBeGreaterThanOrEqual(
            started.timestamp,
          );
          expect(controllerExecuted.timestamp).toBeLessThanOrEqual(
            sent.timestamp,
          );
        });
      });

      describe('when a guard denies the request', () => {
        let statusCode: number;

        beforeAll(async () => {
          sink.events.length = 0;

          const response: Response = await fetch(
            `http://${server.host}:${server.port.toString()}/secret`,
          );

          statusCode = response.status;
          await response.arrayBuffer();
        });

        it('should record a denied guard and no controller execution', () => {
          const guardEvent: Extract<
            HttpInstrumentationEvent,
            { type: 'http.guard.executed' }
          > = requireEvent(sink.events, 'http.guard.executed');

          expect(statusCode).toBe(403);
          expect(guardEvent).toMatchObject({
            allowed: false,
            guard: 'DenyGuard',
          });
          expect(
            sink.events.some(
              (event: HttpInstrumentationEvent): boolean =>
                event.type === 'http.controller.executed',
            ),
          ).toBe(false);
        });
      });
    });

    describe('having a sink that throws', () => {
      describe('when a request is served', () => {
        it('should still respond and deliver events to the other sink', async () => {
          @Controller('/plain-items')
          class PlainItemsController {
            @Get()
            public get(@Query({ name: 'q' }) query: string): string {
              return query;
            }
          }

          const container: Container = new Container();
          const recorded: HttpInstrumentationEvent[] = [];

          container.bind(PlainItemsController).toSelf().inSingletonScope();

          const server: Server = await buildUwebSocketsServer(container, {
            instrumentation: [
              {
                emit: (): void => {
                  throw new Error('sink failed');
                },
              },
              {
                emit: (event: HttpInstrumentationEvent): void => {
                  recorded.push(event);
                },
              },
            ],
            logger: false,
          });

          try {
            const response: Response = await fetch(
              `http://${server.host}:${server.port.toString()}/plain-items?q=hero`,
            );

            expect(response.status).toBe(200);
            await expect(response.text()).resolves.toBe('hero');
          } finally {
            server.shutdown();
          }

          expect(
            recorded.map((event: HttpInstrumentationEvent) => event.type),
          ).toContain('http.response.sent');
        });
      });
    });
  });
});
