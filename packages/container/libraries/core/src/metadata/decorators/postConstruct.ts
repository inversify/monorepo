import { updateOwnReflectMetadata } from '@inversifyjs/reflect-metadata-utils';

import { classMetadataReflectKey } from '../../reflectMetadata/data/classMetadataReflectKey.js';
import { updateMaybeClassMetadataPostConstructor } from '../actions/updateMaybeClassMetadataPostConstructor.js';
import { getDefaultClassMetadata } from '../calculations/getDefaultClassMetadata.js';
import { handleInjectionError } from '../calculations/handleInjectionError.js';

export function postConstruct(): MethodDecorator {
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
        updateMaybeClassMetadataPostConstructor(propertyKey),
      );
    } catch (error: unknown) {
      handleInjectionError(target, propertyKey, undefined, error);
    }
  };
}
