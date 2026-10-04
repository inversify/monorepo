import {
  afterAll,
  beforeAll,
  describe,
  expect,
  it,
  type Mocked,
  vitest,
} from 'vitest';

vitest.mock(import('../../service/calculations/getServiceMetadataList.js'));
vitest.mock(import('./buildGrpcExplorerServiceMetadata.js'));

import { type Logger } from '@inversifyjs/logger';
import { type Container } from 'inversify';

import { InversifyGrpcAdapterError } from '../../error/models/InversifyGrpcAdapterError.js';
import { InversifyGrpcAdapterErrorKind } from '../../error/models/InversifyGrpcAdapterErrorKind.js';
import { getServiceMetadataList } from '../../service/calculations/getServiceMetadataList.js';
import { type ServiceMetadata } from '../../service/models/ServiceMetadata.js';
import { type GrpcExplorerServiceMetadata } from '../model/GrpcExplorerServiceMetadata.js';
import { buildGrpcExplorerServiceMetadata } from './buildGrpcExplorerServiceMetadata.js';
import { buildGrpcExplorerServiceMetadataList } from './buildGrpcExplorerServiceMetadataList.js';

describe(buildGrpcExplorerServiceMetadataList, () => {
  let containerMock: Mocked<Container>;
  let loggerFixture: Logger;

  beforeAll(() => {
    containerMock = {
      isBound: vitest.fn(),
    } as Partial<Mocked<Container>> as Mocked<Container>;
    loggerFixture = Symbol() as unknown as Logger;
  });

  describe('when called, and getServiceMetadataList() returns undefined', () => {
    let errorFixture: unknown;

    beforeAll(() => {
      vitest.mocked(getServiceMetadataList).mockReturnValueOnce(undefined);

      try {
        buildGrpcExplorerServiceMetadataList(containerMock, loggerFixture);
      } catch (error: unknown) {
        errorFixture = error;
      }
    });

    afterAll(() => {
      vitest.clearAllMocks();
    });

    it('should throw InversifyGrpcAdapterError', () => {
      expect(errorFixture).toBeInstanceOf(InversifyGrpcAdapterError);
      expect((errorFixture as InversifyGrpcAdapterError).kind).toBe(
        InversifyGrpcAdapterErrorKind.noServiceFound,
      );
      expect((errorFixture as InversifyGrpcAdapterError).message).toBe(
        'No gRPC services found. Please ensure that your services are properly registered in your container and are annotated with the @Service() decorator.',
      );
    });
  });

  describe('when called, and getServiceMetadataList() returns bound and unbound services', () => {
    let boundServiceMetadataFixture: ServiceMetadata;
    let explorerServiceMetadataFixture: GrpcExplorerServiceMetadata;
    let unboundServiceMetadataFixture: ServiceMetadata;
    let result: unknown;

    beforeAll(() => {
      boundServiceMetadataFixture = {
        definition: {},
        serviceIdentifier: Symbol('bound'),
        target: class BoundService {},
      };
      unboundServiceMetadataFixture = {
        definition: {},
        serviceIdentifier: Symbol('unbound'),
        target: class UnboundService {},
      };
      explorerServiceMetadataFixture = {
        definition: {},
        rpcList: [],
        serviceIdentifier: boundServiceMetadataFixture.serviceIdentifier,
        target: boundServiceMetadataFixture.target,
      };

      vitest
        .mocked(getServiceMetadataList)
        .mockReturnValueOnce([
          boundServiceMetadataFixture,
          unboundServiceMetadataFixture,
        ]);

      containerMock.isBound
        .mockReturnValueOnce(true)
        .mockReturnValueOnce(false);

      vitest
        .mocked(buildGrpcExplorerServiceMetadata)
        .mockReturnValueOnce(explorerServiceMetadataFixture);

      result = buildGrpcExplorerServiceMetadataList(
        containerMock,
        loggerFixture,
      );
    });

    afterAll(() => {
      vitest.clearAllMocks();
    });

    it('should call container.isBound() for each service', () => {
      expect(containerMock.isBound).toHaveBeenCalledTimes(2);
      expect(containerMock.isBound).toHaveBeenNthCalledWith(
        1,
        boundServiceMetadataFixture.serviceIdentifier,
      );
      expect(containerMock.isBound).toHaveBeenNthCalledWith(
        2,
        unboundServiceMetadataFixture.serviceIdentifier,
      );
    });

    it('should call buildGrpcExplorerServiceMetadata() for the bound service', () => {
      expect(buildGrpcExplorerServiceMetadata).toHaveBeenCalledExactlyOnceWith(
        loggerFixture,
        boundServiceMetadataFixture,
      );
    });

    it('should return the bound service metadata', () => {
      expect(result).toStrictEqual([explorerServiceMetadataFixture]);
    });
  });
});
