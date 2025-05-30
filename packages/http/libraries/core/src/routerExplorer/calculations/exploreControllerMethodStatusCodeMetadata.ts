import { getOwnReflectMetadata } from '@inversifyjs/reflect-metadata-utils';

import { HttpStatusCode } from '../../http/responses/HttpStatusCode';
import { controllerMethodStatusCodeMetadataReflectKey } from '../../reflectMetadata/data/controllerMethodStatusCodeMetadataReflectKey';

export function exploreControllerMethodStatusCodeMetadata(
  controllerConstructor: NewableFunction,
  methodKey: string | symbol,
): HttpStatusCode | undefined {
  return getOwnReflectMetadata(
    controllerConstructor,
    controllerMethodStatusCodeMetadataReflectKey,
    methodKey,
  );
}
