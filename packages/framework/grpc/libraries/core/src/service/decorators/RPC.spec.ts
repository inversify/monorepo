import { afterAll, beforeAll, describe, expect, it, vitest } from 'vitest';

vitest.mock(import('@inversifyjs/reflect-metadata-utils'));

import {
  buildArrayMetadataWithElement,
  buildEmptyArrayMetadata,
  updateOwnReflectMetadata,
} from '@inversifyjs/reflect-metadata-utils';

import { InversifyGrpcAdapterError } from '../../error/models/InversifyGrpcAdapterError.js';
import { InversifyGrpcAdapterErrorKind } from '../../error/models/InversifyGrpcAdapterErrorKind.js';
import { rpcMetadataReflectKey } from '../../reflectMetadata/data/rpcMetadataReflectKey.js';
import { RPC } from './RPC.js';

describe(RPC, () => {
  describe('having a name', () => {
    describe('when called', () => {
      let callbackFixture: (arrayMetadata: unknown[]) => unknown[];
      let keyFixture: string;
      let nameFixture: string;
      let targetFixture: object;

      beforeAll(() => {
        callbackFixture = (arrayMetadata: unknown[]): unknown[] =>
          arrayMetadata;
        keyFixture = 'getHero';
        nameFixture = 'GetHero';
        targetFixture = {};

        vitest
          .mocked(buildArrayMetadataWithElement)
          .mockReturnValueOnce(callbackFixture);

        RPC(nameFixture)(targetFixture, keyFixture, {});
      });

      afterAll(() => {
        vitest.clearAllMocks();
      });

      it('should call buildArrayMetadataWithElement()', () => {
        expect(buildArrayMetadataWithElement).toHaveBeenCalledExactlyOnceWith({
          methodKey: keyFixture,
          name: nameFixture,
        });
      });

      it('should call updateOwnReflectMetadata()', () => {
        expect(updateOwnReflectMetadata).toHaveBeenCalledExactlyOnceWith(
          targetFixture.constructor,
          rpcMetadataReflectKey,
          buildEmptyArrayMetadata,
          callbackFixture,
        );
      });
    });
  });

  describe('having an empty name', () => {
    describe('when called', () => {
      let errorFixture: unknown;

      beforeAll(() => {
        try {
          RPC('')({}, 'run', {});
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
          '@RPC() requires a non-empty name',
        );
      });

      it('should not call updateOwnReflectMetadata()', () => {
        expect(updateOwnReflectMetadata).not.toHaveBeenCalled();
      });
    });
  });
});
