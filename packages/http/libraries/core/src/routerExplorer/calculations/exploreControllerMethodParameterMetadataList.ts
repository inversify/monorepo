import { getOwnReflectMetadata } from '@inversifyjs/reflect-metadata-utils';

import { controllerMethodParameterMetadataReflectKey } from '../../reflectMetadata/data/controllerMethodParameterMetadataReflectKey';
import { ControllerMethodParameterMetadata } from '../model/ControllerMethodParameterMetadata';

export function exploreControllerMethodParameterMetadataList(
  controllerConstructor: NewableFunction,
  methodKey: string | symbol,
): (ControllerMethodParameterMetadata | undefined)[] {
  return (
    getOwnReflectMetadata(
      controllerConstructor,
      controllerMethodParameterMetadataReflectKey,
      methodKey,
    ) ?? []
  );
}
