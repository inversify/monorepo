import { getOwnReflectMetadata } from '@inversifyjs/reflect-metadata-utils';
import { type ServiceIdentifier } from 'inversify';

import { classMethodGuardMetadataReflectKey } from '../../reflectMetadata/data/classMethodGuardMetadataReflectKey.js';
import { type Guard } from '../models/Guard.js';

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
