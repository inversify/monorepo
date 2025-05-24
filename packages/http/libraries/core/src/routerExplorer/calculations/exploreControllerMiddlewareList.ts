import { getOwnReflectMetadata } from '@inversifyjs/reflect-metadata-utils';

import { controllerMiddlewareMetadataReflectKey } from '../../reflectMetadata/data/controllerMiddlewareMetadataReflectKey';

export function exploreControllerMiddlewareList(
  controllerConstructor: NewableFunction,
): NewableFunction[] {
  return (
    getOwnReflectMetadata(
      controllerConstructor,
      controllerMiddlewareMetadataReflectKey,
    ) ?? []
  );
}
