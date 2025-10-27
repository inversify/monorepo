import { findInPrototypeChain } from '@inversifyjs/prototype-utils';
import { getOwnReflectMetadata } from '@inversifyjs/reflect-metadata-utils';
import type { Newable } from 'inversify';

import { HttpStatusCode } from '../../http/models/HttpStatusCode';
import { controllerMethodStatusCodeMetadataReflectKey } from '../../reflectMetadata/data/controllerMethodStatusCodeMetadataReflectKey';

export function getControllerMethodStatusCodeMetadata(
  controllerConstructor: NewableFunction,
  methodKey: string | symbol,
): HttpStatusCode | undefined {
  return findInPrototypeChain<HttpStatusCode>(
    controllerConstructor as Newable,
    (type: Newable): HttpStatusCode | undefined =>
      getOwnReflectMetadata(
        type,
        controllerMethodStatusCodeMetadataReflectKey,
        methodKey,
      ),
  );
}
