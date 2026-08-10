import { beforeAll, describe, expect, it, type Mock, vitest } from 'vitest';

import {
  ApplyMiddleware,
  CatchError,
  Controller,
  Get,
  UseErrorFilter,
} from '@inversifyjs/http-core';
import { type Logger } from '@inversifyjs/logger';
import { Container, injectable } from 'inversify';
import {
  type HttpRequest,
  type HttpResponse,
  type TemplatedApp,
} from 'uWebSockets.js';

import { UseRequestTransformers } from '../decorators/UseRequestTransformers.js';
import { type RequestTransformer } from '../models/RequestTransformer.js';
import { type UwebSocketsErrorFilter } from '../models/UwebSocketsErrorFilter.js';
import { type UwebSocketsMiddleware } from '../models/UwebSocketsMiddleware.js';
import { InversifyUwebSocketsHttpAdapter } from './InversifyUwebSocketsHttpAdapter.js';

type RouteHandler = (
  response: HttpResponse,
  request: HttpRequest,
) => void | Promise<void>;

interface TemplatedAppMock {
  any: Mock<(pattern: string, handler: RouteHandler) => TemplatedApp>;
  get: Mock<(pattern: string, handler: RouteHandler) => TemplatedApp>;
}

class TransformerError extends Error {}

function buildLoggerMock(): Logger {
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

function buildTemplatedAppMock(): TemplatedAppMock {
  return {
    any: vitest.fn(),
    get: vitest.fn(),
  };
}

function buildNativeRequestMock(): HttpRequest {
  return {
    getMethod: vitest.fn().mockReturnValue('get'),
  } as unknown as HttpRequest;
}

function buildResponseMock(): HttpResponse {
  return {
    cork: vitest.fn((callback: () => void): void => {
      callback();
    }),
    end: vitest.fn(),
    onAborted: vitest.fn(),
    writeHeader: vitest.fn(),
    writeStatus: vitest.fn(),
  } as unknown as HttpResponse;
}

function getRouteHandler(templatedAppMock: TemplatedAppMock): RouteHandler {
  const [, routeHandler]: [string, RouteHandler] = templatedAppMock.get.mock
    .calls[0] as [string, RouteHandler];

  return routeHandler;
}

async function buildAdapter(
  container: Container,
  templatedAppMock: TemplatedAppMock,
): Promise<InversifyUwebSocketsHttpAdapter> {
  const adapter: InversifyUwebSocketsHttpAdapter =
    new InversifyUwebSocketsHttpAdapter(
      container,
      { logger: buildLoggerMock() },
      templatedAppMock as unknown as TemplatedApp,
    );

  await adapter.build();

  return adapter;
}

describe(InversifyUwebSocketsHttpAdapter, () => {
  describe('having a controller method with no request transformers', () => {
    let requestListFixture: HttpRequest[];
    let templatedAppMock: TemplatedAppMock;

    beforeAll(async () => {
      requestListFixture = [];

      @injectable()
      class TestMiddleware implements UwebSocketsMiddleware {
        public execute(
          request: HttpRequest,
          _response: HttpResponse,
          next: () => void,
        ): void {
          requestListFixture.push(request);

          next();
        }
      }

      @Controller('/no-transformers')
      class TestController {
        @ApplyMiddleware(TestMiddleware)
        @Get()
        public async get(): Promise<string> {
          return 'test';
        }
      }

      const container: Container = new Container();

      container.bind(TestMiddleware).toSelf().inSingletonScope();
      container.bind(TestController).toSelf().inSingletonScope();

      templatedAppMock = buildTemplatedAppMock();

      await buildAdapter(container, templatedAppMock);
    });

    describe('when the registered route handler is called', () => {
      let nativeRequestFixture: HttpRequest;
      let responseMock: HttpResponse;

      beforeAll(async () => {
        nativeRequestFixture = buildNativeRequestMock();
        responseMock = buildResponseMock();

        await getRouteHandler(templatedAppMock)(
          responseMock,
          nativeRequestFixture,
        );
      });

      it('should register the route', () => {
        expect(templatedAppMock.get).toHaveBeenCalledExactlyOnceWith(
          '/no-transformers',
          expect.any(Function),
        );
      });

      it('should register an onAborted handler', () => {
        expect(responseMock.onAborted).toHaveBeenCalledExactlyOnceWith(
          expect.any(Function),
        );
      });

      it('should call the middleware list with the native request', () => {
        expect(requestListFixture).toStrictEqual([nativeRequestFixture]);
      });
    });
  });

  describe('having a controller method with two request transformers', () => {
    let firstTransformedRequestFixture: HttpRequest;
    let secondTransformedRequestFixture: HttpRequest;
    let requestListFixture: HttpRequest[];
    let requestTransformerCallList: HttpRequest[];
    let templatedAppMock: TemplatedAppMock;

    beforeAll(async () => {
      firstTransformedRequestFixture = buildNativeRequestMock();
      secondTransformedRequestFixture = buildNativeRequestMock();
      requestListFixture = [];
      requestTransformerCallList = [];

      const firstRequestTransformer: RequestTransformer = (
        request: HttpRequest,
      ): HttpRequest => {
        requestTransformerCallList.push(request);

        return firstTransformedRequestFixture;
      };

      const secondRequestTransformer: RequestTransformer = async (
        request: HttpRequest,
      ): Promise<HttpRequest> => {
        requestTransformerCallList.push(request);

        return Promise.resolve(secondTransformedRequestFixture);
      };

      @injectable()
      class TestMiddleware implements UwebSocketsMiddleware {
        public execute(
          request: HttpRequest,
          _response: HttpResponse,
          next: () => void,
        ): void {
          requestListFixture.push(request);

          next();
        }
      }

      @Controller('/transformers')
      class TestController {
        @UseRequestTransformers(
          firstRequestTransformer,
          secondRequestTransformer,
        )
        @ApplyMiddleware(TestMiddleware)
        @Get()
        public async get(): Promise<string> {
          return 'test';
        }
      }

      const container: Container = new Container();

      container.bind(TestMiddleware).toSelf().inSingletonScope();
      container.bind(TestController).toSelf().inSingletonScope();

      templatedAppMock = buildTemplatedAppMock();

      await buildAdapter(container, templatedAppMock);
    });

    describe('when the registered route handler is called', () => {
      let nativeRequestFixture: HttpRequest;
      let responseMock: HttpResponse;

      beforeAll(async () => {
        nativeRequestFixture = buildNativeRequestMock();
        responseMock = buildResponseMock();

        await getRouteHandler(templatedAppMock)(
          responseMock,
          nativeRequestFixture,
        );
      });

      it('should register an onAborted handler', () => {
        expect(responseMock.onAborted).toHaveBeenCalledExactlyOnceWith(
          expect.any(Function),
        );
      });

      it('should call the request transformers sequentially', () => {
        expect(requestTransformerCallList).toStrictEqual([
          nativeRequestFixture,
          firstTransformedRequestFixture,
        ]);
      });

      it('should call the middleware list with the last transformed request', () => {
        expect(requestListFixture).toStrictEqual([
          secondTransformedRequestFixture,
        ]);
      });
    });
  });

  describe('having a controller method with a request transformer and a global pre handler middleware', () => {
    let executionOrderFixture: string[];
    let templatedAppMock: TemplatedAppMock;

    beforeAll(async () => {
      executionOrderFixture = [];

      @injectable()
      class TestGlobalMiddleware implements UwebSocketsMiddleware {
        public execute(
          _request: HttpRequest,
          _response: HttpResponse,
          next: () => void,
        ): void {
          executionOrderFixture.push('global-middleware');

          next();
        }
      }

      const requestTransformer: RequestTransformer = (
        request: HttpRequest,
      ): HttpRequest => {
        executionOrderFixture.push('request-transformer');

        return request;
      };

      @Controller('/global-middleware')
      class TestController {
        @UseRequestTransformers(requestTransformer)
        @Get()
        public async get(): Promise<string> {
          return 'test';
        }
      }

      const container: Container = new Container();

      container.bind(TestGlobalMiddleware).toSelf().inSingletonScope();
      container.bind(TestController).toSelf().inSingletonScope();

      templatedAppMock = buildTemplatedAppMock();

      const adapter: InversifyUwebSocketsHttpAdapter =
        new InversifyUwebSocketsHttpAdapter(
          container,
          { logger: buildLoggerMock() },
          templatedAppMock as unknown as TemplatedApp,
        );

      adapter.applyGlobalMiddleware(TestGlobalMiddleware);

      await adapter.build();
    });

    describe('when the registered route handler is called', () => {
      beforeAll(async () => {
        await getRouteHandler(templatedAppMock)(
          buildResponseMock(),
          buildNativeRequestMock(),
        );
      });

      it('should call the request transformer before the global pre handler middleware', () => {
        expect(executionOrderFixture).toStrictEqual([
          'request-transformer',
          'global-middleware',
        ]);
      });
    });
  });

  describe('having a controller method with a throwing request transformer and a route error filter', () => {
    let errorFilterCallList: unknown[];
    let requestListFixture: HttpRequest[];
    let templatedAppMock: TemplatedAppMock;

    beforeAll(async () => {
      errorFilterCallList = [];
      requestListFixture = [];

      @CatchError(TransformerError)
      class TestErrorFilter implements UwebSocketsErrorFilter {
        public catch(
          error: unknown,
          _request: HttpRequest,
          response: HttpResponse,
        ): void {
          errorFilterCallList.push(error);

          response.cork((): void => {
            response.end('handled');
          });
        }
      }

      @injectable()
      class TestMiddleware implements UwebSocketsMiddleware {
        public execute(
          request: HttpRequest,
          _response: HttpResponse,
          next: () => void,
        ): void {
          requestListFixture.push(request);

          next();
        }
      }

      const requestTransformer: RequestTransformer = (): HttpRequest => {
        throw new TransformerError('Transformer error');
      };

      @Controller('/throwing-transformer')
      class TestController {
        @UseRequestTransformers(requestTransformer)
        @ApplyMiddleware(TestMiddleware)
        @UseErrorFilter(TestErrorFilter)
        @Get()
        public async get(): Promise<string> {
          return 'test';
        }
      }

      const container: Container = new Container();

      container.bind(TestErrorFilter).toSelf().inSingletonScope();
      container.bind(TestMiddleware).toSelf().inSingletonScope();
      container.bind(TestController).toSelf().inSingletonScope();

      templatedAppMock = buildTemplatedAppMock();

      await buildAdapter(container, templatedAppMock);
    });

    describe('when the registered route handler is called', () => {
      let responseMock: HttpResponse;

      beforeAll(async () => {
        responseMock = buildResponseMock();

        await getRouteHandler(templatedAppMock)(
          responseMock,
          buildNativeRequestMock(),
        );
      });

      it('should call the route error filter', () => {
        expect(errorFilterCallList).toHaveLength(1);
        expect(errorFilterCallList[0]).toBeInstanceOf(TransformerError);
      });

      it('should not call the middleware list', () => {
        expect(requestListFixture).toStrictEqual([]);
      });

      it('should reply with the error filter response', () => {
        expect(responseMock.end).toHaveBeenCalledExactlyOnceWith('handled');
      });
    });
  });

  describe('having a controller method with a rejecting request transformer and a route error filter', () => {
    let errorFilterCallList: unknown[];
    let templatedAppMock: TemplatedAppMock;

    beforeAll(async () => {
      errorFilterCallList = [];

      @CatchError(TransformerError)
      class TestErrorFilter implements UwebSocketsErrorFilter {
        public catch(
          error: unknown,
          _request: HttpRequest,
          response: HttpResponse,
        ): void {
          errorFilterCallList.push(error);

          response.cork((): void => {
            response.end('handled');
          });
        }
      }

      const requestTransformer: RequestTransformer =
        async (): Promise<HttpRequest> =>
          Promise.reject(new TransformerError('Rejected transformer'));

      @Controller('/rejecting-transformer')
      class TestController {
        @UseRequestTransformers(requestTransformer)
        @UseErrorFilter(TestErrorFilter)
        @Get()
        public async get(): Promise<string> {
          return 'test';
        }
      }

      const container: Container = new Container();

      container.bind(TestErrorFilter).toSelf().inSingletonScope();
      container.bind(TestController).toSelf().inSingletonScope();

      templatedAppMock = buildTemplatedAppMock();

      await buildAdapter(container, templatedAppMock);
    });

    describe('when the registered route handler is called', () => {
      beforeAll(async () => {
        await getRouteHandler(templatedAppMock)(
          buildResponseMock(),
          buildNativeRequestMock(),
        );
      });

      it('should call the route error filter', () => {
        expect(errorFilterCallList).toHaveLength(1);
        expect(errorFilterCallList[0]).toBeInstanceOf(TransformerError);
      });
    });
  });
});
