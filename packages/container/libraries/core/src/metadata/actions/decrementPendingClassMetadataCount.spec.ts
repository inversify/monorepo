import { afterAll, beforeAll, describe, expect, it, vitest } from 'vitest';

vitest.mock('@inversifyjs/reflect-metadata-utils');

import { updateOwnReflectMetadata } from '@inversifyjs/reflect-metadata-utils';

import { pendingClassMetadataCountReflectKey } from '../../reflectMetadata/data/pendingClassMetadataCountReflectKey';
import { getDefaultPendingClassMetadataCount } from '../calculations/getDefaultPendingClassMetadataCount';
import { ClassElementMetadataKind } from '../models/ClassElementMetadataKind';
import { MaybeClassElementMetadata } from '../models/MaybeClassElementMetadata';
import { MaybeClassElementMetadataKind } from '../models/MaybeClassElementMetadataKind';
import { decrementPendingClassMetadataCount } from './decrementPendingClassMetadataCount';

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
