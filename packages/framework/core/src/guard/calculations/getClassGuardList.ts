import { getOwnReflectMetadata } from '@inversifyjs/reflect-metadata-utils';
import { type ServiceIdentifier } from 'inversify';

import { classGuardMetadataReflectKey } from '../../reflectMetadata/data/classGuardMetadataReflectKey.js';
import { type Guard } from '../models/Guard.js';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function getClassGuardList<TRequest = any>(
  classConstructor: NewableFunction,
): ServiceIdentifier<Guard<TRequest>>[] {
  return (
    getOwnReflectMetadata(classConstructor, classGuardMetadataReflectKey) ?? []
  );
}
