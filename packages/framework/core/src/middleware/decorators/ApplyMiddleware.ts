import {
  buildArrayMetadataWithArray,
  buildEmptyArrayMetadata,
  updateOwnReflectMetadata,
} from '@inversifyjs/reflect-metadata-utils';
import { type ServiceIdentifier } from 'inversify';

import { classMethodMiddlewareMetadataReflectKey } from '../../reflectMetadata/data/classMethodMiddlewareMetadataReflectKey.js';
import { classMiddlewareMetadataReflectKey } from '../../reflectMetadata/data/classMiddlewareMetadataReflectKey.js';
import { type ApplyMiddlewareOptions } from '../models/ApplyMiddlewareOptions.js';
import { type Middleware } from '../models/Middleware.js';

// eslint-disable-next-line @typescript-eslint/naming-convention
export function ApplyMiddleware(
  ...middlewareList: (ServiceIdentifier<Middleware> | ApplyMiddlewareOptions)[]
): ClassDecorator & MethodDecorator {
  return (target: object, key?: string | symbol): void => {
    let classTarget: object;
    let metadataKey: string | symbol;

    if (key === undefined) {
      classTarget = target;
      metadataKey = classMiddlewareMetadataReflectKey;
    } else {
      classTarget = target.constructor;
      metadataKey = classMethodMiddlewareMetadataReflectKey;
    }

    updateOwnReflectMetadata(
      classTarget,
      metadataKey,
      buildEmptyArrayMetadata,
      buildArrayMetadataWithArray(middlewareList),
      key,
    );
  };
}
