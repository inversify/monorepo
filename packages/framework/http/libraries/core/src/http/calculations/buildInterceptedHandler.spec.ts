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
import { Container, Newable } from 'inversify';

import { RouterExplorerControllerMethodMetadata } from '../../routerExplorer/model/RouterExplorerControllerMethodMetadata';
import { ControllerResponse } from '../models/ControllerResponse';
import { RequestHandler } from '../models/RequestHandler';
import { buildInterceptedHandler } from './buildInterceptedHandler';

describe(buildInterceptedHandler, () => {
  let containerMock: Mocked<Container>;
  let callRouteHandlerMock: Mock<
    (
      request: unknown,
      response: unknown,
      next: () => void,
    ) => Promise<ControllerResponse>
  >;
  let handleErrorMock: Mock<
    (request: unknown, response: unknown, error: unknown) => Promise<string>
  >;
  let replyMock: Mock<
    (req: unknown, res: unknown, value: ControllerResponse) => string
  >;

  let requestFixture: unknown;
  let responseFixture: unknown;
  let nextFixture: () => void;

  beforeAll(() => {
    containerMock = {
      getAsync: vitest.fn(),
    } as Partial<Mocked<Container>> as Mocked<Container>;

    callRouteHandlerMock = vitest.fn();
    handleErrorMock = vitest.fn();
    replyMock = vitest.fn();

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
      let controllerResponseFixture: ControllerResponse;
      let replyResultFixture: string;

      let result: unknown;

      beforeAll(async () => {
        controllerResponseFixture = { body: 'test response' };
        replyResultFixture = 'reply result';

        callRouteHandlerMock.mockResolvedValueOnce(controllerResponseFixture);
        replyMock.mockReturnValueOnce(replyResultFixture);

        const handler: RequestHandler<unknown, unknown, () => void, unknown> =
          buildInterceptedHandler(
            routerExplorerControllerMethodMetadataFixture,
            containerMock,
            callRouteHandlerMock,
            handleErrorMock,
            replyMock,
          );

        result = await handler(requestFixture, responseFixture, nextFixture);
      });

      afterAll(() => {
        vitest.clearAllMocks();
      });

      it('should call callRouteHandler()', () => {
        expect(callRouteHandlerMock).toHaveBeenCalledExactlyOnceWith(
          requestFixture,
          responseFixture,
          nextFixture,
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

        callRouteHandlerMock.mockRejectedValueOnce(errorFixture);
        handleErrorMock.mockResolvedValueOnce(errorResultFixture);

        const handler: RequestHandler<unknown, unknown, () => void, unknown> =
          buildInterceptedHandler(
            routerExplorerControllerMethodMetadataFixture,
            containerMock,
            callRouteHandlerMock,
            handleErrorMock,
            replyMock,
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
      let controllerResponseFixture: ControllerResponse;
      let replyResultFixture: string;

      let result: unknown;

      beforeAll(async () => {
        stamps = [];
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
          .mockResolvedValueOnce(secondInterceptorMock);

        callRouteHandlerMock.mockImplementationOnce(async () => {
          stamps.push('route-handler');
          return controllerResponseFixture;
        });

        replyMock.mockReturnValueOnce(replyResultFixture);

        const handler: RequestHandler<unknown, unknown, () => void, unknown> =
          buildInterceptedHandler(
            routerExplorerControllerMethodMetadataFixture,
            containerMock,
            callRouteHandlerMock,
            handleErrorMock,
            replyMock,
          );

        result = await handler(requestFixture, responseFixture, nextFixture);
      });

      afterAll(() => {
        vitest.clearAllMocks();
      });

      it('should call container.getAsync() for interceptors', () => {
        expect(containerMock.getAsync).toHaveBeenCalledTimes(2);
        expect(containerMock.getAsync).toHaveBeenNthCalledWith(
          1,
          firstInterceptorType,
        );
        expect(containerMock.getAsync).toHaveBeenNthCalledWith(
          2,
          secondInterceptorType,
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

      it('should call callRouteHandler()', () => {
        expect(callRouteHandlerMock).toHaveBeenCalledExactlyOnceWith(
          requestFixture,
          responseFixture,
          nextFixture,
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
          'route-handler',
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
      let controllerResponseFixture: ControllerResponse;
      let replyResultFixture: string;
      let transformedResultFixture: ControllerResponse;

      let result: unknown;

      beforeAll(async () => {
        stamps = [];
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
          .mockResolvedValueOnce(secondInterceptorMock);

        callRouteHandlerMock.mockImplementationOnce(async () => {
          stamps.push('route-handler');
          return controllerResponseFixture;
        });

        replyMock.mockReturnValueOnce(replyResultFixture);

        const handler: RequestHandler<unknown, unknown, () => void, unknown> =
          buildInterceptedHandler(
            routerExplorerControllerMethodMetadataFixture,
            containerMock,
            callRouteHandlerMock,
            handleErrorMock,
            replyMock,
          );

        result = await handler(requestFixture, responseFixture, nextFixture);
      });

      afterAll(() => {
        vitest.clearAllMocks();
      });

      it('should call container.getAsync() for interceptors', () => {
        expect(containerMock.getAsync).toHaveBeenCalledTimes(2);
        expect(containerMock.getAsync).toHaveBeenNthCalledWith(
          1,
          firstInterceptorType,
        );
        expect(containerMock.getAsync).toHaveBeenNthCalledWith(
          2,
          secondInterceptorType,
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

      it('should call callRouteHandler()', () => {
        expect(callRouteHandlerMock).toHaveBeenCalledExactlyOnceWith(
          requestFixture,
          responseFixture,
          nextFixture,
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
          'route-handler',
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

        const handler: RequestHandler<unknown, unknown, () => void, unknown> =
          buildInterceptedHandler(
            routerExplorerControllerMethodMetadataFixture,
            containerMock,
            callRouteHandlerMock,
            handleErrorMock,
            replyMock,
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

        containerMock.getAsync
          .mockResolvedValueOnce(firstInterceptorMock)
          .mockResolvedValueOnce(secondInterceptorMock);

        callRouteHandlerMock.mockRejectedValueOnce(errorFixture);
        handleErrorMock.mockResolvedValueOnce(errorResultFixture);

        const handler: RequestHandler<unknown, unknown, () => void, unknown> =
          buildInterceptedHandler(
            routerExplorerControllerMethodMetadataFixture,
            containerMock,
            callRouteHandlerMock,
            handleErrorMock,
            replyMock,
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
