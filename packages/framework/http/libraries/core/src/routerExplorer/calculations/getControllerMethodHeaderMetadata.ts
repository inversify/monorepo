import { getBaseType } from '@inversifyjs/prototype-utils';
import { getOwnReflectMetadata } from '@inversifyjs/reflect-metadata-utils';
import { Newable } from 'inversify';

import { controllerMethodHeaderMetadataReflectKey } from '../../reflectMetadata/data/controllerMethodHeaderMetadataReflectKey';

export function getControllerMethodHeaderMetadata(
  controller: NewableFunction,
  methodKey: string | symbol,
): Record<string, string> {
  const headerMetadata: Record<string, string> = {};

  let currentType: Newable | undefined = controller as Newable;

  while (currentType !== undefined) {
    const typeHeaderMetadata: Record<string, string> | undefined =
      getOwnReflectMetadata(
        currentType,
        controllerMethodHeaderMetadataReflectKey,
        methodKey,
      );

    if (typeHeaderMetadata !== undefined) {
      for (const key in typeHeaderMetadata) {
        if (!Object.hasOwn(headerMetadata, key)) {
          headerMetadata[key] = typeHeaderMetadata[key] as string;
        }
      }
    }

    currentType = getBaseType(currentType);
  }

  return headerMetadata;
}
