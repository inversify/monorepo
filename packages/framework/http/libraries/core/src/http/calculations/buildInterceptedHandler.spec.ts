import {
  afterAll,
  beforeAll,
  describe,
  expect,
  it,
  Mock,
  Mocked,
  vitest,
} from 'vitest';

import {
  Interceptor,
  InterceptorTransformObject,
} from '@inversifyjs/framework-core';
import { Container, Newable, ServiceIdentifier } from 'inversify';

import { RouterExplorerControllerMethodMetadata } from '../../routerExplorer/model/RouterExplorerControllerMethodMetadata';
import { ControllerResponse } from '../models/ControllerResponse';
import { RequestHandler } from '../models/RequestHandler';
import { buildInterceptedHandler } from './buildInterceptedHandler';

describe(buildInterceptedHandler, () => {
  let serviceIdentifierFixture: ServiceIdentifier;
  let containerMock: Mocked<Container>;
  let buildHandlerParamsMock: Mock<
    (
      request: unknown,
      response: unknown,
      next: () => void,
    ) => Promise<unknown[]>
  >;
  let handleErrorMock: Mock<
    (request: unknown, response: unknown, error: unknown) => Promise<string>
  >;
  let replyMock: Mock<
    (req: unknown, res: unknown, value: ControllerResponse) => string
  >;
  let setHeadersMock: Mock<
    (
      request: unknown,
      response: unknown,
      headerList: [string, string][],
    ) => void
  >;

  let requestFixture: unknown;
  let responseFixture: unknown;
  let nextFixture: () => void;

  beforeAll(() => {
    serviceIdentifierFixture = class TestController {
      public testMethod(): ControllerResponse {
        return { body: 'test' };
      }
    };

    containerMock = {
      getAsync: vitest.fn(),
    } as Partial<Mocked<Container>> as Mocked<Container>;

    buildHandlerParamsMock = vitest.fn();
    handleErrorMock = vitest.fn();
    replyMock = vitest.fn();
    setHeadersMock = vitest.fn();

    requestFixture = { url: '/test' };
    responseFixture = { status: 200 };
    nextFixture = vitest.fn();
  });

  describe('having no interceptors', () => {
    let routerExplorerControllerMethodMetadataFixture: RouterExplorerControllerMethodMetadata<
      unknown,
      unknown,
      unknown
    >;

    beforeAll(() => {
      routerExplorerControllerMethodMetadataFixture = {
        headerMetadataList: [['Content-Type', 'application/json']],
        interceptorList: [],
        methodKey: 'testMethod',
      } as unknown as RouterExplorerControllerMethodMetadata<
        unknown,
        unknown,
        unknown
      >;
    });

    describe('when called', () => {
      let controllerMock: { testMethod: Mock };
      let handlerParamsFixture: unknown[];
      let controllerResponseFixture: ControllerResponse;
      let replyResultFixture: string;

      let result: unknown;

      beforeAll(async () => {
        controllerMock = {
          testMethod: vitest.fn(),
        };
        handlerParamsFixture = ['param1', 'param2'];
        controllerResponseFixture = { body: 'test response' };
        replyResultFixture = 'reply result';

        containerMock.getAsync.mockResolvedValueOnce(controllerMock);
        buildHandlerParamsMock.mockResolvedValueOnce(handlerParamsFixture);
        controllerMock.testMethod.mockResolvedValueOnce(
          controllerResponseFixture,
        );
        replyMock.mockReturnValueOnce(replyResultFixture);

        const handler: RequestHandler<unknown, unknown, () => void, string> =
          buildInterceptedHandler(
            serviceIdentifierFixture,
            routerExplorerControllerMethodMetadataFixture,
            containerMock,
            buildHandlerParamsMock,
            handleErrorMock,
            replyMock,
            setHeadersMock,
          );

        result = await handler(requestFixture, responseFixture, nextFixture);
      });

      afterAll(() => {
        vitest.clearAllMocks();
      });

      it('should call container.getAsync()', () => {
        expect(containerMock.getAsync).toHaveBeenCalledExactlyOnceWith(
          serviceIdentifierFixture,
        );
      });

      it('should call buildHandlerParams()', () => {
        expect(buildHandlerParamsMock).toHaveBeenCalledExactlyOnceWith(
          requestFixture,
          responseFixture,
          nextFixture,
        );
      });

      it('should call setHeaders()', () => {
        expect(setHeadersMock).toHaveBeenCalledExactlyOnceWith(
          requestFixture,
          responseFixture,
          routerExplorerControllerMethodMetadataFixture.headerMetadataList,
        );
      });

      it('should call controller.testMethod()', () => {
        expect(controllerMock.testMethod).toHaveBeenCalledExactlyOnceWith(
          ...handlerParamsFixture,
        );
      });

      it('should call reply()', () => {
        expect(replyMock).toHaveBeenCalledExactlyOnceWith(
          requestFixture,
          responseFixture,
          controllerResponseFixture,
        );
      });

      it('should return reply result', () => {
        expect(result).toBe(replyResultFixture);
      });
    });

    describe('when called, and an error is thrown', () => {
      let errorFixture: Error;
      let errorResultFixture: string;

      let result: unknown;

      beforeAll(async () => {
        errorFixture = new Error('Test error');
        errorResultFixture = 'error result';

        containerMock.getAsync.mockRejectedValueOnce(errorFixture);
        handleErrorMock.mockResolvedValueOnce(errorResultFixture);

        const handler: RequestHandler<unknown, unknown, () => void, string> =
          buildInterceptedHandler(
            serviceIdentifierFixture,
            routerExplorerControllerMethodMetadataFixture,
            containerMock,
            buildHandlerParamsMock,
            handleErrorMock,
            replyMock,
            setHeadersMock,
          );

        result = await handler(requestFixture, responseFixture, nextFixture);
      });

      afterAll(() => {
        vitest.clearAllMocks();
      });

      it('should call handleError()', () => {
        expect(handleErrorMock).toHaveBeenCalledExactlyOnceWith(
          requestFixture,
          responseFixture,
          errorFixture,
        );
      });

      it('should return error result', () => {
        expect(result).toBe(errorResultFixture);
      });
    });
  });

  describe('having interceptors', () => {
    let firstInterceptorMock: Mocked<Interceptor<unknown, unknown>>;
    let secondInterceptorMock: Mocked<Interceptor<unknown, unknown>>;
    let firstInterceptorType: Newable<Interceptor<unknown, unknown>>;
    let secondInterceptorType: Newable<Interceptor<unknown, unknown>>;
    let routerExplorerControllerMethodMetadataFixture: RouterExplorerControllerMethodMetadata<
      unknown,
      unknown,
      unknown
    >;

    beforeAll(() => {
      firstInterceptorMock = {
        intercept: vitest.fn(),
      };
      secondInterceptorMock = {
        intercept: vitest.fn(),
      };

      firstInterceptorType = class FirstInterceptor {} as Newable<
        Interceptor<unknown, unknown>
      >;
      secondInterceptorType = class SecondInterceptor {} as Newable<
        Interceptor<unknown, unknown>
      >;

      routerExplorerControllerMethodMetadataFixture = {
        headerMetadataList: [['Content-Type', 'application/json']],
        interceptorList: [firstInterceptorType, secondInterceptorType],
        methodKey: 'testMethod',
      } as unknown as RouterExplorerControllerMethodMetadata<
        unknown,
        unknown,
        unknown
      >;
    });

    describe('when called', () => {
      let stamps: string[];
      let controllerMock: { testMethod: Mock };
      let handlerParamsFixture: unknown[];
      let controllerResponseFixture: ControllerResponse;
      let replyResultFixture: string;

      let result: unknown;

      beforeAll(async () => {
        stamps = [];
        controllerMock = {
          testMethod: vitest.fn(),
        };
        handlerParamsFixture = ['param1', 'param2'];
        controllerResponseFixture = { body: 'test response' };
        replyResultFixture = 'reply result';

        firstInterceptorMock.intercept.mockImplementationOnce(
          async (
            _request: unknown,
            _response: unknown,
            next: () => Promise<InterceptorTransformObject>,
          ) => {
            stamps.push('first-interceptor-before');
            await next();
            stamps.push('first-interceptor-after');
          },
        );

        secondInterceptorMock.intercept.mockImplementationOnce(
          async (
            _request: unknown,
            _response: unknown,
            next: () => Promise<InterceptorTransformObject>,
          ) => {
            stamps.push('second-interceptor-before');
            await next();
            stamps.push('second-interceptor-after');
          },
        );

        containerMock.getAsync
          .mockResolvedValueOnce(firstInterceptorMock)
          .mockResolvedValueOnce(secondInterceptorMock)
          .mockResolvedValueOnce(controllerMock);

        buildHandlerParamsMock.mockResolvedValueOnce(handlerParamsFixture);

        controllerMock.testMethod.mockImplementationOnce(() => {
          stamps.push('controller-method');
          return controllerResponseFixture;
        });

        replyMock.mockReturnValueOnce(replyResultFixture);

        const handler: RequestHandler<unknown, unknown, () => void, string> =
          buildInterceptedHandler(
            serviceIdentifierFixture,
            routerExplorerControllerMethodMetadataFixture,
            containerMock,
            buildHandlerParamsMock,
            handleErrorMock,
            replyMock,
            setHeadersMock,
          );

        result = await handler(requestFixture, responseFixture, nextFixture);
      });

      afterAll(() => {
        vitest.clearAllMocks();
      });

      it('should call container.getAsync() for interceptors and controller', () => {
        expect(containerMock.getAsync).toHaveBeenCalledTimes(3);
        expect(containerMock.getAsync).toHaveBeenNthCalledWith(
          1,
          firstInterceptorType,
        );
        expect(containerMock.getAsync).toHaveBeenNthCalledWith(
          2,
          secondInterceptorType,
        );
        expect(containerMock.getAsync).toHaveBeenNthCalledWith(
          3,
          serviceIdentifierFixture,
        );
      });

      it('should call firstInterceptor.intercept()', () => {
        expect(firstInterceptorMock.intercept).toHaveBeenCalledExactlyOnceWith(
          requestFixture,
          responseFixture,
          expect.any(Function),
        );
      });

      it('should call secondInterceptor.intercept()', () => {
        expect(secondInterceptorMock.intercept).toHaveBeenCalledExactlyOnceWith(
          requestFixture,
          responseFixture,
          expect.any(Function),
        );
      });

      it('should call buildHandlerParams()', () => {
        expect(buildHandlerParamsMock).toHaveBeenCalledExactlyOnceWith(
          requestFixture,
          responseFixture,
          nextFixture,
        );
      });

      it('should call setHeaders()', () => {
        expect(setHeadersMock).toHaveBeenCalledExactlyOnceWith(
          requestFixture,
          responseFixture,
          routerExplorerControllerMethodMetadataFixture.headerMetadataList,
        );
      });

      it('should call controller method with handler params', () => {
        expect(controllerMock.testMethod).toHaveBeenCalledExactlyOnceWith(
          ...handlerParamsFixture,
        );
      });

      it('should call reply()', () => {
        expect(replyMock).toHaveBeenCalledExactlyOnceWith(
          requestFixture,
          responseFixture,
          controllerResponseFixture,
        );
      });

      it('should call everything in the expected order', () => {
        expect(stamps).toStrictEqual([
          'first-interceptor-before',
          'second-interceptor-before',
          'controller-method',
          'second-interceptor-after',
          'first-interceptor-after',
        ]);
      });

      it('should return reply result', () => {
        expect(result).toBe(replyResultFixture);
      });
    });

    describe('when called, and interceptor.intercept() calls next().push()', () => {
      let stamps: string[];
      let controllerMock: { testMethod: Mock };
      let handlerParamsFixture: unknown[];
      let controllerResponseFixture: ControllerResponse;
      let replyResultFixture: string;
      let transformedResultFixture: ControllerResponse;

      let result: unknown;

      beforeAll(async () => {
        stamps = [];
        controllerMock = {
          testMethod: vitest.fn(),
        };
        handlerParamsFixture = ['param1', 'param2'];
        controllerResponseFixture = { body: 'test response' };
        replyResultFixture = 'reply result';
        transformedResultFixture = { body: 'transformed test response' };

        firstInterceptorMock.intercept.mockImplementationOnce(
          async (
            _request: unknown,
            _response: unknown,
            next: () => Promise<InterceptorTransformObject>,
          ) => {
            stamps.push('first-interceptor-before');
            (await next()).push(() => transformedResultFixture);
            stamps.push('first-interceptor-after');
          },
        );

        secondInterceptorMock.intercept.mockImplementationOnce(
          async (
            _request: unknown,
            _response: unknown,
            next: () => Promise<InterceptorTransformObject>,
          ) => {
            stamps.push('second-interceptor-before');
            await next();
            stamps.push('second-interceptor-after');
          },
        );

        containerMock.getAsync
          .mockResolvedValueOnce(firstInterceptorMock)
          .mockResolvedValueOnce(secondInterceptorMock)
          .mockResolvedValueOnce(controllerMock);

        buildHandlerParamsMock.mockResolvedValueOnce(handlerParamsFixture);

        controllerMock.testMethod.mockImplementationOnce(() => {
          stamps.push('controller-method');
          return controllerResponseFixture;
        });

        replyMock.mockReturnValueOnce(replyResultFixture);

        const handler: RequestHandler<unknown, unknown, () => void, string> =
          buildInterceptedHandler(
            serviceIdentifierFixture,
            routerExplorerControllerMethodMetadataFixture,
            containerMock,
            buildHandlerParamsMock,
            handleErrorMock,
            replyMock,
            setHeadersMock,
          );

        result = await handler(requestFixture, responseFixture, nextFixture);
      });

      afterAll(() => {
        vitest.clearAllMocks();
      });

      it('should call container.getAsync() for interceptors and controller', () => {
        expect(containerMock.getAsync).toHaveBeenCalledTimes(3);
        expect(containerMock.getAsync).toHaveBeenNthCalledWith(
          1,
          firstInterceptorType,
        );
        expect(containerMock.getAsync).toHaveBeenNthCalledWith(
          2,
          secondInterceptorType,
        );
        expect(containerMock.getAsync).toHaveBeenNthCalledWith(
          3,
          serviceIdentifierFixture,
        );
      });

      it('should call firstInterceptor.intercept()', () => {
        expect(firstInterceptorMock.intercept).toHaveBeenCalledExactlyOnceWith(
          requestFixture,
          responseFixture,
          expect.any(Function),
        );
      });

      it('should call secondInterceptor.intercept()', () => {
        expect(secondInterceptorMock.intercept).toHaveBeenCalledExactlyOnceWith(
          requestFixture,
          responseFixture,
          expect.any(Function),
        );
      });

      it('should call buildHandlerParams()', () => {
        expect(buildHandlerParamsMock).toHaveBeenCalledExactlyOnceWith(
          requestFixture,
          responseFixture,
          nextFixture,
        );
      });

      it('should call setHeaders()', () => {
        expect(setHeadersMock).toHaveBeenCalledExactlyOnceWith(
          requestFixture,
          responseFixture,
          routerExplorerControllerMethodMetadataFixture.headerMetadataList,
        );
      });

      it('should call controller method with handler params', () => {
        expect(controllerMock.testMethod).toHaveBeenCalledExactlyOnceWith(
          ...handlerParamsFixture,
        );
      });

      it('should call reply()', () => {
        expect(replyMock).toHaveBeenCalledExactlyOnceWith(
          requestFixture,
          responseFixture,
          transformedResultFixture,
        );
      });

      it('should call everything in the expected order', () => {
        expect(stamps).toStrictEqual([
          'first-interceptor-before',
          'second-interceptor-before',
          'controller-method',
          'second-interceptor-after',
          'first-interceptor-after',
        ]);
      });

      it('should return reply result', () => {
        expect(result).toBe(replyResultFixture);
      });
    });

    describe('when called, and an interceptor throws an error', () => {
      let errorFixture: Error;
      let errorResultFixture: string;

      let result: unknown;

      beforeAll(async () => {
        errorFixture = new Error('Interceptor error');
        errorResultFixture = 'error result';

        firstInterceptorMock.intercept.mockRejectedValueOnce(errorFixture);

        containerMock.getAsync.mockResolvedValueOnce(firstInterceptorMock);
        handleErrorMock.mockResolvedValueOnce(errorResultFixture);

        const handler: RequestHandler<unknown, unknown, () => void, string> =
          buildInterceptedHandler(
            serviceIdentifierFixture,
            routerExplorerControllerMethodMetadataFixture,
            containerMock,
            buildHandlerParamsMock,
            handleErrorMock,
            replyMock,
            setHeadersMock,
          );

        result = await handler(requestFixture, responseFixture, nextFixture);
      });

      afterAll(() => {
        vitest.clearAllMocks();
      });

      it('should call handleError()', () => {
        expect(handleErrorMock).toHaveBeenCalledExactlyOnceWith(
          requestFixture,
          responseFixture,
          errorFixture,
        );
      });

      it('should return error result', () => {
        expect(result).toBe(errorResultFixture);
      });
    });

    describe('when called, and the controller method throws an error', () => {
      let errorFixture: Error;
      let errorResultFixture: string;

      let result: unknown;

      beforeAll(async () => {
        errorFixture = new Error('Controller error');
        errorResultFixture = 'error result';

        firstInterceptorMock.intercept.mockImplementationOnce(
          async (
            _request: unknown,
            _response: unknown,
            next: () => Promise<InterceptorTransformObject>,
          ) => {
            await next();
          },
        );

        secondInterceptorMock.intercept.mockImplementationOnce(
          async (
            _request: unknown,
            _response: unknown,
            next: () => Promise<InterceptorTransformObject>,
          ) => {
            await next();
          },
        );

        const controllerMock: unknown = {
          testMethod: vitest.fn().mockRejectedValueOnce(errorFixture),
        };

        containerMock.getAsync
          .mockResolvedValueOnce(firstInterceptorMock)
          .mockResolvedValueOnce(secondInterceptorMock)
          .mockResolvedValueOnce(controllerMock);

        buildHandlerParamsMock.mockResolvedValueOnce(['param1', 'param2']);
        handleErrorMock.mockResolvedValueOnce(errorResultFixture);

        const handler: RequestHandler<unknown, unknown, () => void, string> =
          buildInterceptedHandler(
            serviceIdentifierFixture,
            routerExplorerControllerMethodMetadataFixture,
            containerMock,
            buildHandlerParamsMock,
            handleErrorMock,
            replyMock,
            setHeadersMock,
          );

        result = await handler(requestFixture, responseFixture, nextFixture);
      });

      afterAll(() => {
        vitest.clearAllMocks();
      });

      it('should call handleError()', () => {
        expect(handleErrorMock).toHaveBeenCalledExactlyOnceWith(
          requestFixture,
          responseFixture,
          errorFixture,
        );
      });

      it('should return error result', () => {
        expect(result).toBe(errorResultFixture);
      });
    });
  });
});
