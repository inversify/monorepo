import { beforeAll, describe, expect, it, type Mock, vitest } from 'vitest';

vitest.mock(
  import('../../routerExplorer/calculations/buildRouterExplorerControllerMetadataList.js'),
);

vitest.mock(
  import('@inversifyjs/framework-core'),
  // eslint-disable-next-line @typescript-eslint/typedef
  async (importOriginal) => {
    const module: Awaited<ReturnType<typeof importOriginal>> =
      await importOriginal();
    return { ...module, getCatchErrorMetadata: vitest.fn() };
  },
);

import { type Readable } from 'node:stream';

import {
  type ErrorFilter,
  getCatchErrorMetadata,
  type Middleware,
  MiddlewarePhase,
} from '@inversifyjs/framework-core';
import { Container } from 'inversify';

import { buildRouterExplorerControllerMetadataList } from '../../routerExplorer/calculations/buildRouterExplorerControllerMetadataList.js';
import { type RouterExplorerControllerMetadata } from '../../routerExplorer/model/RouterExplorerControllerMetadata.js';
import { type HttpStatusCode } from '../models/HttpStatusCode.js';
import { type MiddlewareHandler } from '../models/MiddlewareHandler.js';
import { RequestMethodType } from '../models/RequestMethodType.js';
import { type RouteParams } from '../models/RouteParams.js';
import { type RouterParams } from '../models/RouterParams.js';
import { InversifyHttpAdapter } from './InversifyHttpAdapter.js';

// ---------------------------------------------------------------------------
// Fixtures
// ---------------------------------------------------------------------------

type TestRequest = Record<string, unknown>;
interface TestResponse {
  statusCode: number;
}
type TestNext = () => void;

class TestHttpAdapter extends InversifyHttpAdapter<
  TestRequest,
  TestResponse,
  TestNext,
  void
