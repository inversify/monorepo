import { type Newable } from '@inversifyjs/common';
import {
  getOwnReflectMetadata,
  updateOwnReflectMetadata,
} from '@inversifyjs/reflect-metadata-utils';

import { classMetadataReflectKey } from '../../reflectMetadata/data/classMetadataReflectKey.js';
import { typescriptParameterTypesReflectKey } from '../../reflectMetadata/data/typescriptDesignParameterTypesReflectKey.js';
import { buildClassElementMetadataFromTypescriptParameterType } from '../calculations/buildClassElementMetadataFromTypescriptParameterType.js';
import { getDefaultClassMetadata } from '../calculations/getDefaultClassMetadata.js';
import { isUserlandEmittedType } from '../calculations/isUserlandEmittedType.js';
import { type MaybeClassMetadata } from '../models/MaybeClassMetadata.js';

export function updateClassMetadataWithTypescriptParameterTypes(
  target: object,
): void {
  const typescriptConstructorArguments: Newable[] | undefined =
    getOwnReflectMetadata(target, typescriptParameterTypesReflectKey);

  if (typescriptConstructorArguments !== undefined) {
    updateOwnReflectMetadata(
      target,
      classMetadataReflectKey,
      getDefaultClassMetadata,
      updateMaybeClassMetadataWithTypescriptClassMetadata(
        typescriptConstructorArguments,
      ),
    );
  }
}

function updateMaybeClassMetadataWithTypescriptClassMetadata(
  typescriptConstructorArguments: Newable[],
): (classMetadata: MaybeClassMetadata) => MaybeClassMetadata {
  return (classMetadata: MaybeClassMetadata): MaybeClassMetadata => {
    typescriptConstructorArguments.forEach(
      (constructorArgumentType: Newable, index: number): void => {
        if (
          classMetadata.constructorArguments[index] === undefined &&
          isUserlandEmittedType(constructorArgumentType)
        ) {
          classMetadata.constructorArguments[index] =
            buildClassElementMetadataFromTypescriptParameterType(
              constructorArgumentType,
            );
        }
      },
    );

    return classMetadata;
  };
}
