import { getBaseType } from '@inversifyjs/prototype-utils';
import { getOwnReflectMetadata } from '@inversifyjs/reflect-metadata-utils';
import type { Newable } from 'inversify';

import { controllerMethodParameterMetadataReflectKey } from '../../reflectMetadata/data/controllerMethodParameterMetadataReflectKey';
import { ControllerMethodParameterMetadata } from '../model/ControllerMethodParameterMetadata';

export function getControllerMethodParameterMetadataList(
  controllerConstructor: NewableFunction,
  methodKey: string | symbol,
): (ControllerMethodParameterMetadata | undefined)[] {
  let currentType: Newable | undefined = controllerConstructor as Newable;

  while (currentType !== undefined) {
    const parameterMetadataList:
      | (ControllerMethodParameterMetadata | undefined)[]
      | undefined = getOwnReflectMetadata(
      currentType,
      controllerMethodParameterMetadataReflectKey,
      methodKey,
    );

    if (parameterMetadataList !== undefined) {
      return parameterMetadataList;
    }

    currentType = getBaseType(currentType);
  }

  return [];
}
