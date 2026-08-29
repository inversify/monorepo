import { decoratorFinalizersMetadataKey } from '@inversifyjs/framework-core';
import { updateOwnReflectMetadata } from '@inversifyjs/reflect-metadata-utils';

import { controllerMethodHeaderMetadataReflectKey } from '../../reflectMetadata/data/controllerMethodHeaderMetadataReflectKey.js';
import { buildSetHeaderMetadata } from '../calculations/buildSetHeaderMetadata.js';

function buildEmptyObjectMetadata(): Record<string, string> {
  return {};
}

// eslint-disable-next-line @typescript-eslint/naming-convention
export function SetHeader(
  headerKey: string,
  value: string,
): (value: Function, context: ClassMethodDecoratorContext) => void {
  return (_value: Function, context: ClassMethodDecoratorContext): void => {
    const finalizers: Array<(cls: object) => void> =
      ((context.metadata as Record<symbol, unknown>)[decoratorFinalizersMetadataKey] ??= []) as Array<(cls: object) => void>;
    finalizers.push((cls: object) => {
      updateOwnReflectMetadata(
        cls,
        controllerMethodHeaderMetadataReflectKey,
        buildEmptyObjectMetadata,
        buildSetHeaderMetadata(headerKey, value),
        context.name,
      );
    });
  };
}
