import { getOwnReflectMetadata } from '@inversifyjs/reflect-metadata-utils';
import { type ServiceIdentifier } from 'inversify';

import { commandMetadataReflectKey } from '../../reflectMetadata/data/commandMetadataReflectKey.js';
import { type CommandMetadata } from '../models/CommandMetadata.js';
import { HandlerRouter } from './HandlerRouter.js';

export class CommandHandlerRouter extends HandlerRouter<
  object,
  ServiceIdentifier[]
> {
  protected override _appendHandler(
    result: ServiceIdentifier[] | undefined,
    serviceIdentifier: ServiceIdentifier,
    // oxlint-disable-next-line typescript/no-unsafe-function-type
    _inputType: Function,
  ): ServiceIdentifier[] {
    const serviceIdentifierList: ServiceIdentifier[] = result ?? [];

    serviceIdentifierList.push(serviceIdentifier);

    return serviceIdentifierList;
  }

  protected override _getInputIdentifier(
    command: object,
  ): string | symbol | undefined {
    return getOwnReflectMetadata<CommandMetadata>(
      command.constructor,
      commandMetadataReflectKey,
    )?.identifier;
  }
}
