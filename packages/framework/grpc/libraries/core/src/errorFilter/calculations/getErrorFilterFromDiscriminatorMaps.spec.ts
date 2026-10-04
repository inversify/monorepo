import { afterAll, beforeAll, describe, expect, it, vitest } from 'vitest';

vitest.mock(import('@inversifyjs/framework-core'));

import {
  type ErrorFilter,
  getErrorDiscriminatorMetadata,
} from '@inversifyjs/framework-core';
import { type Newable } from 'inversify';

import { getErrorFilterFromDiscriminatorMaps } from './getErrorFilterFromDiscriminatorMaps.js';

describe(getErrorFilterFromDiscriminatorMaps, () => {
  let errorTypeFixture: Newable;

  beforeAll(() => {
    errorTypeFixture = class HeroError extends Error {};
  });

  describe('when called, and getErrorDiscriminatorMetadata() returns undefined', () => {
    let result: unknown;

    beforeAll(() => {
      vitest
        .mocked(getErrorDiscriminatorMetadata)
        .mockReturnValueOnce(undefined);

      result = getErrorFilterFromDiscriminatorMaps(errorTypeFixture, [
        new Map<string | symbol, ErrorFilter>(),
      ]);
    });

    afterAll(() => {
      vitest.clearAllMocks();
    });

    it('should call getErrorDiscriminatorMetadata()', () => {
      expect(getErrorDiscriminatorMetadata).toHaveBeenCalledExactlyOnceWith(
        errorTypeFixture,
      );
    });

    it('should return undefined', () => {
      expect(result).toBeUndefined();
    });
  });

  describe('when called, and a later map has a filter for a discriminator', () => {
    let errorFilterFixture: ErrorFilter;
    let result: unknown;

    beforeAll(() => {
      errorFilterFixture = {
        catch: (): undefined => undefined,
      };

      vitest
        .mocked(getErrorDiscriminatorMetadata)
        .mockReturnValueOnce(['villain', 'hero']);

      result = getErrorFilterFromDiscriminatorMaps(errorTypeFixture, [
        new Map<string | symbol, ErrorFilter>(),
        new Map<string | symbol, ErrorFilter>([['hero', errorFilterFixture]]),
      ]);
    });

    afterAll(() => {
      vitest.clearAllMocks();
    });

    it('should return the error filter', () => {
      expect(result).toBe(errorFilterFixture);
    });
  });

  describe('when called, and no map has a filter for the discriminators', () => {
    let result: unknown;

    beforeAll(() => {
      vitest
        .mocked(getErrorDiscriminatorMetadata)
        .mockReturnValueOnce(['hero']);

      result = getErrorFilterFromDiscriminatorMaps(errorTypeFixture, [
        new Map<string | symbol, ErrorFilter>(),
      ]);
    });

    afterAll(() => {
      vitest.clearAllMocks();
    });

    it('should return undefined', () => {
      expect(result).toBeUndefined();
    });
  });
});
