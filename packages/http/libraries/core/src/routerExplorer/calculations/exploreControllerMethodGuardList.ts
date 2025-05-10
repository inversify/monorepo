import { getOwnReflectMetadata } from '@inversifyjs/reflect-metadata-utils';

import { controllerMethodGuardMetadataReflectKey } from '../../reflectMetadata/data/controllerMethodGuardMetadataReflectKey';

export function exploreControllerMethodGuardList(
  controllerConstructor: NewableFunction,
  methodKey: string | symbol,
): NewableFunction[] {
  return (
    getOwnReflectMetadata(
      controllerConstructor,
      controllerMethodGuardMetadataReflectKey,
      methodKey,
    ) ?? []
  );
}
