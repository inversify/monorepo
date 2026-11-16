import {
  getOwnReflectMetadata,
  setReflectMetadata,
} from '@inversifyjs/reflect-metadata-utils';

import { commandMetadataReflectKey } from '../../reflectMetadata/data/commandMetadataReflectKey.js';
import { type CommandMetadata } from '../models/CommandMetadata.js';

export interface CommandOptions {
  identifier?: string | symbol;
}

export function Command(options: CommandOptions): ClassDecorator {
  // oxlint-disable-next-line typescript/no-unsafe-function-type
  return (target: Function) => {
    if (
      getOwnReflectMetadata(target, commandMetadataReflectKey) !== undefined
    ) {
      throw new Error(`Command already defined on target "${target.name}".`);
    }

    const metadata: CommandMetadata = {
      identifier: options.identifier,
    };

    setReflectMetadata(target, commandMetadataReflectKey, metadata);
  };
}
