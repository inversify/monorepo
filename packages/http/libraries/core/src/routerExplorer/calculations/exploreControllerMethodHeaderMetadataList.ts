import { getOwnReflectMetadata } from '@inversifyjs/reflect-metadata-utils';

import { controllerMethodHeaderMetadataReflectKey } from '../../reflectMetadata/data/controllerMethodHeaderMetadataReflectKey';

export function exploreControllerMethodHeaderMetadataList(
  controller: NewableFunction,
  methodKey: string | symbol,
): [string, string][] {
  const headerMetadata: Map<string, string> | undefined = getOwnReflectMetadata(
    controller,
    controllerMethodHeaderMetadataReflectKey,
    methodKey,
  );

  const headerMetadataList: [string, string][] = [];

  if (headerMetadata !== undefined) {
    headerMetadataList.push(...headerMetadata.entries());
  }

  return headerMetadataList;
}
