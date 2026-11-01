import { getBaseType } from '@inversifyjs/prototype-utils';
import { getOwnReflectMetadata } from '@inversifyjs/reflect-metadata-utils';
import { type Newable } from 'inversify';

import { routeValueMetadataReflectKey } from '../../reflectMetadata/data/routeValueMetadataReflectKey.js';

export function getControllerMethodRouteValueMetadata(
  controller: NewableFunction,
  methodKey: string | symbol,
): Map<string | symbol, unknown> | undefined {
  let routeValueMetadataMap: Map<string | symbol, unknown> | undefined;

  let currentType: Newable | undefined = controller as Newable;

  while (currentType !== undefined) {
    const typeRouteValueMetadataMap:
      | Map<string | symbol, Map<string | symbol, unknown>>
      | undefined = getOwnReflectMetadata(
      currentType,
      routeValueMetadataReflectKey,
    );

    if (typeRouteValueMetadataMap !== undefined) {
      const typeMethodRouteValueMetadataMap:
        | Map<string | symbol, unknown>
        | undefined = typeRouteValueMetadataMap.get(methodKey);

      if (typeMethodRouteValueMetadataMap !== undefined) {
        if (routeValueMetadataMap === undefined) {
          routeValueMetadataMap = new Map();
        }

        for (const [key, value] of typeMethodRouteValueMetadataMap) {
          if (!routeValueMetadataMap.has(key)) {
            routeValueMetadataMap.set(key, value);
          }
        }
      }
    }

    currentType = getBaseType(currentType);
  }

  return routeValueMetadataMap;
}