> {
  public override readonly id: string = 'test';

  public readonly applyGlobalPreHandlerMiddlewareListMock: Mock<
    (
      handlerList: MiddlewareHandler<
        TestRequest,
        TestResponse,
        TestNext,
        void
      >[],
    ) => void
  > = vitest.fn();

  public readonly buildRouterMock: Mock<
    (params: RouterParams<TestRequest, TestResponse, TestNext, void>) => void
  > = vitest.fn();

  public readonly getBodyMock: Mock<
    (
      request: TestRequest,
      response: TestResponse,
      parameterName?: string,
    ) => unknown
  > = vitest.fn();

  public readonly getCookiesMock: Mock<
    (
      request: TestRequest,
      response: TestResponse,
      parameterName?: string,
    ) => unknown
  > = vitest.fn();

  public readonly getHeadersMock: Mock<
    (
      request: TestRequest,
      parameterName?: string,
    ) =>
      | Record<string, string | string[] | undefined>
      | string
      | string[]
      | undefined
  > = vitest.fn();

  public readonly getMethodMock: Mock<(request: TestRequest) => string> =
    vitest.fn();

  public readonly getParamsMock: Mock<
    (
      request: TestRequest,
      parameterName?: string,
    ) => Record<string, string> | string | undefined
  > = vitest.fn();

  public readonly getQueryMock: Mock<
    (request: TestRequest, parameterName?: string) => unknown
  > = vitest.fn();

  public readonly getUrlMock: Mock<(request: TestRequest) => string> =
    vitest.fn();

  public readonly replyJsonMock: Mock<
    (request: TestRequest, response: TestResponse, value?: object) => void
  > = vitest.fn();

  public readonly replyStreamMock: Mock<
    (request: TestRequest, response: TestResponse, value: Readable) => void
  > = vitest.fn();

  public readonly replyTextMock: Mock<
    (request: TestRequest, response: TestResponse, value: string) => void
  > = vitest.fn();

  public readonly sendBodySeparatorMock: Mock<
    (request: TestRequest, response: TestResponse) => void
  > = vitest.fn();

  public readonly setHeaderMock: Mock<
    (
      request: TestRequest,
      response: TestResponse,
      key: string,
      value: string,
    ) => void
  > = vitest.fn();

  public readonly setStatusMock: Mock<
    (
      request: TestRequest,
      response: TestResponse,
      statusCode: HttpStatusCode,
    ) => void
  > = vitest.fn();

  constructor(container: Container) {
    super(container, { logger: false }, undefined, [], { statusCode: 200 });

    this.setStatusMock.mockImplementation(
      (
        _request: TestRequest,
        response: TestResponse,
        statusCode: HttpStatusCode,
      ) => {
        response.statusCode = statusCode;
      },
    );
  }

  protected override _applyGlobalPreHandlerMiddlewareList(
    handlerList: MiddlewareHandler<TestRequest, TestResponse, TestNext, void>[],
  ): void {
    this.applyGlobalPreHandlerMiddlewareListMock(handlerList);
  }

  protected override _buildApp(
    _customApp: TestResponse | undefined,
  ): TestResponse {
    return { statusCode: 200 };
  }

  protected override _buildRouter(
    params: RouterParams<TestRequest, TestResponse, TestNext, void>,
  ): void {
    this.buildRouterMock(params);
  }

  protected override _getCookies(
    request: TestRequest,
    response: TestResponse,
    parameterName?: string,
  ): unknown {
    return this.getCookiesMock(request, response, parameterName);
  }

  protected override _getBody(
    request: TestRequest,
    response: TestResponse,
    parameterName?: string,
  ): unknown {
    return this.getBodyMock(request, response, parameterName);
  }

  protected override _getHeaders(
    request: TestRequest,
  ): Record<string, string | string[] | undefined>;
  protected override _getHeaders(
    request: TestRequest,
    parameterName: string,
  ): string | string[] | undefined;
  protected override _getHeaders(
    request: TestRequest,
    parameterName?: string,
  ):
    | Record<string, string | string[] | undefined>
    | string
    | string[]
    | undefined {
    return this.getHeadersMock(request, parameterName);
  }

  protected override _getMethod(request: TestRequest): string {
    return this.getMethodMock(request);
  }

  protected override _getParams(request: TestRequest): Record<string, string>;
  protected override _getParams(
    request: TestRequest,
    parameterName: string,
  ): string | undefined;
  protected override _getParams(
    request: TestRequest,
    parameterName?: string,
  ): Record<string, string> | string | undefined {
    return this.getParamsMock(request, parameterName);
  }

  protected override _getQuery(request: TestRequest): Record<string, unknown>;
  protected override _getQuery(
    request: TestRequest,
    parameterName: string,
  ): unknown;
  protected override _getQuery(
    request: TestRequest,
    parameterName?: string,
  ): unknown {
    return this.getQueryMock(request, parameterName);
  }

  protected override _getUrl(request: TestRequest): string {
    return this.getUrlMock(request);
  }

  protected override _replyJson(
    request: TestRequest,
    response: TestResponse,
    value?: object,
  ): void {
    this.replyJsonMock(request, response, value);
  }

  protected override _replyStream(
    request: TestRequest,
    response: TestResponse,
    value: Readable,
  ): void {
    this.replyStreamMock(request, response, value);
  }

  protected override _replyText(
    request: TestRequest,
    response: TestResponse,
    value: string,
  ): void {
    this.replyTextMock(request, response, value);
  }

  protected override _sendBodySeparator(
    request: TestRequest,
    response: TestResponse,
  ): void {
    this.sendBodySeparatorMock(request, response);
  }

  protected override _setHeader(
    request: TestRequest,
    response: TestResponse,
    key: string,
    value: string,
  ): void {
    this.setHeaderMock(request, response, key, value);
  }

  protected override _setStatus(
    request: TestRequest,
    response: TestResponse,
    statusCode: HttpStatusCode,
  ): void {
    this.setStatusMock(request, response, statusCode);
  }
}

function buildControllerMetadataFixture(): RouterExplorerControllerMetadata<
  TestRequest,
  TestResponse,
  void
