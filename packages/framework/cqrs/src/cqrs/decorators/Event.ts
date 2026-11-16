import {
  getOwnReflectMetadata,
  setReflectMetadata,
} from '@inversifyjs/reflect-metadata-utils';

import { eventMetadataReflectKey } from '../../reflectMetadata/data/eventMetadataReflectKey.js';
import { type EventMetadata } from '../models/EventMetadata.js';

export interface EventOptions {
  identifier?: string | symbol;
}

export function Event(options: EventOptions): ClassDecorator {
  // oxlint-disable-next-line typescript/no-unsafe-function-type
  return (target: Function) => {
    if (getOwnReflectMetadata(target, eventMetadataReflectKey) !== undefined) {
      throw new Error(`Event already defined on target "${target.name}".`);
    }

    const metadata: EventMetadata = {
      identifier: options.identifier,
    };

    setReflectMetadata(target, eventMetadataReflectKey, metadata);
  };
}
