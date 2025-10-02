import { afterAll, beforeAll, describe, expect, it, vitest } from 'vitest';

vitest.mock('@inversifyjs/reflect-metadata-utils');

import {
  getOwnReflectMetadata,
  setReflectMetadata,
} from '@inversifyjs/reflect-metadata-utils';

import { InversifyCoreError } from '../../error/models/InversifyCoreError';
import { InversifyCoreErrorKind } from '../../error/models/InversifyCoreErrorKind';
import { classIsInjectableFlagReflectKey } from '../../reflectMetadata/data/classIsInjectableFlagReflectKey';
import { setIsInjectableFlag } from './setIsInjectableFlag';

describe(setIsInjectableFlag, () => {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
  let targetFixture: Function;

  beforeAll(() => {
    targetFixture = class {};
  });

  describe('when called, and getOwnReflectMetadata() returns undefined', () => {
    let result: unknown;

    beforeAll(() => {
      vitest.mocked(getOwnReflectMetadata).mockReturnValueOnce(undefined);

      result = setIsInjectableFlag(targetFixture);
    });

    afterAll(() => {
      vitest.clearAllMocks();
    });

    it('should call getOwnReflectMetadata()', () => {
      expect(getOwnReflectMetadata).toHaveBeenCalledExactlyOnceWith(
        targetFixture,
        classIsInjectableFlagReflectKey,
      );
    });

    it('should call setReflectMetadata', () => {
      expect(setReflectMetadata).toHaveBeenCalledExactlyOnceWith(
        targetFixture,
        classIsInjectableFlagReflectKey,
        true,
      );
    });

    it('should return undefined', () => {
      expect(result).toBeUndefined();
    });
  });

  describe('when called, and getOwnReflectMetadata() returns boolean', () => {
    let result: unknown;

    beforeAll(() => {
      vitest.mocked(getOwnReflectMetadata).mockReturnValueOnce(true);

      try {
        setIsInjectableFlag(targetFixture);
      } catch (error: unknown) {
        result = error;
      }
    });

    afterAll(() => {
      vitest.clearAllMocks();
    });

    it('should throw an InversifyCoreError', () => {
      const expectedErrorProperties: Partial<InversifyCoreError> = {
        kind: InversifyCoreErrorKind.injectionDecoratorConflict,
        message:
          'Cannot apply @injectable decorator multiple times at class "targetFixture"',
      };

      expect(result).toBeInstanceOf(InversifyCoreError);
      expect(result).toStrictEqual(
        expect.objectContaining(expectedErrorProperties),
      );
    });
  });
});
