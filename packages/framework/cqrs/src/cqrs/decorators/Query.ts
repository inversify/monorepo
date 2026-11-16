import {
  getOwnReflectMetadata,
  setReflectMetadata,
} from '@inversifyjs/reflect-metadata-utils';

import { queryMetadataReflectKey } from '../../reflectMetadata/data/queryMetadataReflectKey.js';
import { type QueryMetadata } from '../models/QueryMetadata.js';

export interface QueryOptions {
  identifier?: string | symbol;
}

export function Query(options: QueryOptions): ClassDecorator {
  // oxlint-disable-next-line typescript/no-unsafe-function-type
  return (target: Function) => {
    if (getOwnReflectMetadata(target, queryMetadataReflectKey) !== undefined) {
      throw new Error(`Query already defined on target "${target.name}".`);
    }

    const metadata: QueryMetadata = {
      identifier: options.identifier,
    };

    setReflectMetadata(target, queryMetadataReflectKey, metadata);
  };
}
