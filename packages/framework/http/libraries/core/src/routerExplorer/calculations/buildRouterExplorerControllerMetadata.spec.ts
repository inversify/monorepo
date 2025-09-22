import { beforeAll, describe, expect, it, vitest } from 'vitest';

vitest.mock('./getControllerMethodMetadataList');
vitest.mock('./buildRouterExplorerControllerMethodMetadataList');

import { ControllerMetadata } from '../model/ControllerMetadata';
import { ControllerMethodMetadata } from '../model/ControllerMethodMetadata';
import { RouterExplorerControllerMetadata } from '../model/RouterExplorerControllerMetadata';
import { RouterExplorerControllerMethodMetadata } from '../model/RouterExplorerControllerMethodMetadata';
import { buildRouterExplorerControllerMetadata } from './buildRouterExplorerControllerMetadata';
import { buildRouterExplorerControllerMethodMetadataList } from './buildRouterExplorerControllerMethodMetadataList';
import { getControllerMethodMetadataList } from './getControllerMethodMetadataList';

describe(buildRouterExplorerControllerMetadata, () => {
  describe('when called', () => {
    let controllerMetadataFixture: ControllerMetadata;
    let controllerMethodMetadataListFixture: ControllerMethodMetadata[];
    let routerExplorerControllerMethodMetadataListFixture: RouterExplorerControllerMethodMetadata[];
    let result: unknown;

    beforeAll(() => {
      controllerMetadataFixture = {
        path: '/test',
        serviceIdentifier: Symbol(),
        target: class TestController {},
      };
      controllerMethodMetadataListFixture = [];
      routerExplorerControllerMethodMetadataListFixture = [];

      vitest
        .mocked(getControllerMethodMetadataList)
        .mockReturnValueOnce(controllerMethodMetadataListFixture);

      vitest
        .mocked(buildRouterExplorerControllerMethodMetadataList)
        .mockReturnValueOnce(routerExplorerControllerMethodMetadataListFixture);

      result = buildRouterExplorerControllerMetadata(controllerMetadataFixture);
    });

    it('should call getControllerMethodMetadataList', () => {
      expect(getControllerMethodMetadataList).toHaveBeenCalledTimes(1);
      expect(getControllerMethodMetadataList).toHaveBeenCalledWith(
        controllerMetadataFixture.target,
      );
    });

    it('should call buildRouterExplorerControllerMethodMetadataList', () => {
      expect(
        buildRouterExplorerControllerMethodMetadataList,
      ).toHaveBeenCalledTimes(1);
      expect(
        buildRouterExplorerControllerMethodMetadataList,
      ).toHaveBeenCalledWith(
        controllerMetadataFixture,
        controllerMethodMetadataListFixture,
      );
    });

    it('should return a RouterExplorerControllerMetadata', () => {
      const expected: RouterExplorerControllerMetadata = {
        controllerMethodMetadataList:
          routerExplorerControllerMethodMetadataListFixture,
        path: controllerMetadataFixture.path,
        serviceIdentifier: controllerMetadataFixture.serviceIdentifier,
        target: controllerMetadataFixture.target,
      };

      expect(result).toStrictEqual(expected);
    });
  });
});
