import {
  afterAll,
  beforeAll,
  describe,
  expect,
  it,
  type Mock,
  vitest,
} from 'vitest';

import { type Readable } from 'node:stream';

import {
  ApplyMiddleware,
  CatchError,
  Discriminated,
  type ErrorFilter,
  getErrorDiscriminatorMetadata,
  type Guard,
  type Interceptor,
  type InterceptorTransformObject,
  type Middleware,
  type Pipe,
  UseErrorFilter,
  UseGuard,
  UseInterceptor,
} from '@inversifyjs/framework-core';
import {
  type EventSink,
  type HttpInstrumentationEvent,
} from '@inversifyjs/http-instrumentation-core';
import { Container } from 'inversify';

import { Controller } from '../decorators/Controller.js';
import { Get } from '../decorators/Get.js';
import { Query } from '../decorators/Query.js';
import { type HttpAdapterOptions } from '../models/HttpAdapterOptions.js';
import { type HttpStatusCode } from '../models/HttpStatusCode.js';
import { type MiddlewareHandler } from '../models/MiddlewareHandler.js';
import { type RouteParams } from '../models/RouteParams.js';
import { type RouterParams } from '../models/RouterParams.js';
import { InversifyHttpAdapter } from './InversifyHttpAdapter.js';

type TestRequest = Record<string, unknown>;
type TestResponse = Record<string, unknown>;

class TestHttpAdapter extends InversifyHttpAdapter<
  TestRequest,
  TestResponse,
  () => void,
  void
> {
  public readonly id: symbol = Symbol.for('TestHttpAdapter');
  public readonly replies: unknown[] = [];

  public readonly routerParamsList: RouterParams<
    TestRequest,
    TestResponse,
    () => void,
    void
  >[] = [];

  constructor(container: Container, options?: HttpAdapterOptions) {
    super(
      container,
      { instrumentation: [], logger: false },
      {
        logger: false,
        ...options,
      },
    );
  }

  protected _buildApp(): TestRequest {
    return {};
  }

  protected _buildRouter(
    routerParams: RouterParams<TestRequest, TestResponse, () => void, void>,
  ): void {
    this.routerParamsList.push(routerParams);
  }

  protected _applyGlobalPreHandlerMiddlewareList(
    _handlerList: MiddlewareHandler<
      TestRequest,
      TestResponse,
      () => void,
      void
    >[],
  ): void {}

  protected _getBody(): unknown {
    return undefined;
  }

  protected _getCookies(): unknown {
    return undefined;
  }

  protected _getHeaders(
    request: TestRequest,
  ): Record<string, string | string[] | undefined>;
  protected _getHeaders(
    request: TestRequest,
    parameterName: string,
  ): string | string[] | undefined;
  protected _getHeaders():
    | Record<string, string | string[] | undefined>
    | string
    | string[]
    | undefined {
    return {};
  }

  protected _getMethod(): string {
    return 'GET';
  }

  protected _getParams(request: TestRequest): Record<string, string>;
  protected _getParams(
    request: TestRequest,
    parameterName: string,
  ): string | undefined;
  protected _getParams(): Record<string, string> | string | undefined {
    return {};
  }

  protected _getQuery(request: TestRequest): Record<string, unknown>;
  protected _getQuery(request: TestRequest, parameterName: string): unknown;
  protected _getQuery(request: TestRequest, parameterName?: string): unknown {
    const query: unknown = request['query'];
    const queryRecord: Record<string, unknown> =
      typeof query === 'object' && query !== null
        ? (query as Record<string, unknown>)
        : {};

    if (parameterName === undefined) {
      return queryRecord;
    }

    return queryRecord[parameterName];
  }

  protected _getUrl(): string {
    return '/';
  }

  protected _replyJson(
    _request: TestRequest,
    _response: TestResponse,
    value?: object,
  ): void {
    this.replies.push(value);
  }

  protected _replyStream(
    _request: TestRequest,
    _response: TestResponse,
    _value: Readable,
  ): void {}

  protected _replyText(
    _request: TestRequest,
    _response: TestResponse,
    value: string,
  ): void {
    this.replies.push(value);
  }

  protected _sendBodySeparator(): void {}

  protected _setHeader(): void {}

  protected _setStatus(
    _request: TestRequest,
    _response: TestResponse,
    _statusCode: HttpStatusCode,
  ): void {}
}

class TestError extends Error {}

@CatchError(TestError)
class TestErrorFilter implements ErrorFilter<
  TestError,
  TestRequest,
  TestResponse,
  void
> {
  public static readonly catchMock: Mock<
    (error: TestError, request: TestRequest, response: TestResponse) => void
  > = vitest.fn();

  public catch(
    error: TestError,
    request: TestRequest,
    response: TestResponse,
  ): void {
    TestErrorFilter.catchMock(error, request, response);
  }
}

