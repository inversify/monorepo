import {
  getReflectMetadata,
  setReflectMetadata,
} from '@inversifyjs/reflect-metadata-utils';

import { controllerMethodMetadataReflectKey } from '../../reflectMetadata/data/controllerMethodMetadataReflectKey';
import { ControllerMethodMetadata } from '../../routerExplorer/model/ControllerMethodMetadata';
import { RequestMethodType } from '../models/RequestMethodType';

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

    let controllerMethodMetadataList: ControllerMethodMetadata[] | undefined =
      getReflectMetadata(
        target.constructor,
        controllerMethodMetadataReflectKey,
      );

    if (controllerMethodMetadataList !== undefined) {
      controllerMethodMetadataList.push(controllerMethodMetadata);
    } else {
      controllerMethodMetadataList = [controllerMethodMetadata];
    }

    setReflectMetadata(
      target.constructor,
      controllerMethodMetadataReflectKey,
      controllerMethodMetadataList,
    );
  };
}
