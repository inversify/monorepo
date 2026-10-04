import { afterAll, beforeAll, describe, expect, it, vitest } from 'vitest';

vitest.mock(import('@inversifyjs/prototype-utils'));
vitest.mock(import('@inversifyjs/reflect-metadata-utils'));

import { getBaseType } from '@inversifyjs/prototype-utils';
import { getOwnReflectMetadata } from '@inversifyjs/reflect-metadata-utils';
import { type Newable } from 'inversify';

import { InversifyGrpcAdapterError } from '../../error/models/InversifyGrpcAdapterError.js';
import { InversifyGrpcAdapterErrorKind } from '../../error/models/InversifyGrpcAdapterErrorKind.js';
import { rpcMetadataReflectKey } from '../../reflectMetadata/data/rpcMetadataReflectKey.js';
import { type RpcMetadata } from '../models/RpcMetadata.js';
import { getRpcMetadataList } from './getRpcMetadataList.js';

describe(getRpcMetadataList, () => {
  describe('when called, and getOwnReflectMetadata() returns undefined', () => {
    let targetFixture: Newable;
    let result: unknown;

    beforeAll(() => {
      targetFixture = class HeroService {};

      vitest.mocked(getBaseType).mockReturnValueOnce(undefined);

      result = getRpcMetadataList(targetFixture);
    });

    afterAll(() => {
      vitest.clearAllMocks();
    });

    it('should call getOwnReflectMetadata()', () => {
      expect(getOwnReflectMetadata).toHaveBeenCalledExactlyOnceWith(
        targetFixture,
        rpcMetadataReflectKey,
      );
    });

    it('should call getBaseType()', () => {
      expect(getBaseType).toHaveBeenCalledExactlyOnceWith(targetFixture);
    });

    it('should return an empty array', () => {
      expect(result).toStrictEqual([]);
    });
  });

  describe('when called, and getBaseType() returns a base class that redefines an RPC name', () => {
    let baseTargetFixture: Newable;
    let baseKeepMetadataFixture: RpcMetadata;
    let baseRunMetadataFixture: RpcMetadata;
    let childRunMetadataFixture: RpcMetadata;
    let targetFixture: Newable;
    let result: unknown;

    beforeAll(() => {
      baseTargetFixture = class ParentService {};
      targetFixture = class ChildService {};
      baseKeepMetadataFixture = {
        methodKey: 'keep',
        name: 'Keep',
      };
      baseRunMetadataFixture = {
        methodKey: 'parentRun',
        name: 'Run',
      };
      childRunMetadataFixture = {
        methodKey: 'childRun',
        name: 'Run',
      };

      vitest
        .mocked(getOwnReflectMetadata)
        .mockReturnValueOnce([childRunMetadataFixture])
        .mockReturnValueOnce([baseRunMetadataFixture, baseKeepMetadataFixture]);

      vitest
        .mocked(getBaseType)
        .mockReturnValueOnce(baseTargetFixture)
        .mockReturnValueOnce(undefined);

      result = getRpcMetadataList(targetFixture);
    });

    afterAll(() => {
      vitest.clearAllMocks();
    });

    it('should call getOwnReflectMetadata() for each type', () => {
      expect(getOwnReflectMetadata).toHaveBeenCalledTimes(2);
      expect(getOwnReflectMetadata).toHaveBeenNthCalledWith(
        1,
        targetFixture,
        rpcMetadataReflectKey,
      );
      expect(getOwnReflectMetadata).toHaveBeenNthCalledWith(
        2,
        baseTargetFixture,
        rpcMetadataReflectKey,
      );
    });

    it('should keep the subclass RPC and the inherited RPC names', () => {
      expect(result).toStrictEqual([
        childRunMetadataFixture,
        baseKeepMetadataFixture,
      ]);
    });
  });

  describe('when called, and getOwnReflectMetadata() returns two RPCs with the same name', () => {
    let errorFixture: unknown;
    let targetFixture: Newable;

    beforeAll(() => {
      targetFixture = class DuplicateService {};

      vitest.mocked(getOwnReflectMetadata).mockReturnValueOnce([
        {
          methodKey: 'first',
          name: 'Same',
        },
        {
          methodKey: 'second',
          name: 'Same',
        },
      ]);

      try {
        getRpcMetadataList(targetFixture);
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
        InversifyGrpcAdapterErrorKind.invalidRpc,
      );
      expect((errorFixture as InversifyGrpcAdapterError).message).toBe(
        'Duplicate @RPC("Same") on DuplicateService',
      );
    });
  });
});
