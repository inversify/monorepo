import { afterAll, beforeAll, describe, expect, it } from 'vitest';

import {
  Controller,
  type EventSink,
  Get,
  type Guard,
  type HttpInstrumentationEvent,
  Query,
  UseGuard,
} from '@inversifyjs/http-core';
import fastify, {
  type FastifyInstance,
  type FastifyReply,
  type FastifyRequest,
} from 'fastify';
import { Container } from 'inversify';

import { InversifyFastifyHttpAdapter } from './InversifyFastifyHttpAdapter.js';

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

class AllowGuard implements Guard<FastifyRequest> {
  public activate(): boolean {
    return true;
  }
}

class DenyGuard implements Guard<FastifyRequest> {
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

function bindControllers(container: Container): void {
  container.bind(AllowGuard).toSelf().inSingletonScope();
  container.bind(DenyGuard).toSelf().inSingletonScope();
  container.bind(ItemsController).toSelf().inSingletonScope();
  container.bind(SecretController).toSelf().inSingletonScope();
}

function createApp(): FastifyInstance {
  return fastify({
    logger: false,
  });
}

async function markResponse(
  _request: FastifyRequest,
  reply: FastifyReply,
  payload: unknown,
): Promise<unknown> {
  reply.header('x-audit', '1');

  return payload;
}

describe(InversifyFastifyHttpAdapter, () => {
  describe('.build', () => {
    describe('having no instrumentation', () => {
      describe('when called', () => {
        it('should serve the route', async () => {
          const app: FastifyInstance = createApp();
          const container: Container = new Container();

          bindControllers(container);

          const adapter: InversifyFastifyHttpAdapter =
            new InversifyFastifyHttpAdapter(
              container,
              {
                logger: false,
              },
              app,
            );

          await adapter.build();

          const response: Awaited<ReturnType<FastifyInstance['inject']>> =
            await app.inject({
              method: 'GET',
              url: '/items?q=hero',
            });

          await app.close();

          expect(response.statusCode).toBe(200);
          expect(response.body).toBe('hero');
        });
      });
    });

    describe('having instrumentation sinks', () => {
      let sink: RecordingSink;
      let app: FastifyInstance;

      beforeAll(async () => {
        const container: Container = new Container();

        bindControllers(container);
        app = createApp();
        sink = new RecordingSink();

        const adapter: InversifyFastifyHttpAdapter =
          new InversifyFastifyHttpAdapter(
            container,
            {
              instrumentation: [sink],
              logger: false,
              useCookies: false,
              useFormUrlEncoded: false,
              useMultipartFormData: false,
            },
            app,
          );

        app.addHook('onSend', markResponse);

        await adapter.build();
      });

      afterAll(async () => {
        await app.close();
      });

      describe('when a request is served', () => {
        let statusCode: number;
        let body: string;

        beforeAll(async () => {
          sink.events.length = 0;

          const response: Awaited<ReturnType<FastifyInstance['inject']>> =
            await app.inject({
              headers: {
                authorization: 'secret',
                'x-api-key': 'key-1',
              },
              method: 'GET',
              url: '/items?q=hero',
            });

          statusCode = response.statusCode;
          body = response.body;
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

          const response: Awaited<ReturnType<FastifyInstance['inject']>> =
            await app.inject({
              method: 'GET',
              url: '/secret',
            });

          statusCode = response.statusCode;
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
          const app: FastifyInstance = createApp();
          const container: Container = new Container();
          const recorded: HttpInstrumentationEvent[] = [];

          bindControllers(container);

          const adapter: InversifyFastifyHttpAdapter =
            new InversifyFastifyHttpAdapter(
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
                useCookies: false,
                useFormUrlEncoded: false,
                useMultipartFormData: false,
              },
              app,
            );

          await adapter.build();

          const response: Awaited<ReturnType<FastifyInstance['inject']>> =
            await app.inject({
              method: 'GET',
              url: '/items?q=hero',
            });

          await app.close();

          expect(response.statusCode).toBe(200);
          expect(response.body).toBe('hero');
          expect(
            recorded.map((event: HttpInstrumentationEvent) => event.type),
          ).toContain('http.response.sent');
        });
      });
    });

    describe('having a prefixed plugin registered after instrumentation', () => {
      describe('when a request is served', () => {
        it('should record the request once', async () => {
          const app: FastifyInstance = createApp();
          const sink: RecordingSink = new RecordingSink();

          new InversifyFastifyHttpAdapter(
            new Container(),
            {
              instrumentation: [sink],
              logger: false,
              useCookies: false,
              useFormUrlEncoded: false,
              useMultipartFormData: false,
            },
            app,
          );

          await app.register(
            async (child: FastifyInstance): Promise<void> => {
              child.get('/ping', async (): Promise<string> => 'pong');
            },
            {
              prefix: '/api',
            },
          );

          const response: Awaited<ReturnType<FastifyInstance['inject']>> =
            await app.inject({
              method: 'GET',
              url: '/api/ping',
            });

          await app.close();

          const started: HttpInstrumentationEvent[] = sink.events.filter(
            (event: HttpInstrumentationEvent): boolean =>
              event.type === 'http.request.started',
          );
          const sent: HttpInstrumentationEvent[] = sink.events.filter(
            (event: HttpInstrumentationEvent): boolean =>
              event.type === 'http.response.sent',
          );

          expect(response.statusCode).toBe(200);
          expect(response.body).toBe('pong');
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
