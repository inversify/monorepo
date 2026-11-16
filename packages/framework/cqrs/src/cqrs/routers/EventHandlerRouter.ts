import { getOwnReflectMetadata } from '@inversifyjs/reflect-metadata-utils';
import { type ServiceIdentifier } from 'inversify';

import { eventMetadataReflectKey } from '../../reflectMetadata/data/eventMetadataReflectKey.js';
import { type CqrsEventHandler } from '../models/CqrsEventHandler.js';
import { type EventMetadata } from '../models/EventMetadata.js';
import { HandlerRouter } from './HandlerRouter.js';

export class EventHandlerRouter extends HandlerRouter<
  object,
  ServiceIdentifier<CqrsEventHandler>[]
> {
  protected override _appendHandler(
    result: ServiceIdentifier<CqrsEventHandler>[] | undefined,
    serviceIdentifier: ServiceIdentifier,
    // oxlint-disable-next-line typescript/no-unsafe-function-type
    _inputType: Function,
  ): ServiceIdentifier<CqrsEventHandler>[] {
    const serviceIdentifierList: ServiceIdentifier<CqrsEventHandler>[] =
      result ?? [];

    serviceIdentifierList.push(
      serviceIdentifier as ServiceIdentifier<CqrsEventHandler>,
    );

    return serviceIdentifierList;
  }

  protected override _getInputIdentifier(
    event: object,
  ): string | symbol | undefined {
    return getOwnReflectMetadata<EventMetadata>(
      event.constructor,
      eventMetadataReflectKey,
    )?.identifier;
  }
}
