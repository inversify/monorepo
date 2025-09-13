import { getOwnReflectMetadata } from '@inversifyjs/reflect-metadata-utils';
import { Newable } from 'inversify';

import { classMethodGuardMetadataReflectKey } from '../../reflectMetadata/data/classMethodGuardMetadataReflectKey';
import { Guard } from '../models/Guard';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function getClassMethodGuardList<TRequest = any>(
  classConstructor: NewableFunction,
  methodKey: string | symbol,
): Newable<Guard<TRequest>>[] {
  return (
    getOwnReflectMetadata(
      classConstructor,
      classMethodGuardMetadataReflectKey,
      methodKey,
    ) ?? []
  );
}
