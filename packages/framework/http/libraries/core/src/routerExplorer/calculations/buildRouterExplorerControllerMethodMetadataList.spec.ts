import { afterAll, beforeAll, describe, expect, it, vitest } from 'vitest';

vitest.mock('./buildRouterExplorerControllerMethodMetadata');

import { ControllerMetadata } from '../model/ControllerMetadata';
import { ControllerMethodMetadata } from '../model/ControllerMethodMetadata';
import { RouterExplorerControllerMethodMetadata } from '../model/RouterExplorerControllerMethodMetadata';
import { buildRouterExplorerControllerMethodMetadata } from './buildRouterExplorerControllerMethodMetadata';
import { buildRouterExplorerControllerMethodMetadataList } from './buildRouterExplorerControllerMethodMetadataList';

describe(buildRouterExplorerControllerMethodMetadataList, () => {
  describe('when called', () => {
    let controllerMetadataFixture: ControllerMetadata;
    let controllerMethodMetadataFixture: ControllerMethodMetadata;
    let controllerMethodMetadataListFixture: ControllerMethodMetadata[];
    let routerExplorerControllerMethodMetadataFixture: RouterExplorerControllerMethodMetadata;
    let result: unknown;

    beforeAll(() => {
      controllerMetadataFixture = {
        path: '/',
        serviceIdentifier: Symbol(),
        target: class Test {},
      };
      controllerMethodMetadataFixture = {} as ControllerMethodMetadata;
      controllerMethodMetadataListFixture = [controllerMethodMetadataFixture];
      routerExplorerControllerMethodMetadataFixture =
        {} as RouterExplorerControllerMethodMetadata;

      vitest
        .mocked(buildRouterExplorerControllerMethodMetadata)
        .mockReturnValueOnce(routerExplorerControllerMethodMetadataFixture);

      result = buildRouterExplorerControllerMethodMetadataList(
        controllerMetadataFixture,
        controllerMethodMetadataListFixture,
      );
    });

    afterAll(() => {
      vitest.clearAllMocks();
    });

    it('should call buildRouterExplorerControllerMethodMetadata()', () => {
      expect(
        buildRouterExplorerControllerMethodMetadata,
      ).toHaveBeenCalledExactlyOnceWith(
        controllerMetadataFixture,
        controllerMethodMetadataFixture,
      );
    });

    it('should return RouterExplorerControllerMethodMetadata[]', () => {
      expect(result).toStrictEqual([
        routerExplorerControllerMethodMetadataFixture,
      ]);
    });
  });
});
