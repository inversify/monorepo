import { afterAll, beforeAll, describe, expect, it, vitest } from 'vitest';

vitest.mock(import('@inversifyjs/reflect-metadata-utils'));

import { updateOwnReflectMetadata } from '@inversifyjs/reflect-metadata-utils';

import { pendingClassMetadataCountReflectKey } from '../../reflectMetadata/data/pendingClassMetadataCountReflectKey.js';
import { getDefaultPendingClassMetadataCount } from '../calculations/getDefaultPendingClassMetadataCount.js';
import { ClassElementMetadataKind } from '../models/ClassElementMetadataKind.js';
import { type MaybeClassElementMetadata } from '../models/MaybeClassElementMetadata.js';
import { MaybeClassElementMetadataKind } from '../models/MaybeClassElementMetadataKind.js';
import { decrementPendingClassMetadataCount } from './decrementPendingClassMetadataCount.js';

describe(decrementPendingClassMetadataCount, () => {
  let typeFixture: object;

  beforeAll(() => {
    typeFixture = class {};
  });

  describe('having unknown metadata', () => {
    let metadataFixture: MaybeClassElementMetadata;

    beforeAll(() => {
      metadataFixture = {
        kind: MaybeClassElementMetadataKind.unknown,
        name: undefined,
        optional: false,
        tags: new Map(),
      };
    });

    describe('when called', () => {
      let result: unknown;

      beforeAll(() => {
        result =
          decrementPendingClassMetadataCount(typeFixture)(metadataFixture);
      });

      afterAll(() => {
        vitest.clearAllMocks();
      });

      it('should call updateOwnReflectMetadata()', () => {
        expect(updateOwnReflectMetadata).toHaveBeenCalledExactlyOnceWith(
          typeFixture,
          pendingClassMetadataCountReflectKey,
          getDefaultPendingClassMetadataCount,
          expect.any(Function),
        );
      });

      it('should return expected value', () => {
        expect(result).toBeUndefined();
      });
    });
  });

  describe('with undefined metadata', () => {
    let metadataFixture: undefined;

    beforeAll(() => {
      metadataFixture = undefined;
    });

    describe('when called', () => {
      let result: unknown;

      beforeAll(() => {
        result =
          decrementPendingClassMetadataCount(typeFixture)(metadataFixture);
      });

      afterAll(() => {
        vitest.clearAllMocks();
      });

      it('should not call updateOwnReflectMetadata()', () => {
        expect(updateOwnReflectMetadata).not.toHaveBeenCalled();
      });

      it('should return expected value', () => {
        expect(result).toBeUndefined();
      });
    });
  });

  describe('with non uknown metadata', () => {
    let metadataFixture: MaybeClassElementMetadata;

    beforeAll(() => {
      metadataFixture = {
        kind: ClassElementMetadataKind.unmanaged,
      };
    });

    describe('when called', () => {
      let result: unknown;

      beforeAll(() => {
        result =
          decrementPendingClassMetadataCount(typeFixture)(metadataFixture);
      });

      afterAll(() => {
        vitest.clearAllMocks();
      });

      it('should not call updateOwnReflectMetadata()', () => {
        expect(updateOwnReflectMetadata).not.toHaveBeenCalled();
      });

      it('should return expected value', () => {
        expect(result).toBeUndefined();
      });
    });
  });
});
