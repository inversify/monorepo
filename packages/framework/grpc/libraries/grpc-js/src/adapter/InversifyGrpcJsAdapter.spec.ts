import {
  afterAll,
  beforeAll,
  describe,
  expect,
  it,
  type Mock,
  vitest,
} from 'vitest';

import { Buffer } from 'node:buffer';

import { type sendUnaryData, Server, type ServerOptions } from '@grpc/grpc-js';
import {
  type GrpcMethodDefinition,
  type GrpcMethodHandler,
  grpcServerServiceIdentifier,
  type GrpcServiceDefinition,
  type GrpcServiceImplementation,
  GrpcStatusCode,
  type Interceptor,
  type InterceptorTransformObject,
  NotFoundGrpcError,
  RPC,
  Service,
  UseInterceptor,
} from '@inversifyjs/grpc-core';
import { Container, injectable } from 'inversify';

import { type GrpcJsCall } from '../models/GrpcJsCall.js';
import { type GrpcJsStatusResponse } from '../status/models/GrpcJsStatusResponse.js';
import { InversifyGrpcJsAdapter } from './InversifyGrpcJsAdapter.js';

interface AddedService {
  definition: GrpcServiceDefinition;
  implementation: GrpcServiceImplementation<
    GrpcJsCall,
    sendUnaryData<unknown>,
    void
  >;
}

interface HeroRequestCall extends GrpcJsCall {
  request: {
    id: string;
  };
}

