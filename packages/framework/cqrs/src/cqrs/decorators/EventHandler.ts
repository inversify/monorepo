import {
  buildArrayMetadataWithElement,
  buildEmptyArrayMetadata,
  updateOwnReflectMetadata,
} from '@inversifyjs/reflect-metadata-utils';

import { eventHandlerMetadataReflectKey } from '../../reflectMetadata/data/eventHandlerMetadataReflectKey.js';
import { type EventHandlerMetadata } from '../models/EventHandlerMetadata.js';
import { type EventHandlerOptions } from '../models/EventHandlerOptions.js';

export function EventHandler(options: EventHandlerOptions): ClassDecorator {
  // oxlint-disable-next-line typescript/no-unsafe-function-type
  return (target: Function) => {
    const metadata: EventHandlerMetadata = {
      event: options.event,
      serviceIdentifier: options.serviceIdentifier,
      target,
    };

    updateOwnReflectMetadata(
      Reflect,
      eventHandlerMetadataReflectKey,
      buildEmptyArrayMetadata,
      buildArrayMetadataWithElement(metadata),
    );
  };
}
