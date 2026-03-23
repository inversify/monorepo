import { afterAll, beforeAll, describe, expect, it, vitest } from 'vitest';

vitest.mock(import('@inversifyjs/framework-core'));

vitest.mock(import('./getControllerMethodParameterMetadataList.js'));
vitest.mock(import('./getControllerMethodStatusCodeMetadata.js'));
vitest.mock(import('./getControllerMethodHeaderMetadata.js'));
vitest.mock(import('./getControllerMethodUseNativeHandlerMetadata.js'));
vitest.mock(import('./getControllerMethodRouteValueMetadata.js'));
vitest.mock(import('./buildErrorTypeToErrorFilterMap.js'));

import {
  buildMiddlewareOptionsFromApplyMiddlewareOptions,
  type ErrorFilter,
  getClassGuardList,
  getClassInterceptorList,
  getClassMethodGuardList,
  getClassMethodInterceptorList,
  getClassMethodMiddlewareList,
  getClassMiddlewareList,
  type Guard,
  type Interceptor,
  type Middleware,
  type MiddlewareOptions,
} from '@inversifyjs/framework-core';
import { type Logger } from '@inversifyjs/logger';
import { type Newable, type ServiceIdentifier } from 'inversify';

import { RequestMethodType } from '../../http/models/RequestMethodType.js';
import { type ControllerMetadata } from '../model/ControllerMetadata.js';
import { type ControllerMethodMetadata } from '../model/ControllerMethodMetadata.js';
import { type ControllerMethodParameterMetadata } from '../model/ControllerMethodParameterMetadata.js';
import { type RouterExplorerControllerMethodMetadata } from '../model/RouterExplorerControllerMethodMetadata.js';
import { buildErrorTypeToErrorFilterMap } from './buildErrorTypeToErrorFilterMap.js';
import { buildRouterExplorerControllerMethodMetadata } from './buildRouterExplorerControllerMethodMetadata.js';
import { getControllerMethodHeaderMetadata } from './getControllerMethodHeaderMetadata.js';
import { getControllerMethodParameterMetadataList } from './getControllerMethodParameterMetadataList.js';
import { getControllerMethodRouteValueMetadata } from './getControllerMethodRouteValueMetadata.js';
import { getControllerMethodStatusCodeMetadata } from './getControllerMethodStatusCodeMetadata.js';
import { getControllerMethodUseNativeHandlerMetadata } from './getControllerMethodUseNativeHandlerMetadata.js';

