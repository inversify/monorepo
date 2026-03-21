import { updateOwnReflectMetadata } from '@inversifyjs/reflect-metadata-utils';

import { routeValueMetadataReflectKey } from '../../reflectMetadata/data/routeValueMetadataReflectKey.js';
import { setRouteValueMetadata } from '../actions/setRouteValueMetadata.js';

function buildEmptyRouteValueMetadataMap(): Map<
  string | symbol,
  Map<string | symbol, unknown>
> {
  return new Map<string | symbol, Map<string | symbol, unknown>>();
}

export function routeValueMetadata(
  metadataKey: string | symbol,
  value: unknown,
): MethodDecorator {
  return (target: object, propertyKey: string | symbol): void => {
    updateOwnReflectMetadata(
      target.constructor,
      routeValueMetadataReflectKey,
      buildEmptyRouteValueMetadataMap,
      setRouteValueMetadata(propertyKey, metadataKey, value),
    );
  };
}
