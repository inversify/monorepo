import { getOwnReflectMetadata } from '@inversifyjs/reflect-metadata-utils';
import { Newable } from 'inversify';

import { catchExceptionMetadataReflectKey } from '../../reflectMetadata/data/catchExceptionMetadataReflectKey';

export function exploreCatchExceptionMap(): Map<
  Newable<Error>,
  NewableFunction[]
> {
  return (
    getOwnReflectMetadata(Reflect, catchExceptionMetadataReflectKey) ??
    new Map<Newable<Error>, NewableFunction[]>()
  );
}
