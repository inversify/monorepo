import { beforeAll, describe, expect, it, vitest } from 'vitest';

vitest.mock(import('./getControllerMethodMetadataList.js'));
vitest.mock(import('./buildRouterExplorerControllerMethodMetadataList.js'));

import { type Logger } from '@inversifyjs/logger';

import { type ControllerMetadata } from '../model/ControllerMetadata.js';
import { type ControllerMethodMetadata } from '../model/ControllerMethodMetadata.js';
import { type RouterExplorerControllerMetadata } from '../model/RouterExplorerControllerMetadata.js';
import { type RouterExplorerControllerMethodMetadata } from '../model/RouterExplorerControllerMethodMetadata.js';
import { buildRouterExplorerControllerMetadata } from './buildRouterExplorerControllerMetadata.js';
import { buildRouterExplorerControllerMethodMetadataList } from './buildRouterExplorerControllerMethodMetadataList.js';
import { getControllerMethodMetadataList } from './getControllerMethodMetadataList.js';

describe(buildRouterExplorerControllerMetadata, () => {
  let loggerFixture: Logger;
  let controllerMetadataFixture: ControllerMetadata;

  beforeAll(() => {
    loggerFixture = Symbol() as unknown as Logger;

    controllerMetadataFixture = {
      path: '/test',
      priority: 0,
      serviceIdentifier: Symbol(),
      target: class TestController {},
    };
  });

  describe('when called', () => {
    let controllerMethodMetadataListFixture: ControllerMethodMetadata[];
    let routerExplorerControllerMethodMetadataListFixture: RouterExplorerControllerMethodMetadata[];
    let result: unknown;

    beforeAll(() => {
      controllerMethodMetadataListFixture = [];
      routerExplorerControllerMethodMetadataListFixture = [];

      vitest
        .mocked(getControllerMethodMetadataList)
        .mockReturnValueOnce(controllerMethodMetadataListFixture);

      vitest
        .mocked(buildRouterExplorerControllerMethodMetadataList)
        .mockReturnValueOnce(routerExplorerControllerMethodMetadataListFixture);

      result = buildRouterExplorerControllerMetadata(
        loggerFixture,
        controllerMetadataFixture,
      );
    });

    it('should call getControllerMethodMetadataList', () => {
      expect(getControllerMethodMetadataList).toHaveBeenCalledExactlyOnceWith(
        controllerMetadataFixture.target,
      );
    });

    it('should call buildRouterExplorerControllerMethodMetadataList', () => {
      expect(
        buildRouterExplorerControllerMethodMetadataList,
      ).toHaveBeenCalledExactlyOnceWith(
        loggerFixture,
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
