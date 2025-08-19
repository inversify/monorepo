import {
  buildEmptyArrayMetadata,
  updateOwnReflectMetadata,
} from '@inversifyjs/reflect-metadata-utils';
import { ZodType } from 'zod';

import { buildZodValidationMetadata } from '../calculations/buildZodValidationMetadata';
import { zodValidationMetadataReflectKey } from '../reflectMetadata/data/zodValidationMetadataReflectKey';

// eslint-disable-next-line @typescript-eslint/naming-convention
export function ValidateZodType(...typesList: ZodType[]): ParameterDecorator {
  return (
    target: object,
    key: string | symbol | undefined,
    index: number,
  ): void => {
    updateOwnReflectMetadata(
      target.constructor,
      zodValidationMetadataReflectKey,
      buildEmptyArrayMetadata,
      buildZodValidationMetadata(typesList, index),
      key,
    );
  };
}
