import {
  buildEmptyArrayMetadata,
  updateOwnReflectMetadata,
} from '@inversifyjs/reflect-metadata-utils';
import { StandardSchemaV1 } from '@standard-schema/spec';

import { updateStandardSchemaValidationMetadata } from '../calculations/updateStandardSchemaValidationMetadata';
import { standardSchemaValidationMetadataReflectKey } from '../reflectMetadata/models/standardSchemaValidationMetadataReflectKey';

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
