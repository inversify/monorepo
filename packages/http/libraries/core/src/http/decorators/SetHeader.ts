import { updateOwnReflectMetadata } from '@inversifyjs/reflect-metadata-utils';

import { controllerMethodHeaderMetadataReflectKey } from '../../reflectMetadata/data/controllerMethodHeaderMetadataReflectKey';
import { buildDefaultMapMetadata } from '../calculations/buildDefaultMapMetadata';
import { buildSetHeaderMetadata } from '../calculations/buildSetHeaderMetadata';

export function setHeader(headerKey: string, value: string): MethodDecorator {
  return (target: object, key: string | symbol): void => {
    updateOwnReflectMetadata(
      target.constructor,
      controllerMethodHeaderMetadataReflectKey,
      buildDefaultMapMetadata,
      buildSetHeaderMetadata(headerKey, value),
      key,
    );
  };
}
