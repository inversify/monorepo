import { decoratorFinalizersMetadataKey } from '@inversifyjs/framework-core';
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
): (value: Function, context: ClassMethodDecoratorContext) => void {
  return (_value: Function, context: ClassMethodDecoratorContext): void => {
    const finalizers: Array<(cls: object) => void> =
      ((context.metadata as Record<symbol, unknown>)[decoratorFinalizersMetadataKey] ??= []) as Array<(cls: object) => void>;
    finalizers.push((cls: object) => {
      updateOwnReflectMetadata(
        cls,
        routeValueMetadataReflectKey,
        buildEmptyRouteValueMetadataMap,
        setRouteValueMetadata(context.name, metadataKey, value),
      );
    });
  };
}
