import { getOwnReflectMetadata } from '@inversifyjs/reflect-metadata-utils';
import { ServiceIdentifier } from 'inversify';

import { classMiddlewareMetadataReflectKey } from '../../reflectMetadata/data/classMiddlewareMetadataReflectKey';
import { ApplyMiddlewareOptions } from '../models/ApplyMiddlewareOptions';
import { Middleware } from '../models/Middleware';

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
