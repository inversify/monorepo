import {
  beforeAll,
  describe,
  expect,
  it,
  type Mock,
  type Mocked,
  vitest,
} from 'vitest';

vitest.mock(import('../handler/actions/runGrpcHandlerList.js'), {
  spy: true,
});

import { Buffer } from 'node:buffer';

import {
  ApplyMiddleware,
  CatchError,
  type ErrorFilter,
  type Guard,
  type Interceptor,
  type InterceptorTransformObject,
  type Middleware,
  MiddlewarePhase,
  type Pipe,
  type PipeMetadata,
  UseErrorFilter,
  UseGuard,
  UseInterceptor,
} from '@inversifyjs/framework-core';
import { type Logger } from '@inversifyjs/logger';
import { Container, injectable } from 'inversify';

import { InversifyGrpcAdapterError } from '../error/models/InversifyGrpcAdapterError.js';
import { InversifyGrpcAdapterErrorKind } from '../error/models/InversifyGrpcAdapterErrorKind.js';
import { NotFoundGrpcError } from '../grpcError/models/NotFoundGrpcError.js';
import { PermissionDeniedGrpcError } from '../grpcError/models/PermissionDeniedGrpcError.js';
import { UnauthenticatedGrpcError } from '../grpcError/models/UnauthenticatedGrpcError.js';
import { UnknownGrpcError } from '../grpcError/models/UnknownGrpcError.js';
import { type GrpcStatus } from '../grpcStatus/models/GrpcStatus.js';
import { GrpcStatusCode } from '../grpcStatus/models/GrpcStatusCode.js';
import { runGrpcHandlerList } from '../handler/actions/runGrpcHandlerList.js';
import { createCustomParameterDecorator } from '../service/calculations/createCustomParameterDecorator.js';
import { Call } from '../service/decorators/Call.js';
import { Callback } from '../service/decorators/Callback.js';
import { RPC } from '../service/decorators/RPC.js';
import { Service } from '../service/decorators/Service.js';
import { type GrpcMethodDefinition } from '../service/models/GrpcMethodDefinition.js';
import { type GrpcServiceDefinition } from '../service/models/GrpcServiceDefinition.js';
import { InversifyGrpcAdapter } from './InversifyGrpcAdapter.js';
import { type GrpcMethodHandler } from './models/GrpcMethodHandler.js';
import { grpcServerServiceIdentifier } from './models/grpcServerServiceIdentifier.js';
import { type GrpcServiceImplementation } from './models/GrpcServiceImplementation.js';

interface TestCall {
  id: string;
}

interface TestUser {
  name: string;
}

type TestCallback = (error: unknown, value?: string) => void;

interface AddedService {
  definition: GrpcServiceDefinition;
  implementation: GrpcServiceImplementation<TestCall, TestCallback, string>;
}

interface SentResponse {
  call: TestCall;
  message: unknown;
  response: TestCall | TestCallback;
}

interface SentStatus {
  call: TestCall;
  response: TestCall | TestCallback;
  status: GrpcStatus;
}

class RecordingGrpcAdapter extends InversifyGrpcAdapter<
  string,
  TestCall,
  TestCallback,
  string
> {
  public readonly addedServices: AddedService[] = [];
  public readonly sentResponses: SentResponse[] = [];
  public readonly sentStatuses: SentStatus[] = [];

  protected override _addService(
    definition: GrpcServiceDefinition,
    implementation: GrpcServiceImplementation<TestCall, TestCallback, string>,
  ): void {
    this.addedServices.push({
      definition,
      implementation,
    });
  }

  protected override _buildServer(customServer: string | undefined): string {
    return customServer ?? 'grpc-server';
  }

  protected override _sendResponse(
    call: TestCall,
    response: TestCall | TestCallback,
    message: unknown,
  ): string {
    this.sentResponses.push({
      call,
      message,
      response,
    });

    return `response:${String(message)}`;
  }

  protected override _sendStatus(
    call: TestCall,
    response: TestCall | TestCallback,
    status: GrpcStatus,
  ): string {
    this.sentStatuses.push({
      call,
      response,
      status,
    });

    return `status:${String(status.code)}`;
  }
}

class ThrowingStatusGrpcAdapter extends RecordingGrpcAdapter {
  protected override _sendStatus(
    call: TestCall,
    response: TestCall | TestCallback,
    status: GrpcStatus,
  ): string {
    super._sendStatus(call, response, status);

    throw new Error(`sendStatus failed: ${String(status.code)}`);
  }
}

class ThrowingResponseGrpcAdapter extends RecordingGrpcAdapter {
  protected override _sendResponse(): string {
    throw new Error('sendResponse failed');
  }
}

