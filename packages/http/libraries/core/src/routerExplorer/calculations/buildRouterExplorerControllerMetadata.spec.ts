import { beforeAll, describe, expect, it, vitest } from 'vitest';

vitest.mock('@inversifyjs/framework-core');

vitest.mock('./exploreControllerMethodMetadataList');
vitest.mock('./buildRouterExplorerControllerMethodMetadataList');

import {
  buildMiddlewareOptionsFromApplyMiddlewareOptions,
  exploreClassGuardList,
  exploreClassMiddlewareList,
  MiddlewareOptions,
} from '@inversifyjs/framework-core';

import { ControllerMetadata } from '../model/ControllerMetadata';
import { ControllerMethodMetadata } from '../model/ControllerMethodMetadata';
import { RouterExplorerControllerMethodMetadata } from '../model/RouterExplorerControllerMethodMetadata';
import { buildRouterExplorerControllerMetadata } from './buildRouterExplorerControllerMetadata';
import { buildRouterExplorerControllerMethodMetadataList } from './buildRouterExplorerControllerMethodMetadataList';
import { exploreControllerMethodMetadataList } from './exploreControllerMethodMetadataList';

describe(buildRouterExplorerControllerMetadata, () => {
  describe('when called', () => {
    let controllerMetadataFixture: ControllerMetadata;
    let controllerMethodMetadataListFixture: ControllerMethodMetadata[];
    let controllerGuardListFixture: NewableFunction[];
    let controllerMiddlewareListFixture: NewableFunction[];
    let middlewareOptionsFixture: MiddlewareOptions;
    let routerExplorerControllerMethodMetadataListFixture: RouterExplorerControllerMethodMetadata[];
    let result: unknown;

    beforeAll(() => {
      controllerMetadataFixture = {
        path: '/test',
        target: class TestController {},
      };
      controllerMethodMetadataListFixture = [];
      controllerGuardListFixture = [];
      controllerMiddlewareListFixture = [];
      middlewareOptionsFixture = {
        postHandlerMiddlewareList: [],
        preHandlerMiddlewareList: [],
      };
      routerExplorerControllerMethodMetadataListFixture = [];

      vitest
        .mocked(exploreControllerMethodMetadataList)
        .mockReturnValueOnce(controllerMethodMetadataListFixture);

      vitest
        .mocked(exploreClassGuardList)
        .mockReturnValueOnce(controllerGuardListFixture);

      vitest
        .mocked(exploreClassMiddlewareList)
        .mockReturnValueOnce(controllerMiddlewareListFixture);

      vitest
        .mocked(buildMiddlewareOptionsFromApplyMiddlewareOptions)
        .mockReturnValueOnce(middlewareOptionsFixture);

      vitest
        .mocked(buildRouterExplorerControllerMethodMetadataList)
        .mockReturnValueOnce(routerExplorerControllerMethodMetadataListFixture);

      result = buildRouterExplorerControllerMetadata(controllerMetadataFixture);
    });

    it('should call exploreControllerMethodMetadataList', () => {
      expect(exploreControllerMethodMetadataList).toHaveBeenCalledTimes(1);
      expect(exploreControllerMethodMetadataList).toHaveBeenCalledWith(
        controllerMetadataFixture.target,
      );
    });

    it('should call exploreClassGuardList', () => {
      expect(exploreClassGuardList).toHaveBeenCalledTimes(1);
      expect(exploreClassGuardList).toHaveBeenCalledWith(
        controllerMetadataFixture.target,
      );
    });

    it('should call exploreControllerMiddlewareList', () => {
      expect(exploreClassMiddlewareList).toHaveBeenCalledTimes(1);
      expect(exploreClassMiddlewareList).toHaveBeenCalledWith(
        controllerMetadataFixture.target,
      );
    });

    it('should call buildMiddlewareOptionsFromApplyMiddlewareOptions', () => {
      expect(
        buildMiddlewareOptionsFromApplyMiddlewareOptions,
      ).toHaveBeenCalledTimes(1);
      expect(
        buildMiddlewareOptionsFromApplyMiddlewareOptions,
      ).toHaveBeenCalledWith(controllerMiddlewareListFixture);
    });

    it('should call buildRouterExplorerControllerMethodMetadataList', () => {
      expect(
        buildRouterExplorerControllerMethodMetadataList,
      ).toHaveBeenCalledTimes(1);
      expect(
        buildRouterExplorerControllerMethodMetadataList,
      ).toHaveBeenCalledWith(
        controllerMetadataFixture.target,
        controllerMethodMetadataListFixture,
      );
    });

    it('should return a RouterExplorerControllerMetadata', () => {
      expect(result).toStrictEqual({
        controllerMethodMetadataList:
          routerExplorerControllerMethodMetadataListFixture,
        guardList: controllerGuardListFixture,
        path: controllerMetadataFixture.path,
        postHandlerMiddlewareList:
          middlewareOptionsFixture.postHandlerMiddlewareList,
        preHandlerMiddlewareList:
          middlewareOptionsFixture.preHandlerMiddlewareList,
        target: controllerMetadataFixture.target,
      });
    });
  });
});
