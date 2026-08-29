import {
  buildArrayMetadataWithElement,
  buildEmptyArrayMetadata,
  updateOwnReflectMetadata,
} from '@inversifyjs/reflect-metadata-utils';
import {
  type BindingScope,
  type ServiceIdentifier,
} from 'inversify';

import { controllerMetadataReflectKey } from '../../reflectMetadata/data/controllerMetadataReflectKey.js';
import { type ControllerMetadata } from '../../routerExplorer/model/ControllerMetadata.js';
import { buildNormalizedPath } from '../calculations/buildNormalizedPath.js';
import { type Controller as ControllerModel } from '../models/Controller.js';
import { type ControllerOptions } from '../models/ControllerOptions.js';
import { decoratorFinalizersMetadataKey } from '@inversifyjs/framework-core';

// eslint-disable-next-line @typescript-eslint/naming-convention
export function Controller(
  pathOrOptions?: string | ControllerOptions,
): (target: Function, context: ClassDecoratorContext) => void {
  return (target: Function, context: ClassDecoratorContext): void => {
    const controllerMetadata: ControllerMetadata = {
      path: '/',
      priority: 0,
      serviceIdentifier: target as ServiceIdentifier<ControllerModel>,
      target: target as NewableFunction,
    };

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
      }
    }

    updateOwnReflectMetadata(
      Reflect,
      controllerMetadataReflectKey,
      buildEmptyArrayMetadata,
      buildArrayMetadataWithElement(controllerMetadata),
    );

    // Run method decorator finalizers queued via context.metadata
    const finalizers = (context.metadata as Record<symbol, unknown>)[decoratorFinalizersMetadataKey] as
      | Array<(cls: object) => void>
      | undefined;
    if (finalizers !== undefined) {
      for (const fn of finalizers) {
        fn(target);
      }
    }
  };
}
