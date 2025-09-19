import { afterAll, beforeAll, describe, expect, it, vitest } from 'vitest';

vitest.mock('@inversifyjs/framework-core');

vitest.mock('./getControllerMethodParameterMetadataList');
vitest.mock('./getControllerMethodStatusCodeMetadata');
vitest.mock('./getControllerMethodHeaderMetadataList');
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
  Guard,
  Interceptor,
  Middleware,
  MiddlewareOptions,
} from '@inversifyjs/framework-core';
import { Newable, ServiceIdentifier } from 'inversify';

import { RequestMethodType } from '../../http/models/RequestMethodType';
import { ControllerMetadata } from '../model/ControllerMetadata';
import { ControllerMethodMetadata } from '../model/ControllerMethodMetadata';
import { ControllerMethodParameterMetadata } from '../model/ControllerMethodParameterMetadata';
import { RouterExplorerControllerMethodMetadata } from '../model/RouterExplorerControllerMethodMetadata';
import { buildErrorTypeToErrorFilterMap } from './buildErrorTypeToErrorFilterMap';
import { buildRouterExplorerControllerMethodMetadata } from './buildRouterExplorerControllerMethodMetadata';
import { getControllerMethodHeaderMetadataList } from './getControllerMethodHeaderMetadataList';
import { getControllerMethodParameterMetadataList } from './getControllerMethodParameterMetadataList';
import { getControllerMethodStatusCodeMetadata } from './getControllerMethodStatusCodeMetadata';
import { getControllerMethodUseNativeHandlerMetadata } from './getControllerMethodUseNativeHandlerMetadata';

