import { beforeAll, describe, expect, it, vitest } from 'vitest';

vitest.mock('./getControllerMethodMetadataList');
vitest.mock('./buildRouterExplorerControllerMethodMetadataList');

import { Logger } from '@inversifyjs/logger';

import { ControllerMetadata } from '../model/ControllerMetadata';
import { ControllerMethodMetadata } from '../model/ControllerMethodMetadata';
import { RouterExplorerControllerMetadata } from '../model/RouterExplorerControllerMetadata';
import { RouterExplorerControllerMethodMetadata } from '../model/RouterExplorerControllerMethodMetadata';
import { buildRouterExplorerControllerMetadata } from './buildRouterExplorerControllerMetadata';
import { buildRouterExplorerControllerMethodMetadataList } from './buildRouterExplorerControllerMethodMetadataList';
import { getControllerMethodMetadataList } from './getControllerMethodMetadataList';

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
