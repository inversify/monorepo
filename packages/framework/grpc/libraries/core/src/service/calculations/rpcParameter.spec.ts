import { afterAll, beforeAll, describe, expect, it, vitest } from 'vitest';

vitest.mock(import('@inversifyjs/reflect-metadata-utils'));

import {
  buildArrayMetadataWithIndex,
  buildEmptyArrayMetadata,
  updateOwnReflectMetadata,
} from '@inversifyjs/reflect-metadata-utils';

import { InversifyGrpcAdapterError } from '../../error/models/InversifyGrpcAdapterError.js';
import { InversifyGrpcAdapterErrorKind } from '../../error/models/InversifyGrpcAdapterErrorKind.js';
import { rpcParameterMetadataReflectKey } from '../../reflectMetadata/data/rpcParameterMetadataReflectKey.js';
import { type RpcParameterMetadata } from '../models/RpcParameterMetadata.js';
import { RpcParameterType } from '../models/RpcParameterType.js';
import { rpcParameter } from './rpcParameter.js';

describe(rpcParameter, () => {
  let rpcParameterMetadataFixture: RpcParameterMetadata;

  beforeAll(() => {
    rpcParameterMetadataFixture = {
      parameterType: RpcParameterType.Call,
      pipeList: [],
    };
  });

  describe('having a method parameter', () => {
    describe('when called', () => {
      let callbackFixture: (arrayMetadata: unknown[]) => unknown[];
      let indexFixture: number;
      let keyFixture: string;
      let targetFixture: object;

      beforeAll(() => {
        callbackFixture = (arrayMetadata: unknown[]): unknown[] =>
          arrayMetadata;
        indexFixture = 1;
        keyFixture = 'getHero';
        targetFixture = {};

        vitest
          .mocked(buildArrayMetadataWithIndex)
          .mockReturnValueOnce(callbackFixture);

        rpcParameter(rpcParameterMetadataFixture)(
          targetFixture,
          keyFixture,
          indexFixture,
        );
      });

      afterAll(() => {
        vitest.clearAllMocks();
      });

      it('should call buildArrayMetadataWithIndex()', () => {
        expect(buildArrayMetadataWithIndex).toHaveBeenCalledExactlyOnceWith(
          rpcParameterMetadataFixture,
          indexFixture,
        );
      });

      it('should call updateOwnReflectMetadata()', () => {
        expect(updateOwnReflectMetadata).toHaveBeenCalledExactlyOnceWith(
          targetFixture.constructor,
          rpcParameterMetadataReflectKey,
          buildEmptyArrayMetadata,
          callbackFixture,
          keyFixture,
        );
      });
    });
  });

  describe('having a constructor parameter', () => {
    describe('when called', () => {
      let errorFixture: unknown;

      beforeAll(() => {
        try {
          rpcParameter(rpcParameterMetadataFixture)({}, undefined, 0);
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
          InversifyGrpcAdapterErrorKind.rpcParameterIncorrectUse,
        );
        expect((errorFixture as InversifyGrpcAdapterError).message).toBe(
          'Expected an RPC parameter decorator on a method parameter, but it was found on a constructor parameter',
        );
      });

      it('should not call updateOwnReflectMetadata()', () => {
        expect(updateOwnReflectMetadata).not.toHaveBeenCalled();
      });
    });
  });
});
