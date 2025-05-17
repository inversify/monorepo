import { afterAll, beforeAll, describe, expect, it, vitest } from 'vitest';

vitest.mock('./buildRouterExplorerControllerMethodMetadata');

import { ControllerMethodMetadata } from '../model/ControllerMethodMetadata';
import { RouterExplorerControllerMethodMetadata } from '../model/RouterExplorerControllerMethodMetadata';
import { buildRouterExplorerControllerMethodMetadata } from './buildRouterExplorerControllerMethodMetadata';
import { buildRouterExplorerControllerMethodMetadataList } from './buildRouterExplorerControllerMethodMetadataList';

describe(buildRouterExplorerControllerMethodMetadataList.name, () => {
  describe('when called', () => {
    let controllerFixture: NewableFunction;
    let controllerMethodMetadataFixture: ControllerMethodMetadata;
    let controllerMethodMetadataListFixture: ControllerMethodMetadata[];
    let routerExplorerControllerMethodMetadataFixture: RouterExplorerControllerMethodMetadata;
    let result: unknown;

    beforeAll(() => {
      controllerFixture = class Test {};
      controllerMethodMetadataFixture = {} as ControllerMethodMetadata;
      controllerMethodMetadataListFixture = [controllerMethodMetadataFixture];
      routerExplorerControllerMethodMetadataFixture =
        {} as RouterExplorerControllerMethodMetadata;

      vitest
        .mocked(buildRouterExplorerControllerMethodMetadata)
        .mockReturnValueOnce(routerExplorerControllerMethodMetadataFixture);

      result = buildRouterExplorerControllerMethodMetadataList(
        controllerFixture,
        controllerMethodMetadataListFixture,
      );
    });

    afterAll(() => {
      vitest.clearAllMocks();
    });

    it('should call buildRouterExplorerControllerMethodMetadata', () => {
      expect(buildRouterExplorerControllerMethodMetadata).toHaveBeenCalledTimes(
        1,
      );

      expect(buildRouterExplorerControllerMethodMetadata).toHaveBeenCalledWith(
        controllerFixture,
        controllerMethodMetadataFixture,
      );
    });

    it('should return an array', () => {
      expect(result).toStrictEqual([
        routerExplorerControllerMethodMetadataFixture,
      ]);
    });
  });
});
