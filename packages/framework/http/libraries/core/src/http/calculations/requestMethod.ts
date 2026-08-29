import {
  buildArrayMetadataWithElement,
  buildEmptyArrayMetadata,
  updateOwnReflectMetadata,
} from '@inversifyjs/reflect-metadata-utils';

import { controllerMethodMetadataReflectKey } from '../../reflectMetadata/data/controllerMethodMetadataReflectKey.js';
import { type ControllerMethodMetadata } from '../../routerExplorer/model/ControllerMethodMetadata.js';
import { type RequestMethodType } from '../models/RequestMethodType.js';
import { buildNormalizedPath } from './buildNormalizedPath.js';
import { decoratorFinalizersMetadataKey } from '@inversifyjs/framework-core';

export function requestMethod(
  requestMethodType: RequestMethodType,
  path?: string,
): (value: Function, context: ClassMethodDecoratorContext) => void {
  return (_value: Function, context: ClassMethodDecoratorContext): void => {
    const controllerMethodMetadata: ControllerMethodMetadata = {
      methodKey: context.name,
      path: buildNormalizedPath(path ?? '/'),
      requestMethodType,
    };

    const finalizers: Array<(cls: object) => void> =
      ((context.metadata as Record<symbol, unknown>)[decoratorFinalizersMetadataKey] ??= []) as Array<(cls: object) => void>;
    finalizers.push((cls: object) => {
      updateOwnReflectMetadata(
        cls,
        controllerMethodMetadataReflectKey,
        buildEmptyArrayMetadata,
        buildArrayMetadataWithElement(controllerMethodMetadata),
      );
    });
  };
}