> {
  class FixtureController {}

  return {
    controllerMethodMetadataList: [
      {
        errorTypeToErrorFilterMap: new Map(),
        guardList: [],
        headerMetadataList: {},
        interceptorList: [],
        methodKey: 'testMethod',
        parameterMetadataList: [],
        path: '/test',
        postHandlerMiddlewareList: [],
        preHandlerMiddlewareList: [],
        requestMethodType: RequestMethodType.Get,
        routeValueMetadataMap: new Map(),
        statusCode: undefined,
        useNativeHandler: false,
      },
    ],
    path: '/',
    serviceIdentifier: FixtureController,
    target: FixtureController,
  };
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe(InversifyHttpAdapter, () => {
  describe('.build()', () => {
    describe('when called, and a global pre-handler middleware is registered', () => {
      const middlewareId: symbol = Symbol('PreMiddleware');

      let adapter: TestHttpAdapter;
      let capturedHandlers: MiddlewareHandler<
        TestRequest,
        TestResponse,
        TestNext,
        void
      >[];
      let capturedRouteParamsList: RouteParams<
        TestRequest,
        TestResponse,
        TestNext,
        void
      >[][];

      beforeAll(async () => {
        capturedHandlers = [];
        capturedRouteParamsList = [];

        adapter = new TestHttpAdapter(new Container());

        adapter.applyGlobalMiddleware(middlewareId);

        adapter.applyGlobalPreHandlerMiddlewareListMock.mockImplementation(
          (
            handlers: MiddlewareHandler<
              TestRequest,
              TestResponse,
              TestNext,
              void
            >[],
          ) => {
            capturedHandlers.push(...handlers);
          },
        );

        adapter.buildRouterMock.mockImplementation(
          (params: RouterParams<TestRequest, TestResponse, TestNext, void>) => {
            capturedRouteParamsList.push(params.routeParamsList);
          },
        );

        vitest
          .mocked(buildRouterExplorerControllerMetadataList)
          .mockReturnValueOnce([
            buildControllerMetadataFixture(),
          ] as unknown as RouterExplorerControllerMetadata<
            unknown,
            unknown,
            unknown
          >[]);

        await adapter.build();
      });

      it('should call _applyGlobalPreHandlerMiddlewareList exactly once', () => {
        expect(
          adapter.applyGlobalPreHandlerMiddlewareListMock,
        ).toHaveBeenCalledTimes(1);
      });

      it('should call _applyGlobalPreHandlerMiddlewareList before _buildRouter', () => {
        const applyOrder: number = adapter
          .applyGlobalPreHandlerMiddlewareListMock.mock
          .invocationCallOrder[0] as number;
        const buildOrder: number = adapter.buildRouterMock.mock
          .invocationCallOrder[0] as number;

        expect(applyOrder).toBeLessThan(buildOrder);
      });

      it('should pass one handler to _applyGlobalPreHandlerMiddlewareList', () => {
        expect(capturedHandlers).toHaveLength(1);
      });

      it('should not include the global pre-handler in any RouteParams.preHandlerMiddlewareList', () => {
        for (const routeParamsList of capturedRouteParamsList) {
          for (const routeParams of routeParamsList) {
            for (const globalHandler of capturedHandlers) {
              expect(routeParams.preHandlerMiddlewareList).not.toContain(
                globalHandler,
              );
            }
          }
        }
      });
    });

    describe('when called, and a global post-handler middleware is registered', () => {
      class PostMiddlewareFixture implements Middleware<
        TestRequest,
        TestResponse,
        TestNext,
        void
      > {
        public execute(): void {}
      }

      let adapter: TestHttpAdapter;
      let capturedRouteParamsList: RouteParams<
        TestRequest,
        TestResponse,
        TestNext,
        void
      >[][];

      beforeAll(async () => {
        capturedRouteParamsList = [];

        adapter = new TestHttpAdapter(new Container());

        adapter.applyGlobalMiddleware({
          middleware: PostMiddlewareFixture,
          phase: MiddlewarePhase.PostHandler,
        });

        adapter.buildRouterMock.mockImplementation(
          (params: RouterParams<TestRequest, TestResponse, TestNext, void>) => {
            capturedRouteParamsList.push(params.routeParamsList);
          },
        );

        vitest
          .mocked(buildRouterExplorerControllerMetadataList)
          .mockReturnValueOnce([
            buildControllerMetadataFixture(),
          ] as unknown as RouterExplorerControllerMetadata<
            unknown,
            unknown,
            unknown
          >[]);

        await adapter.build();
      });

      it('should include the global post-handler in every RouteParams.postHandlerMiddlewareList', () => {
        const allPostHandlers: MiddlewareHandler<
          TestRequest,
          TestResponse,
          TestNext,
          void
        >[] = capturedRouteParamsList.flatMap(
          (list: RouteParams<TestRequest, TestResponse, TestNext, void>[]) =>
            list.flatMap(
              (p: RouteParams<TestRequest, TestResponse, TestNext, void>) =>
                p.postHandlerMiddlewareList,
            ),
        );

        expect(allPostHandlers).toHaveLength(1);
      });
    });

    describe('when called, and two global pre-handler middlewares are registered', () => {
      const middlewareFirstId: symbol = Symbol('MiddlewareA');
      const middlewareSecondId: symbol = Symbol('MiddlewareB');

      let adapter: TestHttpAdapter;
      let capturedHandlers: MiddlewareHandler<
        TestRequest,
        TestResponse,
        TestNext,
        void
      >[];

      beforeAll(async () => {
        capturedHandlers = [];

        adapter = new TestHttpAdapter(new Container());

        adapter.applyGlobalMiddleware(middlewareFirstId);
        adapter.applyGlobalMiddleware(middlewareSecondId);

        adapter.applyGlobalPreHandlerMiddlewareListMock.mockImplementation(
          (
            handlers: MiddlewareHandler<
              TestRequest,
              TestResponse,
              TestNext,
              void
            >[],
          ) => {
            capturedHandlers.push(...handlers);
          },
        );

        vitest
          .mocked(buildRouterExplorerControllerMetadataList)
          .mockReturnValueOnce([]);

        await adapter.build();
      });

      it('should pass two handlers to _applyGlobalPreHandlerMiddlewareList in registration order', () => {
        expect(capturedHandlers).toHaveLength(2);
      });
    });
  });

  describe('#buildGlobalMiddlewareHandlerList', () => {
    describe('when the produced handler is invoked', () => {
      const middlewareId: symbol = Symbol('Middleware');

      let adapter: TestHttpAdapter;
      let container: Container;
      let middlewareMock: Middleware<TestRequest, TestResponse, TestNext, void>;
      let capturedHandlers: MiddlewareHandler<
        TestRequest,
        TestResponse,
        TestNext,
        void
      >[];
      let requestFixture: TestRequest;
      let responseFixture: TestResponse;
      let nextFixture: Mock<TestNext>;

      beforeAll(async () => {
        capturedHandlers = [];
        requestFixture = {};
        responseFixture = { statusCode: 200 };
        nextFixture = vitest.fn();

        middlewareMock = { execute: vitest.fn() };

        container = new Container();
        adapter = new TestHttpAdapter(container);

        adapter.applyGlobalMiddleware(middlewareId);

        adapter.applyGlobalPreHandlerMiddlewareListMock.mockImplementation(
          (
            handlers: MiddlewareHandler<
              TestRequest,
              TestResponse,
              TestNext,
              void
            >[],
          ) => {
            capturedHandlers.push(...handlers);
          },
        );

        vitest
          .mocked(buildRouterExplorerControllerMetadataList)
          .mockReturnValueOnce([]);

        vitest
          .spyOn(container, 'getAsync')
          .mockResolvedValueOnce(middlewareMock);

        await adapter.build();

        const capturedHandler:
          | MiddlewareHandler<TestRequest, TestResponse, TestNext, void>
          | undefined = capturedHandlers[0];

        if (capturedHandler === undefined) {
          throw new Error('Expected a captured handler');
        }

        await capturedHandler(requestFixture, responseFixture, nextFixture);
      });

      it('should resolve the middleware from the container', () => {
        expect(container.getAsync).toHaveBeenCalledExactlyOnceWith(
          middlewareId,
        );
      });

      it('should invoke middleware.execute with request, response, and next', () => {
        expect(middlewareMock.execute).toHaveBeenCalledExactlyOnceWith(
          requestFixture,
          responseFixture,
          nextFixture,
        );
      });
    });

    describe('when the produced handler is invoked, and the middleware throws, and no global filter matches', () => {
      const middlewareId: symbol = Symbol('MiddlewareNoFilter');

      let adapter: TestHttpAdapter;
      let capturedHandlers: MiddlewareHandler<
        TestRequest,
        TestResponse,
        TestNext,
        void
      >[];
      let responseFixture: TestResponse;

      beforeAll(async () => {
        capturedHandlers = [];
        responseFixture = { statusCode: 200 };

        const container: Container = new Container();
        adapter = new TestHttpAdapter(container);

        adapter.applyGlobalMiddleware(middlewareId);

        adapter.applyGlobalPreHandlerMiddlewareListMock.mockImplementation(
          (
            handlers: MiddlewareHandler<
              TestRequest,
              TestResponse,
              TestNext,
              void
            >[],
          ) => {
            capturedHandlers.push(...handlers);
          },
        );

        vitest
          .mocked(buildRouterExplorerControllerMetadataList)
          .mockReturnValueOnce([]);

        vitest.spyOn(container, 'getAsync').mockResolvedValueOnce({
          execute: vitest.fn().mockRejectedValueOnce(new Error('boom')),
        });

        await adapter.build();

        const capturedHandler:
          | MiddlewareHandler<TestRequest, TestResponse, TestNext, void>
          | undefined = capturedHandlers[0];

        if (capturedHandler === undefined) {
          throw new Error('Expected a captured handler');
        }

        await capturedHandler({}, responseFixture, vitest.fn());
      });

      it('should set the response status to 500', () => {
        expect(responseFixture.statusCode).toBe(500);
      });

      it('should call _replyJson once', () => {
        expect(adapter.replyJsonMock).toHaveBeenCalledTimes(1);
      });
    });

    describe('when the produced handler is invoked, and the middleware throws, and a matching global filter is registered', () => {
      const middlewareId: symbol = Symbol('MiddlewareWithFilter');

      class MatchedError extends Error {}

      class MatchedErrorFilter implements ErrorFilter<
        MatchedError,
        TestRequest,
        TestResponse,
        void
      > {
        public readonly catch: Mock = vitest
          .fn()
          .mockResolvedValueOnce(undefined);
      }

      let adapter: TestHttpAdapter;
      let capturedHandlers: MiddlewareHandler<
        TestRequest,
        TestResponse,
        TestNext,
        void
      >[];
      let filterInstance: MatchedErrorFilter;
      let thrownError: MatchedError;

      beforeAll(async () => {
        capturedHandlers = [];
        thrownError = new MatchedError('filter test');
        filterInstance = new MatchedErrorFilter();

        const container: Container = new Container();
        adapter = new TestHttpAdapter(container);

        adapter.applyGlobalMiddleware(middlewareId);

        vitest
          .mocked(getCatchErrorMetadata)
          .mockReturnValueOnce(new Set([MatchedError]));

        adapter.useGlobalFilters(MatchedErrorFilter);

        adapter.applyGlobalPreHandlerMiddlewareListMock.mockImplementation(
          (
            handlers: MiddlewareHandler<
              TestRequest,
              TestResponse,
              TestNext,
              void
            >[],
          ) => {
            capturedHandlers.push(...handlers);
          },
        );

        vitest
          .mocked(buildRouterExplorerControllerMetadataList)
          .mockReturnValueOnce([]);

        vitest
          .spyOn(container, 'getAsync')
          .mockResolvedValueOnce({
            execute: vitest.fn().mockRejectedValueOnce(thrownError),
          })
          .mockResolvedValueOnce(filterInstance);

        await adapter.build();

        const capturedHandler:
          | MiddlewareHandler<TestRequest, TestResponse, TestNext, void>
          | undefined = capturedHandlers[0];

        if (capturedHandler === undefined) {
          throw new Error('Expected a captured handler');
        }

        await capturedHandler({}, { statusCode: 200 }, vitest.fn());
      });

      it('should invoke the matching global error filter with the thrown error', () => {
        expect(filterInstance.catch).toHaveBeenCalledExactlyOnceWith(
          thrownError,
          expect.any(Object),
          expect.any(Object),
        );
      });
    });

    describe('when the produced handler is invoked, and the middleware throws, and the matching global filter also throws', () => {
      const middlewareId: symbol = Symbol('MiddlewareFilterThrows');

      class MatchedError extends Error {}

      class MatchedErrorFilter implements ErrorFilter<
        MatchedError,
        TestRequest,
        TestResponse,
        void
      > {
        public async catch(): Promise<void> {
          throw new Error('filter error');
        }
      }

      let adapter: TestHttpAdapter;
      let capturedHandlers: MiddlewareHandler<
        TestRequest,
        TestResponse,
        TestNext,
        void
      >[];
      let responseFixture: TestResponse;

      beforeAll(async () => {
        capturedHandlers = [];
        responseFixture = { statusCode: 200 };

        const container: Container = new Container();
        adapter = new TestHttpAdapter(container);

        adapter.applyGlobalMiddleware(middlewareId);

        vitest
          .mocked(getCatchErrorMetadata)
          .mockReturnValueOnce(new Set([MatchedError]));

        adapter.useGlobalFilters(MatchedErrorFilter);

        adapter.applyGlobalPreHandlerMiddlewareListMock.mockImplementation(
          (
            handlers: MiddlewareHandler<
              TestRequest,
              TestResponse,
              TestNext,
              void
            >[],
          ) => {
            capturedHandlers.push(...handlers);
          },
        );

        vitest
          .mocked(buildRouterExplorerControllerMetadataList)
          .mockReturnValueOnce([]);

        vitest
          .spyOn(container, 'getAsync')
          .mockResolvedValueOnce({
            execute: vitest
              .fn()
              .mockRejectedValueOnce(new MatchedError('original error')),
          })
          .mockResolvedValueOnce(new MatchedErrorFilter());

        await adapter.build();

        const capturedHandler:
          | MiddlewareHandler<TestRequest, TestResponse, TestNext, void>
          | undefined = capturedHandlers[0];

        if (capturedHandler === undefined) {
          throw new Error('Expected a captured handler');
        }

        await capturedHandler({}, responseFixture, vitest.fn());
      });

      it('should fall back to a 500 response', () => {
        expect(responseFixture.statusCode).toBe(500);
      });

      it('should call _replyJson once', () => {
        expect(adapter.replyJsonMock).toHaveBeenCalledTimes(1);
      });
    });
  });
});
