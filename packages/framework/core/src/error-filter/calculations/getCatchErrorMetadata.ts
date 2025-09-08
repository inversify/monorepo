import { getOwnReflectMetadata } from '@inversifyjs/reflect-metadata-utils';
import { Newable } from 'inversify';

import { catchErrorMetadataReflectKey } from '../../reflectMetadata/data/catchErrorMetadataReflectKey';

export function getCatchErrorMetadata(
  // eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
  target: Function,
): Set<Newable<Error> | null> {
  return (
    getOwnReflectMetadata(target, catchErrorMetadataReflectKey) ?? new Set()
  );
}
