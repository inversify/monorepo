import { beforeAll, describe, expect, it } from 'vitest';

import { setRouteValueMetadata } from './setRouteValueMetadata.js';

describe(setRouteValueMetadata, () => {
  describe('having metadata with no elements', () => {
    let metadataFixture: Map<string | symbol, Map<string | symbol, unknown>>;

    beforeAll(() => {
      metadataFixture = new Map();
    });

    describe('when called', () => {
      let result: Map<string | symbol, Map<string | symbol, unknown>>;

      let propertyKeyFixture: string;
      let metadataKeyFixture: string;
      let valueFixture: string;

      beforeAll(() => {
        propertyKeyFixture = 'testMethod';
        metadataKeyFixture = 'key-example';
        valueFixture = 'value-example';

        result = setRouteValueMetadata(
          propertyKeyFixture,
          metadataKeyFixture,
          valueFixture,
        )(metadataFixture);
      });

      it('should return a map with the method metadata', () => {
        const expectedInnerMap: Map<string | symbol, unknown> = new Map([
          [metadataKeyFixture, valueFixture],
        ]);
        const expectedMap: Map<
          string | symbol,
          Map<string | symbol, unknown>
        > = new Map([[propertyKeyFixture, expectedInnerMap]]);

        expect(result).toStrictEqual(expectedMap);
      });
    });
  });

  describe('having metadata with elements for the same method', () => {
    let metadataFixture: Map<string | symbol, Map<string | symbol, unknown>>;
    let propertyKeyFixture: string;

    beforeAll(() => {
      propertyKeyFixture = 'testMethod';

      const existingInnerMap: Map<string | symbol, unknown> = new Map([
        ['existing-key', 'existing-value'],
      ]);
      metadataFixture = new Map([[propertyKeyFixture, existingInnerMap]]);
    });

    describe('when called', () => {
      let result: Map<string | symbol, Map<string | symbol, unknown>>;

      let metadataKeyFixture: string;
      let valueFixture: string;

      beforeAll(() => {
        metadataKeyFixture = 'key-example';
        valueFixture = 'value-example';

        result = setRouteValueMetadata(
          propertyKeyFixture,
          metadataKeyFixture,
          valueFixture,
        )(metadataFixture);
      });

      it('should append to the existing method map', () => {
        const expectedInnerMap: Map<string | symbol, unknown> = new Map([
          ['existing-key', 'existing-value'],
          [metadataKeyFixture, valueFixture],
        ]);
        const expectedMap: Map<
          string | symbol,
          Map<string | symbol, unknown>
        > = new Map([[propertyKeyFixture, expectedInnerMap]]);

        expect(result).toStrictEqual(expectedMap);
      });
    });
  });

  describe('having metadata with elements for a different method', () => {
    let metadataFixture: Map<string | symbol, Map<string | symbol, unknown>>;

    beforeAll(() => {
      const otherInnerMap: Map<string | symbol, unknown> = new Map([
        ['other-key', 'other-value'],
      ]);
      metadataFixture = new Map([['otherMethodKey', otherInnerMap]]);
    });

    describe('when called', () => {
      let result: Map<string | symbol, Map<string | symbol, unknown>>;

      let propertyKeyFixture: string;
      let metadataKeyFixture: string;
      let valueFixture: string;

      beforeAll(() => {
        propertyKeyFixture = 'testMethod';
        metadataKeyFixture = 'key-example';
        valueFixture = 'value-example';

        result = setRouteValueMetadata(
          propertyKeyFixture,
          metadataKeyFixture,
          valueFixture,
        )(metadataFixture);
      });

      it('should add new method metadata alongside existing entries', () => {
        const otherMethodInnerMap: Map<string | symbol, unknown> = new Map([
          ['other-key', 'other-value'],
        ]);
        const newMethodInnerMap: Map<string | symbol, unknown> = new Map([
          [metadataKeyFixture, valueFixture],
        ]);
        const expectedMap: Map<
          string | symbol,
          Map<string | symbol, unknown>
        > = new Map([
          ['otherMethodKey', otherMethodInnerMap],
          [propertyKeyFixture, newMethodInnerMap],
        ]);

        expect(result).toStrictEqual(expectedMap);
      });
    });
  });
});
