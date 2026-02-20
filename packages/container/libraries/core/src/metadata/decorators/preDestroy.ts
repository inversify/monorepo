import { updateOwnReflectMetadata } from '@inversifyjs/reflect-metadata-utils';

import { classMetadataReflectKey } from '../../reflectMetadata/data/classMetadataReflectKey.js';
import { updateMaybeClassMetadataPreDestroy } from '../actions/updateMaybeClassMetadataPreDestroy.js';
import { getDefaultClassMetadata } from '../calculations/getDefaultClassMetadata.js';
import { handleInjectionError } from '../calculations/handleInjectionError.js';

export function preDestroy(): MethodDecorator {
  return <T>(
    target: object,
    propertyKey: string | symbol,
    _descriptor: TypedPropertyDescriptor<T>,
  ): void => {
    try {
      updateOwnReflectMetadata(
        target.constructor,
        classMetadataReflectKey,
        getDefaultClassMetadata,
        updateMaybeClassMetadataPreDestroy(propertyKey),
      );
    } catch (error: unknown) {
      handleInjectionError(target, propertyKey, undefined, error);
    }
  };
}
