import { afterAll, beforeAll, describe, expect, it, vitest } from 'vitest';

vitest.mock('@inversifyjs/framework-core');

vitest.mock('./getControllerMethodParameterMetadataList');
vitest.mock('./getControllerMethodStatusCodeMetadata');
vitest.mock('./getControllerMethodHeaderMetadataList');
vitest.mock('./getControllerMethodUseNativeHandlerMetadata');

import {
  buildMiddlewareOptionsFromApplyMiddlewareOptions,
  getClassMethodGuardList,
  getClassMethodMiddlewareList,
  MiddlewareOptions,
} from '@inversifyjs/framework-core';

import { RequestMethodType } from '../../http/models/RequestMethodType';
import { ControllerMethodMetadata } from '../model/ControllerMethodMetadata';
import { ControllerMethodParameterMetadata } from '../model/ControllerMethodParameterMetadata';
import { buildRouterExplorerControllerMethodMetadata } from './buildRouterExplorerControllerMethodMetadata';
import { getControllerMethodHeaderMetadataList } from './getControllerMethodHeaderMetadataList';
import { getControllerMethodParameterMetadataList } from './getControllerMethodParameterMetadataList';
import { getControllerMethodStatusCodeMetadata } from './getControllerMethodStatusCodeMetadata';
import { getControllerMethodUseNativeHandlerMetadata } from './getControllerMethodUseNativeHandlerMetadata';

describe(buildRouterExplorerControllerMethodMetadata, () => {
  describe('when called', () => {
    let controllerMethodMetadataFixture: ControllerMethodMetadata;
    let controllerFixture: NewableFunction;
    let controllerMethodParameterMetadataListFixture: (
      | ControllerMethodParameterMetadata
      | undefined
    )[];
    let controllerMethodStatusCodeMetadataFixture: undefined;
    let controllerMethodGuardListFixture: NewableFunction[];
    let controllerMethodMiddlewareListFixture: NewableFunction[];
    let middlewareOptionsFixture: MiddlewareOptions;
    let headerMetadataListFixture: [string, string][];
    let useNativeHandlerFixture: boolean;
    let result: unknown;

    beforeAll(() => {
      controllerMethodMetadataFixture = {
        methodKey: 'testMethod',
        path: '/test',
        requestMethodType: RequestMethodType.Get,
      };
      controllerFixture = class Test {};
      controllerMethodParameterMetadataListFixture = [];
      controllerMethodStatusCodeMetadataFixture = undefined;
      controllerMethodGuardListFixture = [];
      controllerMethodMiddlewareListFixture = [];
      middlewareOptionsFixture = {
        postHandlerMiddlewareList: [],
        preHandlerMiddlewareList: [],
      };
      headerMetadataListFixture = [];
      useNativeHandlerFixture = false;

      vitest
        .mocked(getControllerMethodParameterMetadataList)
        .mockReturnValue(controllerMethodParameterMetadataListFixture);

      vitest
        .mocked(getControllerMethodStatusCodeMetadata)
        .mockReturnValue(controllerMethodStatusCodeMetadataFixture);

      vitest
        .mocked(getClassMethodGuardList)
        .mockReturnValue(controllerMethodGuardListFixture);

      vitest
        .mocked(getClassMethodMiddlewareList)
        .mockReturnValue(controllerMethodMiddlewareListFixture);

      vitest
        .mocked(buildMiddlewareOptionsFromApplyMiddlewareOptions)
        .mockReturnValue(middlewareOptionsFixture);

      vitest
        .mocked(getControllerMethodHeaderMetadataList)
        .mockReturnValueOnce(headerMetadataListFixture);

      vitest
        .mocked(getControllerMethodUseNativeHandlerMetadata)
        .mockReturnValue(useNativeHandlerFixture);

      result = buildRouterExplorerControllerMethodMetadata(
        controllerFixture,
        controllerMethodMetadataFixture,
      );
    });

    afterAll(() => {
      vitest.clearAllMocks();
    });

    it('should call getControllerMethodParameterMetadataList', () => {
      expect(getControllerMethodParameterMetadataList).toHaveBeenCalledTimes(1);
      expect(getControllerMethodParameterMetadataList).toHaveBeenCalledWith(
        controllerFixture,
        controllerMethodMetadataFixture.methodKey,
      );
    });

    it('should call getControllerMethodStatusCodeMetadata', () => {
      expect(getControllerMethodStatusCodeMetadata).toHaveBeenCalledTimes(1);
      expect(getControllerMethodStatusCodeMetadata).toHaveBeenCalledWith(
        controllerFixture,
        controllerMethodMetadataFixture.methodKey,
      );
    });

    it('should call getClassMethodGuardList', () => {
      expect(getClassMethodGuardList).toHaveBeenCalledTimes(1);
      expect(getClassMethodGuardList).toHaveBeenCalledWith(
        controllerFixture,
        controllerMethodMetadataFixture.methodKey,
      );
    });

    it('should call getClassMethodMiddlewareList', () => {
      expect(getClassMethodMiddlewareList).toHaveBeenCalledTimes(1);
      expect(getClassMethodMiddlewareList).toHaveBeenCalledWith(
        controllerFixture,
        controllerMethodMetadataFixture.methodKey,
      );
    });

    it('should call buildMiddlewareOptionsFromApplyMiddlewareOptions', () => {
      expect(
        buildMiddlewareOptionsFromApplyMiddlewareOptions,
      ).toHaveBeenCalledTimes(1);
      expect(
        buildMiddlewareOptionsFromApplyMiddlewareOptions,
      ).toHaveBeenCalledWith(controllerMethodMiddlewareListFixture);
    });

    it('should call getControllerMethodHeaderMetadataList', () => {
      expect(getControllerMethodHeaderMetadataList).toHaveBeenCalledTimes(1);
      expect(getControllerMethodHeaderMetadataList).toHaveBeenCalledWith(
        controllerFixture,
        controllerMethodMetadataFixture.methodKey,
      );
    });

    it('should call getControllerMethodUseNativeHandlerMetadata', () => {
      expect(getControllerMethodUseNativeHandlerMetadata).toHaveBeenCalledTimes(
        1,
      );
      expect(getControllerMethodUseNativeHandlerMetadata).toHaveBeenCalledWith(
        controllerFixture,
        controllerMethodMetadataFixture.methodKey,
      );
    });

    it('should return a RouterExplorerControllerMethodMetadata', () => {
      expect(result).toStrictEqual({
        guardList: controllerMethodGuardListFixture,
        headerMetadataList: headerMetadataListFixture,
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
      });
    });
  });
});
