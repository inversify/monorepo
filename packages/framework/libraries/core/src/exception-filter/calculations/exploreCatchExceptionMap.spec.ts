import { afterAll, beforeAll, describe, expect, it, vitest } from 'vitest';

vitest.mock('@inversifyjs/reflect-metadata-utils');

import { getOwnReflectMetadata } from '@inversifyjs/reflect-metadata-utils';
import { Newable } from 'inversify';

import { catchExceptionMetadataReflectKey } from '../../reflectMetadata/data/catchExceptionMetadataReflectKey';
import { exploreCatchExceptionMap } from './exploreCatchExceptionMap';

describe(exploreCatchExceptionMap, () => {
  describe('when called and getOwnReflectMetadata returns undefined', () => {
    let result: unknown;

    beforeAll(() => {
      result = exploreCatchExceptionMap();
    });

    afterAll(() => {
      vitest.clearAllMocks();
    });

    it('should call getOwnReflectMetadata', () => {
      expect(getOwnReflectMetadata).toHaveBeenCalledTimes(1);
      expect(getOwnReflectMetadata).toHaveBeenCalledWith(
        Reflect,
        catchExceptionMetadataReflectKey,
      );
    });

    it('should return an empty map', () => {
      expect(result).toStrictEqual(new Map());
    });
  });

  describe('when called and getOwnReflectMetadata returns a map', () => {
    let catchExceptionMapFixture: Map<Newable<Error>, NewableFunction[]>;
    let result: unknown;

    beforeAll(() => {
      catchExceptionMapFixture = new Map();

      vitest
        .mocked(getOwnReflectMetadata)
        .mockReturnValueOnce(catchExceptionMapFixture);

      result = exploreCatchExceptionMap();
    });

    afterAll(() => {
      vitest.clearAllMocks();
    });

    it('should call getOwnReflectMetadata', () => {
      expect(getOwnReflectMetadata).toHaveBeenCalledTimes(1);
      expect(getOwnReflectMetadata).toHaveBeenCalledWith(
        Reflect,
        catchExceptionMetadataReflectKey,
      );
    });

    it('should return a map', () => {
      expect(result).toBe(catchExceptionMapFixture);
    });
  });
});
