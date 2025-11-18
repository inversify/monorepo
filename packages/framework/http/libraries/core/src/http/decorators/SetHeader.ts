import { updateOwnReflectMetadata } from '@inversifyjs/reflect-metadata-utils';

import { controllerMethodHeaderMetadataReflectKey } from '../../reflectMetadata/data/controllerMethodHeaderMetadataReflectKey';
import { buildSetHeaderMetadata } from '../calculations/buildSetHeaderMetadata';

function buildEmptyObjectMetadata(): Record<string, string> {
  return {};
}

// eslint-disable-next-line @typescript-eslint/naming-convention
export function SetHeader(headerKey: string, value: string): MethodDecorator {
  return (target: object, key: string | symbol): void => {
    updateOwnReflectMetadata(
      target.constructor,
      controllerMethodHeaderMetadataReflectKey,
      buildEmptyObjectMetadata,
      buildSetHeaderMetadata(headerKey, value),
      key,
    );
  };
}
