import {
  buildArrayMetadataWithElement,
  buildEmptyArrayMetadata,
  updateOwnReflectMetadata,
} from '@inversifyjs/reflect-metadata-utils';
import { BindingScope, injectable } from 'inversify';

import { controllerMetadataReflectKey } from '../../reflectMetadata/data/controllerMetadataReflectKey';
import { ControllerMetadata } from '../../routerExplorer/model/ControllerMetadata';
import { buildNormalizedPath } from '../calculations/buildNormalizedPath';
import { ControllerOptions } from '../models/ControllerOptions';

// eslint-disable-next-line @typescript-eslint/naming-convention
export function Controller(
  pathOrOptions?: string | ControllerOptions,
): ClassDecorator {
  return (target: NewableFunction): void => {
    const controllerMetadata: ControllerMetadata = {
      path: '/',
      priority: 0,
      serviceIdentifier: target,
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
            pathOrOptions.serviceIdentifier;
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
