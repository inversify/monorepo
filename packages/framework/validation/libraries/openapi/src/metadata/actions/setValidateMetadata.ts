import {
  buildEmptyArrayMetadata,
  updateOwnReflectMetadata,
} from '@inversifyjs/reflect-metadata-utils';

import { openApiValidationMetadataReflectKey } from '../models/openApiValidationMetadataReflectKey.js';

export function setValidateMetadata(
  target: object,
  key: string | symbol | undefined,
  index: number,
): void {
  updateOwnReflectMetadata(
    target.constructor,
    openApiValidationMetadataReflectKey,
    buildEmptyArrayMetadata<boolean>,
    (metadata: boolean[]): boolean[] => {
      metadata[index] = true;

      return metadata;
    },
    key,
  );
}
