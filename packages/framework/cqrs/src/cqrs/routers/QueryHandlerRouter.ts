import { getOwnReflectMetadata } from '@inversifyjs/reflect-metadata-utils';
import { type ServiceIdentifier } from 'inversify';

import { queryMetadataReflectKey } from '../../reflectMetadata/data/queryMetadataReflectKey.js';
import { type QueryMetadata } from '../models/QueryMetadata.js';
import { HandlerRouter } from './HandlerRouter.js';

export class QueryHandlerRouter extends HandlerRouter<
  object,
  ServiceIdentifier
> {
  protected override _appendHandler(
    result: ServiceIdentifier | undefined,
    serviceIdentifier: ServiceIdentifier,
    // oxlint-disable-next-line typescript/no-unsafe-function-type
    inputType: Function,
  ): ServiceIdentifier {
    if (result !== undefined) {
      throw new Error(`Query handler already defined for "${inputType.name}".`);
    }

    return serviceIdentifier;
  }

  protected override _getInputIdentifier(
    query: object,
  ): string | symbol | undefined {
    return getOwnReflectMetadata<QueryMetadata>(
      query.constructor,
      queryMetadataReflectKey,
    )?.identifier;
  }
}
