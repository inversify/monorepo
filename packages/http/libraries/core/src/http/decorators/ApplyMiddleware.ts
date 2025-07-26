import {
  buildArrayMetadataWithArray,
  buildDefaultArrayMetadata,
  updateOwnReflectMetadata,
} from '@inversifyjs/reflect-metadata-utils';
import { Newable } from 'inversify';

import { controllerMethodMiddlewareMetadataReflectKey } from '../../reflectMetadata/data/controllerMethodMiddlewareMetadataReflectKey';
import { controllerMiddlewareMetadataReflectKey } from '../../reflectMetadata/data/controllerMiddlewareMetadataReflectKey';
import { Middleware } from '../middleware/model/Middleware';
import { ApplyMiddlewareOptions } from '../models/ApplyMiddlewareOptions';

// eslint-disable-next-line @typescript-eslint/naming-convention
export function ApplyMiddleware(
  ...middlewareList: (Newable<Middleware> | ApplyMiddlewareOptions)[]
): ClassDecorator & MethodDecorator {
  return (target: object, key?: string | symbol): void => {
    let classTarget: object;
    let metadataKey: string | symbol;

    if (key === undefined) {
      classTarget = target;
      metadataKey = controllerMiddlewareMetadataReflectKey;
    } else {
      classTarget = target.constructor;
      metadataKey = controllerMethodMiddlewareMetadataReflectKey;
    }

    updateOwnReflectMetadata(
      classTarget,
      metadataKey,
      buildDefaultArrayMetadata,
      buildArrayMetadataWithArray(middlewareList),
      key,
    );
  };
}
