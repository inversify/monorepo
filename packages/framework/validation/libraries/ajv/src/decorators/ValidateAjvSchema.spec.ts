import { beforeAll, describe, expect, it, vitest } from 'vitest';

vitest.mock('@inversifyjs/reflect-metadata-utils');

vitest.mock('../calculations/updateAjvValidationMetadata');

import {
  buildEmptyArrayMetadata,
  updateOwnReflectMetadata,
} from '@inversifyjs/reflect-metadata-utils';
import { AnySchema } from 'ajv';

import { updateAjvValidationMetadata } from '../calculations/updateAjvValidationMetadata';
import { ajvValidationMetadataReflectKey } from '../reflectMetadata/models/ajvValidationMetadataReflectKey';
import { ValidateAjvSchema } from './ValidateAjvSchema';

describe(ValidateAjvSchema, () => {
  let schemaFixture: AnySchema;

  let targetFixture: object;
  let keyFixture: string | symbol | undefined;
  let indexFixture: number;

  beforeAll(() => {
    schemaFixture = Symbol() as unknown as AnySchema;

    targetFixture = {};
    keyFixture = Symbol();
    indexFixture = 0;
  });

  describe('when called', () => {
    let buildStandartdSchemaValidationMetadataFixture: (
      metadata: AnySchema[][],
    ) => AnySchema[][];
    let result: unknown;

    beforeAll(() => {
      buildStandartdSchemaValidationMetadataFixture = vitest.fn();

      vitest
        .mocked(updateAjvValidationMetadata)
        .mockReturnValueOnce(buildStandartdSchemaValidationMetadataFixture);

      result = ValidateAjvSchema(schemaFixture)(
        targetFixture,
        keyFixture,
        indexFixture,
      );
    });

    it('should call updateStandardSchemaValidationMetadata()', () => {
      expect(updateAjvValidationMetadata).toHaveBeenCalledExactlyOnceWith(
        [schemaFixture],
        indexFixture,
      );
    });

    it('should call updateOwnReflectMetadata()', () => {
      expect(updateOwnReflectMetadata).toHaveBeenCalledExactlyOnceWith(
        targetFixture.constructor,
        ajvValidationMetadataReflectKey,
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
