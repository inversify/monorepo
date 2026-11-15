import {
  buildArrayMetadataWithElement,
  buildEmptyArrayMetadata,
  updateOwnReflectMetadata,
} from '@inversifyjs/reflect-metadata-utils';

import { commandHandlerMetadataReflectKey } from '../../reflectMetadata/data/commandHandlerMetadataReflectKey.js';
import { type CommandHandlerMetadata } from '../models/CommandHandlerMetadata.js';
import { type CommandHandlerOptions } from '../models/CommandHandlerOptions.js';

export function CommandHandler(options: CommandHandlerOptions): ClassDecorator {
  // oxlint-disable-next-line typescript/no-unsafe-function-type
  return (target: Function) => {
    const metadata: CommandHandlerMetadata = {
      command: options.command,
      serviceIdentifier: options.serviceIdentifier,
      target,
      transports: options.transports,
    };

    updateOwnReflectMetadata(
      Reflect,
      commandHandlerMetadataReflectKey,
      buildEmptyArrayMetadata,
      buildArrayMetadataWithElement(metadata),
    );
  };
}