function buildLogger(): {
  debug: Mock;
  error: Mock;
  http: Mock;
  info: Mock;
  log: Mock;
  silly: Mock;
  verbose: Mock;
  warn: Mock;
} {
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

class FakeGrpcServer {
  public readonly addedServices: AddedService[] = [];

  public addService(
    definition: GrpcServiceDefinition,
    implementation: GrpcServiceImplementation<
      GrpcJsCall,
      sendUnaryData<unknown>,
      void
    >,
  ): void {
    this.addedServices.push({
      definition,
      implementation,
    });
  }

  public getHandler(
    name: string,
  ): GrpcMethodHandler<GrpcJsCall, sendUnaryData<unknown>, void> {
    const addedService: AddedService | undefined = this.addedServices[0];

    if (addedService === undefined) {
      throw new Error('Expected a gRPC service to be registered');
    }

    const handler:
      GrpcMethodHandler<GrpcJsCall, sendUnaryData<unknown>, void> | undefined =
      addedService.implementation[name];

    if (handler === undefined) {
      throw new Error(`Expected RPC "${name}" to be registered`);
    }

    return handler;
  }
}

function buildMethodDefinition(
  name: string,
  responseStream: boolean,
): GrpcMethodDefinition {
  return {
    path: `/test.HeroService/${name}`,
    requestDeserialize: (bytes: Buffer): Buffer => bytes,
    requestSerialize: (): Buffer => Buffer.alloc(0),
    requestStream: false,
    responseDeserialize: (bytes: Buffer): Buffer => bytes,
    responseSerialize: (): Buffer => Buffer.alloc(0),
    responseStream,
  };
}

function getBuiltServer(server: Server | undefined): Server {
  if (server === undefined) {
    throw new Error('Expected the server to be built');
  }

  return server;
}

function readServerOptions(server: Server): ServerOptions {
  return (server as unknown as { options: ServerOptions }).options;
}

describe(InversifyGrpcJsAdapter, () => {
  describe('.build', () => {
    describe('having server options and no custom server', () => {
      describe('when called', () => {
        let containerFixture: Container;
        let serverFixture: Server | undefined;
        let serverOptionsFixture: ServerOptions;

        beforeAll(async () => {
          containerFixture = new Container();
          serverOptionsFixture = {
            'grpc.max_receive_message_length': 1024,
          };

          @Service({
            GetHero: buildMethodDefinition('GetHero', false),
          })
          class HeroService {
            @RPC('GetHero')
            public getHero(): { name: string } {
              return { name: 'hero-1' };
            }
          }

          containerFixture.bind(HeroService).toSelf();

          const adapter: InversifyGrpcJsAdapter = new InversifyGrpcJsAdapter(
            containerFixture,
            {
              logger: false,
              serverOptions: serverOptionsFixture,
            },
          );

          serverFixture = await adapter.build();
        });

        afterAll(() => {
          if (serverFixture !== undefined) {
            serverFixture.forceShutdown();
          }
        });

        it('should return a grpc-js server', () => {
          expect(serverFixture).toBeInstanceOf(Server);
        });

        it('should apply the server options', () => {
          expect(readServerOptions(getBuiltServer(serverFixture))).toBe(
            serverOptionsFixture,
          );
        });

        it('should bind the server in the container', () => {
          expect(
            containerFixture.get<Server>(grpcServerServiceIdentifier),
          ).toBe(serverFixture);
        });
      });
    });

    describe('having a custom server', () => {
      describe('when called', () => {
        let definitionFixture: GrpcServiceDefinition;
        let serverFixture: FakeGrpcServer;

        beforeAll(async () => {
          definitionFixture = {
            GetHero: buildMethodDefinition('GetHero', false),
          };
          serverFixture = new FakeGrpcServer();

          @Service(definitionFixture)
          class HeroService {
            @RPC('GetHero')
            public getHero(): { name: string } {
              return { name: 'hero-1' };
            }
          }

          const container: Container = new Container();

          container.bind(HeroService).toSelf();

          const adapter: InversifyGrpcJsAdapter = new InversifyGrpcJsAdapter(
            container,
            { logger: false },
            serverFixture as unknown as Server,
          );

          await adapter.build();
        });

        it('should register the service on that server', () => {
          expect(serverFixture.addedServices[0]?.definition).toBe(
            definitionFixture,
          );
        });
      });
    });

    describe('having a unary RPC that returns a message', () => {
      describe('when called, and the handler is invoked', () => {
        let callbackFixture: Mock<sendUnaryData<unknown>>;
        let callFixture: HeroRequestCall;
        let serverFixture: FakeGrpcServer;

        beforeAll(async () => {
          callbackFixture = vitest.fn();
          callFixture = {
            emit: vitest.fn(),
            request: { id: 'hero-1' },
          };
          serverFixture = new FakeGrpcServer();

          @Service({
            GetHero: buildMethodDefinition('GetHero', false),
          })
          class HeroService {
            @RPC('GetHero')
            public getHero(call: HeroRequestCall): { name: string } {
              return { name: call.request.id };
            }
          }

          const container: Container = new Container();

          container.bind(HeroService).toSelf();

          const adapter: InversifyGrpcJsAdapter = new InversifyGrpcJsAdapter(
            container,
            { logger: false },
            serverFixture as unknown as Server,
          );

          await adapter.build();
          await serverFixture.getHandler('GetHero')(
            callFixture,
            callbackFixture,
          );
        });

        it('should send the message through the callback', () => {
          expect(callbackFixture).toHaveBeenCalledExactlyOnceWith(null, {
            name: 'hero-1',
          });
        });

        it('should not emit an error on the call', () => {
          expect(callFixture.emit).not.toHaveBeenCalled();
        });
      });
    });

    describe('having a unary RPC and an interceptor that replaces the message', () => {
      describe('when called, and the handler is invoked', () => {
        let callbackFixture: Mock<sendUnaryData<unknown>>;

        beforeAll(async () => {
          callbackFixture = vitest.fn();

          @injectable()
          class ReplaceNameInterceptor implements Interceptor<
            GrpcJsCall,
            GrpcJsCall | sendUnaryData<unknown>
          > {
            public async intercept(
              _call: GrpcJsCall,
              _response: GrpcJsCall | sendUnaryData<unknown>,
              next: () => Promise<InterceptorTransformObject>,
            ): Promise<void> {
              const transformObject: InterceptorTransformObject = await next();

              transformObject.push((): { name: string } => ({
                name: 'transformed',
              }));
            }
          }

          @Service({
            GetHero: buildMethodDefinition('GetHero', false),
          })
          class HeroService {
            @UseInterceptor(ReplaceNameInterceptor)
            @RPC('GetHero')
            public getHero(): { name: string } {
              return { name: 'hero-1' };
            }
          }

          const container: Container = new Container();
          const server: FakeGrpcServer = new FakeGrpcServer();

          container.bind(ReplaceNameInterceptor).toSelf();
          container.bind(HeroService).toSelf();

          const adapter: InversifyGrpcJsAdapter = new InversifyGrpcJsAdapter(
            container,
            { logger: false },
            server as unknown as Server,
          );

          await adapter.build();
          await server.getHandler('GetHero')(
            { emit: vitest.fn() },
            callbackFixture,
          );
        });

        it('should send the transformed message through the callback', () => {
          expect(callbackFixture).toHaveBeenCalledExactlyOnceWith(null, {
            name: 'transformed',
          });
        });
      });
    });

    describe('having a unary RPC that replies through the callback and returns nothing', () => {
      describe('when called, and the handler is invoked', () => {
        let callbackFixture: Mock<sendUnaryData<unknown>>;

        beforeAll(async () => {
          callbackFixture = vitest.fn();

          @Service({
            GetHero: buildMethodDefinition('GetHero', false),
          })
          class HeroService {
            @RPC('GetHero')
            public getHero(
              _call: HeroRequestCall,
              callback: sendUnaryData<{ name: string }>,
            ): void {
              callback(null, { name: 'native' });
            }
          }

          const container: Container = new Container();
          const server: FakeGrpcServer = new FakeGrpcServer();

          container.bind(HeroService).toSelf();

          const adapter: InversifyGrpcJsAdapter = new InversifyGrpcJsAdapter(
            container,
            { logger: false },
            server as unknown as Server,
          );

          const callFixture: HeroRequestCall = {
            emit: vitest.fn(),
            request: { id: 'hero-1' },
          };

          await adapter.build();
          await server.getHandler('GetHero')(callFixture, callbackFixture);
        });

        it('should leave that single callback invocation in place', () => {
          expect(callbackFixture).toHaveBeenCalledExactlyOnceWith(null, {
            name: 'native',
          });
        });
      });
    });

    describe('having a unary RPC that throws NotFoundGrpcError with metadata', () => {
      describe('when called, and the handler is invoked', () => {
        let callbackFixture: Mock<sendUnaryData<unknown>>;
        let emitFixture: Mock<GrpcJsCall['emit']>;

        beforeAll(async () => {
          callbackFixture = vitest.fn();
          emitFixture = vitest.fn();

          @Service({
            GetHero: buildMethodDefinition('GetHero', false),
          })
          class HeroService {
            @RPC('GetHero')
            public getHero(): never {
              throw new NotFoundGrpcError('missing', undefined, {
                'x-hero-id': 'hero-1',
              });
            }
          }

          const container: Container = new Container();
          const server: FakeGrpcServer = new FakeGrpcServer();

          container.bind(HeroService).toSelf();

          const adapter: InversifyGrpcJsAdapter = new InversifyGrpcJsAdapter(
            container,
            { logger: false },
            server as unknown as Server,
          );

          await adapter.build();
          await server.getHandler('GetHero')(
            { emit: emitFixture },
            callbackFixture,
          );
        });

        it('should send NOT_FOUND through the callback', () => {
          expect(callbackFixture.mock.calls[0]?.[0]?.code).toBe(
            GrpcStatusCode.NOT_FOUND,
          );
        });

        it('should send the error details through the callback', () => {
          expect(callbackFixture.mock.calls[0]?.[0]?.details).toBe('missing');
        });

        it('should send the metadata through the callback', () => {
          expect(
            callbackFixture.mock.calls[0]?.[0]?.metadata?.get('x-hero-id'),
          ).toStrictEqual(['hero-1']);
        });

        it('should not emit an error on the call', () => {
          expect(emitFixture).not.toHaveBeenCalled();
        });
      });
    });

    describe('having a unary RPC that throws NotFoundGrpcError with metadata grpc-js rejects', () => {
      describe('when called, and the handler is invoked', () => {
        let callbackFixture: Mock<sendUnaryData<unknown>>;
        let loggerFixture: ReturnType<typeof buildLogger>;

        beforeAll(async () => {
          callbackFixture = vitest.fn();
          loggerFixture = buildLogger();

          @Service({
            GetHero: buildMethodDefinition('GetHero', false),
          })
          class HeroService {
            @RPC('GetHero')
            public getHero(): never {
              throw new NotFoundGrpcError('missing', undefined, {
                raw: Buffer.from('hero'),
              });
            }
          }

          const container: Container = new Container();
          const server: FakeGrpcServer = new FakeGrpcServer();

          container.bind(HeroService).toSelf();

          const adapter: InversifyGrpcJsAdapter = new InversifyGrpcJsAdapter(
            container,
            { logger: loggerFixture },
            server as unknown as Server,
          );

          await adapter.build();
          await server.getHandler('GetHero')(
            { emit: vitest.fn() },
            callbackFixture,
          );
        });

        it('should send NOT_FOUND through the callback', () => {
          expect(callbackFixture.mock.calls[0]?.[0]?.code).toBe(
            GrpcStatusCode.NOT_FOUND,
          );
        });

        it('should send the error details through the callback', () => {
          expect(callbackFixture.mock.calls[0]?.[0]?.details).toBe('missing');
        });

        it('should omit the rejected metadata', () => {
          expect(callbackFixture.mock.calls[0]?.[0]?.metadata).toBeUndefined();
        });

        it('should log the metadata failure', () => {
          expect(loggerFixture.error).toHaveBeenCalledExactlyOnceWith(
            expect.stringContaining(
              "keys that don't end with '-bin' must have String values",
            ),
          );
        });
      });
    });

    describe('having a unary RPC that throws NotFoundGrpcError with one metadata entry grpc-js rejects', () => {
      describe('when called, and the handler is invoked', () => {
        let callbackFixture: Mock<sendUnaryData<unknown>>;
        let loggerFixture: ReturnType<typeof buildLogger>;

        beforeAll(async () => {
          callbackFixture = vitest.fn();
          loggerFixture = buildLogger();

          @Service({
            GetHero: buildMethodDefinition('GetHero', false),
          })
          class HeroService {
            @RPC('GetHero')
            public getHero(): never {
              throw new NotFoundGrpcError('missing', undefined, {
                raw: Buffer.from('hero'),
                'x-hero-id': 'hero-1',
              });
            }
          }

          const container: Container = new Container();
          const server: FakeGrpcServer = new FakeGrpcServer();

          container.bind(HeroService).toSelf();

          const adapter: InversifyGrpcJsAdapter = new InversifyGrpcJsAdapter(
            container,
            { logger: loggerFixture },
            server as unknown as Server,
          );

          await adapter.build();
          await server.getHandler('GetHero')(
            { emit: vitest.fn() },
            callbackFixture,
          );
        });

        it('should send NOT_FOUND through the callback', () => {
          expect(callbackFixture.mock.calls[0]?.[0]?.code).toBe(
            GrpcStatusCode.NOT_FOUND,
          );
        });

        it('should send the accepted metadata', () => {
          expect(
            callbackFixture.mock.calls[0]?.[0]?.metadata?.get('x-hero-id'),
          ).toStrictEqual(['hero-1']);
        });

        it('should omit the rejected metadata', () => {
          expect(
            callbackFixture.mock.calls[0]?.[0]?.metadata?.get('raw'),
          ).toStrictEqual([]);
        });

        it('should log the rejected metadata', () => {
          expect(loggerFixture.error).toHaveBeenCalledExactlyOnceWith(
            expect.stringContaining(
              "keys that don't end with '-bin' must have String values",
            ),
          );
        });
      });
    });

    describe('having a unary RPC invoked without a callback', () => {
      describe('when called, and the handler is invoked', () => {
        let emitFixture: Mock<GrpcJsCall['emit']>;
        let handlerResultFixture: unknown;

        beforeAll(async () => {
          emitFixture = vitest.fn();

          @Service({
            GetHero: buildMethodDefinition('GetHero', false),
          })
          class HeroService {
            @RPC('GetHero')
            public getHero(): { name: string } {
              return { name: 'hero-1' };
            }
          }

          const container: Container = new Container();
          const server: FakeGrpcServer = new FakeGrpcServer();

          container.bind(HeroService).toSelf();

          const adapter: InversifyGrpcJsAdapter = new InversifyGrpcJsAdapter(
            container,
            { logger: false },
            server as unknown as Server,
          );

          await adapter.build();
          handlerResultFixture = await server.getHandler('GetHero')({
            emit: emitFixture,
          });
        });

        it('should resolve', () => {
          expect(handlerResultFixture).toBeUndefined();
        });

        it('should not emit an error on the call', () => {
          expect(emitFixture).not.toHaveBeenCalled();
        });
      });
    });

    describe('having a server-streaming RPC that throws NotFoundGrpcError', () => {
      describe('when called, and the handler is invoked', () => {
        let emitFixture: Mock<GrpcJsCall['emit']>;

        beforeAll(async () => {
          emitFixture = vitest.fn();

          @Service({
            ListHeroes: buildMethodDefinition('ListHeroes', true),
          })
          class HeroService {
            @RPC('ListHeroes')
            public listHeroes(): never {
              throw new NotFoundGrpcError('missing', undefined, {
                'x-hero-id': 'hero-1',
              });
            }
          }

          const container: Container = new Container();
          const server: FakeGrpcServer = new FakeGrpcServer();

          container.bind(HeroService).toSelf();

          const adapter: InversifyGrpcJsAdapter = new InversifyGrpcJsAdapter(
            container,
            { logger: false },
            server as unknown as Server,
          );

          await adapter.build();
          await server.getHandler('ListHeroes')({ emit: emitFixture });
        });

        it('should emit the status on the call', () => {
          const statusResponse: GrpcJsStatusResponse | undefined =
            emitFixture.mock.calls[0]?.[1];

          expect(emitFixture).toHaveBeenCalledExactlyOnceWith(
            'error',
            statusResponse,
          );
        });

        it('should emit NOT_FOUND', () => {
          const statusResponse: GrpcJsStatusResponse | undefined =
            emitFixture.mock.calls[0]?.[1];

          expect(statusResponse?.code).toBe(GrpcStatusCode.NOT_FOUND);
        });

        it('should emit the metadata', () => {
          const statusResponse: GrpcJsStatusResponse | undefined =
            emitFixture.mock.calls[0]?.[1];

          expect(statusResponse?.metadata?.get('x-hero-id')).toStrictEqual([
            'hero-1',
          ]);
        });
      });
    });

    describe('having a unary RPC whose callback throws because the call already ended', () => {
      describe('when called, and the handler is invoked', () => {
        let handlerResultFixture: unknown;

        beforeAll(async () => {
          @Service({
            GetHero: buildMethodDefinition('GetHero', false),
          })
          class HeroService {
            @RPC('GetHero')
            public getHero(): { name: string } {
              return { name: 'hero-1' };
            }
          }

          const container: Container = new Container();
          const server: FakeGrpcServer = new FakeGrpcServer();

          container.bind(HeroService).toSelf();

          const adapter: InversifyGrpcJsAdapter = new InversifyGrpcJsAdapter(
            container,
            { logger: false },
            server as unknown as Server,
          );

          await adapter.build();
          handlerResultFixture = await server.getHandler('GetHero')(
            { emit: vitest.fn() },
            vitest.fn((): void => {
              throw new Error('The call already ended');
            }),
          );
        });

        it('should resolve', () => {
          expect(handlerResultFixture).toBeUndefined();
        });
      });
    });

    describe('having a unary RPC whose callback throws', () => {
      describe('when called with a logger, and the handler is invoked', () => {
        let handlerResultFixture: unknown;
        let loggerFixture: ReturnType<typeof buildLogger>;

        beforeAll(async () => {
          loggerFixture = buildLogger();

          @Service({
            GetHero: buildMethodDefinition('GetHero', false),
          })
          class HeroService {
            @RPC('GetHero')
            public getHero(): { name: string } {
              return { name: 'hero-1' };
            }
          }

          const container: Container = new Container();
          const server: FakeGrpcServer = new FakeGrpcServer();

          container.bind(HeroService).toSelf();

          const adapter: InversifyGrpcJsAdapter = new InversifyGrpcJsAdapter(
            container,
            { logger: loggerFixture },
            server as unknown as Server,
          );

          await adapter.build();
          handlerResultFixture = await server.getHandler('GetHero')(
            { emit: vitest.fn() },
            vitest.fn((): void => {
              throw new Error('The call already ended');
            }),
          );
        });

        it('should resolve', () => {
          expect(handlerResultFixture).toBeUndefined();
        });

        it('should log the failure', () => {
          expect(loggerFixture.error).toHaveBeenCalledExactlyOnceWith(
            expect.stringContaining('The call already ended'),
          );
        });
      });
    });

    describe('having a server-streaming RPC whose call throws because the call already ended', () => {
      describe('when called, and the handler is invoked', () => {
        let handlerResultFixture: unknown;

        beforeAll(async () => {
          @Service({
            ListHeroes: buildMethodDefinition('ListHeroes', true),
          })
          class HeroService {
            @RPC('ListHeroes')
            public listHeroes(): never {
              throw new NotFoundGrpcError('missing');
            }
          }

          const container: Container = new Container();
          const server: FakeGrpcServer = new FakeGrpcServer();

          container.bind(HeroService).toSelf();

          const adapter: InversifyGrpcJsAdapter = new InversifyGrpcJsAdapter(
            container,
            { logger: false },
            server as unknown as Server,
          );

          await adapter.build();
          handlerResultFixture = await server.getHandler('ListHeroes')({
            emit: vitest.fn((): boolean => {
              throw new Error('The call already ended');
            }),
          });
        });

        it('should resolve', () => {
          expect(handlerResultFixture).toBeUndefined();
        });
      });
    });
  });
});
