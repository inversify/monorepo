import { afterAll, beforeAll, describe, expect, it, vitest } from 'vitest';

import { Newable } from 'inversify';

import { InversifyFrameworkCoreError } from '../../error/models/InversifyFrameworkCoreError';
import { InversifyFrameworkCoreErrorKind } from '../../error/models/InversifyFrameworkCoreErrorKind';
import { buildCatchErrorMetadata } from './buildCatchErrorMetadata';

describe(buildCatchErrorMetadata, () => {
  describe('when called', () => {
    let errorTypeFixture: Newable<Error>;
    let catchErrorMetadataFixture: Set<Newable<Error> | null>;
    let result: unknown;

    beforeAll(() => {
      errorTypeFixture = Error;
      catchErrorMetadataFixture = new Set();

      result = buildCatchErrorMetadata(errorTypeFixture)(
        catchErrorMetadataFixture,
      );
    });

    afterAll(() => {
      vitest.clearAllMocks();
    });

    it('should add the error type to the catch error metadata', () => {
      expect(catchErrorMetadataFixture.has(errorTypeFixture)).toBe(true);
    });

    it('should return the updated catch error metadata', () => {
      expect(result).toBe(catchErrorMetadataFixture);
    });
  });

  describe('when called, and errorType is null', () => {
    let errorTypeFixture: null;
    let catchErrorMetadataFixture: Set<Newable<Error> | null>;
    let result: unknown;

    beforeAll(() => {
      errorTypeFixture = null;
      catchErrorMetadataFixture = new Set();

      result = buildCatchErrorMetadata(errorTypeFixture)(
        catchErrorMetadataFixture,
      );
    });

    afterAll(() => {
      vitest.clearAllMocks();
    });

    it('should add null to the catch error metadata', () => {
      expect(catchErrorMetadataFixture.has(null)).toBe(true);
    });

    it('should return the updated catch error metadata', () => {
      expect(result).toBe(catchErrorMetadataFixture);
    });
  });

  describe('when called, and errorType is already in the set', () => {
    let errorTypeFixture: Newable<Error>;
    let catchErrorMetadataFixture: Set<Newable<Error> | null>;

    beforeAll(() => {
      errorTypeFixture = Error;
      catchErrorMetadataFixture = new Set([errorTypeFixture]);
    });

    afterAll(() => {
      vitest.clearAllMocks();
    });

    it('should throw an InversifyFrameworkCoreError', () => {
      expect(() => {
        buildCatchErrorMetadata(errorTypeFixture)(catchErrorMetadataFixture);
      }).toThrow(
        new InversifyFrameworkCoreError(
          InversifyFrameworkCoreErrorKind.injectionDecoratorConflict,
          `CatchError for error type '${errorTypeFixture.name}' is already defined.`,
        ),
      );
    });
  });

  describe('when called, and null is already in the set', () => {
    let errorTypeFixture: null;
    let catchErrorMetadataFixture: Set<Newable<Error> | null>;

    beforeAll(() => {
      errorTypeFixture = null;
      catchErrorMetadataFixture = new Set([null]);
    });

    afterAll(() => {
      vitest.clearAllMocks();
    });

    it('should throw an InversifyFrameworkCoreError', () => {
      expect(() => {
        buildCatchErrorMetadata(errorTypeFixture)(catchErrorMetadataFixture);
      }).toThrow(
        new InversifyFrameworkCoreError(
          InversifyFrameworkCoreErrorKind.injectionDecoratorConflict,
          `CatchError for error type 'null' is already defined.`,
        ),
      );
    });
  });
});
