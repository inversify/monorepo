import { getBaseType } from '@inversifyjs/prototype-utils';
import { getOwnReflectMetadata } from '@inversifyjs/reflect-metadata-utils';
import { Newable } from 'inversify';

import { HttpStatusCode } from '../../http/models/HttpStatusCode';
import { controllerMethodStatusCodeMetadataReflectKey } from '../../reflectMetadata/data/controllerMethodStatusCodeMetadataReflectKey';

export function getControllerMethodStatusCodeMetadata(
  controllerConstructor: NewableFunction,
  methodKey: string | symbol,
): HttpStatusCode | undefined {
  let currentType: Newable | undefined = controllerConstructor as Newable;

  while (currentType !== undefined) {
    const statusCode: HttpStatusCode | undefined = getOwnReflectMetadata(
      currentType,
      controllerMethodStatusCodeMetadataReflectKey,
      methodKey,
    );

    if (statusCode !== undefined) {
      return statusCode;
    }

    currentType = getBaseType(currentType);
  }

  return undefined;
}
