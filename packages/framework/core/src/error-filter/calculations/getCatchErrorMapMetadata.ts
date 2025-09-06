import { getOwnReflectMetadata } from '@inversifyjs/reflect-metadata-utils';
import { Newable } from 'inversify';

import { catchErrorMetadataReflectKey } from '../../reflectMetadata/data/catchErrorMetadataReflectKey';

export function getCatchErrorMapMetadata(): Map<
  Newable<Error>,
  NewableFunction[]
> {
  return (
    getOwnReflectMetadata(Reflect, catchErrorMetadataReflectKey) ??
    new Map<Newable<Error>, NewableFunction[]>()
  );
}
