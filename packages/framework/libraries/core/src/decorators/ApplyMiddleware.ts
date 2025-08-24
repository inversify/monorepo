import {
  buildArrayMetadataWithArray,
  buildEmptyArrayMetadata,
  updateOwnReflectMetadata,
} from '@inversifyjs/reflect-metadata-utils';
import { Newable } from 'inversify';

import { ApplyMiddlewareOptions } from '../middleware/models/ApplyMiddlewareOptions';
import { Middleware } from '../middleware/models/Middleware';
import { classMethodMiddlewareMetadataReflectKey } from '../reflectMetadata/data/classMethodMiddlewareMetadataReflectKey';
import { classMiddlewareMetadataReflectKey } from '../reflectMetadata/data/classMiddlewareMetadataReflectKey';

// eslint-disable-next-line @typescript-eslint/naming-convention
export function ApplyMiddleware(
  ...middlewareList: (Newable<Middleware> | ApplyMiddlewareOptions)[]
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
