import { getOwnReflectMetadata } from '@inversifyjs/reflect-metadata-utils';
import { type Newable } from 'inversify';

import { classMethodErrorFilterMetadataReflectKey } from '../../reflectMetadata/data/classMethodErrorFilterMetadataReflectKey.js';
import { type ErrorFilter } from '../models/ErrorFilter.js';

export function getClassMethodErrorFilterMetadata(
  classConstructor: NewableFunction,
  methodKey: string | symbol,
): Set<Newable<ErrorFilter>> {
  return (
    getOwnReflectMetadata(
      classConstructor,
      classMethodErrorFilterMetadataReflectKey,
      methodKey,
    ) ?? new Set()
  );
}
