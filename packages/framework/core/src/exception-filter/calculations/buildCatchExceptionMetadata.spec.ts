import { afterAll, beforeAll, describe, expect, it, vitest } from 'vitest';

import { Newable } from 'inversify';

import { buildCatchExceptionMetadata } from './buildCatchExceptionMetadata';

describe(buildCatchExceptionMetadata, () => {
  describe('when called and targetList is undefined', () => {
    let keyFixture: Newable<Error>;
    let valueFixture: NewableFunction;
    let catchExceptionMetadataFixture: Map<Newable<Error>, NewableFunction[]>;
    let result: unknown;

    beforeAll(() => {
      keyFixture = Error;
      valueFixture = class Test {};
      catchExceptionMetadataFixture = new Map();

      result = buildCatchExceptionMetadata(
        keyFixture,
        valueFixture,
      )(catchExceptionMetadataFixture);
    });

    afterAll(() => {
      vitest.clearAllMocks();
    });

    it('should set the catch exception metadata', () => {
      expect(catchExceptionMetadataFixture.get(keyFixture)).toStrictEqual([
        valueFixture,
      ]);
    });

    it('should return the updated catch exception metadata', () => {
      expect(result).toBe(catchExceptionMetadataFixture);
    });
  });

  describe('when called and targetList is defined', () => {
    let keyFixture: Newable<Error>;
    let valueFixture: NewableFunction;
    let anotherValueFixture: NewableFunction;
    let catchExceptionMetadataFixture: Map<Newable<Error>, NewableFunction[]>;
    let result: unknown;

    beforeAll(() => {
      keyFixture = Error;
      valueFixture = class Test {};
      anotherValueFixture = class AnotherTest {};
      catchExceptionMetadataFixture = new Map([
        [keyFixture, [anotherValueFixture]],
      ]);

      result = buildCatchExceptionMetadata(
        keyFixture,
        valueFixture,
      )(catchExceptionMetadataFixture);
    });

    afterAll(() => {
      vitest.clearAllMocks();
    });

    it('should set the catch exception metadata', () => {
      expect(catchExceptionMetadataFixture.get(keyFixture)).toStrictEqual([
        anotherValueFixture,
        valueFixture,
      ]);
    });

    it('should return the updated catch exception metadata', () => {
      expect(result).toBe(catchExceptionMetadataFixture);
    });
  });
});