describe(buildRouterExplorerControllerMethodMetadata, () => {
  describe('when called', () => {
    let controllerMetadataFixture: ControllerMetadata;
    let controllerMethodMetadataFixture: ControllerMethodMetadata;
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
    let controllerMethodMiddlewareListFixture: ServiceIdentifier<Middleware>[];
    let middlewareOptionsFixture: MiddlewareOptions;
    let headerMetadataListFixture: [string, string][];
    let useNativeHandlerFixture: boolean;
    let errorTypeToErrorFilterMapFixture: Map<
      Newable<Error> | null,
      Newable<ErrorFilter>
    >;
    let result: unknown;

    beforeAll(() => {
      controllerMetadataFixture = {
        path: '/',
        serviceIdentifier: Symbol(),
        target: class TestController {},
      };
      controllerMethodMetadataFixture = {
        methodKey: 'testMethod',
        path: '/test',
        requestMethodType: RequestMethodType.Get,
      };
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
      controllerMethodMiddlewareListFixture = [];
      middlewareOptionsFixture = {
        postHandlerMiddlewareList: [],
        preHandlerMiddlewareList: [],
      };
      headerMetadataListFixture = [];
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
        .mocked(getClassMethodMiddlewareList)
        .mockReturnValueOnce(controllerMethodMiddlewareListFixture);

      vitest
        .mocked(buildMiddlewareOptionsFromApplyMiddlewareOptions)
        .mockReturnValueOnce(middlewareOptionsFixture);

      vitest
        .mocked(getControllerMethodHeaderMetadataList)
        .mockReturnValueOnce(headerMetadataListFixture);

      vitest
        .mocked(getControllerMethodUseNativeHandlerMetadata)
        .mockReturnValueOnce(useNativeHandlerFixture);

      vitest
        .mocked(buildErrorTypeToErrorFilterMap)
        .mockReturnValueOnce(errorTypeToErrorFilterMapFixture);

      result = buildRouterExplorerControllerMethodMetadata(
        controllerMetadataFixture,
        controllerMethodMetadataFixture,
      );
    });

    afterAll(() => {
      vitest.clearAllMocks();
    });

    it('should call getControllerMethodParameterMetadataList()', () => {
      expect(getControllerMethodParameterMetadataList).toHaveBeenCalledTimes(1);
      expect(getControllerMethodParameterMetadataList).toHaveBeenCalledWith(
        controllerMetadataFixture.target,
        controllerMethodMetadataFixture.methodKey,
      );
    });

    it('should call getControllerMethodStatusCodeMetadata()', () => {
      expect(getControllerMethodStatusCodeMetadata).toHaveBeenCalledTimes(1);
      expect(getControllerMethodStatusCodeMetadata).toHaveBeenCalledWith(
        controllerMetadataFixture.target,
        controllerMethodMetadataFixture.methodKey,
      );
    });

    it('should call getClassGuardList()', () => {
      expect(getClassGuardList).toHaveBeenCalledTimes(1);
      expect(getClassGuardList).toHaveBeenCalledWith(
        controllerMetadataFixture.target,
      );
    });

    it('should call getClassMethodGuardList()', () => {
      expect(getClassMethodGuardList).toHaveBeenCalledTimes(1);
      expect(getClassMethodGuardList).toHaveBeenCalledWith(
        controllerMetadataFixture.target,
        controllerMethodMetadataFixture.methodKey,
      );
    });

    it('should call getClassInterceptorList()', () => {
      expect(getClassInterceptorList).toHaveBeenCalledTimes(1);
      expect(getClassInterceptorList).toHaveBeenCalledWith(
        controllerMetadataFixture.target,
      );
    });

    it('should call getClassMethodInterceptorList()', () => {
      expect(getClassMethodInterceptorList).toHaveBeenCalledTimes(1);
      expect(getClassMethodInterceptorList).toHaveBeenCalledWith(
        controllerMetadataFixture.target,
        controllerMethodMetadataFixture.methodKey,
      );
    });

    it('should call getClassMethodMiddlewareList()', () => {
      expect(getClassMethodMiddlewareList).toHaveBeenCalledTimes(1);
      expect(getClassMethodMiddlewareList).toHaveBeenCalledWith(
        controllerMetadataFixture.target,
        controllerMethodMetadataFixture.methodKey,
      );
    });

    it('should call buildMiddlewareOptionsFromApplyMiddlewareOptions()', () => {
      expect(
        buildMiddlewareOptionsFromApplyMiddlewareOptions,
      ).toHaveBeenCalledTimes(1);
      expect(
        buildMiddlewareOptionsFromApplyMiddlewareOptions,
      ).toHaveBeenCalledWith(controllerMethodMiddlewareListFixture);
    });

    it('should call getControllerMethodHeaderMetadataList()', () => {
      expect(getControllerMethodHeaderMetadataList).toHaveBeenCalledTimes(1);
      expect(getControllerMethodHeaderMetadataList).toHaveBeenCalledWith(
        controllerMetadataFixture.target,
        controllerMethodMetadataFixture.methodKey,
      );
    });

    it('should call getControllerMethodUseNativeHandlerMetadata()', () => {
      expect(getControllerMethodUseNativeHandlerMetadata).toHaveBeenCalledTimes(
        1,
      );
      expect(getControllerMethodUseNativeHandlerMetadata).toHaveBeenCalledWith(
        controllerMetadataFixture.target,
        controllerMethodMetadataFixture.methodKey,
      );
    });

    it('should call buildErrorTypeToErrorFilterMap()', () => {
      expect(buildErrorTypeToErrorFilterMap).toHaveBeenCalledTimes(1);
      expect(buildErrorTypeToErrorFilterMap).toHaveBeenCalledWith(
        controllerMetadataFixture.target,
        controllerMethodMetadataFixture.methodKey,
      );
    });

    it('should return RouterExplorerControllerMethodMetadata', () => {
      const expected: RouterExplorerControllerMethodMetadata = {
        errorTypeToErrorFilterMap: errorTypeToErrorFilterMapFixture,
        guardList: controllerMethodGuardListFixture,
        headerMetadataList: headerMetadataListFixture,
        interceptorList: controllerMethodInterceptorListFixture,
        methodKey: controllerMethodMetadataFixture.methodKey,
        parameterMetadataList: controllerMethodParameterMetadataListFixture,
        path: controllerMethodMetadataFixture.path,
        postHandlerMiddlewareList:
          middlewareOptionsFixture.postHandlerMiddlewareList,
        preHandlerMiddlewareList:
          middlewareOptionsFixture.preHandlerMiddlewareList,
        requestMethodType: controllerMethodMetadataFixture.requestMethodType,
        statusCode: controllerMethodStatusCodeMetadataFixture,
        useNativeHandler: useNativeHandlerFixture,
      };

      expect(result).toStrictEqual(expected);
    });
  });
});
