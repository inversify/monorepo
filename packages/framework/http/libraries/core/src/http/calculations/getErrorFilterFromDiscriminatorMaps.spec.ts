import { afterAll, beforeAll, describe, expect, it, vitest } from 'vitest';

vitest.mock(import('@inversifyjs/framework-core'));

import {
  type ErrorFilter,
  getErrorDiscriminatorMetadata,
} from '@inversifyjs/framework-core';
import { type Newable } from 'inversify';

import { getErrorFilterFromDiscriminatorMaps } from './getErrorFilterFromDiscriminatorMaps.js';

describe(getErrorFilterFromDiscriminatorMaps, () => {
  describe('having an error type with matching discriminator metadata', () => {
    class FooError extends Error {}

    let errorFilterFixture: ErrorFilter;
    let errorDiscriminatorToFilterMapListFixture: Map<
      string | symbol,
      ErrorFilter | Newable<ErrorFilter>
    >[];

    beforeAll(() => {
      errorFilterFixture = {
        catch: vitest.fn(),
      };

      vitest.mocked(getErrorDiscriminatorMetadata).mockReturnValueOnce(['foo']);

      errorDiscriminatorToFilterMapListFixture = [
        new Map<string | symbol, ErrorFilter>([['foo', errorFilterFixture]]),
      ];
    });

    afterAll(() => {
      vitest.clearAllMocks();
    });

    describe('when called', () => {
      let result: unknown;

      beforeAll(() => {
        result = getErrorFilterFromDiscriminatorMaps(
          FooError,
          errorDiscriminatorToFilterMapListFixture,
        );
      });

      it('should call getErrorDiscriminatorMetadata()', () => {
        expect(getErrorDiscriminatorMetadata).toHaveBeenCalledExactlyOnceWith(
          FooError,
        );
      });

      it('should return the matching error filter', () => {
        expect(result).toBe(errorFilterFixture);
      });
    });
  });

  describe('having an error type with no discriminator metadata', () => {
    class FooError extends Error {}

    describe('when called', () => {
      let result: unknown;

      beforeAll(() => {
        result = getErrorFilterFromDiscriminatorMaps(FooError, [
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

  describe('having an error type with a discriminator in the second map', () => {
    class FooError extends Error {}

    let errorFilterFixture: ErrorFilter;
    let errorDiscriminatorToFilterMapListFixture: Map<
      string | symbol,
      ErrorFilter | Newable<ErrorFilter>
    >[];

    beforeAll(() => {
      errorFilterFixture = {
        catch: vitest.fn(),
      };

      vitest.mocked(getErrorDiscriminatorMetadata).mockReturnValueOnce(['foo']);

      errorDiscriminatorToFilterMapListFixture = [
        new Map<string | symbol, ErrorFilter>(),
        new Map<string | symbol, ErrorFilter>([['foo', errorFilterFixture]]),
      ];
    });

    afterAll(() => {
      vitest.clearAllMocks();
    });

    describe('when called', () => {
      let result: unknown;

      beforeAll(() => {
        result = getErrorFilterFromDiscriminatorMaps(
          FooError,
          errorDiscriminatorToFilterMapListFixture,
        );
      });

      it('should return the error filter from the second map', () => {
        expect(result).toBe(errorFilterFixture);
      });
    });
  });

  describe('having an error type with multiple own discriminators', () => {
    class FooError extends Error {}

    let childFilterFixture: ErrorFilter;
    let parentFilterFixture: ErrorFilter;
    let errorDiscriminatorToFilterMapListFixture: Map<
      string | symbol,
      ErrorFilter | Newable<ErrorFilter>
    >[];

    beforeAll(() => {
      childFilterFixture = {
        catch: vitest.fn(),
      };
      parentFilterFixture = {
        catch: vitest.fn(),
      };

      vitest
        .mocked(getErrorDiscriminatorMetadata)
        .mockReturnValueOnce(['foo-child', 'foo']);

      errorDiscriminatorToFilterMapListFixture = [
        new Map<string | symbol, ErrorFilter>([
          ['foo-child', childFilterFixture],
          ['foo', parentFilterFixture],
        ]),
      ];
    });

    afterAll(() => {
      vitest.clearAllMocks();
    });

    describe('when called', () => {
      let result: unknown;

      beforeAll(() => {
        result = getErrorFilterFromDiscriminatorMaps(
          FooError,
          errorDiscriminatorToFilterMapListFixture,
        );
      });

      it('should return the filter for the first matching own discriminator', () => {
        expect(result).toBe(childFilterFixture);
      });
    });
  });
});
