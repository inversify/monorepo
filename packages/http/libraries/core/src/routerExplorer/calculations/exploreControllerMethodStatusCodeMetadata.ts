import { StatusCode } from '@inversifyjs/framework-core';
import { getOwnReflectMetadata } from '@inversifyjs/reflect-metadata-utils';

import { controllerMethodStatusCodeMetadataReflectKey } from '../../reflectMetadata/data/controllerMethodStatusCodeMetadataReflectKey';

export function exploreControllerMethodStatusCodeMetadata(
  controllerConstructor: NewableFunction,
  methodKey: string | symbol,
): StatusCode | undefined {
  return getOwnReflectMetadata(
    controllerConstructor,
    controllerMethodStatusCodeMetadataReflectKey,
    methodKey,
  );
}
