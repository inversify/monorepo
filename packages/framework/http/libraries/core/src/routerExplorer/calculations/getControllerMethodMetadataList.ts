import { getBaseType } from '@inversifyjs/prototype-utils';
import { getOwnReflectMetadata } from '@inversifyjs/reflect-metadata-utils';
import type { Newable } from 'inversify';

import { controllerMethodMetadataReflectKey } from '../../reflectMetadata/data/controllerMethodMetadataReflectKey';
import { ControllerMethodMetadata } from '../model/ControllerMethodMetadata';

export function getControllerMethodMetadataList(
  controllerConstructor: NewableFunction,
): ControllerMethodMetadata[] {
  const metadataListMap: Map<string, ControllerMethodMetadata> = new Map<
    string,
    ControllerMethodMetadata
  >();

  let currentType: Newable | undefined = controllerConstructor as Newable;

  while (currentType !== undefined) {
    const metadataList: ControllerMethodMetadata[] | undefined =
      getOwnReflectMetadata(currentType, controllerMethodMetadataReflectKey);

    if (metadataList !== undefined) {
      for (const metadata of metadataList) {
        const collisionKey: string = `${metadata.requestMethodType}:${metadata.path}`;

        if (!metadataListMap.has(collisionKey)) {
          metadataListMap.set(collisionKey, metadata);
        }
      }
    }

    currentType = getBaseType(currentType);
  }

  return [...metadataListMap.values()];
}
