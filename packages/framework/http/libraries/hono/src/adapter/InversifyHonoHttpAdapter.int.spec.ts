import { afterAll, beforeAll, describe, expect, it } from 'vitest';

import { type AddressInfo } from 'node:net';

import { serve, type ServerType } from '@hono/node-server';
import {
  ApplyMiddleware,
  Body,
  Controller,
  type EventSink,
  Get,
  type Guard,
  type HttpInstrumentationEvent,
  Post,
  Query,
  UseGuard,
} from '@inversifyjs/http-core';
import { type Context, Hono, type HonoRequest, type Next } from 'hono';
import { Container, injectable } from 'inversify';

import { type HonoMiddleware } from '../models/HonoMiddleware.js';
import { InversifyHonoHttpAdapter } from './InversifyHonoHttpAdapter.js';

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

class AllowGuard implements Guard<HonoRequest> {
  public activate(): boolean {
    return true;
  }
}

class DenyGuard implements Guard<HonoRequest> {
  public activate(): boolean {
    return false;
  }
}

@Controller('/items')
@UseGuard(AllowGuard)
class ItemsController {
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

function bindInstrumentationControllers(container: Container): void {
  container.bind(AllowGuard).toSelf().inSingletonScope();
  container.bind(DenyGuard).toSelf().inSingletonScope();
  container.bind(ItemsController).toSelf().inSingletonScope();
  container.bind(SecretController).toSelf().inSingletonScope();
}

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

  describe('having a hono http server with an endpoint returning the request body', () => {
    let server: Server;

    beforeAll(async () => {
      @Controller('/test')
      class TestController {
        @Post()
        public async post(
          @Body() body: Record<string, unknown>,
        ): Promise<Record<string, unknown>> {
          return body;
        }
      }

      const container: Container = new Container();

      container.bind(TestController).toSelf().inSingletonScope();

      server = await buildHonoServer(container);
    });

    afterAll(async () => {
      await server.shutdown();
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
    describe('having no instrumentation', () => {
      describe('when called', () => {
        it('should serve the route', async () => {
          const app: Hono = new Hono();
          const container: Container = new Container();

          bindInstrumentationControllers(container);

          const adapter: InversifyHonoHttpAdapter =
            new InversifyHonoHttpAdapter(
              container,
              {
                logger: false,
              },
              app,
            );

          await adapter.build();

          const response: Response = await app.request('/items?q=hero');

          expect(response.status).toBe(200);
          await expect(response.text()).resolves.toBe('hero');
        });
      });
    });

    describe('having instrumentation sinks', () => {
      let sink: RecordingSink;
      let app: Hono;

      beforeAll(async () => {
        const container: Container = new Container();

        bindInstrumentationControllers(container);
        app = new Hono();
        sink = new RecordingSink();

        const adapter: InversifyHonoHttpAdapter = new InversifyHonoHttpAdapter(
          container,
          {
            instrumentation: [sink],
            logger: false,
          },
          app,
        );

        app.use(async (context: Context, next: Next): Promise<void> => {
          await next();
          context.header('x-audit', '1');
        });

        await adapter.build();
      });

      describe('when a request is served', () => {
        let statusCode: number;
        let body: string;

        beforeAll(async () => {
          sink.events.length = 0;

          const response: Response = await app.request('/items?q=hero', {
            headers: {
              authorization: 'secret',
              'x-api-key': 'key-1',
            },
          });

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

          const response: Response = await app.request('/secret');

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
          const app: Hono = new Hono();
          const container: Container = new Container();
          const recorded: HttpInstrumentationEvent[] = [];

          bindInstrumentationControllers(container);

          const adapter: InversifyHonoHttpAdapter =
            new InversifyHonoHttpAdapter(
              container,
              {
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
              },
              app,
            );

          await adapter.build();

          const response: Response = await app.request('/items?q=hero');

          expect(response.status).toBe(200);
          await expect(response.text()).resolves.toBe('hero');
          expect(
            recorded.map((event: HttpInstrumentationEvent) => event.type),
          ).toContain('http.response.sent');
        });
      });
    });

    describe('having a mounted Hono app registered after instrumentation', () => {
      describe('when a request is served', () => {
        it('should record the request once', async () => {
          const app: Hono = new Hono();
          const child: Hono = new Hono();
          const sink: RecordingSink = new RecordingSink();

          new InversifyHonoHttpAdapter(
            new Container(),
            {
              instrumentation: [sink],
              logger: false,
            },
            app,
          );

          child.get('/ping', (context: Context): Response =>
            context.text('pong'),
          );
          app.route('/api', child);

          const response: Response = await app.request('/api/ping');
          const started: HttpInstrumentationEvent[] = sink.events.filter(
            (event: HttpInstrumentationEvent): boolean =>
              event.type === 'http.request.started',
          );
          const sent: HttpInstrumentationEvent[] = sink.events.filter(
            (event: HttpInstrumentationEvent): boolean =>
              event.type === 'http.response.sent',
          );

          expect(response.status).toBe(200);
          await expect(response.text()).resolves.toBe('pong');
          expect(started).toHaveLength(1);
          expect(sent).toHaveLength(1);
          expect(started[0]).toMatchObject({
            type: 'http.request.started',
            url: '/api/ping',
          });
        });
      });
    });
  });
});