describe(buildRouterExplorerControllerMethodMetadata, () => {
  let loggerFixture: Logger;
  let controllerMetadataFixture: ControllerMetadata;
  let controllerMethodMetadataFixture: ControllerMethodMetadata;

  beforeAll(() => {
    loggerFixture = Symbol() as unknown as Logger;

    controllerMetadataFixture = {
      path: '/',
      priority: 0,
      serviceIdentifier: Symbol(),
      target: class TestController {},
    };
    controllerMethodMetadataFixture = {
      methodKey: 'testMethod',
      path: '/test',
      requestMethodType: RequestMethodType.Get,
    };
  });

  describe('when called', () => {
    let controllerMethodParameterMetadataListFixture: (
      | ControllerMethodParameterMetadata
      | undefined
    )[];
    let controllerMethodStatusCodeMetadataFixture: undefined;
    let classGuardListFixture: Newable<Guard>[];
    let classMethodGuardListFixture: Newable<Guard>[];
    let classInterceptorMetadataListFixture: Newable<Interceptor>[];
    let classMethodInterceptorListFixture: Newable<Interceptor>[];
    let controllerMethodGuardListFixture: Newable<Guard>[];
    let controllerMethodInterceptorListFixture: Newable<Interceptor>[];
    let controllerMiddlewareListFixture: ServiceIdentifier<Middleware>[];
    let controllerMethodMiddlewareListFixture: ServiceIdentifier<Middleware>[];
    let controllerMiddlewareOptionsFixture: MiddlewareOptions;
    let controllerMethodMiddlewareOptionsFixture: MiddlewareOptions;
    let headerMetadataFixture: Record<string, string>;
    let useNativeHandlerFixture: boolean;
    let errorTypeToErrorFilterMapFixture: Map<
      Newable<Error> | null,
      Newable<ErrorFilter>
    >;
    let controllerMethodRouteValueMetadataMapFixture: Map<
      string | symbol,
      unknown
    >;
    let result: unknown;

    beforeAll(() => {
      controllerMethodParameterMetadataListFixture = [];
      controllerMethodStatusCodeMetadataFixture = undefined;
      classGuardListFixture = [Symbol() as unknown as Newable<Guard>];
      classMethodGuardListFixture = [Symbol() as unknown as Newable<Guard>];
      controllerMethodGuardListFixture = [
        ...classGuardListFixture,
        ...classMethodGuardListFixture,
      ];
      classInterceptorMetadataListFixture = [
        Symbol() as unknown as Newable<Interceptor>,
      ];
      classMethodInterceptorListFixture = [
        Symbol() as unknown as Newable<Interceptor>,
      ];
      controllerMethodInterceptorListFixture = [
        ...classInterceptorMetadataListFixture,
        ...classMethodInterceptorListFixture,
      ];
      controllerMiddlewareListFixture = [];
      controllerMethodMiddlewareListFixture = [];
      controllerMiddlewareOptionsFixture = {
        postHandlerMiddlewareList: [],
        preHandlerMiddlewareList: [],
      };
      controllerMethodMiddlewareOptionsFixture = {
        postHandlerMiddlewareList: [],
        preHandlerMiddlewareList: [],
      };
      headerMetadataFixture = {};
      useNativeHandlerFixture = false;
      errorTypeToErrorFilterMapFixture = new Map();
      controllerMethodRouteValueMetadataMapFixture = new Map([
        ['test-metadata-key', 'test-metadata-value'],
      ]);

      vitest
        .mocked(getControllerMethodParameterMetadataList)
        .mockReturnValueOnce(controllerMethodParameterMetadataListFixture);

      vitest
        .mocked(getControllerMethodStatusCodeMetadata)
        .mockReturnValueOnce(controllerMethodStatusCodeMetadataFixture);

      vitest
        .mocked(getClassGuardList)
        .mockReturnValueOnce(classGuardListFixture);

      vitest
        .mocked(getClassMethodGuardList)
        .mockReturnValueOnce(classMethodGuardListFixture);

      vitest
        .mocked(getClassInterceptorList)
        .mockReturnValueOnce(classInterceptorMetadataListFixture);

      vitest
        .mocked(getClassMethodInterceptorList)
        .mockReturnValueOnce(classMethodInterceptorListFixture);

      vitest
        .mocked(getClassMiddlewareList)
        .mockReturnValueOnce(controllerMiddlewareListFixture);

      vitest
        .mocked(getClassMethodMiddlewareList)
        .mockReturnValueOnce(controllerMethodMiddlewareListFixture);

      vitest
        .mocked(buildMiddlewareOptionsFromApplyMiddlewareOptions)
        .mockReturnValueOnce(controllerMiddlewareOptionsFixture)
        .mockReturnValueOnce(controllerMethodMiddlewareOptionsFixture);

      vitest
        .mocked(getControllerMethodHeaderMetadata)
        .mockReturnValueOnce(headerMetadataFixture);

      vitest
        .mocked(getControllerMethodUseNativeHandlerMetadata)
        .mockReturnValueOnce(useNativeHandlerFixture);

      vitest
        .mocked(buildErrorTypeToErrorFilterMap)
        .mockReturnValueOnce(errorTypeToErrorFilterMapFixture);

      vitest
        .mocked(getControllerMethodRouteValueMetadata)
        .mockReturnValueOnce(controllerMethodRouteValueMetadataMapFixture);

      result = buildRouterExplorerControllerMethodMetadata(
        loggerFixture,
        controllerMetadataFixture,
        controllerMethodMetadataFixture,
      );
    });

    afterAll(() => {
      vitest.clearAllMocks();
    });

    it('should call getControllerMethodParameterMetadataList()', () => {
      expect(
        getControllerMethodParameterMetadataList,
      ).toHaveBeenCalledExactlyOnceWith(
        controllerMetadataFixture.target,
        controllerMethodMetadataFixture.methodKey,
      );
    });

    it('should call getControllerMethodStatusCodeMetadata()', () => {
      expect(
        getControllerMethodStatusCodeMetadata,
      ).toHaveBeenCalledExactlyOnceWith(
        controllerMetadataFixture.target,
        controllerMethodMetadataFixture.methodKey,
      );
    });

    it('should call getClassGuardList()', () => {
      expect(getClassGuardList).toHaveBeenCalledExactlyOnceWith(
        controllerMetadataFixture.target,
      );
    });

    it('should call getClassMethodGuardList()', () => {
      expect(getClassMethodGuardList).toHaveBeenCalledExactlyOnceWith(
        controllerMetadataFixture.target,
        controllerMethodMetadataFixture.methodKey,
      );
    });

    it('should call getClassInterceptorList()', () => {
      expect(getClassInterceptorList).toHaveBeenCalledExactlyOnceWith(
        controllerMetadataFixture.target,
      );
    });

    it('should call getClassMethodInterceptorList()', () => {
      expect(getClassMethodInterceptorList).toHaveBeenCalledExactlyOnceWith(
        controllerMetadataFixture.target,
        controllerMethodMetadataFixture.methodKey,
      );
    });

    it('should call getClassMethodMiddlewareList()', () => {
      expect(getClassMethodMiddlewareList).toHaveBeenCalledExactlyOnceWith(
        controllerMetadataFixture.target,
        controllerMethodMetadataFixture.methodKey,
      );
    });

    it('should call getClassMiddlewareList()', () => {
      expect(getClassMiddlewareList).toHaveBeenCalledExactlyOnceWith(
        controllerMetadataFixture.target,
      );
    });

    it('should call buildMiddlewareOptionsFromApplyMiddlewareOptions() twice', () => {
      expect(
        buildMiddlewareOptionsFromApplyMiddlewareOptions,
      ).toHaveBeenCalledTimes(2);
      expect(
        buildMiddlewareOptionsFromApplyMiddlewareOptions,
      ).toHaveBeenNthCalledWith(1, controllerMiddlewareListFixture);
      expect(
        buildMiddlewareOptionsFromApplyMiddlewareOptions,
      ).toHaveBeenNthCalledWith(2, controllerMethodMiddlewareListFixture);
    });

    it('should call getControllerMethodHeaderMetadataList()', () => {
      expect(getControllerMethodHeaderMetadata).toHaveBeenCalledExactlyOnceWith(
        controllerMetadataFixture.target,
        controllerMethodMetadataFixture.methodKey,
      );
    });

    it('should call getControllerMethodUseNativeHandlerMetadata()', () => {
      expect(
        getControllerMethodUseNativeHandlerMetadata,
      ).toHaveBeenCalledExactlyOnceWith(
        controllerMetadataFixture.target,
        controllerMethodMetadataFixture.methodKey,
      );
    });

    it('should call buildErrorTypeToErrorFilterMap()', () => {
      expect(buildErrorTypeToErrorFilterMap).toHaveBeenCalledExactlyOnceWith(
        loggerFixture,
        controllerMetadataFixture.target,
        controllerMethodMetadataFixture.methodKey,
      );
    });

    it('should call getControllerMethodRouteValueMetadata()', () => {
      expect(
        getControllerMethodRouteValueMetadata,
      ).toHaveBeenCalledExactlyOnceWith(
        controllerMetadataFixture.target,
        controllerMethodMetadataFixture.methodKey,
      );
    });

    it('should return RouterExplorerControllerMethodMetadata', () => {
      const expected: RouterExplorerControllerMethodMetadata = {
        errorTypeToErrorFilterMap: errorTypeToErrorFilterMapFixture,
        guardList: controllerMethodGuardListFixture,
        headerMetadataList: headerMetadataFixture,
        interceptorList: controllerMethodInterceptorListFixture,
        methodKey: controllerMethodMetadataFixture.methodKey,
        parameterMetadataList: controllerMethodParameterMetadataListFixture,
        path: controllerMethodMetadataFixture.path,
        postHandlerMiddlewareList: [
          ...controllerMiddlewareOptionsFixture.postHandlerMiddlewareList,
          ...controllerMethodMiddlewareOptionsFixture.postHandlerMiddlewareList,
        ],
        preHandlerMiddlewareList: [
          ...controllerMiddlewareOptionsFixture.preHandlerMiddlewareList,
          ...controllerMethodMiddlewareOptionsFixture.preHandlerMiddlewareList,
        ],
        requestMethodType: controllerMethodMetadataFixture.requestMethodType,
        routeValueMetadataMap: controllerMethodRouteValueMetadataMapFixture,
        statusCode: controllerMethodStatusCodeMetadataFixture,
        useNativeHandler: useNativeHandlerFixture,
      };

      expect(result).toStrictEqual(expected);
    });
  });
});
