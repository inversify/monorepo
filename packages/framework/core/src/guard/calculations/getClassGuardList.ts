import { getOwnReflectMetadata } from '@inversifyjs/reflect-metadata-utils';
import { Newable } from 'inversify';

import { classGuardMetadataReflectKey } from '../../reflectMetadata/data/classGuardMetadataReflectKey';
import { Guard } from '../models/Guard';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function getClassGuardList<TRequest = any>(
  classConstructor: NewableFunction,
): Newable<Guard<TRequest>>[] {
  return (
    getOwnReflectMetadata(classConstructor, classGuardMetadataReflectKey) ?? []
  );
}
