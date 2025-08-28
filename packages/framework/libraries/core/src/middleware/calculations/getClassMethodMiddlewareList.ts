import { getOwnReflectMetadata } from '@inversifyjs/reflect-metadata-utils';

import { classMethodMiddlewareMetadataReflectKey } from '../../reflectMetadata/data/classMethodMiddlewareMetadataReflectKey';
import { ApplyMiddlewareOptions } from '../models/ApplyMiddlewareOptions';

export function getClassMethodMiddlewareList(
  classConstructor: NewableFunction,
  methodKey: string | symbol,
): (NewableFunction | ApplyMiddlewareOptions)[] {
  return (
    getOwnReflectMetadata(
      classConstructor,
      classMethodMiddlewareMetadataReflectKey,
      methodKey,
    ) ?? []
  );
}
