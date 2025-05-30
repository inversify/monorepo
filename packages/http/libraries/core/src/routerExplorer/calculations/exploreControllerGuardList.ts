import { getOwnReflectMetadata } from '@inversifyjs/reflect-metadata-utils';

import { controllerGuardMetadataReflectKey } from '../../reflectMetadata/data/controllerGuardMetadataReflectKey';

export function exploreControllerGuardList(
  controller: NewableFunction,
): NewableFunction[] {
  return (
    getOwnReflectMetadata(controller, controllerGuardMetadataReflectKey) ?? []
  );
}
