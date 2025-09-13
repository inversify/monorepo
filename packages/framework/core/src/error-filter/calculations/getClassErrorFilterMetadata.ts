import { getOwnReflectMetadata } from '@inversifyjs/reflect-metadata-utils';
import { Newable } from 'inversify';

import { classErrorFilterMetadataReflectKey } from '../../reflectMetadata/data/classErrorFilterMetadataReflectKey';
import { ErrorFilter } from '../models/ErrorFilter';

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
