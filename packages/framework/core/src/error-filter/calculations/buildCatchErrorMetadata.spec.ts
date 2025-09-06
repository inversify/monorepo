import { afterAll, beforeAll, describe, expect, it, vitest } from 'vitest';

import { Newable } from 'inversify';

import { buildCatchErrorMetadata } from './buildCatchErrorMetadata';

describe(buildCatchErrorMetadata, () => {
  describe('when called and targetList is undefined', () => {
    let keyFixture: Newable<Error>;
    let valueFixture: NewableFunction;
    let catchErrorMetadataFixture: Map<Newable<Error>, NewableFunction[]>;
    let result: unknown;

    beforeAll(() => {
      keyFixture = Error;
      valueFixture = class Test {};
      catchErrorMetadataFixture = new Map();

      result = buildCatchErrorMetadata(
        keyFixture,
        valueFixture,
      )(catchErrorMetadataFixture);
    });

    afterAll(() => {
      vitest.clearAllMocks();
    });

    it('should set the catch error metadata', () => {
      expect(catchErrorMetadataFixture.get(keyFixture)).toStrictEqual([
        valueFixture,
      ]);
    });

    it('should return the updated catch error metadata', () => {
      expect(result).toBe(catchErrorMetadataFixture);
    });
  });

  describe('when called and targetList is defined', () => {
    let keyFixture: Newable<Error>;
    let valueFixture: NewableFunction;
    let anotherValueFixture: NewableFunction;
    let catchErrorMetadataFixture: Map<Newable<Error>, NewableFunction[]>;
    let result: unknown;

    beforeAll(() => {
      keyFixture = Error;
      valueFixture = class Test {};
      anotherValueFixture = class AnotherTest {};
      catchErrorMetadataFixture = new Map([
        [keyFixture, [anotherValueFixture]],
      ]);

      result = buildCatchErrorMetadata(
        keyFixture,
        valueFixture,
      )(catchErrorMetadataFixture);
    });

    afterAll(() => {
      vitest.clearAllMocks();
    });

    it('should set the catch error metadata', () => {
      expect(catchErrorMetadataFixture.get(keyFixture)).toStrictEqual([
        anotherValueFixture,
        valueFixture,
      ]);
    });

    it('should return the updated catch error metadata', () => {
      expect(result).toBe(catchErrorMetadataFixture);
    });
  });
});
