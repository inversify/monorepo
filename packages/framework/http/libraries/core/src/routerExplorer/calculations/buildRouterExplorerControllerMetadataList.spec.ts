import {
  afterAll,
  beforeAll,
  describe,
  expect,
  it,
  Mocked,
  vitest,
} from 'vitest';

vitest.mock('./getControllerMetadataList');
vitest.mock('./buildRouterExplorerControllerMetadata');

import { Container } from 'inversify';

import { InversifyHttpAdapterError } from '../../error/models/InversifyHttpAdapterError';
import { InversifyHttpAdapterErrorKind } from '../../error/models/InversifyHttpAdapterErrorKind';
import { ControllerMetadata } from '../model/ControllerMetadata';
import { RouterExplorerControllerMetadata } from '../model/RouterExplorerControllerMetadata';
import { buildRouterExplorerControllerMetadata } from './buildRouterExplorerControllerMetadata';
import { buildRouterExplorerControllerMetadataList } from './buildRouterExplorerControllerMetadataList';
import { getControllerMetadataList } from './getControllerMetadataList';

describe(buildRouterExplorerControllerMetadataList, () => {
  describe('when called, and exploreControllers returns undefined', () => {
    let containerMock: Mocked<Container>;
    let controllerMetadataListFixture: undefined;
    let result: unknown;

    beforeAll(async () => {
      containerMock = {} as Partial<Mocked<Container>> as Mocked<Container>;
      controllerMetadataListFixture = undefined;

      vitest
        .mocked(getControllerMetadataList)
        .mockReturnValueOnce(controllerMetadataListFixture);

      try {
        result = buildRouterExplorerControllerMetadataList(containerMock);
      } catch (error: unknown) {
        result = error;
      }
    });

    afterAll(() => {
      vitest.clearAllMocks();
    });

    it('should call exploreControllers', () => {
      expect(getControllerMetadataList).toHaveBeenCalledTimes(1);
      expect(getControllerMetadataList).toHaveBeenCalledWith();
    });

    it('should throw an InversifyHttpAdapterError with the correct kind', () => {
      expect(result).toBeInstanceOf(InversifyHttpAdapterError);
      expect(result).toHaveProperty(
        'kind',
        InversifyHttpAdapterErrorKind.noControllerFound,
      );
    });
  });

  describe('when called, and exploreControllers returns a ControllerMetadata list', () => {
    let containerMock: Mocked<Container>;
    let controllerMetadataFixture: ControllerMetadata;
    let controllerMetadataListFixture: ControllerMetadata[];
    let routerExplorerControllerMetadataFixture: RouterExplorerControllerMetadata;
    let result: unknown;

    beforeAll(async () => {
      containerMock = { isBound: vitest.fn() } as Partial<
        Mocked<Container>
      > as Mocked<Container>;
      controllerMetadataFixture = {
        path: '',
        serviceIdentifier: Symbol(),
        target: {} as NewableFunction,
      };
      controllerMetadataListFixture = [controllerMetadataFixture];
      routerExplorerControllerMetadataFixture = {
        controllerMethodMetadataList: [],
        path: '',
        postHandlerMiddlewareList: [],
        preHandlerMiddlewareList: [],
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

      result = buildRouterExplorerControllerMetadataList(containerMock);
    });

    afterAll(() => {
      vitest.clearAllMocks();
    });

    it('should call getControllerMetadataList()', () => {
      expect(getControllerMetadataList).toHaveBeenCalledTimes(1);
      expect(getControllerMetadataList).toHaveBeenCalledWith();
    });

    it('should call container.isBound()', () => {
      expect(containerMock.isBound).toHaveBeenCalledTimes(1);
      expect(containerMock.isBound).toHaveBeenCalledWith(
        controllerMetadataFixture.serviceIdentifier,
      );
    });

    it('should call buildRouterExplorerControllerMetadata()', () => {
      expect(buildRouterExplorerControllerMetadata).toHaveBeenCalledTimes(1);
      expect(buildRouterExplorerControllerMetadata).toHaveBeenCalledWith(
        controllerMetadataFixture,
      );
    });

    it('should return RouterExplorerControllerMetadata[]', () => {
      expect(result).toStrictEqual([routerExplorerControllerMetadataFixture]);
    });
  });
});
