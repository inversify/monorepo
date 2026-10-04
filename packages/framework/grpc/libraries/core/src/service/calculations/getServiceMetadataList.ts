import { getOwnReflectMetadata } from '@inversifyjs/reflect-metadata-utils';

import { serviceMetadataReflectKey } from '../../reflectMetadata/data/serviceMetadataReflectKey.js';
import { type ServiceMetadata } from '../models/ServiceMetadata.js';

export function getServiceMetadataList(): ServiceMetadata[] | undefined {
  return getOwnReflectMetadata(Reflect, serviceMetadataReflectKey);
}
