import { updateOwnReflectMetadata } from '@inversifyjs/reflect-metadata-utils';
import { BindingScope, injectable } from 'inversify';

import { controllerMetadataReflectKey } from '../../reflectMetadata/data/controllerMetadataReflectKey';
import { ControllerMetadata } from '../../routerExplorer/model/ControllerMetadata';
import { buildArrayMetadataWithElement } from '../calculations/buildArrayMetadataWithElement';
import { buildDefaultArrayMetadata } from '../calculations/buildDefaultArrayMetadata';
import { ControllerOptions } from '../models/ControllerOptions';

export function controller(
  pathOrOptions?: string | ControllerOptions,
): ClassDecorator {
  return (target: NewableFunction): void => {
    const controllerMetadata: ControllerMetadata = {
      path: '/',
      target,
    };

    let scope: BindingScope | undefined = undefined;

    if (pathOrOptions !== undefined) {
      if (typeof pathOrOptions === 'string') {
        controllerMetadata.path = pathOrOptions;
      } else {
        controllerMetadata.path = pathOrOptions.path ?? '/';
        scope = pathOrOptions.scope;
      }
    }

    injectable(scope)(target);

    updateOwnReflectMetadata(
      Reflect,
      controllerMetadataReflectKey,
      buildDefaultArrayMetadata,
      buildArrayMetadataWithElement(controllerMetadata),
    );
  };
}
