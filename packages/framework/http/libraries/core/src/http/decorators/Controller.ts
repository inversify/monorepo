import {
  buildArrayMetadataWithElement,
  buildEmptyArrayMetadata,
  updateOwnReflectMetadata,
} from '@inversifyjs/reflect-metadata-utils';
import {
  type BindingScope,
  injectable,
  type ServiceIdentifier,
} from 'inversify';

import { controllerMetadataReflectKey } from '../../reflectMetadata/data/controllerMetadataReflectKey.js';
import { type ControllerMetadata } from '../../routerExplorer/model/ControllerMetadata.js';
import { buildNormalizedPath } from '../calculations/buildNormalizedPath.js';
import { type Controller as ControllerModel } from '../models/Controller.js';
import { type ControllerOptions } from '../models/ControllerOptions.js';

// eslint-disable-next-line @typescript-eslint/naming-convention
export function Controller(
  pathOrOptions?: string | ControllerOptions,
): ClassDecorator {
  return (target: NewableFunction): void => {
    const controllerMetadata: ControllerMetadata = {
      path: '/',
      priority: 0,
      serviceIdentifier: target as ServiceIdentifier<ControllerModel>,
      target,
    };

    let scope: BindingScope | undefined = undefined;

    if (pathOrOptions !== undefined) {
      if (typeof pathOrOptions === 'string') {
        controllerMetadata.path = buildNormalizedPath(pathOrOptions);
      } else {
        controllerMetadata.path = buildNormalizedPath(
          pathOrOptions.path ?? '/',
        );

        if (pathOrOptions.priority !== undefined) {
          controllerMetadata.priority = pathOrOptions.priority;
        }

        if (pathOrOptions.serviceIdentifier !== undefined) {
          controllerMetadata.serviceIdentifier =
            pathOrOptions.serviceIdentifier as ServiceIdentifier<ControllerModel>;
        }

        scope = pathOrOptions.scope;
      }
    }

    injectable(scope)(target);

    updateOwnReflectMetadata(
      Reflect,
      controllerMetadataReflectKey,
      buildEmptyArrayMetadata,
      buildArrayMetadataWithElement(controllerMetadata),
    );
  };
}
