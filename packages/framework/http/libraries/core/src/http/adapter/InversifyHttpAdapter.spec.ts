import { beforeAll, describe, expect, it } from 'vitest';

import { type Readable } from 'node:stream';

import { Container } from 'inversify';

import { Controller } from '../decorators/Controller.js';
import { Get } from '../decorators/Get.js';
import { type HttpStatusCode } from '../models/HttpStatusCode.js';
import { type MiddlewareHandler } from '../models/MiddlewareHandler.js';
import { type RequestTransformer } from '../models/RequestTransformer.js';
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

  public resolveRequestTransformerList(
    ...params: Parameters<TestHttpAdapter['_resolveRequestTransformerList']>
  ): RequestTransformer<TestRequest, TestResponse>[] | undefined {
    return this._resolveRequestTransformerList(...params);
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

class TestRequestTransformerHttpAdapter extends TestHttpAdapter {
  public readonly requestTransformerListFixture: RequestTransformer<
    TestRequest,
    TestResponse
  >[] = [(request: TestRequest): TestRequest => request];

  protected override _resolveRequestTransformerList(): RequestTransformer<
    TestRequest,
    TestResponse
  >[] {
    return this.requestTransformerListFixture;
  }
}

@Controller('/test')
class TestController {
  @Get()
  public async get(): Promise<string> {
    return 'test';
  }
}

function buildContainer(): Container {
  const container: Container = new Container();

  container.bind(TestController).toSelf().inSingletonScope();

  return container;
}

describe(InversifyHttpAdapter, () => {
  describe('._resolveRequestTransformerList', () => {
    describe('when called, and the adapter does not override it', () => {
      let result: unknown;

      beforeAll(() => {
        const adapter: TestHttpAdapter = new TestHttpAdapter(buildContainer());

        result = adapter.resolveRequestTransformerList(
          {
            controllerMethodMetadataList: [],
            path: '/test',
            serviceIdentifier: TestController,
            target: TestController,
          },
          {
            errorTypeToErrorFilterMap: new Map(),
            guardList: [],
            headerMetadataList: {},
            interceptorList: [],
            methodKey: 'get',
            parameterMetadataList: [],
            path: '/',
            postHandlerMiddlewareList: [],
            preHandlerMiddlewareList: [],
            requestMethodType: 'get' as never,
            routeValueMetadataMap: new Map(),
            statusCode: undefined,
            useNativeHandler: false,
          },
        );
      });

      it('should return undefined', () => {
        expect(result).toBeUndefined();
      });
    });
  });

  describe('.build', () => {
    describe('when called, and the adapter does not override _resolveRequestTransformerList()', () => {
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

      it('should build route params with undefined requestTransformerList', () => {
        expect(routeParams.requestTransformerList).toBeUndefined();
      });

      it('should build router params with an error handler', () => {
        expect(routerParams.handleError).toBeInstanceOf(Function);
      });
    });

    describe('when called, and the adapter overrides _resolveRequestTransformerList()', () => {
      let adapter: TestRequestTransformerHttpAdapter;
      let routeParams: RouteParams<TestRequest, TestResponse, () => void, void>;

      beforeAll(async () => {
        adapter = new TestRequestTransformerHttpAdapter(buildContainer());

        await adapter.build();

        [routeParams] = adapter.routerParamsList[0]?.routeParamsList as [
          RouteParams<TestRequest, TestResponse, () => void, void>,
        ];
      });

      it('should build route params with the resolved requestTransformerList', () => {
        expect(routeParams.requestTransformerList).toBe(
          adapter.requestTransformerListFixture,
        );
      });
    });
  });
});
