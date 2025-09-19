import { getOwnReflectMetadata } from '@inversifyjs/reflect-metadata-utils';
import { ServiceIdentifier } from 'inversify';

import { classMethodMiddlewareMetadataReflectKey } from '../../reflectMetadata/data/classMethodMiddlewareMetadataReflectKey';
import { ApplyMiddlewareOptions } from '../models/ApplyMiddlewareOptions';
import { Middleware } from '../models/Middleware';

export function getClassMethodMiddlewareList(
  classConstructor: NewableFunction,
  methodKey: string | symbol,
): (ServiceIdentifier<Middleware> | ApplyMiddlewareOptions)[] {
  return (
    getOwnReflectMetadata(
      classConstructor,
      classMethodMiddlewareMetadataReflectKey,
      methodKey,
    ) ?? []
  );
}
