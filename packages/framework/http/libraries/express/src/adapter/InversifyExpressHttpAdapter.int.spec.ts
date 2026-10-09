import { afterAll, beforeAll, describe, expect, it } from 'vitest';

import { type Server } from 'node:http';
import { type AddressInfo } from 'node:net';

import {
  ApplyMiddleware,
  Controller,
  type EventSink,
  Get,
  type Guard,
  type HttpInstrumentationEvent,
  type Middleware,
  Query,
  UseGuard,
} from '@inversifyjs/http-core';
import express, {
  type Application,
  type NextFunction,
  type Request,
  type Response,
} from 'express';
import { Container } from 'inversify';

import { InversifyExpressHttpAdapter } from './InversifyExpressHttpAdapter.js';

function requireExecutedNativeMiddleware(
  events: readonly HttpInstrumentationEvent[],
  name: string,
): Extract<
  HttpInstrumentationEvent,
  { type: 'http.nativeMiddleware.executed' }
> {
  const event: HttpInstrumentationEvent | undefined = events.find(
    (candidate: HttpInstrumentationEvent): boolean =>
      candidate.type === 'http.nativeMiddleware.executed' &&
      candidate.name === name,
  );

  if (event?.type !== 'http.nativeMiddleware.executed') {
    throw new Error(`Missing ${name} middleware event`);
  }

  return event;
}

function requireExecutedController(
  events: readonly HttpInstrumentationEvent[],
): Extract<HttpInstrumentationEvent, { type: 'http.controller.executed' }> {
  const event: HttpInstrumentationEvent | undefined = events.find(
    (candidate: HttpInstrumentationEvent): boolean =>
      candidate.type === 'http.controller.executed',
  );

  if (event?.type !== 'http.controller.executed') {
    throw new Error('Missing controller event');
  }

  return event;
}

class RecordingSink implements EventSink<HttpInstrumentationEvent> {
  public readonly events: HttpInstrumentationEvent[] = [];

  public emit(event: HttpInstrumentationEvent): void {
    this.events.push(event);
  }
}

class AllowGuard implements Guard<Request> {
  public activate(): boolean {
    return true;
  }
}

class DenyGuard implements Guard<Request> {
  public activate(): boolean {
    return false;
  }
}

class NoteMiddleware implements Middleware<
  Request,
  Response,
  NextFunction,
  void
> {
  public execute(
    _request: Request,
    _response: Response,
    next: NextFunction,
  ): void {
    next();
  }
}

@Controller('/items')
@UseGuard(AllowGuard)
@ApplyMiddleware(NoteMiddleware)
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

@Controller('/late')
class LateController {
  @Get()
  public get(): string {
    return 'late';
  }
}

async function rejectAfterNext(
  _request: Request,
  _response: Response,
  next: NextFunction,
): Promise<void> {
  next();

  throw new Error('after next');
}

function audit(
  _request: Request,
  response: Response,
  next: NextFunction,
): void {
  response.setHeader('x-audit', '1');
  next();
}

function bindControllers(container: Container): void {
  container.bind(AllowGuard).toSelf().inSingletonScope();
  container.bind(DenyGuard).toSelf().inSingletonScope();
  container.bind(NoteMiddleware).toSelf().inSingletonScope();
  container.bind(ItemsController).toSelf().inSingletonScope();
  container.bind(SecretController).toSelf().inSingletonScope();
  container.bind(LateController).toSelf().inSingletonScope();
}

async function listen(app: Application): Promise<Server> {
  return new Promise<Server>((resolve: (server: Server) => void) => {
    const server: Server = app.listen(0, () => {
      resolve(server);
    });
  });
}

function readPort(server: Server): number {
  const address: AddressInfo | string | null = server.address();

  if (address === null || typeof address === 'string') {
    throw new Error('Expected a TCP port');
  }

  return address.port;
}

