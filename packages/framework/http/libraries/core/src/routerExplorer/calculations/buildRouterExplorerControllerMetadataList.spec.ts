import {
  afterAll,
  beforeAll,
  describe,
  expect,
  it,
  Mocked,
  vitest,
} from 'vitest';

vitest.mock('./getControllers');
vitest.mock('./buildRouterExplorerControllerMetadata');

import { Container } from 'inversify';

import { InversifyHttpAdapterError } from '../../error/models/InversifyHttpAdapterError';
import { InversifyHttpAdapterErrorKind } from '../../error/models/InversifyHttpAdapterErrorKind';
import { ControllerMetadata } from '../model/ControllerMetadata';
import { RouterExplorerControllerMetadata } from '../model/RouterExplorerControllerMetadata';
import { buildRouterExplorerControllerMetadata } from './buildRouterExplorerControllerMetadata';
import { buildRouterExplorerControllerMetadataList } from './buildRouterExplorerControllerMetadataList';
import { getControllers } from './getControllers';

describe(buildRouterExplorerControllerMetadataList, () => {
  describe('when called, and exploreControllers returns undefined', () => {
    let containerMock: Mocked<Container>;
    let controllerMetadataListFixture: undefined;
    let result: unknown;

    beforeAll(async () => {
      containerMock = {} as Partial<Mocked<Container>> as Mocked<Container>;
      controllerMetadataListFixture = undefined;

      vitest
        .mocked(getControllers)
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
      expect(getControllers).toHaveBeenCalledTimes(1);
      expect(getControllers).toHaveBeenCalledWith();
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
        target: {} as NewableFunction,
      };
      controllerMetadataListFixture = [controllerMetadataFixture];
      routerExplorerControllerMetadataFixture = {
        controllerMethodMetadataList: [],
        path: '',
        postHandlerMiddlewareList: [],
        preHandlerMiddlewareList: [],
        target: {} as NewableFunction,
      };

      vitest
        .mocked(getControllers)
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

    it('should call getControllers()', () => {
      expect(getControllers).toHaveBeenCalledTimes(1);
      expect(getControllers).toHaveBeenCalledWith();
    });

    it('should call container.isBound()', () => {
      expect(containerMock.isBound).toHaveBeenCalledTimes(1);
      expect(containerMock.isBound).toHaveBeenCalledWith(
        controllerMetadataFixture.target,
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
