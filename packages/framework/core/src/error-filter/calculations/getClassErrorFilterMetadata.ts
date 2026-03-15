import { getOwnReflectMetadata } from '@inversifyjs/reflect-metadata-utils';
import { type Newable } from 'inversify';

import { classErrorFilterMetadataReflectKey } from '../../reflectMetadata/data/classErrorFilterMetadataReflectKey.js';
import { type ErrorFilter } from '../models/ErrorFilter.js';

export function getClassErrorFilterMetadata(
  classConstructor: NewableFunction,
): Set<Newable<ErrorFilter>> {
  return (
    getOwnReflectMetadata(
      classConstructor,
      classErrorFilterMetadataReflectKey,
    ) ?? new Set()
  );
}
