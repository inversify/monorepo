import { getOwnReflectMetadata } from '@inversifyjs/reflect-metadata-utils';
import { type ServiceIdentifier } from 'inversify';

import { classMiddlewareMetadataReflectKey } from '../../reflectMetadata/data/classMiddlewareMetadataReflectKey.js';
import { type ApplyMiddlewareOptions } from '../models/ApplyMiddlewareOptions.js';
import { type Middleware } from '../models/Middleware.js';

export function getClassMiddlewareList(
  classConstructor: NewableFunction,
): (ServiceIdentifier<Middleware> | ApplyMiddlewareOptions)[] {
  return (
    getOwnReflectMetadata(
      classConstructor,
      classMiddlewareMetadataReflectKey,
    ) ?? []
  );
}
