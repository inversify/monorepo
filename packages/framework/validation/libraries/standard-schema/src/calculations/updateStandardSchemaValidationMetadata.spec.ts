import { beforeAll, describe, expect, it } from 'vitest';

import { StandardSchemaV1 } from '@standard-schema/spec';

import { updateStandardSchemaValidationMetadata } from './updateStandardSchemaValidationMetadata';

describe(updateStandardSchemaValidationMetadata, () => {
  let typeFixture: StandardSchemaV1;
  let indexFixture: number;
  let standardSchemaValidationMetadataFixtureElement: StandardSchemaV1;

  beforeAll(() => {
    typeFixture = Symbol.for('Type fixture') as unknown as StandardSchemaV1;
    indexFixture = 0;
    standardSchemaValidationMetadataFixtureElement = Symbol.for(
      'Standard Schema validation metadata fixture element',
    ) as unknown as StandardSchemaV1;
  });

  describe('when called', () => {
    let result: unknown;

    beforeAll(() => {
      result = updateStandardSchemaValidationMetadata(
        [typeFixture],
        indexFixture,
      )([[standardSchemaValidationMetadataFixtureElement]]);
    });

    it('should return the expected metadata', () => {
      expect(result).toStrictEqual([
        [standardSchemaValidationMetadataFixtureElement, typeFixture],
      ]);
    });
  });
});