class TestGuard implements Guard<TestRequest> {
  public static readonly errorFixture: TestError = new TestError('guard error');

  public activate(_request: TestRequest): boolean {
    throw TestGuard.errorFixture;
  }
}

class TestMiddleware implements Middleware<
  TestRequest,
  TestResponse,
  () => void,
  void
> {
  public static readonly errorFixture: TestError = new TestError(
    'middleware error',
  );

  public execute(
    _request: TestRequest,
    _response: TestResponse,
    _next: () => void,
  ): void {
    throw TestMiddleware.errorFixture;
  }
}

@Controller('/test')
class TestController {
  @Get()
  public async get(): Promise<string> {
    return 'test';
  }
}

@Controller('/test-shared-handle-error')
class TestSharedHandleErrorController {
  @UseErrorFilter(TestErrorFilter)
  @UseGuard(TestGuard)
  @ApplyMiddleware(TestMiddleware)
  @Get()
  public async get(): Promise<string> {
    return 'test';
  }
}

@Discriminated('foo')
class FooError extends Error {}

@Discriminated('foo-child')
class FooChildError extends FooError {}

@CatchError(FooChildError)
class ChildFilter implements ErrorFilter<
  FooChildError,
  TestRequest,
  TestResponse,
  void
> {
  public static readonly catchMock: Mock<
    (error: FooChildError, request: TestRequest, response: TestResponse) => void
  > = vitest.fn();

  public catch(
    error: FooChildError,
    request: TestRequest,
    response: TestResponse,
  ): void {
    ChildFilter.catchMock(error, request, response);
  }
}

@CatchError(FooError)
class ParentFilter implements ErrorFilter<
  FooError,
  TestRequest,
  TestResponse,
  void
> {
  public static readonly catchMock: Mock<
    (error: FooError, request: TestRequest, response: TestResponse) => void
  > = vitest.fn();

  public catch(
    error: FooError,
    request: TestRequest,
    response: TestResponse,
  ): void {
    ParentFilter.catchMock(error, request, response);
  }
}

@Controller('/users')
@UseErrorFilter(ParentFilter)
class UsersController {
  @Get()
  @UseErrorFilter(ChildFilter)
  public list(): string {
    throw new FooError();
  }
}

class SpecialFooError extends FooError {}

@CatchError(SpecialFooError)
class SpecialFilter implements ErrorFilter<
  SpecialFooError,
  TestRequest,
  TestResponse,
  void
> {
  public static readonly catchMock: Mock<
    (
      error: SpecialFooError,
      request: TestRequest,
      response: TestResponse,
    ) => void
  > = vitest.fn();

  public catch(
    error: SpecialFooError,
    request: TestRequest,
    response: TestResponse,
  ): void {
    SpecialFilter.catchMock(error, request, response);
  }
}

@Controller('/special')
@UseErrorFilter(ParentFilter)
class SpecialFooController {
  @Get()
  @UseErrorFilter(SpecialFilter)
  public list(): string {
    return 'ok';
  }
}

@Discriminated('phantom-foo')
class FooErrorCopy1 extends Error {}

@Discriminated('phantom-foo')
class FooErrorCopy2 extends Error {}

@CatchError(FooErrorCopy1)
class PhantomFooFilter implements ErrorFilter<
  FooErrorCopy1,
  TestRequest,
  TestResponse,
  void
> {
  public static readonly catchMock: Mock<
    (
      error: FooErrorCopy1 | FooErrorCopy2,
      request: TestRequest,
      response: TestResponse,
    ) => void
  > = vitest.fn();

  public catch(
    error: FooErrorCopy1,
    request: TestRequest,
    response: TestResponse,
  ): void {
    PhantomFooFilter.catchMock(error, request, response);
  }
}

@Controller('/phantom')
@UseErrorFilter(PhantomFooFilter)
class PhantomController {
  @Get()
  public get(): string {
    return 'ok';
  }
}

class StageError extends Error {}

@CatchError(StageError)
class StageErrorFilter implements ErrorFilter<
  StageError,
  TestRequest,
  TestResponse,
  void
> {
  public static readonly catchMock: Mock<
    (error: StageError, request: TestRequest, response: TestResponse) => void
  > = vitest.fn();

  public catch(
    error: StageError,
    request: TestRequest,
    response: TestResponse,
  ): void {
    StageErrorFilter.catchMock(error, request, response);
  }
}

class AllowGuard implements Guard<TestRequest> {
  public activate(): boolean {
    return true;
  }
}

class DenyGuard implements Guard<TestRequest> {
  public activate(): boolean {
    return false;
  }
}

class ThrowingStatusHttpAdapter extends TestHttpAdapter {
  public static readonly errorFixture: StageError = new StageError(
    'forbidden reply',
  );

