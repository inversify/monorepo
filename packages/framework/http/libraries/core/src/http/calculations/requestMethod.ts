import {
  buildArrayMetadataWithElement,
  buildEmptyArrayMetadata,
  updateOwnReflectMetadata,
} from '@inversifyjs/reflect-metadata-utils';

import { controllerMethodMetadataReflectKey } from '../../reflectMetadata/data/controllerMethodMetadataReflectKey.js';
import { type ControllerMethodMetadata } from '../../routerExplorer/model/ControllerMethodMetadata.js';
import { type RequestMethodType } from '../models/RequestMethodType.js';
import { buildNormalizedPath } from './buildNormalizedPath.js';

export function requestMethod(
  requestMethodType: RequestMethodType,
  path?: string,
): MethodDecorator {
  return (target: object, methodKey: string | symbol): void => {
    const controllerMethodMetadata: ControllerMethodMetadata = {
      methodKey,
      path: buildNormalizedPath(path ?? '/'),
      requestMethodType,
    };

    updateOwnReflectMetadata(
      target.constructor,
      controllerMethodMetadataReflectKey,
      buildEmptyArrayMetadata,
      buildArrayMetadataWithElement(controllerMethodMetadata),
    );
  };
}
