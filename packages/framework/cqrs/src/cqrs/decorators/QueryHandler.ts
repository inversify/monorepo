import {
  buildArrayMetadataWithElement,
  buildEmptyArrayMetadata,
  updateOwnReflectMetadata,
} from '@inversifyjs/reflect-metadata-utils';

import { queryHandlerMetadataReflectKey } from '../../reflectMetadata/data/queryHandlerMetadataReflectKey.js';
import { type QueryHandlerMetadata } from '../models/QueryHandlerMetadata.js';
import { type QueryHandlerOptions } from '../models/QueryHandlerOptions.js';

export function QueryHandler(options: QueryHandlerOptions): ClassDecorator {
  // oxlint-disable-next-line typescript/no-unsafe-function-type
  return (target: Function) => {
    const metadata: QueryHandlerMetadata = {
      query: options.query,
      serviceIdentifier: options.serviceIdentifier,
      target,
    };

    updateOwnReflectMetadata(
      Reflect,
      queryHandlerMetadataReflectKey,
      buildEmptyArrayMetadata,
      buildArrayMetadataWithElement(metadata),
    );
  };
}
