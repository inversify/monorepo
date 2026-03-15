import {
  buildEmptyArrayMetadata,
  updateOwnReflectMetadata,
} from '@inversifyjs/reflect-metadata-utils';
import { type StandardSchemaV1 } from '@standard-schema/spec';

import { updateStandardSchemaValidationMetadata } from '../calculations/updateStandardSchemaValidationMetadata.js';
import { standardSchemaValidationMetadataReflectKey } from '../reflectMetadata/models/standardSchemaValidationMetadataReflectKey.js';

// eslint-disable-next-line @typescript-eslint/naming-convention
export function ValidateStandardSchemaV1(
  ...schemaList: StandardSchemaV1[]
): ParameterDecorator {
  return (
    target: object,
    key: string | symbol | undefined,
    index: number,
  ): void => {
    updateOwnReflectMetadata(
      target.constructor,
      standardSchemaValidationMetadataReflectKey,
      buildEmptyArrayMetadata,
      updateStandardSchemaValidationMetadata(schemaList, index),
      key,
    );
  };
}
