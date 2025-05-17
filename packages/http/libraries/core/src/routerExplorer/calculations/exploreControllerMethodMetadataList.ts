import { getOwnReflectMetadata } from '@inversifyjs/reflect-metadata-utils';

import { controllerMethodMetadataReflectKey } from '../../reflectMetadata/data/controllerMethodMetadataReflectKey';
import { ControllerMethodMetadata } from '../model/ControllerMethodMetadata';

export function exploreControllerMethodMetadataList(
  controllerConstructor: NewableFunction,
): ControllerMethodMetadata[] {
  return (
    getOwnReflectMetadata(
      controllerConstructor,
      controllerMethodMetadataReflectKey,
    ) ?? []
  );
}
