import { getOwnReflectMetadata } from '@inversifyjs/reflect-metadata-utils';

import { HttpStatusCode } from '../../http/models/HttpStatusCode';
import { controllerMethodStatusCodeMetadataReflectKey } from '../../reflectMetadata/data/controllerMethodStatusCodeMetadataReflectKey';

export function getControllerMethodStatusCodeMetadata(
  controllerConstructor: NewableFunction,
  methodKey: string | symbol,
): HttpStatusCode | undefined {
  return getOwnReflectMetadata(
    controllerConstructor,
    controllerMethodStatusCodeMetadataReflectKey,
    methodKey,
  );
}
