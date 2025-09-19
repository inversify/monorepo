import { getOwnReflectMetadata } from '@inversifyjs/reflect-metadata-utils';
import { ServiceIdentifier } from 'inversify';

import { classMethodGuardMetadataReflectKey } from '../../reflectMetadata/data/classMethodGuardMetadataReflectKey';
import { Guard } from '../models/Guard';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function getClassMethodGuardList<TRequest = any>(
  classConstructor: NewableFunction,
  methodKey: string | symbol,
): ServiceIdentifier<Guard<TRequest>>[] {
  return (
    getOwnReflectMetadata(
      classConstructor,
      classMethodGuardMetadataReflectKey,
      methodKey,
    ) ?? []
  );
}
