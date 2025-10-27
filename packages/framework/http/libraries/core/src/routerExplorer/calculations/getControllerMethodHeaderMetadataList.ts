import { getBaseType } from '@inversifyjs/prototype-utils';
import { getOwnReflectMetadata } from '@inversifyjs/reflect-metadata-utils';
import { Newable } from 'inversify';

import { controllerMethodHeaderMetadataReflectKey } from '../../reflectMetadata/data/controllerMethodHeaderMetadataReflectKey';

export function getControllerMethodHeaderMetadataList(
  controller: NewableFunction,
  methodKey: string | symbol,
): [string, string][] {
  const headerMetadataMap: Map<string, string> = new Map<string, string>();

  let currentType: Newable | undefined = controller as Newable;

  while (currentType !== undefined) {
    const headerMetadata: Map<string, string> | undefined =
      getOwnReflectMetadata(
        currentType,
        controllerMethodHeaderMetadataReflectKey,
        methodKey,
      );

    if (headerMetadata !== undefined) {
      for (const [key, value] of headerMetadata.entries()) {
        if (!headerMetadataMap.has(key)) {
          headerMetadataMap.set(key, value);
        }
      }
    }

    currentType = getBaseType(currentType);
  }

  return [...headerMetadataMap.entries()];
}
