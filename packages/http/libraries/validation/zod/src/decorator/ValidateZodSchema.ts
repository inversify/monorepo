import {
  buildDefaultArrayMetadata,
  updateOwnReflectMetadata,
} from '@inversifyjs/reflect-metadata-utils';
import { ZodSchema } from 'zod';
import { buildZodValidationMetadata } from '../calculations/buildZodValidationMetadata';
import { zodValidationMetadataReflectKey } from '../reflectMetadata/data/zodValidationMetadataReflectKey';

export function ValidateZodSchema(
  ...schemaList: ZodSchema[]
): ParameterDecorator {
  return (target: object, key: string | symbol | undefined, index: number) => {
    updateOwnReflectMetadata(
      target.constructor,
      zodValidationMetadataReflectKey,
      buildDefaultArrayMetadata,
      buildZodValidationMetadata(schemaList, index),
      key,
    );
  };
}
