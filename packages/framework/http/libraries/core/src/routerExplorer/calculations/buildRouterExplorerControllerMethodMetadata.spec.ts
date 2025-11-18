import { afterAll, beforeAll, describe, expect, it, vitest } from 'vitest';

vitest.mock('@inversifyjs/framework-core');

vitest.mock('./getControllerMethodParameterMetadataList');
vitest.mock('./getControllerMethodStatusCodeMetadata');
vitest.mock('./getControllerMethodHeaderMetadata');
vitest.mock('./getControllerMethodUseNativeHandlerMetadata');
vitest.mock('./buildErrorTypeToErrorFilterMap');

import {
  buildMiddlewareOptionsFromApplyMiddlewareOptions,
  ErrorFilter,
  getClassGuardList,
  getClassInterceptorList,
  getClassMethodGuardList,
  getClassMethodInterceptorList,
  getClassMethodMiddlewareList,
  getClassMiddlewareList,
  Guard,
  Interceptor,
  Middleware,
  MiddlewareOptions,
} from '@inversifyjs/framework-core';
import { Logger } from '@inversifyjs/logger';
import { Newable, ServiceIdentifier } from 'inversify';

import { RequestMethodType } from '../../http/models/RequestMethodType';
import { ControllerMetadata } from '../model/ControllerMetadata';
import { ControllerMethodMetadata } from '../model/ControllerMethodMetadata';
import { ControllerMethodParameterMetadata } from '../model/ControllerMethodParameterMetadata';
import { RouterExplorerControllerMethodMetadata } from '../model/RouterExplorerControllerMethodMetadata';
import { buildErrorTypeToErrorFilterMap } from './buildErrorTypeToErrorFilterMap';
import { buildRouterExplorerControllerMethodMetadata } from './buildRouterExplorerControllerMethodMetadata';
import { getControllerMethodHeaderMetadata } from './getControllerMethodHeaderMetadata';
import { getControllerMethodParameterMetadataList } from './getControllerMethodParameterMetadataList';
import { getControllerMethodStatusCodeMetadata } from './getControllerMethodStatusCodeMetadata';
import { getControllerMethodUseNativeHandlerMetadata } from './getControllerMethodUseNativeHandlerMetadata';

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
        statusCode: controllerMethodStatusCodeMetadataFixture,
        useNativeHandler: useNativeHandlerFixture,
      };

      expect(result).toStrictEqual(expected);
    });
  });
});
