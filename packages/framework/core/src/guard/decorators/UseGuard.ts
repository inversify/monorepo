import {
  buildArrayMetadataWithArray,
  buildEmptyArrayMetadata,
  updateOwnReflectMetadata,
} from '@inversifyjs/reflect-metadata-utils';
import { type ServiceIdentifier } from 'inversify';

import { classGuardMetadataReflectKey } from '../../reflectMetadata/data/classGuardMetadataReflectKey.js';
import { classMethodGuardMetadataReflectKey } from '../../reflectMetadata/data/classMethodGuardMetadataReflectKey.js';
import { decoratorFinalizersMetadataKey } from '../../reflectMetadata/data/decoratorFinalizersMetadataKey.js';
import { type Guard } from '../models/Guard.js';

// eslint-disable-next-line @typescript-eslint/naming-convention
export function UseGuard(
  ...guardList: ServiceIdentifier<Guard>[]
): (target: object, context: DecoratorContext) => void {
  return (target: object, context: DecoratorContext): void => {
    if (context.kind === 'class') {
      updateOwnReflectMetadata(
        target,
        classGuardMetadataReflectKey,
        buildEmptyArrayMetadata,
        buildArrayMetadataWithArray(guardList),
      );
    } else if (context.kind === 'method') {
      const finalizers: Array<(cls: object) => void> =
        ((context.metadata as Record<symbol, unknown>)[decoratorFinalizersMetadataKey] ??= []) as Array<(cls: object) => void>;
      finalizers.push((cls: object) => {
        updateOwnReflectMetadata(
          cls,
          classMethodGuardMetadataReflectKey,
          buildEmptyArrayMetadata,
          buildArrayMetadataWithArray(guardList),
          context.name,
        );
      });
    }
  };
}
