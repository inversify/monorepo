import {
  getReflectMetadata,
  setReflectMetadata,
} from '@inversifyjs/reflect-metadata-utils';

import { controllerMethodMiddlewareMetadataReflectKey } from '../../reflectMetadata/data/controllerMethodMiddlewareMetadataReflectKey';
import { controllerMiddlewareMetadataReflectKey } from '../../reflectMetadata/data/controllerMiddlewareMetadataReflectKey';
import { ControllerFunction } from '../models/ControllerFunction';

export function applyMiddleware(
  ...middlewareList: NewableFunction[]
): ClassDecorator & MethodDecorator {
  return (
    target: object,
    _key?: string | symbol,
    descriptor?: PropertyDescriptor,
  ): void => {
    let middlewareMetadataList: NewableFunction[] | undefined = undefined;

    if (descriptor === undefined) {
      middlewareMetadataList = getReflectMetadata(
        target,
        controllerMiddlewareMetadataReflectKey,
      );
    } else {
      middlewareMetadataList = getReflectMetadata(
        descriptor.value as ControllerFunction,
        controllerMethodMiddlewareMetadataReflectKey,
      );
    }

    if (middlewareMetadataList !== undefined) {
      middlewareList.push(...middlewareMetadataList);
    } else {
      middlewareMetadataList = middlewareList;
    }

    if (descriptor === undefined) {
      setReflectMetadata(
        target,
        controllerMiddlewareMetadataReflectKey,
        middlewareMetadataList,
      );
    } else {
      setReflectMetadata(
        descriptor.value as ControllerFunction,
        controllerMethodMiddlewareMetadataReflectKey,
        middlewareList,
      );
    }
  };
}
