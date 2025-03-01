import {
  getReflectMetadata,
  setReflectMetadata,
} from '@inversifyjs/reflect-metadata-utils';
import { BindingScope, injectable } from 'inversify';

import { controllerMetadataReflectKey } from '../../reflectMetadata/data/controllerMetadataReflectKey';
import { ControllerMetadata } from '../models/ControllerMetadata';
import { ControllerOptions } from '../models/ControllerOptions';

export function controller(
  pathOrOptions?: string | ControllerOptions,
  scope?: BindingScope,
): ClassDecorator {
  return (target: NewableFunction): void => {
    injectable(scope)(target);
    const controllerMetadata: ControllerMetadata = {
      path: '/',
      target,
    };

    if (pathOrOptions !== undefined) {
      if (typeof pathOrOptions === 'string') {
        controllerMetadata.path = pathOrOptions;
      } else {
        controllerMetadata.controllerName = pathOrOptions.controllerName;
        controllerMetadata.path = pathOrOptions.path ?? '/';
      }
    }

    let controllerMetadataList: ControllerMetadata[] | undefined =
      getReflectMetadata(Reflect, controllerMetadataReflectKey);

    if (controllerMetadataList !== undefined) {
      controllerMetadataList.push(controllerMetadata);
    } else {
      controllerMetadataList = [controllerMetadata];
    }

    setReflectMetadata(
      Reflect,
      controllerMetadataReflectKey,
      controllerMetadataList,
    );
  };
}
