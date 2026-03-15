import { getOwnReflectMetadata } from '@inversifyjs/reflect-metadata-utils';
import { type ServiceIdentifier } from 'inversify';

import { classMethodMiddlewareMetadataReflectKey } from '../../reflectMetadata/data/classMethodMiddlewareMetadataReflectKey.js';
import { type ApplyMiddlewareOptions } from '../models/ApplyMiddlewareOptions.js';
import { type Middleware } from '../models/Middleware.js';

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
