import { beforeAll, describe, expect, it, vitest } from 'vitest';

vitest.mock('@inversifyjs/reflect-metadata-utils');

vitest.mock('../calculations/updateStandardSchemaValidationMetadata');

import {
  buildEmptyArrayMetadata,
  updateOwnReflectMetadata,
} from '@inversifyjs/reflect-metadata-utils';
import { StandardSchemaV1 } from '@standard-schema/spec';

import { updateStandardSchemaValidationMetadata } from '../calculations/updateStandardSchemaValidationMetadata';
import { standardSchemaValidationMetadataReflectKey } from '../reflectMetadata/models/standardSchemaValidationMetadataReflectKey';
import { ValidateStandardSchemaV1 } from './ValidateStandardSchemaV1';

describe(ValidateStandardSchemaV1, () => {
  let typeFixture: StandardSchemaV1;

  let targetFixture: object;
  let keyFixture: string | symbol | undefined;
  let indexFixture: number;

  beforeAll(() => {
    typeFixture = Symbol() as unknown as StandardSchemaV1;

    targetFixture = {};
    keyFixture = Symbol();
    indexFixture = 0;
  });

  describe('when called', () => {
    let buildStandartdSchemaValidationMetadataFixture: (
      metadata: StandardSchemaV1[][],
    ) => StandardSchemaV1[][];
    let result: unknown;

    beforeAll(() => {
      buildStandartdSchemaValidationMetadataFixture = vitest.fn();

      vitest
        .mocked(updateStandardSchemaValidationMetadata)
        .mockReturnValueOnce(buildStandartdSchemaValidationMetadataFixture);

      result = ValidateStandardSchemaV1(typeFixture)(
        targetFixture,
        keyFixture,
        indexFixture,
      );
    });

    it('should call updateStandardSchemaValidationMetadata()', () => {
      expect(
        updateStandardSchemaValidationMetadata,
      ).toHaveBeenCalledExactlyOnceWith([typeFixture], indexFixture);
    });

    it('should call updateOwnReflectMetadata()', () => {
      expect(updateOwnReflectMetadata).toHaveBeenCalledExactlyOnceWith(
        targetFixture.constructor,
        standardSchemaValidationMetadataReflectKey,
        buildEmptyArrayMetadata,
        buildStandartdSchemaValidationMetadataFixture,
        keyFixture,
      );
    });

    it('should return undefined', () => {
      expect(result).toBeUndefined();
    });
  });
});
