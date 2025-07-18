import { updateOwnReflectMetadata } from '@inversifyjs/reflect-metadata-utils';

import { controllerMethodMetadataReflectKey } from '../../reflectMetadata/data/controllerMethodMetadataReflectKey';
import { ControllerMethodMetadata } from '../../routerExplorer/model/ControllerMethodMetadata';
import { RequestMethodType } from '../models/RequestMethodType';
import { buildArrayMetadataWithElement } from './buildArrayMetadataWithElement';
import { buildDefaultArrayMetadata } from './buildDefaultArrayMetadata';

export function requestMethod(
  requestMethodType: RequestMethodType,
  path?: string,
): MethodDecorator {
  return (target: object, methodKey: string | symbol): void => {
    const controllerMethodMetadata: ControllerMethodMetadata = {
      methodKey,
      path: path ?? '/',
      requestMethodType,
    };

    updateOwnReflectMetadata(
      target.constructor,
      controllerMethodMetadataReflectKey,
      buildDefaultArrayMetadata,
      buildArrayMetadataWithElement(controllerMethodMetadata),
    );
  };
}
