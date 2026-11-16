import { getOwnReflectMetadata } from '@inversifyjs/reflect-metadata-utils';
import { type ServiceIdentifier } from 'inversify';

import { queryMetadataReflectKey } from '../../reflectMetadata/data/queryMetadataReflectKey.js';
import { type CqrsQueryHandler } from '../models/CqrsQueryHandler.js';
import { type QueryMetadata } from '../models/QueryMetadata.js';
import { HandlerRouter } from './HandlerRouter.js';

export class QueryHandlerRouter extends HandlerRouter<
  object,
  ServiceIdentifier<CqrsQueryHandler>
> {
  protected override _appendHandler(
    result: ServiceIdentifier<CqrsQueryHandler> | undefined,
    serviceIdentifier: ServiceIdentifier,
    // oxlint-disable-next-line typescript/no-unsafe-function-type
    inputType: Function,
  ): ServiceIdentifier<CqrsQueryHandler> {
    if (result !== undefined) {
      throw new Error(`Query handler already defined for "${inputType.name}".`);
    }

    return serviceIdentifier as ServiceIdentifier<CqrsQueryHandler>;
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
