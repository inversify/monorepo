import { afterAll, beforeAll, describe, expect, it, vitest } from 'vitest';

vitest.mock('@inversifyjs/framework-core');

vitest.mock('./exploreControllerMethodParameterMetadataList');
vitest.mock('./exploreControllerMethodStatusCodeMetadata');
vitest.mock('./exploreControllerMethodHeaderMetadataList');
vitest.mock('./exploreControllerMethodUseNativeHandlerMetadata');

import {
  buildMiddlewareOptionsFromApplyMiddlewareOptions,
  exploreClassMethodGuardList,
  exploreClassMethodMiddlewareList,
  MiddlewareOptions,
} from '@inversifyjs/framework-core';

import { RequestMethodType } from '../../http/models/RequestMethodType';
import { ControllerMethodMetadata } from '../model/ControllerMethodMetadata';
import { ControllerMethodParameterMetadata } from '../model/ControllerMethodParameterMetadata';
import { buildRouterExplorerControllerMethodMetadata } from './buildRouterExplorerControllerMethodMetadata';
import { exploreControllerMethodHeaderMetadataList } from './exploreControllerMethodHeaderMetadataList';
import { exploreControllerMethodParameterMetadataList } from './exploreControllerMethodParameterMetadataList';
import { exploreControllerMethodStatusCodeMetadata } from './exploreControllerMethodStatusCodeMetadata';
import { exploreControllerMethodUseNativeHandlerMetadata } from './exploreControllerMethodUseNativeHandlerMetadata';

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
        .mocked(exploreControllerMethodParameterMetadataList)
        .mockReturnValue(controllerMethodParameterMetadataListFixture);

      vitest
        .mocked(exploreControllerMethodStatusCodeMetadata)
        .mockReturnValue(controllerMethodStatusCodeMetadataFixture);

      vitest
        .mocked(exploreClassMethodGuardList)
        .mockReturnValue(controllerMethodGuardListFixture);

      vitest
        .mocked(exploreClassMethodMiddlewareList)
        .mockReturnValue(controllerMethodMiddlewareListFixture);

      vitest
        .mocked(buildMiddlewareOptionsFromApplyMiddlewareOptions)
        .mockReturnValue(middlewareOptionsFixture);

      vitest
        .mocked(exploreControllerMethodHeaderMetadataList)
        .mockReturnValueOnce(headerMetadataListFixture);

      vitest
        .mocked(exploreControllerMethodUseNativeHandlerMetadata)
        .mockReturnValue(useNativeHandlerFixture);

      result = buildRouterExplorerControllerMethodMetadata(
        controllerFixture,
        controllerMethodMetadataFixture,
      );
    });

    afterAll(() => {
      vitest.clearAllMocks();
    });

    it('should call exploreControllerMethodParameterMetadataList', () => {
      expect(
        exploreControllerMethodParameterMetadataList,
      ).toHaveBeenCalledTimes(1);
      expect(exploreControllerMethodParameterMetadataList).toHaveBeenCalledWith(
        controllerFixture,
        controllerMethodMetadataFixture.methodKey,
      );
    });

    it('should call exploreControllerMethodStatusCodeMetadata', () => {
      expect(exploreControllerMethodStatusCodeMetadata).toHaveBeenCalledTimes(
        1,
      );
      expect(exploreControllerMethodStatusCodeMetadata).toHaveBeenCalledWith(
        controllerFixture,
        controllerMethodMetadataFixture.methodKey,
      );
    });

    it('should call exploreClassMethodGuardList', () => {
      expect(exploreClassMethodGuardList).toHaveBeenCalledTimes(1);
      expect(exploreClassMethodGuardList).toHaveBeenCalledWith(
        controllerFixture,
        controllerMethodMetadataFixture.methodKey,
      );
    });

    it('should call exploreClassMethodMiddlewareList', () => {
      expect(exploreClassMethodMiddlewareList).toHaveBeenCalledTimes(1);
      expect(exploreClassMethodMiddlewareList).toHaveBeenCalledWith(
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

    it('should call exploreControllerMethodHeaderMetadataList', () => {
      expect(exploreControllerMethodHeaderMetadataList).toHaveBeenCalledTimes(
        1,
      );
      expect(exploreControllerMethodHeaderMetadataList).toHaveBeenCalledWith(
        controllerFixture,
        controllerMethodMetadataFixture.methodKey,
      );
    });

    it('should call exploreControllerMethodUseNativeHandlerMetadata', () => {
      expect(
        exploreControllerMethodUseNativeHandlerMetadata,
      ).toHaveBeenCalledTimes(1);
      expect(
        exploreControllerMethodUseNativeHandlerMetadata,
      ).toHaveBeenCalledWith(
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
