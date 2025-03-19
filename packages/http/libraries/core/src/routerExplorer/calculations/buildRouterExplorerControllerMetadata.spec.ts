import { beforeAll, describe, expect, it, Mocked, vitest } from 'vitest';

vitest.mock('./exploreControllerMethodMetadataList');
vitest.mock('./exploreControllerGuardList');
vitest.mock('./exploreControllerMiddlewareList');
vitest.mock('./buildMiddlewareOptionsFromApplyMiddlewareOptions');
vitest.mock('./buildRouterExplorerControllerMethodMetadataList');

import { Container } from 'inversify';

import { Controller } from '../../http/models/Controller';
import { ControllerMetadata } from '../model/ControllerMetadata';
import { ControllerMethodMetadata } from '../model/ControllerMethodMetadata';
import { MiddlewareOptions } from '../model/MiddlewareOptions';
import { RouterExplorerControllerMethodMetadata } from '../model/RouterExplorerControllerMethodMetadata';
import { buildMiddlewareOptionsFromApplyMiddlewareOptions } from './buildMiddlewareOptionsFromApplyMiddlewareOptions';
import { buildRouterExplorerControllerMetadata } from './buildRouterExplorerControllerMetadata';
import { buildRouterExplorerControllerMethodMetadataList } from './buildRouterExplorerControllerMethodMetadataList';
import { exploreControllerGuardList } from './exploreControllerGuardList';
import { exploreControllerMethodMetadataList } from './exploreControllerMethodMetadataList';
import { exploreControllerMiddlewareList } from './exploreControllerMiddlewareList';

describe(buildRouterExplorerControllerMetadata.name, () => {
  describe('when called', () => {
    let containerMock: Mocked<Container>;
    let controllerMetadataFixture: ControllerMetadata;
    let controllerMethodMetadataListFixture: ControllerMethodMetadata[];
    let controllerGuardListFixture: NewableFunction[];
    let controllerMiddlewareListFixture: NewableFunction[];
    let controllerFixture: Controller;
    let middlewareOptionsFixture: MiddlewareOptions;
    let routerExplorerControllerMethodMetadataListFixture: RouterExplorerControllerMethodMetadata[];
    let result: unknown;

    beforeAll(async () => {
      containerMock = {
        getAsync: vitest.fn(),
      } as Partial<Mocked<Container>> as Mocked<Container>;
      controllerMetadataFixture = {
        path: '/test',
        target: class TestController {},
      };
      controllerMethodMetadataListFixture = [];
      controllerGuardListFixture = [];
      controllerMiddlewareListFixture = [];
      controllerFixture = {} as Controller;
      middlewareOptionsFixture = {
        postHandlerMiddlewareList: [],
        preHandlerMiddlewareList: [],
      };
      routerExplorerControllerMethodMetadataListFixture = [];

      vitest
        .mocked(exploreControllerMethodMetadataList)
        .mockReturnValueOnce(controllerMethodMetadataListFixture);

      vitest
        .mocked(exploreControllerGuardList)
        .mockReturnValueOnce(controllerGuardListFixture);

      vitest
        .mocked(exploreControllerMiddlewareList)
        .mockReturnValueOnce(controllerMiddlewareListFixture);

      vitest
        .mocked(buildMiddlewareOptionsFromApplyMiddlewareOptions)
        .mockReturnValueOnce(middlewareOptionsFixture);

      containerMock.getAsync.mockResolvedValueOnce(controllerFixture);

      vitest
        .mocked(buildRouterExplorerControllerMethodMetadataList)
        .mockReturnValueOnce(routerExplorerControllerMethodMetadataListFixture);

      result = await buildRouterExplorerControllerMetadata(
        containerMock,
        controllerMetadataFixture,
      );
    });

    it('should call exploreControllerMethodMetadataList', () => {
      expect(exploreControllerMethodMetadataList).toHaveBeenCalledTimes(1);
      expect(exploreControllerMethodMetadataList).toHaveBeenCalledWith(
        controllerMetadataFixture.target,
      );
    });

    it('should call exploreControllerGuardList', () => {
      expect(exploreControllerGuardList).toHaveBeenCalledTimes(1);
      expect(exploreControllerGuardList).toHaveBeenCalledWith(
        controllerMetadataFixture.target,
      );
    });

    it('should call exploreControllerMiddlewareList', () => {
      expect(exploreControllerMiddlewareList).toHaveBeenCalledTimes(1);
      expect(exploreControllerMiddlewareList).toHaveBeenCalledWith(
        controllerMetadataFixture.target,
      );
    });

    it('should call container.getAsync', () => {
      expect(containerMock.getAsync).toHaveBeenCalledTimes(1);
      expect(containerMock.getAsync).toHaveBeenCalledWith(
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
        controllerFixture,
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
