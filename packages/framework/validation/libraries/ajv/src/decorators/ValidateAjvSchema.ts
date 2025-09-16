import {
  buildEmptyArrayMetadata,
  updateOwnReflectMetadata,
} from '@inversifyjs/reflect-metadata-utils';
import { AnySchema } from 'ajv';

import { updateAjvValidationMetadata } from '../calculations/updateAjvValidationMetadata';
import { ajvValidationMetadataReflectKey } from '../reflectMetadata/models/ajvValidationMetadataReflectKey';

// eslint-disable-next-line @typescript-eslint/naming-convention
export function ValidateAjvSchema(
  ...schemaList: AnySchema[]
): ParameterDecorator {
  return (
    target: object,
    key: string | symbol | undefined,
    index: number,
  ): void => {
    updateOwnReflectMetadata(
      target.constructor,
      ajvValidationMetadataReflectKey,
      buildEmptyArrayMetadata,
      updateAjvValidationMetadata(schemaList, index),
      key,
    );
  };
}