function buildLogger(): Mocked<Logger> {
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

function buildMethodDefinition(
  overrides: Partial<GrpcMethodDefinition> = {},
): GrpcMethodDefinition {
  return {
    path: '/test.Hero/GetHero',
    requestDeserialize: (bytes: Buffer): Buffer => bytes,
    requestSerialize: (): Buffer => Buffer.alloc(0),
    requestStream: false,
    responseDeserialize: (bytes: Buffer): Buffer => bytes,
    responseSerialize: (): Buffer => Buffer.alloc(0),
    responseStream: false,
    ...overrides,
  };
}

function getAddedService(adapter: RecordingGrpcAdapter): AddedService {
  const addedService: AddedService | undefined = adapter.addedServices[0];

  if (addedService === undefined) {
    throw new Error('Expected a gRPC service to be registered');
  }

  return addedService;
}

function getSentStatus(adapter: RecordingGrpcAdapter): SentStatus {
  const sentStatus: SentStatus | undefined = adapter.sentStatuses[0];

  if (sentStatus === undefined) {
    throw new Error('Expected a gRPC status to be sent');
  }

  return sentStatus;
}

function getHandler(
  adapter: RecordingGrpcAdapter,
  name: string,
): GrpcMethodHandler<TestCall, TestCallback, string> {
  const handler: GrpcMethodHandler<TestCall, TestCallback, string> | undefined =
    getAddedService(adapter).implementation[name];

  if (handler === undefined) {
    throw new Error(`Expected RPC "${name}" to be registered`);
  }

  return handler;
}

describe(InversifyGrpcAdapter, () => {
  describe('.build', () => {
    describe('having a bound unary service', () => {
      describe('when called, and the handler is invoked', () => {
        let adapterFixture: RecordingGrpcAdapter;
        let buildResultFixture: string;
        let callFixture: TestCall;
        let callbackFixture: TestCallback;
        let containerFixture: Container;
        let definitionFixture: GrpcServiceDefinition;
        let handlerResultFixture: string | undefined;
        let loggerFixture: Mocked<Logger>;
        let receivedArgumentsFixture: unknown[];

        beforeAll(async () => {
          callFixture = { id: 'hero-1' };
          callbackFixture = (): void => undefined;
          containerFixture = new Container();
          definitionFixture = {
            getHero: buildMethodDefinition(),
          };
          loggerFixture = buildLogger();
          receivedArgumentsFixture = [];

          @Service(definitionFixture)
          class HeroService {
            @RPC('getHero')
            public getHero(...args: unknown[]): string {
              receivedArgumentsFixture = args;

              return 'hero';
            }
          }

          containerFixture.bind(HeroService).toSelf();
          adapterFixture = new RecordingGrpcAdapter(containerFixture, {
            logger: loggerFixture,
          });
          buildResultFixture = await adapterFixture.build();
          handlerResultFixture = await getHandler(adapterFixture, 'getHero')(
            callFixture,
            callbackFixture,
          );
        });

        it('should return the server', () => {
          expect(buildResultFixture).toBe('grpc-server');
        });

        it('should bind the server in the container', () => {
          expect(containerFixture.get(grpcServerServiceIdentifier)).toBe(
            'grpc-server',
          );
        });

        it('should add the service definition', () => {
          expect(getAddedService(adapterFixture).definition).toBe(
            definitionFixture,
          );
        });

        it('should call the service method with the call and callback', () => {
          expect(receivedArgumentsFixture).toStrictEqual([
            callFixture,
            callbackFixture,
          ]);
        });

        it('should send the service method result as the response', () => {
          expect(adapterFixture.sentResponses).toStrictEqual([
            {
              call: callFixture,
              message: 'hero',
              response: callbackFixture,
            },
          ]);
        });

        it('should return the sendResponse() result', () => {
          expect(handlerResultFixture).toBe('response:hero');
        });

        it('should log the service', () => {
          expect(loggerFixture.info).toHaveBeenNthCalledWith(1, 'HeroService:');
          expect(loggerFixture.info).toHaveBeenNthCalledWith(
            2,
            '  - getHero() {unary}',
          );
        });
      });
    });

    describe('having a server-streaming RPC', () => {
      describe('when called, and the handler is invoked', () => {
        let adapterFixture: RecordingGrpcAdapter;
        let receivedArgumentsFixture: unknown[];

        beforeAll(async () => {
          const container: Container = new Container();
          const definition: GrpcServiceDefinition = {
            watch: buildMethodDefinition({
              path: '/test.Hero/Watch',
              responseStream: true,
            }),
          };

          receivedArgumentsFixture = [];

          @Service(definition)
          class StreamService {
            @RPC('watch')
            public watch(...args: unknown[]): string {
              receivedArgumentsFixture = args;

              return 'stream';
            }
          }

          container.bind(StreamService).toSelf();
          adapterFixture = new RecordingGrpcAdapter(container, {
            logger: buildLogger(),
          });
          await adapterFixture.build();
          await getHandler(adapterFixture, 'watch')({ id: 'stream-1' });
        });

        it('should call the service method with the call and no callback', () => {
          expect(receivedArgumentsFixture).toStrictEqual([
            { id: 'stream-1' },
            undefined,
          ]);
        });

        it('should not send a response', () => {
          expect(adapterFixture.sentResponses).toStrictEqual([]);
        });
      });
    });

    describe('having a grpc-js style unary RPC', () => {
      describe('when called, and the handler is invoked', () => {
        let adapterFixture: RecordingGrpcAdapter;
        let callbackMock: Mock<TestCallback>;
        let handlerResultFixture: string | undefined;

        beforeAll(async () => {
          const container: Container = new Container();

          callbackMock = vitest.fn();

          @Service({
            getHero: buildMethodDefinition(),
          })
          class GrpcJsStyleService {
            @RPC('getHero')
            public getHero(call: TestCall, callback: TestCallback): void {
              callback(null, `hero-${call.id}`);
            }
          }

          container.bind(GrpcJsStyleService).toSelf();
          adapterFixture = new RecordingGrpcAdapter(container, {
            logger: buildLogger(),
          });
          await adapterFixture.build();
          handlerResultFixture = await getHandler(adapterFixture, 'getHero')(
            { id: 'native' },
            callbackMock,
          );
        });

        it('should let the service method reply through the callback', () => {
          expect(callbackMock).toHaveBeenCalledExactlyOnceWith(
            null,
            'hero-native',
          );
        });

        it('should not send a response', () => {
          expect(adapterFixture.sentResponses).toStrictEqual([]);
        });

        it('should return undefined', () => {
          expect(handlerResultFixture).toBeUndefined();
        });
      });
    });

    describe('having a grpc-js style unary RPC and an interceptor that transforms the result', () => {
      describe('when called, and the handler is invoked', () => {
        let adapterFixture: RecordingGrpcAdapter;
        let callbackMock: Mock<TestCallback>;
        let transformMock: Mock<(value: unknown) => unknown>;

        beforeAll(async () => {
          const container: Container = new Container();

          callbackMock = vitest.fn();
          transformMock = vitest.fn();

          @injectable()
          class TransformingInterceptor implements Interceptor {
            public async intercept(
              _call: TestCall,
              _response: unknown,
              next: () => Promise<InterceptorTransformObject>,
            ): Promise<void> {
              const transformObject: InterceptorTransformObject = await next();

              transformObject.push(transformMock);
            }
          }

          @Service({
            getHero: buildMethodDefinition(),
          })
          class InterceptedGrpcJsStyleService {
            @UseInterceptor(TransformingInterceptor)
            @RPC('getHero')
            public getHero(_call: TestCall, callback: TestCallback): void {
              callback(null, 'native');
            }
          }

          container.bind(TransformingInterceptor).toSelf();
          container.bind(InterceptedGrpcJsStyleService).toSelf();
          adapterFixture = new RecordingGrpcAdapter(container, {
            logger: buildLogger(),
          });
          await adapterFixture.build();
          await getHandler(adapterFixture, 'getHero')(
            { id: 'native' },
            callbackMock,
          );
        });

        it('should let the service method reply through the callback', () => {
          expect(callbackMock).toHaveBeenCalledExactlyOnceWith(null, 'native');
        });

        it('should not run the transform', () => {
          expect(transformMock).not.toHaveBeenCalled();
        });

        it('should not send a response', () => {
          expect(adapterFixture.sentResponses).toStrictEqual([]);
        });
      });
    });

    describe('having no middleware and no guards', () => {
      describe('when called', () => {
        let runnerCountFixture: number;

        beforeAll(async () => {
          const container: Container = new Container();

          @Service({
            getHero: buildMethodDefinition(),
          })
          class PlainService {
            @RPC('getHero')
            public getHero(): string {
              return 'hero';
            }
          }

          container.bind(PlainService).toSelf();

          const callCountBefore: number =
            vitest.mocked(runGrpcHandlerList).mock.calls.length;

          await new RecordingGrpcAdapter(container, {
            logger: buildLogger(),
          }).build();

          runnerCountFixture =
            vitest.mocked(runGrpcHandlerList).mock.calls.length -
            callCountBefore;
        });

        it('should not build middleware runners', () => {
          expect(runnerCountFixture).toBe(0);
        });
      });
    });

    describe('having pre-handler middleware only', () => {
      describe('when called', () => {
        let runnerCountFixture: number;

        beforeAll(async () => {
          const container: Container = new Container();

          @injectable()
          class PassMiddleware implements Middleware {
            public execute(
              _call: TestCall,
              _response: unknown,
              next: () => void,
            ): void {
              next();
            }
          }

          @Service({
            getHero: buildMethodDefinition(),
          })
          class PreMiddlewareService {
            @ApplyMiddleware(PassMiddleware)
            @RPC('getHero')
            public getHero(): string {
              return 'hero';
            }
          }

          container.bind(PassMiddleware).toSelf();
          container.bind(PreMiddlewareService).toSelf();

          const callCountBefore: number =
            vitest.mocked(runGrpcHandlerList).mock.calls.length;

          await new RecordingGrpcAdapter(container, {
            logger: buildLogger(),
          }).build();

          runnerCountFixture =
            vitest.mocked(runGrpcHandlerList).mock.calls.length -
            callCountBefore;
        });

        it('should build the pre-handler runner only', () => {
          expect(runnerCountFixture).toBe(1);
        });
      });
    });

    describe('having a client-streaming RPC', () => {
      describe('when called, and the handler is invoked', () => {
        let adapterFixture: RecordingGrpcAdapter;
        let callbackFixture: TestCallback;
        let callFixture: TestCall;
        let handlerResultFixture: string | undefined;

        beforeAll(async () => {
          const container: Container = new Container();

          callbackFixture = (): void => undefined;
          callFixture = { id: 'route' };

          @Service({
            recordRoute: buildMethodDefinition({
              path: '/test.Hero/RecordRoute',
              requestStream: true,
            }),
          })
          class RouteService {
            @RPC('recordRoute')
            public async recordRoute(call: TestCall): Promise<string> {
              return `summary-${call.id}`;
            }
          }

          container.bind(RouteService).toSelf();
          adapterFixture = new RecordingGrpcAdapter(container, {
            logger: buildLogger(),
          });
          await adapterFixture.build();
          handlerResultFixture = await getHandler(
            adapterFixture,
            'recordRoute',
          )(callFixture, callbackFixture);
        });

        it('should send the service method result through the callback', () => {
          expect(adapterFixture.sentResponses).toStrictEqual([
            {
              call: callFixture,
              message: 'summary-route',
              response: callbackFixture,
            },
          ]);
        });

        it('should return the sendResponse() result', () => {
          expect(handlerResultFixture).toBe('response:summary-route');
        });
      });
    });

    describe('having a proto-loader service definition', () => {
      describe('when called, and the handler is invoked', () => {
        let adapterFixture: RecordingGrpcAdapter;
        let handlerResultFixture: string | undefined;

        beforeAll(async () => {
          const container: Container = new Container();
          const protoLoaderMethodDefinition: GrpcMethodDefinition & {
            originalName: string;
          } = {
            ...buildMethodDefinition(),
            originalName: 'getHero',
          };

          @Service({
            GetHero: protoLoaderMethodDefinition,
          })
          class ProtoLoaderService {
            @RPC('GetHero')
            public getHero(): string {
              return 'hero';
            }
          }

          container.bind(ProtoLoaderService).toSelf();
          adapterFixture = new RecordingGrpcAdapter(container, {
            logger: buildLogger(),
          });
          await adapterFixture.build();
          handlerResultFixture = await getHandler(
            adapterFixture,
            'GetHero',
          )({
            id: 'proto-loader',
          });
        });

        it('should register the handler under the definition key', () => {
          expect(
            Object.keys(getAddedService(adapterFixture).implementation),
          ).toStrictEqual(['GetHero']);
        });

        it('should call the service method', () => {
          expect(handlerResultFixture).toBe('response:hero');
        });
      });
    });

    describe('having a service method that uses this', () => {
      describe('when called, and the handler is invoked', () => {
        let handlerResultFixture: string | undefined;

        beforeAll(async () => {
          const container: Container = new Container();

          @Service({
            getHero: buildMethodDefinition(),
          })
          class StatefulService {
            readonly #heroName: string = 'stateful-hero';

            @RPC('getHero')
            public getHero(): string {
              return this.#heroName;
            }
          }

          container.bind(StatefulService).toSelf();

          const adapter: RecordingGrpcAdapter = new RecordingGrpcAdapter(
            container,
            { logger: buildLogger() },
          );

          await adapter.build();
          handlerResultFixture = await getHandler(
            adapter,
            'getHero',
          )({
            id: 'stateful',
          });
        });

        it('should call the service method bound to the service instance', () => {
          expect(handlerResultFixture).toBe('response:stateful-hero');
        });
      });
    });

    describe('having an RPC method that is not a function', () => {
      describe('when called', () => {
        let errorFixture: unknown;

        beforeAll(async () => {
          const container: Container = new Container();

          @Service({
            getHero: buildMethodDefinition(),
          })
          class PropertyService {
            public getHero: string = 'not a function';
          }

          RPC('getHero')(PropertyService.prototype, 'getHero', {});

          container.bind(PropertyService).toSelf();

          try {
            await new RecordingGrpcAdapter(container, {
              logger: buildLogger(),
            }).build();
          } catch (error: unknown) {
            errorFixture = error;
          }
        });

        it('should throw InversifyGrpcAdapterError', () => {
          expect(errorFixture).toBeInstanceOf(InversifyGrpcAdapterError);
          expect((errorFixture as InversifyGrpcAdapterError).kind).toBe(
            InversifyGrpcAdapterErrorKind.invalidRpc,
          );
          expect((errorFixture as InversifyGrpcAdapterError).message).toBe(
            'RPC "getHero" on PropertyService is not a function',
          );
        });
      });
    });

    describe('having a custom service identifier', () => {
      describe('when called, and the handler is invoked', () => {
        let handlerResultFixture: string | undefined;

        beforeAll(async () => {
          const container: Container = new Container();
          const definition: GrpcServiceDefinition = {
            getHero: buildMethodDefinition(),
          };
          const serviceIdentifier: symbol = Symbol.for(
            '@inversifyjs/grpc-core/test/custom-hero',
          );

          @Service(definition, { serviceIdentifier })
          class CustomHero {
            @RPC('getHero')
            public getHero(): string {
              return 'custom';
            }
          }

          container.bind(serviceIdentifier).to(CustomHero);

          const adapter: RecordingGrpcAdapter = new RecordingGrpcAdapter(
            container,
            { logger: buildLogger() },
          );

          await adapter.build();
          handlerResultFixture = await getHandler(
            adapter,
            'getHero',
          )({
            id: 'custom',
          });
        });

        it('should call the bound service', () => {
          expect(handlerResultFixture).toBe('response:custom');
        });
      });
    });

    describe('having an unbound service', () => {
      describe('when called', () => {
        let adapterFixture: RecordingGrpcAdapter;
        let boundDefinitionFixture: GrpcServiceDefinition;
        let loggerFixture: Mocked<Logger>;
        let unboundTargetFixture: NewableFunction;

        beforeAll(async () => {
          const container: Container = new Container();

          loggerFixture = buildLogger();
          boundDefinitionFixture = {
            getHero: buildMethodDefinition(),
          };

          const unboundDefinition: GrpcServiceDefinition = {
            getHero: buildMethodDefinition({
              path: '/test.Hero/Unbound',
            }),
          };

          @Service(boundDefinitionFixture)
          class BoundHero {
            @RPC('getHero')
            public getHero(): string {
              return 'bound';
            }
          }

          @Service(unboundDefinition)
          class UnboundHero {
            @RPC('getHero')
            public getHero(): string {
              return 'unbound';
            }
          }

          unboundTargetFixture = UnboundHero;

          container.bind(BoundHero).toSelf();
          adapterFixture = new RecordingGrpcAdapter(container, {
            logger: loggerFixture,
          });
          await adapterFixture.build();
        });

        it('should register the bound service', () => {
          expect(adapterFixture.addedServices).toStrictEqual([
            {
              definition: boundDefinitionFixture,
              implementation: getAddedService(adapterFixture).implementation,
            },
          ]);
        });

        it('should not register the unbound service', () => {
          expect(loggerFixture.info).not.toHaveBeenCalledWith(
            `${unboundTargetFixture.name}:`,
          );
        });
      });
    });

    describe('having an RPC that is not in the service definition', () => {
      describe('when called', () => {
        let errorFixture: unknown;

        beforeAll(async () => {
          const container: Container = new Container();

          @Service({
            getHero: buildMethodDefinition(),
          })
          class MissingRpc {
            @RPC('getHero')
            public getHero(): string {
              return 'hero';
            }

            @RPC('Other')
            public other(): string {
              return 'other';
            }
          }

          container.bind(MissingRpc).toSelf();

          try {
            await new RecordingGrpcAdapter(container, {
              logger: buildLogger(),
            }).build();
          } catch (error: unknown) {
            errorFixture = error;
          }
        });

        it('should throw InversifyGrpcAdapterError', () => {
          expect(errorFixture).toBeInstanceOf(InversifyGrpcAdapterError);
          expect((errorFixture as InversifyGrpcAdapterError).kind).toBe(
            InversifyGrpcAdapterErrorKind.invalidRpc,
          );
          expect((errorFixture as InversifyGrpcAdapterError).message).toBe(
            'RPC "Other" on MissingRpc is not declared by the service definition',
          );
        });
      });
    });

    describe('having a service definition method without an RPC', () => {
      describe('when called', () => {
        let errorFixture: unknown;

        beforeAll(async () => {
          const container: Container = new Container();

          @Service({
            GetHero: buildMethodDefinition(),
            Missing: buildMethodDefinition({
              path: '/test.Hero/Missing',
            }),
          })
          class ExtraDefinition {
            @RPC('GetHero')
            public getHero(): string {
              return 'hero';
            }
          }

          container.bind(ExtraDefinition).toSelf();

          try {
            await new RecordingGrpcAdapter(container, {
              logger: buildLogger(),
            }).build();
          } catch (error: unknown) {
            errorFixture = error;
          }
        });

        it('should throw InversifyGrpcAdapterError', () => {
          expect((errorFixture as InversifyGrpcAdapterError).kind).toBe(
            InversifyGrpcAdapterErrorKind.invalidRpc,
          );
          expect((errorFixture as InversifyGrpcAdapterError).message).toBe(
            'Service definition method "Missing" on ExtraDefinition has no @RPC() method',
          );
        });
      });
    });

    describe('having an invalid method definition', () => {
      describe('when called', () => {
        let errorFixture: unknown;

        beforeAll(async () => {
          const container: Container = new Container();

          @Service({
            GetHero: { path: '/test.Hero/GetHero' } as GrpcMethodDefinition,
          })
          class InvalidDefinition {
            @RPC('GetHero')
            public getHero(): string {
              return 'hero';
            }
          }

          container.bind(InvalidDefinition).toSelf();

          try {
            await new RecordingGrpcAdapter(container, {
              logger: buildLogger(),
            }).build();
          } catch (error: unknown) {
            errorFixture = error;
          }
        });

        it('should throw InversifyGrpcAdapterError', () => {
          expect((errorFixture as InversifyGrpcAdapterError).kind).toBe(
            InversifyGrpcAdapterErrorKind.invalidServiceDefinition,
          );
          expect((errorFixture as InversifyGrpcAdapterError).message).toBe(
            'Service definition method "GetHero" on InvalidDefinition is not a valid method definition',
          );
        });
      });
    });

    describe('having an inherited RPC', () => {
      describe('when called, and the handlers are invoked', () => {
        let childResultFixture: string | undefined;
        let parentResultFixture: string | undefined;

        beforeAll(async () => {
          const container: Container = new Container();

          class ParentHero {
            @RPC('parentCall')
            public parentCall(): string {
              return 'parent';
            }
          }

          @Service({
            childCall: buildMethodDefinition({
              path: '/test.Hero/Child',
            }),
            parentCall: buildMethodDefinition({
              path: '/test.Hero/Parent',
            }),
          })
          class ChildHero extends ParentHero {
            @RPC('childCall')
            public childCall(): string {
              return 'child';
            }
          }

          container.bind(ChildHero).toSelf();

          const adapter: RecordingGrpcAdapter = new RecordingGrpcAdapter(
            container,
            { logger: buildLogger() },
          );

          await adapter.build();
          parentResultFixture = await getHandler(
            adapter,
            'parentCall',
          )({
            id: 'parent',
          });
          childResultFixture = await getHandler(
            adapter,
            'childCall',
          )({
            id: 'child',
          });
        });

        it('should call the inherited method', () => {
          expect(parentResultFixture).toBe('response:parent');
        });

        it('should call the subclass method', () => {
          expect(childResultFixture).toBe('response:child');
        });
      });
    });

    describe('having a guard that denies the call', () => {
      describe('when called, and the handler is invoked', () => {
        let adapterFixture: RecordingGrpcAdapter;
        let handlerResultFixture: string | undefined;
        let methodCalledFixture: boolean;

        beforeAll(async () => {
          const container: Container = new Container();

          methodCalledFixture = false;

          @injectable()
          class DenyGuard implements Guard<TestCall> {
            public activate(): boolean {
              return false;
            }
          }

          @Service({
            getHero: buildMethodDefinition(),
          })
          class GuardedService {
            @UseGuard(DenyGuard)
            @RPC('getHero')
            public getHero(): string {
              methodCalledFixture = true;

              return 'hero';
            }
          }

          container.bind(DenyGuard).toSelf();
          container.bind(GuardedService).toSelf();

          adapterFixture = new RecordingGrpcAdapter(container, {
            logger: buildLogger(),
          });

          await adapterFixture.build();
          handlerResultFixture = await getHandler(
            adapterFixture,
            'getHero',
          )({
            id: 'denied',
          });
        });

        it('should send a PERMISSION_DENIED status', () => {
          const status: GrpcStatus = getSentStatus(adapterFixture).status;

          expect(status).toBeInstanceOf(PermissionDeniedGrpcError);
          expect(status.code).toBe(GrpcStatusCode.PERMISSION_DENIED);
          expect(status.details).toBe('Permission Denied');
        });

        it('should return the sendStatus() result', () => {
          expect(handlerResultFixture).toBe('status:7');
        });

        it('should not call the service method', () => {
          expect(methodCalledFixture).toBe(false);
        });
      });
    });

    describe('having a guard that throws UnauthenticatedGrpcError', () => {
      describe('when called, and the handler is invoked', () => {
        let adapterFixture: RecordingGrpcAdapter;
        let callbackFixture: TestCallback;
        let callFixture: TestCall;
        let errorFixture: UnauthenticatedGrpcError;
        let handlerResultFixture: string | undefined;
        let methodCalledFixture: boolean;

        beforeAll(async () => {
          const container: Container = new Container();

          callbackFixture = (): void => undefined;
          callFixture = { id: 'anonymous' };
          errorFixture = new UnauthenticatedGrpcError();
          methodCalledFixture = false;

          @injectable()
          class AuthGuard implements Guard<TestCall> {
            public activate(): boolean {
              throw errorFixture;
            }
          }

          @Service({
            getHero: buildMethodDefinition(),
          })
          class AuthenticatedService {
            @UseGuard(AuthGuard)
            @RPC('getHero')
            public getHero(): string {
              methodCalledFixture = true;

              return 'hero';
            }
          }

          container.bind(AuthGuard).toSelf();
          container.bind(AuthenticatedService).toSelf();

          adapterFixture = new RecordingGrpcAdapter(container, {
            logger: buildLogger(),
          });

          await adapterFixture.build();
          handlerResultFixture = await getHandler(adapterFixture, 'getHero')(
            callFixture,
            callbackFixture,
          );
        });

        it('should send the thrown error as status', () => {
          expect(adapterFixture.sentStatuses).toStrictEqual([
            {
              call: callFixture,
              response: callbackFixture,
              status: errorFixture,
            },
          ]);
        });

        it('should return the sendStatus() result', () => {
          expect(handlerResultFixture).toBe('status:16');
        });

        it('should not call the service method', () => {
          expect(methodCalledFixture).toBe(false);
        });
      });
    });

    describe('having a unary RPC that throws a GrpcError', () => {
      describe('when called, and the handler is invoked', () => {
        let adapterFixture: RecordingGrpcAdapter;
        let callbackFixture: TestCallback;
        let callFixture: TestCall;
        let errorFixture: NotFoundGrpcError;
        let handlerResultFixture: string | undefined;

        beforeAll(async () => {
          const container: Container = new Container();

          callbackFixture = (): void => undefined;
          callFixture = { id: 'missing' };
          errorFixture = new NotFoundGrpcError('Hero missing not found');

          @Service({
            getHero: buildMethodDefinition(),
          })
          class MissingHeroService {
            @RPC('getHero')
            public getHero(): string {
              throw errorFixture;
            }
          }

          container.bind(MissingHeroService).toSelf();

          adapterFixture = new RecordingGrpcAdapter(container, {
            logger: buildLogger(),
          });

          await adapterFixture.build();
          handlerResultFixture = await getHandler(adapterFixture, 'getHero')(
            callFixture,
            callbackFixture,
          );
        });

        it('should send the error as status, replying on the callback', () => {
          expect(adapterFixture.sentStatuses).toStrictEqual([
            {
              call: callFixture,
              response: callbackFixture,
              status: errorFixture,
            },
          ]);
        });

        it('should return the sendStatus() result', () => {
          expect(handlerResultFixture).toBe('status:5');
        });
      });
    });

    describe('having a server-streaming RPC that throws a GrpcError', () => {
      describe('when called, and the handler is invoked', () => {
        let adapterFixture: RecordingGrpcAdapter;
        let callFixture: TestCall;
        let errorFixture: NotFoundGrpcError;

        beforeAll(async () => {
          const container: Container = new Container();

          callFixture = { id: 'stream-missing' };
          errorFixture = new NotFoundGrpcError();

          @Service({
            watch: buildMethodDefinition({
              path: '/test.Hero/Watch',
              responseStream: true,
            }),
          })
          class MissingStreamService {
            @RPC('watch')
            public watch(): string {
              throw errorFixture;
            }
          }

          container.bind(MissingStreamService).toSelf();

          adapterFixture = new RecordingGrpcAdapter(container, {
            logger: buildLogger(),
          });

          await adapterFixture.build();
          await getHandler(adapterFixture, 'watch')(callFixture);
        });

        it('should send the error as status, replying on the call', () => {
          expect(adapterFixture.sentStatuses).toStrictEqual([
            {
              call: callFixture,
              response: callFixture,
              status: errorFixture,
            },
          ]);
        });
      });
    });

    describe('having an error filter for a GrpcError subclass', () => {
      describe('when called, and the handler is invoked', () => {
        let adapterFixture: RecordingGrpcAdapter;
        let handlerResultFixture: string | undefined;

        beforeAll(async () => {
          const container: Container = new Container();

          @CatchError(NotFoundGrpcError)
          class NotFoundFilter implements ErrorFilter {
            public catch(): string {
              return 'custom-not-found';
            }
          }

          @Service({
            getHero: buildMethodDefinition(),
          })
          class OverriddenService {
            @UseErrorFilter(NotFoundFilter)
            @RPC('getHero')
            public getHero(): string {
              throw new NotFoundGrpcError();
            }
          }

          container.bind(NotFoundFilter).toSelf();
          container.bind(OverriddenService).toSelf();

          adapterFixture = new RecordingGrpcAdapter(container, {
            logger: buildLogger(),
          });

          await adapterFixture.build();
          handlerResultFixture = await getHandler(
            adapterFixture,
            'getHero',
          )({
            id: 'overridden',
          });
        });

        it('should return the custom error filter result', () => {
          expect(handlerResultFixture).toBe('custom-not-found');
        });

        it('should not send a status', () => {
          expect(adapterFixture.sentStatuses).toStrictEqual([]);
        });
      });
    });

    describe('having middleware and guards', () => {
      describe('when called, and the handler is invoked', () => {
        let orderFixture: string[];

        beforeAll(async () => {
          const container: Container = new Container();

          orderFixture = [];

          @injectable()
          class GlobalPreMiddleware implements Middleware {
            public execute(
              _call: TestCall,
              _callback: TestCallback | undefined,
              next: () => void,
            ): void {
              orderFixture.push('globalPre');
              next();
            }
          }

          @injectable()
          class ClassPreMiddleware implements Middleware {
            public execute(
              _call: TestCall,
              _callback: TestCallback | undefined,
              next: () => void,
            ): void {
              orderFixture.push('classPre');
              next();
            }
          }

          @injectable()
          class MethodPreMiddleware implements Middleware {
            public execute(
              _call: TestCall,
              _callback: TestCallback | undefined,
              next: () => void,
            ): void {
              orderFixture.push('methodPre');
              next();
            }
          }

          @injectable()
          class MethodPostMiddleware implements Middleware {
            public execute(
              _call: TestCall,
              _callback: TestCallback | undefined,
              next: () => void,
            ): void {
              orderFixture.push('methodPost');
              next();
            }
          }

          @injectable()
          class GlobalPostMiddleware implements Middleware {
            public execute(
              _call: TestCall,
              _callback: TestCallback | undefined,
              next: () => void,
            ): void {
              orderFixture.push('globalPost');
              next();
            }
          }

          @injectable()
          class GlobalAllowGuard implements Guard<TestCall> {
            public activate(): boolean {
              orderFixture.push('globalGuard');

              return true;
            }
          }

          @injectable()
          class MethodAllowGuard implements Guard<TestCall> {
            public activate(): boolean {
              orderFixture.push('methodGuard');

              return true;
            }
          }

          @ApplyMiddleware(ClassPreMiddleware)
          @Service({
            getHero: buildMethodDefinition(),
          })
          class OrderedService {
            @UseGuard(MethodAllowGuard)
            @ApplyMiddleware({
              middleware: MethodPostMiddleware,
              phase: MiddlewarePhase.PostHandler,
            })
            @ApplyMiddleware({
              middleware: MethodPreMiddleware,
              phase: MiddlewarePhase.PreHandler,
            })
            @RPC('getHero')
            public getHero(): string {
              orderFixture.push('method');

              return 'hero';
            }
          }

          container.bind(GlobalPreMiddleware).toSelf();
          container.bind(ClassPreMiddleware).toSelf();
          container.bind(MethodPreMiddleware).toSelf();
          container.bind(MethodPostMiddleware).toSelf();
          container.bind(GlobalPostMiddleware).toSelf();
          container.bind(GlobalAllowGuard).toSelf();
          container.bind(MethodAllowGuard).toSelf();
          container.bind(OrderedService).toSelf();

          const adapter: RecordingGrpcAdapter = new RecordingGrpcAdapter(
            container,
            { logger: buildLogger() },
          );

          adapter.applyGlobalMiddleware(GlobalPreMiddleware);
          adapter.applyGlobalMiddleware({
            middleware: GlobalPostMiddleware,
            phase: MiddlewarePhase.PostHandler,
          });
          adapter.applyGlobalGuards(GlobalAllowGuard);
          await adapter.build();
          await getHandler(adapter, 'getHero')({ id: 'ordered' });
        });

        it('should run middleware and guards around the method', () => {
          expect(orderFixture).toStrictEqual([
            'globalPre',
            'classPre',
            'methodPre',
            'globalGuard',
            'methodGuard',
            'method',
            'methodPost',
            'globalPost',
          ]);
        });
      });
    });

    describe('having pre-handler middleware that does not call next', () => {
      describe('when called, and the handler is invoked', () => {
        let handlerResultFixture: string | undefined;
        let methodCalledFixture: boolean;

        beforeAll(async () => {
          const container: Container = new Container();

          methodCalledFixture = false;

          @injectable()
          class StopMiddleware implements Middleware {
            public execute(): string {
              return 'stopped';
            }
          }

          @Service({
            getHero: buildMethodDefinition(),
          })
          class StoppedService {
            @ApplyMiddleware(StopMiddleware)
            @RPC('getHero')
            public getHero(): string {
              methodCalledFixture = true;

              return 'hero';
            }
          }

          container.bind(StopMiddleware).toSelf();
          container.bind(StoppedService).toSelf();

          const adapter: RecordingGrpcAdapter = new RecordingGrpcAdapter(
            container,
            { logger: buildLogger() },
          );

          await adapter.build();
          handlerResultFixture = await getHandler(
            adapter,
            'getHero',
          )({
            id: 'stopped',
          });
        });

        it('should return the middleware result', () => {
          expect(handlerResultFixture).toBe('stopped');
        });

        it('should not call the service method', () => {
          expect(methodCalledFixture).toBe(false);
        });
      });
    });

    describe('having an error filter', () => {
      describe('when called, and the handler is invoked', () => {
        let handlerResultFixture: string | undefined;

        beforeAll(async () => {
          const container: Container = new Container();

          @CatchError(Error)
          class BoomFilter implements ErrorFilter {
            public catch(): string {
              return 'filtered';
            }
          }

          @Service({
            getHero: buildMethodDefinition(),
          })
          class BoomService {
            @UseErrorFilter(BoomFilter)
            @RPC('getHero')
            public getHero(): string {
              throw new Error('boom');
            }
          }

          container.bind(BoomFilter).toSelf();
          container.bind(BoomService).toSelf();

          const adapter: RecordingGrpcAdapter = new RecordingGrpcAdapter(
            container,
            { logger: buildLogger() },
          );

          await adapter.build();
          handlerResultFixture = await getHandler(
            adapter,
            'getHero',
          )({
            id: 'boom',
          });
        });

        it('should return the error filter result', () => {
          expect(handlerResultFixture).toBe('filtered');
        });
      });
    });

    describe('having no error filter', () => {
      describe('when called, and the handler is invoked', () => {
        let adapterFixture: RecordingGrpcAdapter;
        let errorFixture: Error;
        let handlerResultFixture: string | undefined;
        let loggerFixture: Mocked<Logger>;

        beforeAll(async () => {
          const container: Container = new Container();

          errorFixture = new Error('boom');
          loggerFixture = buildLogger();

          @Service({
            getHero: buildMethodDefinition(),
          })
          class UnhandledService {
            @RPC('getHero')
            public getHero(): string {
              throw errorFixture;
            }
          }

          container.bind(UnhandledService).toSelf();

          adapterFixture = new RecordingGrpcAdapter(container, {
            logger: loggerFixture,
          });

          await adapterFixture.build();
          handlerResultFixture = await getHandler(
            adapterFixture,
            'getHero',
          )({
            id: 'unhandled',
          });
        });

        it('should send an UNKNOWN status with generic details', () => {
          const status: GrpcStatus = getSentStatus(adapterFixture).status;

          expect(status).toBeInstanceOf(UnknownGrpcError);
          expect(status.code).toBe(GrpcStatusCode.UNKNOWN);
          expect(status.details).toBe('Unknown');
          expect((status as UnknownGrpcError).cause).toBe(errorFixture);
        });

        it('should return the sendStatus() result', () => {
          expect(handlerResultFixture).toBe('status:2');
        });

        it('should log the error', () => {
          expect(loggerFixture.error).toHaveBeenCalledWith(
            expect.stringContaining('boom'),
          );
        });
      });
    });

    describe('having @Callback() and @Call() parameters', () => {
      describe('when called, and the handler is invoked', () => {
        let adapterFixture: RecordingGrpcAdapter;
        let callbackFixture: TestCallback;
        let callFixture: TestCall;
        let handlerResultFixture: string | undefined;
        let receivedArgumentsFixture: unknown[];

        beforeAll(async () => {
          const container: Container = new Container();

          callbackFixture = (): void => undefined;
          callFixture = { id: 'decorated' };
          receivedArgumentsFixture = [];

          @Service({
            getHero: buildMethodDefinition(),
          })
          class DecoratedService {
            @RPC('getHero')
            public getHero(
              @Callback() callback: TestCallback,
              @Call() call: TestCall,
            ): string {
              receivedArgumentsFixture = [callback, call];

              return 'decorated';
            }
          }

          container.bind(DecoratedService).toSelf();

          adapterFixture = new RecordingGrpcAdapter(container, {
            logger: buildLogger(),
          });

          await adapterFixture.build();
          handlerResultFixture = await getHandler(adapterFixture, 'getHero')(
            callFixture,
            callbackFixture,
          );
        });

        it('should pass the arguments in the decorated order', () => {
          expect(receivedArgumentsFixture).toStrictEqual([
            callbackFixture,
            callFixture,
          ]);
        });

        it('should not send a response', () => {
          expect(adapterFixture.sentResponses).toStrictEqual([]);
        });

        it('should return the service method result', () => {
          expect(handlerResultFixture).toBe('decorated');
        });
      });
    });

    describe('having @Callback() and an interceptor that transforms the result', () => {
      describe('when called, and the handler is invoked', () => {
        let adapterFixture: RecordingGrpcAdapter;
        let handlerResultFixture: string | undefined;

        beforeAll(async () => {
          const container: Container = new Container();

          @injectable()
          class SuffixInterceptor implements Interceptor {
            public async intercept(
              _call: TestCall,
              _response: unknown,
              next: () => Promise<InterceptorTransformObject>,
            ): Promise<void> {
              const transformObject: InterceptorTransformObject = await next();

              transformObject.push(
                (value: unknown): unknown => `${String(value)}!`,
              );
            }
          }

          @Service({
            getHero: buildMethodDefinition(),
          })
          class NativeInterceptedService {
            @UseInterceptor(SuffixInterceptor)
            @RPC('getHero')
            public getHero(@Callback() callback: TestCallback): string {
              callback(null, 'native');

              return 'native';
            }
          }

          container.bind(SuffixInterceptor).toSelf();
          container.bind(NativeInterceptedService).toSelf();

          adapterFixture = new RecordingGrpcAdapter(container, {
            logger: buildLogger(),
          });

          await adapterFixture.build();
          handlerResultFixture = await getHandler(adapterFixture, 'getHero')(
            { id: 'native' },
            (): void => undefined,
          );
        });

        it('should not send a response', () => {
          expect(adapterFixture.sentResponses).toStrictEqual([]);
        });

        it('should return the transformed service method result', () => {
          expect(handlerResultFixture).toBe('native!');
        });
      });
    });

    describe('having a custom parameter decorator with a pipe on top of a middleware', () => {
      describe('when called, and the handler is invoked', () => {
        let handlerResultFixture: string | undefined;

        beforeAll(async () => {
          const container: Container = new Container();
          const tokenByCall: WeakMap<TestCall, string> = new WeakMap();

          @injectable()
          class AuthorizationMiddleware implements Middleware {
            public execute(
              call: TestCall,
              _response: unknown,
              next: () => void,
            ): void {
              tokenByCall.set(call, `token-${call.id}`);
              next();
            }
          }

          @injectable()
          class UserPipe implements Pipe<string | undefined, TestUser> {
            public execute(token: string | undefined): TestUser {
              if (token === undefined) {
                throw new UnauthenticatedGrpcError();
              }

              return { name: token.replace('token-', 'user-') };
            }
          }

          const authenticatedUser: ParameterDecorator =
            createCustomParameterDecorator(
              (call: TestCall): string | undefined => tokenByCall.get(call),
              UserPipe,
            );

          @Service({
            getHero: buildMethodDefinition(),
          })
          class AuthenticatedService {
            @ApplyMiddleware(AuthorizationMiddleware)
            @RPC('getHero')
            public getHero(@authenticatedUser user: TestUser): string {
              return user.name;
            }
          }

          container.bind(AuthorizationMiddleware).toSelf();
          container.bind(UserPipe).toSelf();
          container.bind(AuthenticatedService).toSelf();

          const adapter: RecordingGrpcAdapter = new RecordingGrpcAdapter(
            container,
            { logger: buildLogger() },
          );

          await adapter.build();
          handlerResultFixture = await getHandler(
            adapter,
            'getHero',
          )({
            id: 'alice',
          });
        });

        it('should pass the piped value to the service method', () => {
          expect(handlerResultFixture).toBe('response:user-alice');
        });
      });
    });

    describe('having a pipe that throws UnauthenticatedGrpcError', () => {
      describe('when called, and the handler is invoked', () => {
        let adapterFixture: RecordingGrpcAdapter;
        let handlerResultFixture: string | undefined;
        let methodCalledFixture: boolean;

        beforeAll(async () => {
          const container: Container = new Container();

          methodCalledFixture = false;

          const rejectingPipe: Pipe = {
            execute: (): never => {
              throw new UnauthenticatedGrpcError();
            },
          };

          const missingUser: ParameterDecorator =
            createCustomParameterDecorator(
              (): undefined => undefined,
              rejectingPipe,
            );

          @Service({
            getHero: buildMethodDefinition(),
          })
          class RejectedService {
            @RPC('getHero')
            public getHero(@missingUser _user: TestUser): string {
              methodCalledFixture = true;

              return 'hero';
            }
          }

          container.bind(RejectedService).toSelf();

          adapterFixture = new RecordingGrpcAdapter(container, {
            logger: buildLogger(),
          });

          await adapterFixture.build();
          handlerResultFixture = await getHandler(
            adapterFixture,
            'getHero',
          )({
            id: 'anonymous',
          });
        });

        it('should send an UNAUTHENTICATED status', () => {
          expect(getSentStatus(adapterFixture).status.code).toBe(
            GrpcStatusCode.UNAUTHENTICATED,
          );
        });

        it('should return the sendStatus() result', () => {
          expect(handlerResultFixture).toBe('status:16');
        });

        it('should not call the service method', () => {
          expect(methodCalledFixture).toBe(false);
        });
      });
    });

    describe('having a global pipe and a parameter pipe', () => {
      describe('when called, and the handler is invoked', () => {
        let handlerResultFixture: string | undefined;
        let pipeMetadataListFixture: PipeMetadata[];
        let targetFixture: NewableFunction;

        beforeAll(async () => {
          const container: Container = new Container();

          pipeMetadataListFixture = [];

          const globalPipe: Pipe = {
            execute: (input: unknown, metadata: PipeMetadata): string => {
              pipeMetadataListFixture.push(metadata);

              return `global(${String(input)})`;
            },
          };
          const parameterPipe: Pipe = {
            execute: (input: unknown): string => `parameter(${String(input)})`,
          };
          const rawValue: ParameterDecorator = createCustomParameterDecorator(
            (): string => 'raw',
            parameterPipe,
          );

          @Service({
            getHero: buildMethodDefinition(),
          })
          class PipedService {
            @RPC('getHero')
            public getHero(@rawValue value: string): string {
              return value;
            }
          }

          targetFixture = PipedService;

          container.bind(PipedService).toSelf();

          const adapter: RecordingGrpcAdapter = new RecordingGrpcAdapter(
            container,
            { logger: buildLogger() },
          );

          adapter.useGlobalPipe(globalPipe);
          await adapter.build();
          handlerResultFixture = await getHandler(
            adapter,
            'getHero',
          )({
            id: 'piped',
          });
        });

        it('should run the global pipe before the parameter pipe', () => {
          expect(handlerResultFixture).toBe('response:parameter(global(raw))');
        });

        it('should pass PipeMetadata to the pipes', () => {
          expect(pipeMetadataListFixture).toStrictEqual([
            {
              methodName: 'getHero',
              parameterIndex: 0,
              targetClass: targetFixture,
            },
          ]);
        });
      });
    });

    describe('having @Callback() on a server-streaming RPC', () => {
      describe('when called', () => {
        let errorFixture: unknown;

        beforeAll(async () => {
          const container: Container = new Container();

          @Service({
            watch: buildMethodDefinition({
              path: '/test.Hero/Watch',
              responseStream: true,
            }),
          })
          class StreamCallbackService {
            @RPC('watch')
            public watch(@Callback() _callback: TestCallback): string {
              return 'stream';
            }
          }

          container.bind(StreamCallbackService).toSelf();

          try {
            await new RecordingGrpcAdapter(container, {
              logger: buildLogger(),
            }).build();
          } catch (error: unknown) {
            errorFixture = error;
          }
        });

        it('should throw InversifyGrpcAdapterError', () => {
          expect(errorFixture).toBeInstanceOf(InversifyGrpcAdapterError);
          expect((errorFixture as InversifyGrpcAdapterError).kind).toBe(
            InversifyGrpcAdapterErrorKind.invalidRpc,
          );
          expect((errorFixture as InversifyGrpcAdapterError).message).toBe(
            'RPC "watch" on StreamCallbackService uses @Callback(), but response-streaming RPCs have no callback',
          );
        });
      });
    });

    describe('having an error filter that cannot be resolved', () => {
      describe('when called, and the handler throws', () => {
        let adapterFixture: RecordingGrpcAdapter;
        let errorFixture: Error;
        let handlerResultFixture: string | undefined;
        let loggerFixture: Mocked<Logger>;

        beforeAll(async () => {
          const container: Container = new Container();

          errorFixture = new Error('boom');
          loggerFixture = buildLogger();

          @CatchError(Error)
          class UnboundFilter implements ErrorFilter {
            public catch(): string {
              return 'unbound';
            }
          }

          @Service({
            getHero: buildMethodDefinition(),
          })
          class UnresolvableFilterService {
            @UseErrorFilter(UnboundFilter)
            @RPC('getHero')
            public getHero(): string {
              throw errorFixture;
            }
          }

          container.bind(UnresolvableFilterService).toSelf();

          adapterFixture = new RecordingGrpcAdapter(container, {
            logger: loggerFixture,
          });

          await adapterFixture.build();
          handlerResultFixture = await getHandler(
            adapterFixture,
            'getHero',
          )({
            id: 'unresolvable-filter',
          });
        });

        it('should send an UNKNOWN status caused by the original error', () => {
          const status: GrpcStatus = getSentStatus(adapterFixture).status;

          expect(status).toBeInstanceOf(UnknownGrpcError);
          expect((status as UnknownGrpcError).cause).toBe(errorFixture);
        });

        it('should log the filter resolution error and the original error', () => {
          expect(loggerFixture.error).toHaveBeenCalledTimes(2);
          expect(loggerFixture.error).toHaveBeenLastCalledWith(
            errorFixture.stack,
          );
        });

        it('should return the sendStatus() result', () => {
          expect(handlerResultFixture).toBe('status:2');
        });
      });
    });

    describe('having a sendStatus implementation that throws', () => {
      describe('when called, and the handler throws a GrpcError', () => {
        let adapterFixture: ThrowingStatusGrpcAdapter;
        let handlerResultFixture: string | undefined;
        let loggerFixture: Mocked<Logger>;

        beforeAll(async () => {
          const container: Container = new Container();

          loggerFixture = buildLogger();

          @Service({
            getHero: buildMethodDefinition(),
          })
          class FailingTransportService {
            @RPC('getHero')
            public getHero(): string {
              throw new NotFoundGrpcError();
            }
          }

          container.bind(FailingTransportService).toSelf();

          adapterFixture = new ThrowingStatusGrpcAdapter(container, {
            logger: loggerFixture,
          });

          await adapterFixture.build();
          handlerResultFixture = await getHandler(
            adapterFixture,
            'getHero',
          )({
            id: 'failing-transport',
          });
        });

        it('should try NOT_FOUND, then fall back to UNKNOWN', () => {
          expect(
            adapterFixture.sentStatuses.map(
              (sentStatus: SentStatus): GrpcStatusCode =>
                sentStatus.status.code,
            ),
          ).toStrictEqual([GrpcStatusCode.NOT_FOUND, GrpcStatusCode.UNKNOWN]);
        });

        it('should log both sendStatus() errors', () => {
          expect(loggerFixture.error).toHaveBeenCalledTimes(2);
          expect(loggerFixture.error).toHaveBeenNthCalledWith(
            1,
            expect.stringContaining('sendStatus failed: 5'),
          );
          expect(loggerFixture.error).toHaveBeenNthCalledWith(
            2,
            expect.stringContaining('sendStatus failed: 2'),
          );
        });

        it('should resolve undefined', () => {
          expect(handlerResultFixture).toBeUndefined();
        });
      });
    });

    describe('having logging disabled', () => {
      describe('when called, and the handler throws', () => {
        let handlerResultFixture: string | undefined;

        beforeAll(async () => {
          const container: Container = new Container();

          @Service({
            getHero: buildMethodDefinition(),
          })
          class QuietService {
            @RPC('getHero')
            public getHero(): string {
              throw new Error('quiet');
            }
          }

          container.bind(QuietService).toSelf();

          const adapter: RecordingGrpcAdapter = new RecordingGrpcAdapter(
            container,
            { logger: false },
          );

          await adapter.build();
          handlerResultFixture = await getHandler(
            adapter,
            'getHero',
          )({
            id: 'quiet',
          });
        });

        it('should return the sendStatus() result', () => {
          expect(handlerResultFixture).toBe('status:2');
        });
      });
    });

    describe('having an interceptor', () => {
      describe('when called, and the handler is invoked', () => {
        let adapterFixture: RecordingGrpcAdapter;
        let handlerResultFixture: string | undefined;

        beforeAll(async () => {
          const container: Container = new Container();

          @injectable()
          class RedactEmailInterceptor implements Interceptor<
            TestCall,
            TestCall | TestCallback
          > {
            public async intercept(
              _call: TestCall,
              _response: TestCall | TestCallback,
              next: () => Promise<InterceptorTransformObject>,
            ): Promise<void> {
              const transformObject: InterceptorTransformObject = await next();

              transformObject.push((user: unknown): unknown => ({
                ...(user as TestUser & { email: string }),
                email: '***',
              }));
            }
          }

          @Service({
            getUser: buildMethodDefinition(),
          })
          class UserService {
            @UseInterceptor(RedactEmailInterceptor)
            @RPC('getUser')
            public async getUser(
              call: TestCall,
            ): Promise<TestUser & { email: string }> {
              return { email: 'alice@example.com', name: call.id };
            }
          }

          container.bind(RedactEmailInterceptor).toSelf();
          container.bind(UserService).toSelf();

          adapterFixture = new RecordingGrpcAdapter(container, {
            logger: buildLogger(),
          });

          await adapterFixture.build();
          handlerResultFixture = await getHandler(adapterFixture, 'getUser')(
            { id: 'alice' },
            (): void => undefined,
          );
        });

        it('should send the transformed result as the response', () => {
          expect(
            adapterFixture.sentResponses.map(
              (sentResponse: SentResponse): unknown => sentResponse.message,
            ),
          ).toStrictEqual([{ email: '***', name: 'alice' }]);
        });

        it('should return the sendResponse() result', () => {
          expect(handlerResultFixture).toBe('response:[object Object]');
        });
      });
    });

    describe('having an interceptor whose transform throws a GrpcError', () => {
      describe('when called, and the handler is invoked', () => {
        let adapterFixture: RecordingGrpcAdapter;
        let errorFixture: NotFoundGrpcError;

        beforeAll(async () => {
          const container: Container = new Container();

          errorFixture = new NotFoundGrpcError('Hero hidden');

          @injectable()
          class HidingInterceptor implements Interceptor {
            public async intercept(
              _call: TestCall,
              _response: unknown,
              next: () => Promise<InterceptorTransformObject>,
            ): Promise<void> {
              const transformObject: InterceptorTransformObject = await next();

              transformObject.push((): never => {
                throw errorFixture;
              });
            }
          }

          @Service({
            getHero: buildMethodDefinition(),
          })
          class HiddenService {
            @UseInterceptor(HidingInterceptor)
            @RPC('getHero')
            public getHero(): string {
              return 'hero';
            }
          }

          container.bind(HidingInterceptor).toSelf();
          container.bind(HiddenService).toSelf();

          adapterFixture = new RecordingGrpcAdapter(container, {
            logger: buildLogger(),
          });

          await adapterFixture.build();
          await getHandler(adapterFixture, 'getHero')(
            { id: 'hidden' },
            (): void => undefined,
          );
        });

        it('should not send a response', () => {
          expect(adapterFixture.sentResponses).toStrictEqual([]);
        });

        it('should send the error as status', () => {
          expect(getSentStatus(adapterFixture).status).toBe(errorFixture);
        });
      });
    });

    describe('having a sendResponse implementation that throws', () => {
      describe('when called, and the handler is invoked', () => {
        let adapterFixture: ThrowingResponseGrpcAdapter;
        let handlerResultFixture: string | undefined;

        beforeAll(async () => {
          const container: Container = new Container();

          @Service({
            getHero: buildMethodDefinition(),
          })
          class FailingResponseService {
            @RPC('getHero')
            public getHero(): string {
              return 'hero';
            }
          }

          container.bind(FailingResponseService).toSelf();

          adapterFixture = new ThrowingResponseGrpcAdapter(container, {
            logger: buildLogger(),
          });

          await adapterFixture.build();
          handlerResultFixture = await getHandler(adapterFixture, 'getHero')(
            { id: 'failing-response' },
            (): void => undefined,
          );
        });

        it('should send an UNKNOWN status', () => {
          expect(getSentStatus(adapterFixture).status.code).toBe(
            GrpcStatusCode.UNKNOWN,
          );
        });

        it('should return the sendStatus() result', () => {
          expect(handlerResultFixture).toBe('status:2');
        });
      });
    });

    describe('having an interceptor that does not call next', () => {
      describe('when called, and the handler is invoked', () => {
        let adapterFixture: RecordingGrpcAdapter;
        let handlerResultFixture: string | undefined;
        let methodCalledFixture: boolean;

        beforeAll(async () => {
          const container: Container = new Container();

          methodCalledFixture = false;

          @injectable()
          class SkipInterceptor implements Interceptor {
            public async intercept(): Promise<void> {
              return undefined;
            }
          }

          @Service({
            getHero: buildMethodDefinition(),
          })
          class SkippedService {
            @UseInterceptor(SkipInterceptor)
            @RPC('getHero')
            public getHero(): string {
              methodCalledFixture = true;

              return 'hero';
            }
          }

          container.bind(SkipInterceptor).toSelf();
          container.bind(SkippedService).toSelf();

          adapterFixture = new RecordingGrpcAdapter(container, {
            logger: buildLogger(),
          });

          await adapterFixture.build();
          handlerResultFixture = await getHandler(
            adapterFixture,
            'getHero',
          )({
            id: 'skipped',
          });
        });

        it('should not call the service method', () => {
          expect(methodCalledFixture).toBe(false);
        });

        it('should not send a response', () => {
          expect(adapterFixture.sentResponses).toStrictEqual([]);
        });

        it('should return undefined', () => {
          expect(handlerResultFixture).toBeUndefined();
        });
      });
    });

    describe('having post-handler middleware that throws', () => {
      describe('when called, and the handler is invoked', () => {
        let handlerResultFixture: string | undefined;
        let methodCalledFixture: boolean;

        beforeAll(async () => {
          const container: Container = new Container();

          methodCalledFixture = false;

          @injectable()
          class ThrowingPostMiddleware implements Middleware {
            public execute(): void {
              throw new Error('post');
            }
          }

          @CatchError(Error)
          class PostFilter implements ErrorFilter {
            public catch(): string {
              return 'post-filtered';
            }
          }

          @Service({
            getHero: buildMethodDefinition(),
          })
          class PostService {
            @UseErrorFilter(PostFilter)
            @ApplyMiddleware({
              middleware: ThrowingPostMiddleware,
              phase: MiddlewarePhase.PostHandler,
            })
            @RPC('getHero')
            public getHero(): string {
              methodCalledFixture = true;

              return 'hero';
            }
          }

          container.bind(ThrowingPostMiddleware).toSelf();
          container.bind(PostFilter).toSelf();
          container.bind(PostService).toSelf();

          const adapter: RecordingGrpcAdapter = new RecordingGrpcAdapter(
            container,
            { logger: buildLogger() },
          );

          await adapter.build();
          handlerResultFixture = await getHandler(
            adapter,
            'getHero',
          )({
            id: 'post',
          });
        });

        it('should call the service method', () => {
          expect(methodCalledFixture).toBe(true);
        });

        it('should return the error filter result', () => {
          expect(handlerResultFixture).toBe('post-filtered');
        });
      });
    });

    describe('having a guard that throws', () => {
      describe('when called, and the handler is invoked', () => {
        let handlerResultFixture: string | undefined;

        beforeAll(async () => {
          const container: Container = new Container();

          @injectable()
          class ThrowingGuard implements Guard<TestCall> {
            public activate(): boolean {
              throw new Error('guard');
            }
          }

          @CatchError(Error)
          class GuardFilter implements ErrorFilter {
            public catch(): string {
              return 'guard-filtered';
            }
          }

          @UseErrorFilter(GuardFilter)
          @Service({
            getHero: buildMethodDefinition(),
          })
          class GuardErrorService {
            @UseGuard(ThrowingGuard)
            @RPC('getHero')
            public getHero(): string {
              return 'hero';
            }
          }

          container.bind(ThrowingGuard).toSelf();
          container.bind(GuardFilter).toSelf();
          container.bind(GuardErrorService).toSelf();

          const adapter: RecordingGrpcAdapter = new RecordingGrpcAdapter(
            container,
            { logger: buildLogger() },
          );

          await adapter.build();
          handlerResultFixture = await getHandler(
            adapter,
            'getHero',
          )({
            id: 'guard-error',
          });
        });

        it('should return the error filter result', () => {
          expect(handlerResultFixture).toBe('guard-filtered');
        });
      });
    });

    describe('having a server that is already built', () => {
      describe('when called', () => {
        let adapterFixture: RecordingGrpcAdapter;
        let errorFixture: unknown;

        beforeAll(async () => {
          const container: Container = new Container();

          @Service({
            getHero: buildMethodDefinition(),
          })
          class BuiltService {
            @RPC('getHero')
            public getHero(): string {
              return 'hero';
            }
          }

          container.bind(BuiltService).toSelf();
          adapterFixture = new RecordingGrpcAdapter(container, {
            logger: buildLogger(),
          });
          await adapterFixture.build();

          try {
            await adapterFixture.build();
          } catch (error: unknown) {
            errorFixture = error;
          }
        });

        it('should throw InversifyGrpcAdapterError', () => {
          expect((errorFixture as InversifyGrpcAdapterError).kind).toBe(
            InversifyGrpcAdapterErrorKind.invalidOperationAfterBuild,
          );
          expect((errorFixture as InversifyGrpcAdapterError).message).toBe(
            'The server has already been built',
          );
        });

        it('should not register the service again', () => {
          expect(adapterFixture.addedServices).toHaveLength(1);
        });
      });
    });

    describe('having a custom server', () => {
      describe('when called', () => {
        let buildResultFixture: string;
        let containerFixture: Container;

        beforeAll(async () => {
          containerFixture = new Container();

          @Service({
            getHero: buildMethodDefinition(),
          })
          class CustomServerService {
            @RPC('getHero')
            public getHero(): string {
              return 'hero';
            }
          }

          containerFixture.bind(CustomServerService).toSelf();
          buildResultFixture = await new RecordingGrpcAdapter(
            containerFixture,
            { logger: buildLogger() },
            'custom-server',
          ).build();
        });

        it('should return the custom server', () => {
          expect(buildResultFixture).toBe('custom-server');
        });

        it('should bind the custom server', () => {
          expect(containerFixture.get(grpcServerServiceIdentifier)).toBe(
            'custom-server',
          );
        });
      });
    });

    describe('having a server already registered in the container', () => {
      describe('when called', () => {
        let errorFixture: unknown;

        beforeAll(async () => {
          const container: Container = new Container();

          container
            .bind(grpcServerServiceIdentifier)
            .toConstantValue('existing');

          @Service({
            getHero: buildMethodDefinition(),
          })
          class ExistingServerService {
            @RPC('getHero')
            public getHero(): string {
              return 'hero';
            }
          }

          container.bind(ExistingServerService).toSelf();

          try {
            await new RecordingGrpcAdapter(container, {
              logger: buildLogger(),
            }).build();
          } catch (error: unknown) {
            errorFixture = error;
          }
        });

        it('should throw InversifyGrpcAdapterError', () => {
          expect((errorFixture as InversifyGrpcAdapterError).kind).toBe(
            InversifyGrpcAdapterErrorKind.serverAlreadyRegistered,
          );
          expect((errorFixture as InversifyGrpcAdapterError).message).toBe(
            'A gRPC server is already registered in the container',
          );
        });
      });
    });
  });

  describe('.applyGlobalGuards', () => {
    describe('having a built server', () => {
      describe('when called', () => {
        let errorFixture: unknown;

        beforeAll(async () => {
          const container: Container = new Container();

          @injectable()
          class LateGuard implements Guard<TestCall> {
            public activate(): boolean {
              return true;
            }
          }

          @Service({
            getHero: buildMethodDefinition(),
          })
          class LateGuardService {
            @RPC('getHero')
            public getHero(): string {
              return 'hero';
            }
          }

          container.bind(LateGuardService).toSelf();

          const adapter: RecordingGrpcAdapter = new RecordingGrpcAdapter(
            container,
            { logger: buildLogger() },
          );

          await adapter.build();

          try {
            adapter.applyGlobalGuards(LateGuard);
          } catch (error: unknown) {
            errorFixture = error;
          }
        });

        it('should throw InversifyGrpcAdapterError', () => {
          expect((errorFixture as InversifyGrpcAdapterError).kind).toBe(
            InversifyGrpcAdapterErrorKind.invalidOperationAfterBuild,
          );
          expect((errorFixture as InversifyGrpcAdapterError).message).toBe(
            'Cannot apply global guards after the server has been built',
          );
        });
      });
    });
  });

  describe('.useGlobalFilters', () => {
    describe('having a built server', () => {
      describe('when called, and the handler is invoked', () => {
        let handlerResultFixture: string | undefined;

        beforeAll(async () => {
          const container: Container = new Container();

          @CatchError(Error)
          class LateFilter implements ErrorFilter {
            public catch(): string {
              return 'late';
            }
          }

          @Service({
            getHero: buildMethodDefinition(),
          })
          class LateFilterService {
            @RPC('getHero')
            public getHero(): string {
              throw new Error('late');
            }
          }

          container.bind(LateFilter).toSelf();
          container.bind(LateFilterService).toSelf();

          const adapter: RecordingGrpcAdapter = new RecordingGrpcAdapter(
            container,
            { logger: buildLogger() },
          );

          await adapter.build();
          adapter.useGlobalFilters(LateFilter);
          handlerResultFixture = await getHandler(
            adapter,
            'getHero',
          )({
            id: 'late',
          });
        });

        it('should use the error filter registered after build', () => {
          expect(handlerResultFixture).toBe('late');
        });
      });
    });
  });
});
