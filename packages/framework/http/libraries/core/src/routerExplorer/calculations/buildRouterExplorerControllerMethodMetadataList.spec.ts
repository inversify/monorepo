import { afterAll, beforeAll, describe, expect, it, vitest } from 'vitest';

vitest.mock(import('./buildRouterExplorerControllerMethodMetadata.js'));

import { type Logger } from '@inversifyjs/logger';

import { type ControllerMetadata } from '../model/ControllerMetadata.js';
import { type ControllerMethodMetadata } from '../model/ControllerMethodMetadata.js';
import { type RouterExplorerControllerMethodMetadata } from '../model/RouterExplorerControllerMethodMetadata.js';
import { buildRouterExplorerControllerMethodMetadata } from './buildRouterExplorerControllerMethodMetadata.js';
import { buildRouterExplorerControllerMethodMetadataList } from './buildRouterExplorerControllerMethodMetadataList.js';

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
