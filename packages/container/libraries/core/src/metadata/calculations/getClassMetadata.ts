import { type Newable } from '@inversifyjs/common';
import { getOwnReflectMetadata } from '@inversifyjs/reflect-metadata-utils';

import { classMetadataReflectKey } from '../../reflectMetadata/data/classMetadataReflectKey.js';
import { type ClassMetadata } from '../models/ClassMetadata.js';
import { getDefaultClassMetadata } from './getDefaultClassMetadata.js';
import { isPendingClassMetadata } from './isPendingClassMetadata.js';
import { throwAtInvalidClassMetadata } from './throwAtInvalidClassMetadata.js';
import { validateConstructorMetadataArray } from './validateConstructorMetadataArray.js';

export function getClassMetadata(type: Newable): ClassMetadata {
  const classMetadata: ClassMetadata =
    getOwnReflectMetadata(type, classMetadataReflectKey) ??
    getDefaultClassMetadata();

  if (isPendingClassMetadata(type)) {
    throwAtInvalidClassMetadata(type, classMetadata);
  } else {
    validateConstructorMetadataArray(type, classMetadata.constructorArguments);

    return classMetadata;
  }
}