describe(InversifyExpressHttpAdapter, () => {
  describe('.build', () => {
    describe('having no instrumentation', () => {
      describe('when called', () => {
        it('should leave Express registration unpatched', () => {
          const app: Application = express();
          const registerMiddleware: Application['use'] = app.use;

          new InversifyExpressHttpAdapter(
            new Container(),
            {
              logger: false,
            },
            app,
          );

          expect(app.use).toBe(registerMiddleware);
        });
      });
    });

    describe('having instrumentation sinks', () => {
      let sink: RecordingSink;
      let server: Server;
      let port: number;

      beforeAll(async () => {
        const app: Application = express();
        const container: Container = new Container();

        bindControllers(container);
        sink = new RecordingSink();

        const adapter: InversifyExpressHttpAdapter =
          new InversifyExpressHttpAdapter(
            container,
            {
              instrumentation: [sink],
              logger: false,
              useCookies: false,
              useJson: false,
              useText: false,
              useUrlEncoded: false,
            },
            app,
          );

        app.use(audit);

        await adapter.build();
        server = await listen(app);
        port = readPort(server);
      });

      afterAll(async () => {
        await new Promise<void>(
          (resolve: () => void, reject: (error: Error) => void) => {
            server.close((error: Error | undefined) => {
              if (error === undefined) {
                resolve();
              } else {
                reject(error);
              }
            });
          },
        );
      });

      describe('when a request is served', () => {
        let statusCode: number;
        let body: string;

        beforeAll(async () => {
          sink.events.length = 0;

          const response: globalThis.Response = await fetch(
            `http://127.0.0.1:${port.toString()}/items?q=hero`,
            {
              headers: {
                authorization: 'secret',
              },
            },
          );

          statusCode = response.status;
          body = await response.text();
        });

        it('should record redacted request headers and the response status', () => {
          const started: HttpInstrumentationEvent | undefined =
            sink.events.find(
              (event: HttpInstrumentationEvent) =>
                event.type === 'http.request.started',
            );
          const sent: HttpInstrumentationEvent | undefined = sink.events.find(
            (event: HttpInstrumentationEvent) =>
              event.type === 'http.response.sent',
          );

          expect(statusCode).toBe(200);
          expect(body).toBe('hero');

          expect(started).toMatchObject({
            headers: {
              authorization: '[redacted]',
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

        it('should record the Express middleware and the framework stages', () => {
          expect(
            sink.events.map((event: HttpInstrumentationEvent) => event.type),
          ).toStrictEqual(
            expect.arrayContaining([
              'http.nativeMiddleware.executed',
              'http.middleware.executed',
              'http.guard.executed',
              'http.controller.executed',
            ]),
          );

          const auditExecuted: Extract<
            HttpInstrumentationEvent,
            { type: 'http.nativeMiddleware.executed' }
          > = requireExecutedNativeMiddleware(sink.events, 'audit');
          const controllerExecuted: Extract<
            HttpInstrumentationEvent,
            { type: 'http.controller.executed' }
          > = requireExecutedController(sink.events);

          expect(controllerExecuted.parentExecutionId).toBe(
            auditExecuted.executionId,
          );
          expect(controllerExecuted.startedAt).toBeGreaterThanOrEqual(
            auditExecuted.startedAt,
          );
          expect(controllerExecuted.timestamp).toBeLessThanOrEqual(
            auditExecuted.timestamp,
          );
        });
      });

      describe('when a guard denies the request', () => {
        let statusCode: number;

        beforeAll(async () => {
          sink.events.length = 0;

          const response: globalThis.Response = await fetch(
            `http://127.0.0.1:${port.toString()}/secret`,
          );

          statusCode = response.status;

          await response.arrayBuffer();
        });

        it('should emit a denied guard and no controller execution', () => {
          const guardEvent: HttpInstrumentationEvent | undefined =
            sink.events.find(
              (event: HttpInstrumentationEvent) =>
                event.type === 'http.guard.executed',
            );

          expect(statusCode).toBe(403);

          expect(guardEvent).toMatchObject({
            allowed: false,
            guard: 'DenyGuard',
          });
          expect(
            sink.events.some(
              (event: HttpInstrumentationEvent) =>
                event.type === 'http.controller.executed',
            ),
          ).toBe(false);
        });
      });
    });

    describe('having middleware that calls next and then rejects', () => {
      describe('when a request is served', () => {
        it('should keep the middleware span open around the controller', async () => {
          const app: Application = express();
          const container: Container = new Container();
          const sink: RecordingSink = new RecordingSink();

          bindControllers(container);

          const adapter: InversifyExpressHttpAdapter =
            new InversifyExpressHttpAdapter(
              container,
              {
                instrumentation: [sink],
                logger: false,
                useCookies: false,
                useJson: false,
                useText: false,
                useUrlEncoded: false,
              },
              app,
            );

          app.use('/late', rejectAfterNext);

          await adapter.build();

          const server: Server = await listen(app);
          const port: number = readPort(server);

          try {
            const response: globalThis.Response = await fetch(
              `http://127.0.0.1:${port.toString()}/late`,
            );

            await response.arrayBuffer();
          } finally {
            await new Promise<void>(
              (resolve: () => void, reject: (error: Error) => void) => {
                server.close((error: Error | undefined) => {
                  if (error === undefined) {
                    resolve();
                  } else {
                    reject(error);
                  }
                });
              },
            );
          }

          const middlewareExecuted: Extract<
            HttpInstrumentationEvent,
            { type: 'http.nativeMiddleware.executed' }
          > = requireExecutedNativeMiddleware(sink.events, 'rejectAfterNext');
          const controllerExecuted: Extract<
            HttpInstrumentationEvent,
            { type: 'http.controller.executed' }
          > = requireExecutedController(sink.events);

          expect(controllerExecuted.parentExecutionId).toBe(
            middlewareExecuted.executionId,
          );
          expect(controllerExecuted.startedAt).toBeGreaterThanOrEqual(
            middlewareExecuted.startedAt,
          );
          expect(controllerExecuted.timestamp).toBeLessThanOrEqual(
            middlewareExecuted.timestamp,
          );
          expect(middlewareExecuted).not.toHaveProperty('error');
        });
      });
    });

    describe('having a mounted Express sub-app', () => {
      describe('when a request is served', () => {
        it('should mount the sub-app and record the request', async () => {
          const app: Application = express();
          const subApp: Application = express();
          const container: Container = new Container();
          const sink: RecordingSink = new RecordingSink();
          let mountedParent: Application | undefined;

          app.set('trust proxy', true);
          app.set('view engine', 'pug');

          const adapter: InversifyExpressHttpAdapter =
            new InversifyExpressHttpAdapter(
              container,
              {
                instrumentation: [sink],
                logger: false,
                useCookies: false,
                useJson: false,
                useText: false,
                useUrlEncoded: false,
              },
              app,
            );

          subApp.get('/ping', (_request: Request, response: Response): void => {
            response.status(200).send('ok');
          });
          subApp.on('mount', (parent: Application): void => {
            mountedParent = parent;
          });

          app.use('/mounted', subApp);

          await adapter.build();

          const server: Server = await listen(app);
          const port: number = readPort(server);

          try {
            const response: globalThis.Response = await fetch(
              `http://127.0.0.1:${port.toString()}/mounted/ping`,
            );

            expect(response.status).toBe(200);
            await expect(response.text()).resolves.toBe('ok');
          } finally {
            await new Promise<void>(
              (resolve: () => void, reject: (error: Error) => void) => {
                server.close((error: Error | undefined) => {
                  if (error === undefined) {
                    resolve();
                  } else {
                    reject(error);
                  }
                });
              },
            );
          }

          expect(subApp.mountpath).toBe('/mounted');
          expect(mountedParent).toBe(app);
          expect(subApp.get('trust proxy')).toBe(true);
          expect(subApp.get('view engine')).toBe('pug');
          expect(
            sink.events.map((event: HttpInstrumentationEvent) => event.type),
          ).toStrictEqual(
            expect.arrayContaining([
              'http.request.started',
              'http.response.sent',
            ]),
          );
          expect(
            sink.events.some(
              (event: HttpInstrumentationEvent): boolean =>
                event.type === 'http.nativeMiddleware.executed' &&
                event.name === 'app',
            ),
          ).toBe(false);
        });
      });
    });

    describe('having a sink that throws', () => {
      describe('when a request is served', () => {
        it('should still respond and deliver events to the other sink', async () => {
          const app: Application = express();
          const container: Container = new Container();
          const recorded: HttpInstrumentationEvent[] = [];

          bindControllers(container);

          const adapter: InversifyExpressHttpAdapter =
            new InversifyExpressHttpAdapter(
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
                useJson: false,
                useText: false,
                useUrlEncoded: false,
              },
              app,
            );

          await adapter.build();

          const server: Server = await listen(app);
          const port: number = readPort(server);

          try {
            const response: globalThis.Response = await fetch(
              `http://127.0.0.1:${port.toString()}/items?q=hero`,
            );

            expect(response.status).toBe(200);

            await response.arrayBuffer();
          } finally {
            await new Promise<void>(
              (resolve: () => void, reject: (error: Error) => void) => {
                server.close((error: Error | undefined) => {
                  if (error === undefined) {
                    resolve();
                  } else {
                    reject(error);
                  }
                });
              },
            );
          }

          expect(
            recorded.map((event: HttpInstrumentationEvent) => event.type),
          ).toContain('http.response.sent');
        });
      });
    });
  });
});
