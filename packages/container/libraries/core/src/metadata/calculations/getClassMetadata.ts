import { type Newable } from '@inversifyjs/common';
import { getOwnReflectMetadata } from '@inversifyjs/reflect-metadata-utils';

import { classMetadataReflectKey } from '../../reflectMetadata/data/classMetadataReflectKey.js';
import { type ClassMetadata } from '../models/ClassMetadata.js';
import { buildClassMetadataFromRflct } from './buildClassMetadataFromRflct.js';
import { getDefaultClassMetadata } from './getDefaultClassMetadata.js';
import { isPendingClassMetadata } from './isPendingClassMetadata.js';
import { throwAtInvalidClassMetadata } from './throwAtInvalidClassMetadata.js';
import { validateConstructorMetadataArray } from './validateConstructorMetadataArray.js';

export function getClassMetadata(type: Newable): ClassMetadata {
  const decoratorMetadata: ClassMetadata | undefined = getOwnReflectMetadata(
    type,
    classMetadataReflectKey,
  );

  if (decoratorMetadata !== undefined) {
    if (isPendingClassMetadata(type)) {
      throwAtInvalidClassMetadata(type, decoratorMetadata);
    }
    validateConstructorMetadataArray(
      type,
      decoratorMetadata.constructorArguments,
    );
    return decoratorMetadata;
  }

  return buildClassMetadataFromRflct(type) ?? getDefaultClassMetadata();
}
