import {
  buildArrayMetadataWithArray,
  buildEmptyArrayMetadata,
  updateOwnReflectMetadata,
} from '@inversifyjs/reflect-metadata-utils';
import { type ServiceIdentifier } from 'inversify';

import { classMethodMiddlewareMetadataReflectKey } from '../../reflectMetadata/data/classMethodMiddlewareMetadataReflectKey.js';
import { classMiddlewareMetadataReflectKey } from '../../reflectMetadata/data/classMiddlewareMetadataReflectKey.js';
import { decoratorFinalizersMetadataKey } from '../../reflectMetadata/data/decoratorFinalizersMetadataKey.js';
import { type ApplyMiddlewareOptions } from '../models/ApplyMiddlewareOptions.js';
import { type Middleware } from '../models/Middleware.js';

// eslint-disable-next-line @typescript-eslint/naming-convention
export function ApplyMiddleware(
  ...middlewareList: (ServiceIdentifier<Middleware> | ApplyMiddlewareOptions)[]
): (target: object, context: DecoratorContext) => void {
  return (target: object, context: DecoratorContext): void => {
    if (context.kind === 'class') {
      updateOwnReflectMetadata(
        target,
        classMiddlewareMetadataReflectKey,
        buildEmptyArrayMetadata,
        buildArrayMetadataWithArray(middlewareList),
      );
    } else if (context.kind === 'method') {
      const finalizers: Array<(cls: object) => void> =
        ((context.metadata as Record<symbol, unknown>)[decoratorFinalizersMetadataKey] ??= []) as Array<(cls: object) => void>;
      finalizers.push((cls: object) => {
        updateOwnReflectMetadata(
          cls,
          classMethodMiddlewareMetadataReflectKey,
          buildEmptyArrayMetadata,
          buildArrayMetadataWithArray(middlewareList),
          context.name,
        );
      });
    }
  };
}
