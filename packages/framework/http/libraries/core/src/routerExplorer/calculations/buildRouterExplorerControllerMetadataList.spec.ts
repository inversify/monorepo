import {
  afterAll,
  beforeAll,
  describe,
  expect,
  it,
  type Mocked,
  vitest,
} from 'vitest';

vitest.mock(import('./getControllerMetadataList.js'));
vitest.mock(import('./buildRouterExplorerControllerMetadata.js'));

import { type Logger } from '@inversifyjs/logger';
import { type Container } from 'inversify';

import { InversifyHttpAdapterError } from '../../error/models/InversifyHttpAdapterError.js';
import { InversifyHttpAdapterErrorKind } from '../../error/models/InversifyHttpAdapterErrorKind.js';
import { type ControllerMetadata } from '../model/ControllerMetadata.js';
import { type RouterExplorerControllerMetadata } from '../model/RouterExplorerControllerMetadata.js';
import { buildRouterExplorerControllerMetadata } from './buildRouterExplorerControllerMetadata.js';
import { buildRouterExplorerControllerMetadataList } from './buildRouterExplorerControllerMetadataList.js';
import { getControllerMetadataList } from './getControllerMetadataList.js';

describe(buildRouterExplorerControllerMetadataList, () => {
  let containerMock: Mocked<Container>;
  let loggerFixture: Logger;

  beforeAll(() => {
    containerMock = {
      isBound: vitest.fn(),
    } as Partial<Mocked<Container>> as Mocked<Container>;
    loggerFixture = Symbol() as unknown as Logger;
  });

  describe('when called, and getControllerMetadataList() returns undefined', () => {
    let controllerMetadataListFixture: undefined;
    let result: unknown;

    beforeAll(async () => {
      controllerMetadataListFixture = undefined;

      vitest
        .mocked(getControllerMetadataList)
        .mockReturnValueOnce(controllerMetadataListFixture);

      try {
        buildRouterExplorerControllerMetadataList(containerMock, loggerFixture);
      } catch (error: unknown) {
        result = error;
      }
    });

    afterAll(() => {
      vitest.clearAllMocks();
    });

    it('should call exploreControllers', () => {
      expect(getControllerMetadataList).toHaveBeenCalledExactlyOnceWith();
    });

    it('should throw an InversifyHttpAdapterError', () => {
      const expectedErrorProperties: Partial<InversifyHttpAdapterError> = {
        kind: InversifyHttpAdapterErrorKind.noControllerFound,
        message:
          'No controllers found. Please ensure that your controllers are properly registered in your container and are annotated with the @Controller() decorator.',
      };

      expect(result).toBeInstanceOf(InversifyHttpAdapterError);
      expect(result).toStrictEqual(
        expect.objectContaining(expectedErrorProperties),
      );
    });
  });

  describe('when called, and getControllerMetadataList() returns a ControllerMetadata list', () => {
    let controllerMetadataFixture: ControllerMetadata;
    let controllerMetadataListFixture: ControllerMetadata[];
    let routerExplorerControllerMetadataFixture: RouterExplorerControllerMetadata;
    let result: unknown;

    beforeAll(async () => {
      controllerMetadataFixture = {
        path: '',
        priority: 0,
        serviceIdentifier: Symbol(),
        target: {} as NewableFunction,
      };
      controllerMetadataListFixture = [controllerMetadataFixture];
      routerExplorerControllerMetadataFixture = {
        controllerMethodMetadataList: [],
        path: '',
        serviceIdentifier: Symbol(),
        target: {} as NewableFunction,
      };

      vitest
        .mocked(getControllerMetadataList)
        .mockReturnValueOnce(controllerMetadataListFixture);

      containerMock.isBound.mockReturnValueOnce(true);

      vitest
        .mocked(buildRouterExplorerControllerMetadata)
        .mockReturnValueOnce(routerExplorerControllerMetadataFixture);

      result = buildRouterExplorerControllerMetadataList(
        containerMock,
        loggerFixture,
      );
    });

    afterAll(() => {
      vitest.clearAllMocks();
    });

    it('should call getControllerMetadataList()', () => {
      expect(getControllerMetadataList).toHaveBeenCalledExactlyOnceWith();
    });

    it('should call container.isBound()', () => {
      expect(containerMock.isBound).toHaveBeenCalledExactlyOnceWith(
        controllerMetadataFixture.serviceIdentifier,
      );
    });

    it('should call buildRouterExplorerControllerMetadata()', () => {
      expect(
        buildRouterExplorerControllerMetadata,
      ).toHaveBeenCalledExactlyOnceWith(
        loggerFixture,
        controllerMetadataFixture,
      );
    });

    it('should return RouterExplorerControllerMetadata[]', () => {
      expect(result).toStrictEqual([routerExplorerControllerMetadataFixture]);
    });
  });
});
