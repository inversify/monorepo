import { beforeAll, describe, expect, it } from 'vitest';

import { ZodType } from 'zod';

import { buildZodValidationMetadata } from './buildZodValidationMetadata';

describe(buildZodValidationMetadata, () => {
  let typeFixture: ZodType;
  let indexFixture: number;
  let zodValidationMetadataFixtureElement: ZodType;

  beforeAll(() => {
    typeFixture = Symbol.for('Type fixture') as unknown as ZodType;
    indexFixture = 0;
    zodValidationMetadataFixtureElement = Symbol.for(
      'Zod validation metadata fixture element',
    ) as unknown as ZodType;
  });

  describe('when called', () => {
    let result: unknown;

    beforeAll(() => {
      result = buildZodValidationMetadata(
        [typeFixture],
        indexFixture,
      )([[zodValidationMetadataFixtureElement]]);
    });

    it('should return the expected metadata', () => {
      expect(result).toStrictEqual([
        [zodValidationMetadataFixtureElement, typeFixture],
      ]);
    });
  });
});
