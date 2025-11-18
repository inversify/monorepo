import { afterAll, beforeAll, describe, expect, it, vitest } from 'vitest';

vitest.mock('./buildRouterExplorerControllerMethodMetadata');

import { Logger } from '@inversifyjs/logger';

import { ControllerMetadata } from '../model/ControllerMetadata';
import { ControllerMethodMetadata } from '../model/ControllerMethodMetadata';
import { RouterExplorerControllerMethodMetadata } from '../model/RouterExplorerControllerMethodMetadata';
import { buildRouterExplorerControllerMethodMetadata } from './buildRouterExplorerControllerMethodMetadata';
import { buildRouterExplorerControllerMethodMetadataList } from './buildRouterExplorerControllerMethodMetadataList';

describe(buildRouterExplorerControllerMethodMetadataList, () => {
  let loggerFixture: Logger;
  let controllerMetadataFixture: ControllerMetadata;
  let controllerMethodMetadataFixture: ControllerMethodMetadata;

  beforeAll(() => {
    loggerFixture = Symbol() as unknown as Logger;
    controllerMetadataFixture = {
      path: '/',
      priority: 0,
      serviceIdentifier: Symbol(),
      target: class Test {},
    };
    controllerMethodMetadataFixture = {} as ControllerMethodMetadata;
  });

  describe('when called', () => {
    let controllerMethodMetadataListFixture: ControllerMethodMetadata[];
    let routerExplorerControllerMethodMetadataFixture: RouterExplorerControllerMethodMetadata;
    let result: unknown;

    beforeAll(() => {
      controllerMethodMetadataListFixture = [controllerMethodMetadataFixture];
      routerExplorerControllerMethodMetadataFixture =
        {} as RouterExplorerControllerMethodMetadata;

      vitest
        .mocked(buildRouterExplorerControllerMethodMetadata)
        .mockReturnValueOnce(routerExplorerControllerMethodMetadataFixture);

      result = buildRouterExplorerControllerMethodMetadataList(
        loggerFixture,
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
        loggerFixture,
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
