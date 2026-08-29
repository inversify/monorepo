import { decoratorFinalizersMetadataKey } from '@inversifyjs/framework-core';
import { setReflectMetadata } from '@inversifyjs/reflect-metadata-utils';

import { controllerMethodStatusCodeMetadataReflectKey } from '../../reflectMetadata/data/controllerMethodStatusCodeMetadataReflectKey.js';
import { type HttpStatusCode } from '../models/HttpStatusCode.js';

// eslint-disable-next-line @typescript-eslint/naming-convention
export function StatusCode(
  statusCode: HttpStatusCode,
): (value: Function, context: ClassMethodDecoratorContext) => void {
  return (_value: Function, context: ClassMethodDecoratorContext): void => {
    const finalizers: Array<(cls: object) => void> =
      ((context.metadata as Record<symbol, unknown>)[decoratorFinalizersMetadataKey] ??= []) as Array<(cls: object) => void>;
    finalizers.push((cls: object) => {
      setReflectMetadata(
        cls,
        controllerMethodStatusCodeMetadataReflectKey,
        statusCode,
        context.name,
      );
    });
  };
}
