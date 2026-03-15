import { afterAll, beforeAll, describe, expect, it, vitest } from 'vitest';

vitest.mock(import('@inversifyjs/reflect-metadata-utils'));

import { getOwnReflectMetadata } from '@inversifyjs/reflect-metadata-utils';
import { type Newable } from 'inversify';

import { catchErrorMetadataReflectKey } from '../../reflectMetadata/data/catchErrorMetadataReflectKey.js';
import { getCatchErrorMetadata } from './getCatchErrorMetadata.js';

describe(getCatchErrorMetadata, () => {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
  let targetFixture: Function;

  beforeAll(() => {
    targetFixture = class Foo {};
  });

  describe('when called, and getOwnReflectMetadata() returns undefined', () => {
    let result: unknown;

    beforeAll(() => {
      result = getCatchErrorMetadata(targetFixture);
    });

    afterAll(() => {
      vitest.clearAllMocks();
    });

    it('should call getOwnReflectMetadata()', () => {
      expect(getOwnReflectMetadata).toHaveBeenCalledExactlyOnceWith(
        targetFixture,
        catchErrorMetadataReflectKey,
      );
    });

    it('should return an empty set', () => {
      expect(result).toStrictEqual(new Set());
    });
  });

  describe('when called, and getOwnReflectMetadata() returns a map', () => {
    let catchErrorMetadataFixture: Set<Newable<Error> | null>;
    let result: unknown;

    beforeAll(() => {
      catchErrorMetadataFixture = new Set();

      vitest
        .mocked(getOwnReflectMetadata)
        .mockReturnValueOnce(catchErrorMetadataFixture);

      result = getCatchErrorMetadata(targetFixture);
    });

    afterAll(() => {
      vitest.clearAllMocks();
    });

    it('should call getOwnReflectMetadata()', () => {
      expect(getOwnReflectMetadata).toHaveBeenCalledExactlyOnceWith(
        targetFixture,
        catchErrorMetadataReflectKey,
      );
    });

    it('should return a set', () => {
      expect(result).toBe(catchErrorMetadataFixture);
    });
  });
});
