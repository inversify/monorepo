import { afterAll, beforeAll, describe, expect, it, vitest } from 'vitest';

vitest.mock('@inversifyjs/reflect-metadata-utils');

import { getOwnReflectMetadata } from '@inversifyjs/reflect-metadata-utils';
import { Newable } from 'inversify';

import { catchErrorMetadataReflectKey } from '../../reflectMetadata/data/catchErrorMetadataReflectKey';
import { getCatchErrorMapMetadata } from './getCatchErrorMapMetadata';

describe(getCatchErrorMapMetadata, () => {
  describe('when called and getOwnReflectMetadata returns undefined', () => {
    let result: unknown;

    beforeAll(() => {
      result = getCatchErrorMapMetadata();
    });

    afterAll(() => {
      vitest.clearAllMocks();
    });

    it('should call getOwnReflectMetadata', () => {
      expect(getOwnReflectMetadata).toHaveBeenCalledTimes(1);
      expect(getOwnReflectMetadata).toHaveBeenCalledWith(
        Reflect,
        catchErrorMetadataReflectKey,
      );
    });

    it('should return an empty map', () => {
      expect(result).toStrictEqual(new Map());
    });
  });

  describe('when called and getOwnReflectMetadata returns a map', () => {
    let catchErrorMapFixture: Map<Newable<Error>, NewableFunction[]>;
    let result: unknown;

    beforeAll(() => {
      catchErrorMapFixture = new Map();

      vitest
        .mocked(getOwnReflectMetadata)
        .mockReturnValueOnce(catchErrorMapFixture);

      result = getCatchErrorMapMetadata();
    });

    afterAll(() => {
      vitest.clearAllMocks();
    });

    it('should call getOwnReflectMetadata', () => {
      expect(getOwnReflectMetadata).toHaveBeenCalledTimes(1);
      expect(getOwnReflectMetadata).toHaveBeenCalledWith(
        Reflect,
        catchErrorMetadataReflectKey,
      );
    });

    it('should return a map', () => {
      expect(result).toBe(catchErrorMapFixture);
    });
  });
});
