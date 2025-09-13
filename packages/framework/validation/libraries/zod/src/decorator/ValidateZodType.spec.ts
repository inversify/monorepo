import { beforeAll, describe, expect, it, vitest } from 'vitest';

vitest.mock('@inversifyjs/reflect-metadata-utils');

vitest.mock('../calculations/buildZodValidationMetadata');

import {
  buildEmptyArrayMetadata,
  updateOwnReflectMetadata,
} from '@inversifyjs/reflect-metadata-utils';
import { ZodType } from 'zod';

import { buildZodValidationMetadata } from '../calculations/buildZodValidationMetadata';
import { zodValidationMetadataReflectKey } from '../reflectMetadata/data/zodValidationMetadataReflectKey';
import { ValidateZodType } from './ValidateZodType';

describe(ValidateZodType, () => {
  let typeFixture: ZodType;

  let targetFixture: object;
  let keyFixture: string | symbol | undefined;
  let indexFixture: number;

  beforeAll(() => {
    typeFixture = Symbol() as unknown as ZodType;

    targetFixture = {};
    keyFixture = Symbol();
    indexFixture = 0;
  });

  describe('when called', () => {
    let buildZodValidationMetadataFixture: (
      zodValidationMetadata: ZodType[][],
    ) => ZodType[][];
    let result: unknown;

    beforeAll(() => {
      buildZodValidationMetadataFixture = vitest.fn();

      vitest
        .mocked(buildZodValidationMetadata)
        .mockReturnValueOnce(buildZodValidationMetadataFixture);

      result = ValidateZodType(typeFixture)(
        targetFixture,
        keyFixture,
        indexFixture,
      );
    });

    it('should call buildZodValidationMetadata()', () => {
      expect(buildZodValidationMetadata).toHaveBeenCalledTimes(1);
      expect(buildZodValidationMetadata).toHaveBeenCalledWith(
        [typeFixture],
        indexFixture,
      );
    });

    it('should call updateOwnReflectMetadata()', () => {
      expect(updateOwnReflectMetadata).toHaveBeenCalledTimes(1);
      expect(updateOwnReflectMetadata).toHaveBeenCalledWith(
        targetFixture.constructor,
        zodValidationMetadataReflectKey,
        buildEmptyArrayMetadata,
        buildZodValidationMetadataFixture,
        keyFixture,
      );
    });

    it('should return undefined', () => {
      expect(result).toBeUndefined();
    });
  });
});
