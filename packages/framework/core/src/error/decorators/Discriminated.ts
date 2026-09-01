import {
  buildEmptyArrayMetadata,
  updateReflectMetadata,
} from '@inversifyjs/reflect-metadata-utils';

import { errorDiscriminatorMetadataReflectKey } from '../../reflectMetadata/data/errorDiscriminatorMetadataReflectKey.js';
import { buildErrorDiscriminatorMetadata } from '../calculations/buildErrorDiscriminatorMetadata.js';

// eslint-disable-next-line @typescript-eslint/naming-convention
export function Discriminated(discriminator: string | symbol): ClassDecorator {
  return (target: NewableFunction): void => {
    updateReflectMetadata(
      target,
      errorDiscriminatorMetadataReflectKey,
      buildEmptyArrayMetadata,
      buildErrorDiscriminatorMetadata(discriminator),
    );
  };
}
