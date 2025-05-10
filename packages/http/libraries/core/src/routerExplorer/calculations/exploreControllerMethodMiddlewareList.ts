import { getOwnReflectMetadata } from '@inversifyjs/reflect-metadata-utils';

import { ApplyMiddlewareOptions } from '../../http/models/ApplyMiddlewareOptions';
import { controllerMethodMiddlewareMetadataReflectKey } from '../../reflectMetadata/data/controllerMethodMiddlewareMetadataReflectKey';

export function exploreControllerMethodMiddlewareList(
  controllerConstructor: NewableFunction,
  methodKey: string | symbol,
): (NewableFunction | ApplyMiddlewareOptions)[] {
  return (
    getOwnReflectMetadata(
      controllerConstructor,
      controllerMethodMiddlewareMetadataReflectKey,
      methodKey,
    ) ?? []
  );
}
