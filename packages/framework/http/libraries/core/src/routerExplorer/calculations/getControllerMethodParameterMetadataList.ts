import { findInPrototypeChain } from '@inversifyjs/prototype-utils';
import { getOwnReflectMetadata } from '@inversifyjs/reflect-metadata-utils';
import type { Newable } from 'inversify';

import { controllerMethodParameterMetadataReflectKey } from '../../reflectMetadata/data/controllerMethodParameterMetadataReflectKey';
import { ControllerMethodParameterMetadata } from '../model/ControllerMethodParameterMetadata';

export function getControllerMethodParameterMetadataList(
  controllerConstructor: NewableFunction,
  methodKey: string | symbol,
): (ControllerMethodParameterMetadata | undefined)[] {
  return (
    findInPrototypeChain<(ControllerMethodParameterMetadata | undefined)[]>(
      controllerConstructor as Newable,
      (
        type: Newable,
      ): (ControllerMethodParameterMetadata | undefined)[] | undefined =>
        getOwnReflectMetadata(
          type,
          controllerMethodParameterMetadataReflectKey,
          methodKey,
        ),
    ) ?? []
  );
}