  protected override _setStatus(): void {
    throw ThrowingStatusHttpAdapter.errorFixture;
  }
}

class FailingGuard implements Guard<TestRequest> {
  public static readonly errorFixture: StageError = new StageError('guard');

  public activate(): boolean {
    throw FailingGuard.errorFixture;
  }
}

class NoteMiddleware implements Middleware<
  TestRequest,
  TestResponse,
  () => void,
  void
> {
  public execute(
    _request: TestRequest,
    _response: TestResponse,
    next: () => void,
  ): void {
    next();
  }
}

class PassInterceptor implements Interceptor<TestRequest, TestResponse> {
  public async intercept(
    _request: TestRequest,
    _response: TestResponse,
    next: () => Promise<InterceptorTransformObject>,
  ): Promise<void> {
    await next();
  }
}

class TrimPipe implements Pipe {
  public execute(input: unknown): string {
    return typeof input === 'string' ? input.trim() : '';
  }
}

class YieldPipe implements Pipe {
  public async execute(input: unknown): Promise<unknown> {
    await Promise.resolve();

    return input;
  }
}

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

@Controller('/items')
@UseErrorFilter(StageErrorFilter)
class ItemsController {
  @UseInterceptor(PassInterceptor)
  @UseGuard(AllowGuard)
  @ApplyMiddleware(NoteMiddleware)
  @Get()
  public get(@Query({ name: 'q' }, new TrimPipe()) query: string): string {
    return query;
  }
}

@Controller('/pair')
class PairController {
  @Get()
  public get(
    @Query({ name: 'left' }) left: string,
    @Query({ name: 'right' }) right: string,
  ): string {
    return `${left}:${right}`;
  }
}

@Controller('/allowed-guard')
@UseErrorFilter(StageErrorFilter)
class AllowedGuardController {
  @UseGuard(AllowGuard)
  @Get()
  public get(): string {
    return 'unused';
  }
}

@Controller('/denied-guard')
@UseErrorFilter(StageErrorFilter)
class DeniedGuardController {
  @UseGuard(DenyGuard)
  @Get()
  public get(): string {
    return 'unused';
  }
}

@Controller('/failing-guard')
@UseErrorFilter(StageErrorFilter)
class FailingGuardController {
  @UseGuard(FailingGuard)
  @Get()
  public get(): string {
    return 'unused';
  }
}

function bindItems(container: Container): void {
  container.bind(StageErrorFilter).toSelf().inSingletonScope();
  container.bind(AllowGuard).toSelf().inSingletonScope();
  container.bind(NoteMiddleware).toSelf().inSingletonScope();
  container.bind(PassInterceptor).toSelf().inSingletonScope();
  container.bind(ItemsController).toSelf().inSingletonScope();
}

function buildContainer(): Container {
  const container: Container = new Container();

  container.bind(TestController).toSelf().inSingletonScope();

  return container;
}

function buildSharedHandleErrorContainer(): Container {
  const container: Container = new Container();

  container.bind(TestErrorFilter).toSelf().inSingletonScope();
  container.bind(TestGuard).toSelf().inSingletonScope();
  container.bind(TestMiddleware).toSelf().inSingletonScope();
  container.bind(TestSharedHandleErrorController).toSelf().inSingletonScope();

  return container;
}

function buildDiscriminatedErrorContainer(): Container {
  const container: Container = new Container();

  container.bind(ChildFilter).toSelf().inSingletonScope();
  container.bind(ParentFilter).toSelf().inSingletonScope();
  container.bind(UsersController).toSelf().inSingletonScope();

  return container;
}

function buildSpecialFooErrorContainer(): Container {
  const container: Container = new Container();

  container.bind(SpecialFilter).toSelf().inSingletonScope();
  container.bind(ParentFilter).toSelf().inSingletonScope();
  container.bind(SpecialFooController).toSelf().inSingletonScope();

  return container;
}

function buildPhantomConstructorErrorContainer(): Container {
  const container: Container = new Container();

  container.bind(PhantomFooFilter).toSelf().inSingletonScope();
  container.bind(PhantomController).toSelf().inSingletonScope();

  return container;
}

