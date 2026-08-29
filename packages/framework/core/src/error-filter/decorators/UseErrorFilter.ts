import {
  buildEmptySetMetadata,
  updateOwnReflectMetadata,
  updateSetMetadataWithList,
} from '@inversifyjs/reflect-metadata-utils';
import { type Newable } from 'inversify';

import { classErrorFilterMetadataReflectKey } from '../../reflectMetadata/data/classErrorFilterMetadataReflectKey.js';
import { classMethodErrorFilterMetadataReflectKey } from '../../reflectMetadata/data/classMethodErrorFilterMetadataReflectKey.js';
import { decoratorFinalizersMetadataKey } from '../../reflectMetadata/data/decoratorFinalizersMetadataKey.js';
import { type ErrorFilter } from '../models/ErrorFilter.js';

// eslint-disable-next-line @typescript-eslint/naming-convention
export function UseErrorFilter(
  ...interceptorList: Newable<ErrorFilter>[]
): (target: object, context: DecoratorContext) => void {
  return (target: object, context: DecoratorContext): void => {
    if (context.kind === 'class') {
      updateOwnReflectMetadata(
        target,
        classErrorFilterMetadataReflectKey,
        buildEmptySetMetadata,
        updateSetMetadataWithList(interceptorList),
      );
    } else if (context.kind === 'method') {
      const finalizers: Array<(cls: object) => void> =
        ((context.metadata as Record<symbol, unknown>)[decoratorFinalizersMetadataKey] ??= []) as Array<(cls: object) => void>;
      finalizers.push((cls: object) => {
        updateOwnReflectMetadata(
          cls,
          classMethodErrorFilterMetadataReflectKey,
          buildEmptySetMetadata,
          updateSetMetadataWithList(interceptorList),
          context.name,
        );
      });
    }
  };
}
