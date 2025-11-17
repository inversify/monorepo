import { getOwnReflectMetadata } from '@inversifyjs/reflect-metadata-utils';

import { controllerMetadataReflectKey } from '../../reflectMetadata/data/controllerMetadataReflectKey';
import { ControllerMetadata } from '../model/ControllerMetadata';

export function getControllerMetadataList(): ControllerMetadata[] | undefined {
  const controllerMetadataList: ControllerMetadata[] | undefined =
    getOwnReflectMetadata(Reflect, controllerMetadataReflectKey);

  if (controllerMetadataList === undefined) {
    return undefined;
  }

  return controllerMetadataList.sort(
    (first: ControllerMetadata, second: ControllerMetadata): number =>
      second.priority - first.priority,
  );
}
