import { getOwnReflectMetadata } from '@inversifyjs/reflect-metadata-utils';
import { Newable } from 'inversify';

import { classMethodErrorFilterMetadataReflectKey } from '../../reflectMetadata/data/classMethodErrorFilterMetadataReflectKey';
import { ErrorFilter } from '../models/ErrorFilter';

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
