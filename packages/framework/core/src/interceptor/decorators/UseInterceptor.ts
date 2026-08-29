import {
  buildArrayMetadataWithArray,
  buildEmptyArrayMetadata,
  updateOwnReflectMetadata,
} from '@inversifyjs/reflect-metadata-utils';
import { type ServiceIdentifier } from 'inversify';

import { classInterceptorMetadataReflectKey } from '../../reflectMetadata/data/classInterceptorMetadataReflectKey.js';
import { classMethodInterceptorMetadataReflectKey } from '../../reflectMetadata/data/classMethodInterceptorMetadataReflectKey.js';
import { decoratorFinalizersMetadataKey } from '../../reflectMetadata/data/decoratorFinalizersMetadataKey.js';
import { type Interceptor } from '../models/Interceptor.js';

// eslint-disable-next-line @typescript-eslint/naming-convention
export function UseInterceptor(
  ...interceptorList: ServiceIdentifier<Interceptor>[]
): (target: object, context: DecoratorContext) => void {
  return (target: object, context: DecoratorContext): void => {
    if (context.kind === 'class') {
      updateOwnReflectMetadata(
        target,
        classInterceptorMetadataReflectKey,
        buildEmptyArrayMetadata,
        buildArrayMetadataWithArray(interceptorList),
      );
    } else if (context.kind === 'method') {
      const finalizers: Array<(cls: object) => void> =
        ((context.metadata as Record<symbol, unknown>)[decoratorFinalizersMetadataKey] ??= []) as Array<(cls: object) => void>;
      finalizers.push((cls: object) => {
        updateOwnReflectMetadata(
          cls,
          classMethodInterceptorMetadataReflectKey,
          buildEmptyArrayMetadata,
          buildArrayMetadataWithArray(interceptorList),
          context.name,
        );
      });
    }
  };
}
