import { getOwnReflectMetadata } from '@inversifyjs/reflect-metadata-utils';
import { type Newable } from 'inversify';

import { catchErrorMetadataReflectKey } from '../../reflectMetadata/data/catchErrorMetadataReflectKey.js';

export function getCatchErrorMetadata(
  // eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
  target: Function,
): Set<Newable<Error> | null> {
  return (
    getOwnReflectMetadata(target, catchErrorMetadataReflectKey) ?? new Set()
  );
}
