import { getOwnReflectMetadata } from '@inversifyjs/reflect-metadata-utils';

import { controllerMetadataReflectKey } from '../../reflectMetadata/data/controllerMetadataReflectKey';
import { ControllerMetadata } from '../model/ControllerMetadata';

export function exploreControllers(): ControllerMetadata[] | undefined {
  return getOwnReflectMetadata(Reflect, controllerMetadataReflectKey);
}