describe(InversifyHttpAdapter, () => {
  describe('.build', () => {
    describe('when called', () => {
      let routerParams: RouterParams<
        TestRequest,
        TestResponse,
        () => void,
        void
      >;
      let routeParams: RouteParams<TestRequest, TestResponse, () => void, void>;

      beforeAll(async () => {
        const adapter: TestHttpAdapter = new TestHttpAdapter(buildContainer());

        await adapter.build();

        [routerParams] = adapter.routerParamsList as [
          RouterParams<TestRequest, TestResponse, () => void, void>,
        ];
        [routeParams] = routerParams.routeParamsList as [
          RouteParams<TestRequest, TestResponse, () => void, void>,
        ];
      });

      it('should build route params with an error handler', () => {
        expect(routeParams.handleError).toBeInstanceOf(Function);
      });

      it('should build router params with the controller target', () => {
        expect(routerParams.target).toBe(TestController);
      });

      it('should build route params with the controller method key', () => {
        expect(routeParams.methodKey).toBe('get');
      });
    });

    describe('when called, and the controller method has guards and middlewares', () => {
      let adapter: TestHttpAdapter;
      let routeParams: RouteParams<TestRequest, TestResponse, () => void, void>;
      let requestFixture: TestRequest;
      let responseFixture: TestResponse;
      let nextFixture: () => void;

      beforeAll(async () => {
        adapter = new TestHttpAdapter(buildSharedHandleErrorContainer());

        await adapter.build();

        [routeParams] = adapter.routerParamsList[0]?.routeParamsList as [
          RouteParams<TestRequest, TestResponse, () => void, void>,
        ];

        requestFixture = { id: 'request' };
        responseFixture = { id: 'response' };
        nextFixture = vitest.fn();
      });

      afterAll(() => {
        vitest.clearAllMocks();
      });

      it('should build route params with an error handler', () => {
        expect(routeParams.handleError).toBeInstanceOf(Function);
      });

      describe('when handleError is called', () => {
        let errorFixture: TestError;

        beforeAll(async () => {
          errorFixture = new TestError('direct handleError');

          await routeParams.handleError(
            requestFixture,
            responseFixture,
            errorFixture,
          );
        });

        afterAll(() => {
          vitest.clearAllMocks();
        });

        it('should handle the error with the route error filter', () => {
          expect(TestErrorFilter.catchMock).toHaveBeenCalledExactlyOnceWith(
            errorFixture,
            requestFixture,
            responseFixture,
          );
        });
      });

      describe('when a pre handler middleware throws an error', () => {
        beforeAll(async () => {
          const [middlewareHandler]: MiddlewareHandler<
            TestRequest,
            TestResponse,
            () => void,
            void
          >[] = routeParams.preHandlerMiddlewareList;

          await middlewareHandler?.(
            requestFixture,
            responseFixture,
            nextFixture,
          );
        });

        afterAll(() => {
          vitest.clearAllMocks();
        });

        it('should handle the error with the route error filter', () => {
          expect(TestErrorFilter.catchMock).toHaveBeenCalledExactlyOnceWith(
            TestMiddleware.errorFixture,
            requestFixture,
            responseFixture,
          );
        });
      });

      describe('when a guard throws an error', () => {
        beforeAll(async () => {
          const [guardHandler]: MiddlewareHandler<
            TestRequest,
            TestResponse,
            () => void,
            unknown
          >[] = routeParams.guardList;

          await guardHandler?.(requestFixture, responseFixture, nextFixture);
        });

        afterAll(() => {
          vitest.clearAllMocks();
        });

        it('should handle the error with the route error filter', () => {
          expect(TestErrorFilter.catchMock).toHaveBeenCalledExactlyOnceWith(
            TestGuard.errorFixture,
            requestFixture,
            responseFixture,
          );
        });
      });
    });

    describe('having a method child filter and a controller parent filter', () => {
      let routeParams: RouteParams<TestRequest, TestResponse, () => void, void>;
      let requestFixture: TestRequest;
      let responseFixture: TestResponse;

      beforeAll(async () => {
        const adapter: TestHttpAdapter = new TestHttpAdapter(
          buildDiscriminatedErrorContainer(),
        );

        await adapter.build();

        [routeParams] = adapter.routerParamsList[0]?.routeParamsList as [
          RouteParams<TestRequest, TestResponse, () => void, void>,
        ];

        requestFixture = { id: 'request' };
        responseFixture = { id: 'response' };
      });

      afterAll(() => {
        vitest.clearAllMocks();
      });

      it('should store own child discriminators without flattened parent metadata', () => {
        expect(getErrorDiscriminatorMetadata(FooChildError)).toStrictEqual([
          'foo-child',
        ]);
        expect(getErrorDiscriminatorMetadata(FooError)).toStrictEqual(['foo']);
      });

      describe('when handleError is called with a parent FooError', () => {
        let errorFixture: FooError;

        beforeAll(async () => {
          errorFixture = new FooError();

          await routeParams.handleError(
            requestFixture,
            responseFixture,
            errorFixture,
          );
        });

        afterAll(() => {
          vitest.clearAllMocks();
        });

        it('should handle the error with the parent error filter', () => {
          expect(ParentFilter.catchMock).toHaveBeenCalledExactlyOnceWith(
            errorFixture,
            requestFixture,
            responseFixture,
          );
        });

        it('should not handle the error with the child error filter', () => {
          expect(ChildFilter.catchMock).not.toHaveBeenCalled();
        });
      });

      describe('when handleError is called with a child FooChildError', () => {
        let errorFixture: FooChildError;

        beforeAll(async () => {
          errorFixture = new FooChildError();

          await routeParams.handleError(
            requestFixture,
            responseFixture,
            errorFixture,
          );
        });

        afterAll(() => {
          vitest.clearAllMocks();
        });

        it('should handle the error with the child error filter', () => {
          expect(ChildFilter.catchMock).toHaveBeenCalledExactlyOnceWith(
            errorFixture,
            requestFixture,
            responseFixture,
          );
        });

        it('should not handle the error with the parent error filter', () => {
          expect(ParentFilter.catchMock).not.toHaveBeenCalled();
        });
      });
    });

    describe('having an undecorated child type filter and a parent discriminator filter', () => {
      let routeParams: RouteParams<TestRequest, TestResponse, () => void, void>;
      let requestFixture: TestRequest;
      let responseFixture: TestResponse;

      beforeAll(async () => {
        const adapter: TestHttpAdapter = new TestHttpAdapter(
          buildSpecialFooErrorContainer(),
        );

        await adapter.build();

        [routeParams] = adapter.routerParamsList[0]?.routeParamsList as [
          RouteParams<TestRequest, TestResponse, () => void, void>,
        ];

        requestFixture = { id: 'request' };
        responseFixture = { id: 'response' };
      });

      afterAll(() => {
        vitest.clearAllMocks();
      });

      describe('when handleError is called with a SpecialFooError', () => {
        let errorFixture: SpecialFooError;

        beforeAll(async () => {
          errorFixture = new SpecialFooError();

          await routeParams.handleError(
            requestFixture,
            responseFixture,
            errorFixture,
          );
        });

        afterAll(() => {
          vitest.clearAllMocks();
        });

        it('should handle the error with the more specific type filter', () => {
          expect(SpecialFilter.catchMock).toHaveBeenCalledExactlyOnceWith(
            errorFixture,
            requestFixture,
            responseFixture,
          );
        });

        it('should not handle the error with the parent error filter', () => {
          expect(ParentFilter.catchMock).not.toHaveBeenCalled();
        });
      });

      describe('when handleError is called with a parent FooError', () => {
        let errorFixture: FooError;

        beforeAll(async () => {
          errorFixture = new FooError();

          await routeParams.handleError(
            requestFixture,
            responseFixture,
            errorFixture,
          );
        });

        afterAll(() => {
          vitest.clearAllMocks();
        });

        it('should handle the error with the parent error filter', () => {
          expect(ParentFilter.catchMock).toHaveBeenCalledExactlyOnceWith(
            errorFixture,
            requestFixture,
            responseFixture,
          );
        });

        it('should not handle the error with the child type filter', () => {
          expect(SpecialFilter.catchMock).not.toHaveBeenCalled();
        });
      });
    });

    describe('having a filter registered for a phantom constructor copy', () => {
      let routeParams: RouteParams<TestRequest, TestResponse, () => void, void>;
      let requestFixture: TestRequest;
      let responseFixture: TestResponse;

      beforeAll(async () => {
        const adapter: TestHttpAdapter = new TestHttpAdapter(
          buildPhantomConstructorErrorContainer(),
        );

        await adapter.build();

        [routeParams] = adapter.routerParamsList[0]?.routeParamsList as [
          RouteParams<TestRequest, TestResponse, () => void, void>,
        ];

        requestFixture = { id: 'request' };
        responseFixture = { id: 'response' };
      });

      afterAll(() => {
        vitest.clearAllMocks();
      });

      it('should treat the two constructors as distinct types', () => {
        expect(new FooErrorCopy2() instanceof FooErrorCopy1).toBe(false);
        expect(getErrorDiscriminatorMetadata(FooErrorCopy1)).toStrictEqual([
          'phantom-foo',
        ]);
        expect(getErrorDiscriminatorMetadata(FooErrorCopy2)).toStrictEqual([
          'phantom-foo',
        ]);
      });

      describe('when handleError is called with the other constructor copy', () => {
        let errorFixture: FooErrorCopy2;

        beforeAll(async () => {
          errorFixture = new FooErrorCopy2();

          await routeParams.handleError(
            requestFixture,
            responseFixture,
            errorFixture,
          );
        });

        afterAll(() => {
          vitest.clearAllMocks();
        });

        it('should handle the error with the filter registered for the first copy', () => {
          expect(PhantomFooFilter.catchMock).toHaveBeenCalledExactlyOnceWith(
            errorFixture,
            requestFixture,
            responseFixture,
          );
        });
      });
    });

    describe('having instrumentation sinks', () => {
      let adapter: TestHttpAdapter;
      let firstSink: RecordingSink;
      let secondSink: RecordingSink;
      let routeParams: RouteParams<TestRequest, TestResponse, () => void, void>;

      beforeAll(async () => {
        const container: Container = new Container();

        bindItems(container);
        firstSink = new RecordingSink();
        secondSink = new RecordingSink();
        adapter = new TestHttpAdapter(container, {
          instrumentation: [firstSink, secondSink],
        });

        await adapter.build();

        [routeParams] = adapter.routerParamsList[0]?.routeParamsList as [
          RouteParams<TestRequest, TestResponse, () => void, void>,
        ];
      });

      describe('when the route handler is called', () => {
        beforeAll(async () => {
          await routeParams.handler(
            { query: { q: ' hero ' } },
            {},
            vitest.fn(),
          );
        });

        afterAll(() => {
          firstSink.events.length = 0;
          secondSink.events.length = 0;
          adapter.replies.length = 0;
        });

        it('should emit the same events to every sink', () => {
          expect(secondSink.events).toStrictEqual(firstSink.events);
        });

        it('should emit interceptor, pipe, and controller events', () => {
          expect(
            firstSink.events.map(
              (event: HttpInstrumentationEvent) => event.type,
            ),
          ).toStrictEqual([
            'http.interceptor.started',
            'http.pipe.started',
            'http.pipe.executed',
            'http.controller.started',
            'http.controller.executed',
            'http.interceptor.executed',
          ]);
        });

        it('should share one request id', () => {
          const requestIds: string[] = firstSink.events.map(
            (event: HttpInstrumentationEvent) => event.requestId,
          );

          expect(new Set(requestIds).size).toBe(1);
        });

        it('should reply with the piped query', () => {
          expect(adapter.replies).toStrictEqual(['hero']);
        });

        it('should nest the controller inside the interceptor', () => {
          const interceptorStarted: Extract<
            HttpInstrumentationEvent,
            { type: 'http.interceptor.started' }
          > = requireEvent(firstSink.events, 'http.interceptor.started');
          const interceptorExecuted: Extract<
            HttpInstrumentationEvent,
            { type: 'http.interceptor.executed' }
          > = requireEvent(firstSink.events, 'http.interceptor.executed');
          const controllerExecuted: Extract<
            HttpInstrumentationEvent,
            { type: 'http.controller.executed' }
          > = requireEvent(firstSink.events, 'http.controller.executed');

          expect(controllerExecuted.parentExecutionId).toBe(
            interceptorStarted.executionId,
          );
          expect(controllerExecuted.startedAt).toBeGreaterThanOrEqual(
            interceptorStarted.timestamp,
          );
          expect(controllerExecuted.timestamp).toBeLessThanOrEqual(
            interceptorExecuted.timestamp,
          );
        });
      });

      describe('when the pre-handler middleware and guard run', () => {
        beforeAll(async () => {
          const [middleware]: MiddlewareHandler<
            TestRequest,
            TestResponse,
            () => void,
            void
          >[] = routeParams.preHandlerMiddlewareList;
          const [guard]: MiddlewareHandler<
            TestRequest,
            TestResponse,
            () => void,
            unknown
          >[] = routeParams.guardList;

          await middleware?.({}, {}, vitest.fn());
          await guard?.({}, {}, vitest.fn());
        });

        afterAll(() => {
          firstSink.events.length = 0;
          secondSink.events.length = 0;
        });

        it('should emit middleware and guard events', () => {
          expect(
            firstSink.events.map(
              (event: HttpInstrumentationEvent) => event.type,
            ),
          ).toStrictEqual([
            'http.middleware.started',
            'http.middleware.executed',
            'http.guard.started',
            'http.guard.executed',
          ]);
        });
      });
    });

    describe('having a global pipe and two parameters', () => {
      describe('when the route handler is called', () => {
        it('should record the parameter pipes as siblings', async () => {
          const container: Container = new Container();
          const sink: RecordingSink = new RecordingSink();

          container.bind(PairController).toSelf().inSingletonScope();

          const adapter: TestHttpAdapter = new TestHttpAdapter(container, {
            instrumentation: [sink],
          });

          adapter.useGlobalPipe(new YieldPipe());

          await adapter.build();

          const [routeParams]: [
            RouteParams<TestRequest, TestResponse, () => void, void>,
          ] = adapter.routerParamsList[0]?.routeParamsList as [
            RouteParams<TestRequest, TestResponse, () => void, void>,
          ];

          await routeParams.handler(
            {
              query: {
                left: 'a',
                right: 'b',
              },
            },
            {},
            vitest.fn(),
          );

          const pipeEvents: Extract<
            HttpInstrumentationEvent,
            { type: 'http.pipe.executed' }
          >[] = sink.events.filter(
            (
              event: HttpInstrumentationEvent,
            ): event is Extract<
              HttpInstrumentationEvent,
              { type: 'http.pipe.executed' }
            > => event.type === 'http.pipe.executed',
          );
          const firstPipe: Extract<
            HttpInstrumentationEvent,
            { type: 'http.pipe.executed' }
          > = pipeEvents[0] as Extract<
            HttpInstrumentationEvent,
            { type: 'http.pipe.executed' }
          >;
          const secondPipe: Extract<
            HttpInstrumentationEvent,
            { type: 'http.pipe.executed' }
          > = pipeEvents[1] as Extract<
            HttpInstrumentationEvent,
            { type: 'http.pipe.executed' }
          >;

          expect(pipeEvents).toHaveLength(2);
          expect(firstPipe.parameterIndex).toBe(0);
          expect(secondPipe.parameterIndex).toBe(1);
          expect(firstPipe.parentExecutionId).toBe(
            secondPipe.parentExecutionId,
          );
          expect(secondPipe.parentExecutionId).not.toBe(firstPipe.executionId);
          expect(adapter.replies).toStrictEqual(['a:b']);
        });
      });
    });

    describe('having a guard that throws', () => {
      let sink: RecordingSink;
      const requestFixture: TestRequest = {};
      const responseFixture: TestResponse = {};

      beforeAll(async () => {
        const container: Container = new Container();

        container.bind(StageErrorFilter).toSelf().inSingletonScope();
        container.bind(FailingGuard).toSelf().inSingletonScope();
        container.bind(FailingGuardController).toSelf().inSingletonScope();
        sink = new RecordingSink();

        const adapter: TestHttpAdapter = new TestHttpAdapter(container, {
          instrumentation: [sink],
        });

        await adapter.build();

        const [routeParams]: [
          RouteParams<TestRequest, TestResponse, () => void, void>,
        ] = adapter.routerParamsList[0]?.routeParamsList as [
          RouteParams<TestRequest, TestResponse, () => void, void>,
        ];
        const [guard]: MiddlewareHandler<
          TestRequest,
          TestResponse,
          () => void,
          unknown
        >[] = routeParams.guardList;

        await guard?.(requestFixture, responseFixture, vitest.fn());
      });

      afterAll(() => {
        vitest.clearAllMocks();
      });

      it('should emit the guard failure and the error event', () => {
        expect(
          sink.events.map((event: HttpInstrumentationEvent) => event.type),
        ).toStrictEqual([
          'http.guard.started',
          'http.guard.executed',
          'http.error',
        ]);
      });

      it('should handle the error with the filter', () => {
        expect(StageErrorFilter.catchMock).toHaveBeenCalledExactlyOnceWith(
          FailingGuard.errorFixture,
          requestFixture,
          responseFixture,
        );
      });
    });

    describe('having an allowed guard and a failing next call', () => {
      let sink: RecordingSink;
      const requestFixture: TestRequest = {};
      const responseFixture: TestResponse = {};
      const downstreamError: StageError = new StageError('downstream');

      beforeAll(async () => {
        const container: Container = new Container();

        container.bind(StageErrorFilter).toSelf().inSingletonScope();
        container.bind(AllowGuard).toSelf().inSingletonScope();
        container.bind(AllowedGuardController).toSelf().inSingletonScope();
        sink = new RecordingSink();

        const adapter: TestHttpAdapter = new TestHttpAdapter(container, {
          instrumentation: [sink],
        });

        await adapter.build();

        const [routeParams]: [
          RouteParams<TestRequest, TestResponse, () => void, void>,
        ] = adapter.routerParamsList[0]?.routeParamsList as [
          RouteParams<TestRequest, TestResponse, () => void, void>,
        ];
        const [guard]: MiddlewareHandler<
          TestRequest,
          TestResponse,
          () => void,
          unknown
        >[] = routeParams.guardList;

        const callGuard: (
          request: TestRequest,
          response: TestResponse,
          next: () => Promise<void>,
        ) => Promise<unknown> = guard as (
          request: TestRequest,
          response: TestResponse,
          next: () => Promise<void>,
        ) => Promise<unknown>;

        await callGuard(
          requestFixture,
          responseFixture,
          async (): Promise<void> => Promise.reject(downstreamError),
        );
      });

      afterAll(() => {
        vitest.clearAllMocks();
      });

      it('should handle the downstream error with the filter', () => {
        expect(StageErrorFilter.catchMock).toHaveBeenCalledExactlyOnceWith(
          downstreamError,
          requestFixture,
          responseFixture,
        );
      });

      it('should keep the guard result separate from the downstream error', () => {
        const guardExecuted: Extract<
          HttpInstrumentationEvent,
          { type: 'http.guard.executed' }
        > = requireEvent(sink.events, 'http.guard.executed');
        const errorEvent: Extract<
          HttpInstrumentationEvent,
          { type: 'http.error' }
        > = requireEvent(sink.events, 'http.error');

        expect(guardExecuted.allowed).toBe(true);
        expect(guardExecuted.error).toBeUndefined();
        expect(errorEvent.error).toBe(downstreamError);
      });
    });

    describe('having a denied guard and a failing forbidden reply', () => {
      let sink: RecordingSink;
      const requestFixture: TestRequest = {};
      const responseFixture: TestResponse = {};

      beforeAll(async () => {
        const container: Container = new Container();

        container.bind(StageErrorFilter).toSelf().inSingletonScope();
        container.bind(DenyGuard).toSelf().inSingletonScope();
        container.bind(DeniedGuardController).toSelf().inSingletonScope();
        sink = new RecordingSink();

        const adapter: ThrowingStatusHttpAdapter =
          new ThrowingStatusHttpAdapter(container, {
            instrumentation: [sink],
          });

        await adapter.build();

        const [routeParams]: [
          RouteParams<TestRequest, TestResponse, () => void, void>,
        ] = adapter.routerParamsList[0]?.routeParamsList as [
          RouteParams<TestRequest, TestResponse, () => void, void>,
        ];
        const [guard]: MiddlewareHandler<
          TestRequest,
          TestResponse,
          () => void,
          unknown
        >[] = routeParams.guardList;

        await guard?.(requestFixture, responseFixture, vitest.fn());
      });

      afterAll(() => {
        vitest.clearAllMocks();
      });

      it('should handle the reply error with the filter', () => {
        expect(StageErrorFilter.catchMock).toHaveBeenCalledExactlyOnceWith(
          ThrowingStatusHttpAdapter.errorFixture,
          requestFixture,
          responseFixture,
        );
      });

      it('should record the denied guard and the reply error', () => {
        const guardExecuted: Extract<
          HttpInstrumentationEvent,
          { type: 'http.guard.executed' }
        > = requireEvent(sink.events, 'http.guard.executed');
        const errorEvent: Extract<
          HttpInstrumentationEvent,
          { type: 'http.error' }
        > = requireEvent(sink.events, 'http.error');

        expect(guardExecuted.allowed).toBe(false);
        expect(errorEvent.error).toBe(ThrowingStatusHttpAdapter.errorFixture);
      });
    });

    describe('having an empty instrumentation list', () => {
      describe('when called', () => {
        it('should run the guard without recording instrumentation state', async () => {
          const container: Container = new Container();
          const requestFixture: TestRequest = {};
          const responseFixture: TestResponse = {};

          container.bind(StageErrorFilter).toSelf().inSingletonScope();
          container.bind(FailingGuard).toSelf().inSingletonScope();
          container.bind(FailingGuardController).toSelf().inSingletonScope();
          vitest.clearAllMocks();

          const adapter: TestHttpAdapter = new TestHttpAdapter(container, {
            instrumentation: [],
          });

          await adapter.build();

          const [routeParams]: [
            RouteParams<TestRequest, TestResponse, () => void, void>,
          ] = adapter.routerParamsList[0]?.routeParamsList as [
            RouteParams<TestRequest, TestResponse, () => void, void>,
          ];
          const [guard]: MiddlewareHandler<
            TestRequest,
            TestResponse,
            () => void,
            unknown
          >[] = routeParams.guardList;

          await guard?.(requestFixture, responseFixture, vitest.fn());

          expect(StageErrorFilter.catchMock).toHaveBeenCalledExactlyOnceWith(
            FailingGuard.errorFixture,
            requestFixture,
            responseFixture,
          );
          expect(Object.getOwnPropertySymbols(requestFixture)).toStrictEqual(
            [],
          );
        });
      });
    });

    describe('having a sink that throws', () => {
      describe('when the route handler is called', () => {
        it('should still run the controller and the other sink', async () => {
          const container: Container = new Container();

          bindItems(container);

          const recorded: HttpInstrumentationEvent[] = [];
          const adapter: TestHttpAdapter = new TestHttpAdapter(container, {
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
          });

          await adapter.build();

          const [routeParams]: [
            RouteParams<TestRequest, TestResponse, () => void, void>,
          ] = adapter.routerParamsList[0]?.routeParamsList as [
            RouteParams<TestRequest, TestResponse, () => void, void>,
          ];

          await routeParams.handler({ query: { q: 'hero' } }, {}, vitest.fn());

          expect(adapter.replies).toStrictEqual(['hero']);
          expect(
            recorded.map((event: HttpInstrumentationEvent) => event.type),
          ).toContain('http.controller.executed');
        });
      });
    });
  });
});
