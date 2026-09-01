import { getReflectMetadata } from '@inversifyjs/reflect-metadata-utils';

import { errorDiscriminatorMetadataReflectKey } from '../../reflectMetadata/data/errorDiscriminatorMetadataReflectKey.js';

export function getErrorDiscriminatorMetadata(
  // eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
  target: Function,
): (string | symbol)[] | undefined {
  return getReflectMetadata(target, errorDiscriminatorMetadataReflectKey);
}
