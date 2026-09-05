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
  type Middleware,
  UseErrorFilter,
  UseGuard,
} from '@inversifyjs/framework-core';
import { Container } from 'inversify';

import { Controller } from '../decorators/Controller.js';
import { Get } from '../decorators/Get.js';
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

  public readonly routerParamsList: RouterParams<
    TestRequest,
    TestResponse,
    () => void,
    void
  >[] = [];

  constructor(container: Container) {
    super(container, { logger: false }, { logger: false });
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
  protected _getQuery(): unknown {
    return {};
  }

  protected _getUrl(): string {
    return '/';
  }

  protected _replyJson(): void {}

  protected _replyStream(
    _request: TestRequest,
    _response: TestResponse,
    _value: Readable,
  ): void {}

  protected _replyText(): void {}

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
  });
});
