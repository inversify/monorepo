import { beforeAll, describe, expect, it } from 'vitest';

import { AnySchema } from 'ajv';

import { updateAjvValidationMetadata } from './updateAjvValidationMetadata';

describe(updateAjvValidationMetadata, () => {
  describe('having empty metadata', () => {
    let schemaFixture: AnySchema;
    let indexFixture: number;

    beforeAll(() => {
      schemaFixture = Symbol.for('Type fixture') as unknown as AnySchema;
      indexFixture = 0;
    });

    describe('when called', () => {
      let result: unknown;

      beforeAll(() => {
        result = updateAjvValidationMetadata([schemaFixture], indexFixture)([]);
      });

      it('should return the expected metadata', () => {
        expect(result).toStrictEqual([[schemaFixture]]);
      });
    });
  });

  describe('having metadata with one non empty element and index 0', () => {
    let schemaFixture: AnySchema;
    let indexFixture: number;
    let metadataFixtureElement: AnySchema;

    beforeAll(() => {
      schemaFixture = Symbol.for('Type fixture') as unknown as AnySchema;
      indexFixture = 0;
      metadataFixtureElement = Symbol.for(
        'AJV validation metadata fixture element',
      ) as unknown as AnySchema;
    });

    describe('when called', () => {
      let result: unknown;

      beforeAll(() => {
        result = updateAjvValidationMetadata(
          [schemaFixture],
          indexFixture,
        )([[metadataFixtureElement]]);
      });

      it('should return the expected metadata', () => {
        expect(result).toStrictEqual([[metadataFixtureElement, schemaFixture]]);
      });
    });
  });
});
