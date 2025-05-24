import { updateOwnReflectMetadata } from '@inversifyjs/reflect-metadata-utils';
import { Newable } from 'inversify';

import { controllerMethodMiddlewareMetadataReflectKey } from '../../reflectMetadata/data/controllerMethodMiddlewareMetadataReflectKey';
import { controllerMiddlewareMetadataReflectKey } from '../../reflectMetadata/data/controllerMiddlewareMetadataReflectKey';
import { buildArrayMetadataWithArray } from '../calculations/buildArrayMetadataWithArray';
import { buildDefaultArrayMetadata } from '../calculations/buildDefaultArrayMetadata';
import { Middleware } from '../middleware/model/Middleware';
import { ApplyMiddlewareOptions } from '../models/ApplyMiddlewareOptions';

export function applyMiddleware(
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
