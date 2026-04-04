import {
  buildEmptyArrayMetadata,
  updateOwnReflectMetadata,
} from '@inversifyjs/reflect-metadata-utils';

import { openApiValidationMetadataReflectKey } from '../reflectMetadata/openApiValidationMetadataReflectKey.js';

// eslint-disable-next-line @typescript-eslint/naming-convention
export function Validate(): ParameterDecorator {
  return (
    target: object,
    key: string | symbol | undefined,
    index: number,
  ): void => {
    updateOwnReflectMetadata(
      target.constructor,
      openApiValidationMetadataReflectKey,
      buildEmptyArrayMetadata as () => boolean[],
      (metadata: boolean[]): boolean[] => {
        metadata[index] = true;

        return metadata;
      },
      key,
    );
  };
}
