import { isPromise } from '@inversifyjs/common';
import { getOwnReflectMetadata } from '@inversifyjs/reflect-metadata-utils';
import { type Container, type ServiceIdentifier } from 'inversify';

import { commandMetadataReflectKey } from '../../reflectMetadata/data/commandMetadataReflectKey.js';
import { type CommandHandlerConfig } from '../models/CommandHandlerConfig.js';
import { type CommandMetadata } from '../models/CommandMetadata.js';
import { type CqrsCommandHandler } from '../models/CqrsCommandHandler.js';
import { type TransportProvider } from '../models/TransportProvider.js';
import { type TransportProviderConfig } from '../models/TransportProviderConfig.js';

export const syncTransportIdentifier: symbol = Symbol.for(
  '@inversifyjs/cqrs/syncTransportIdentifier',
);

export class SyncTransportProvider implements TransportProvider<undefined> {
  readonly #commandIdentifierToCommandMap: Map<
    string | symbol,
    // oxlint-disable-next-line typescript/no-unsafe-function-type
    Function
  > = new Map();
  readonly #commandTypeToServiceIdentifierListMap: Map<
    // oxlint-disable-next-line typescript/no-unsafe-function-type
    Function,
    ServiceIdentifier<CqrsCommandHandler>[]
  > = new Map();
  #container: Container | undefined = undefined;
  #initialized: boolean = false;

  public getConfigList(): Iterable<TransportProviderConfig<undefined>> {
    const configList: TransportProviderConfig<undefined>[] = [];

    for (const type of this.#commandTypeToServiceIdentifierListMap.keys()) {
      configList.push({
        params: undefined,
        type,
      });
    }

    return configList;
  }

  public getIdentifier(): string | symbol {
    return syncTransportIdentifier;
  }

  public async initialize(
    container: Container,
    configList: Iterable<CommandHandlerConfig>,
  ): Promise<void> {
    if (this.#initialized) {
      throw new Error('Sync transport is already initialized');
    }

    this.#container = container;

    for (const config of configList) {
      this.#registerHandler(config);
    }

    this.#initialized = true;
  }

  public async send(command: object, _params: undefined): Promise<void> {
    if (this.#container === undefined) {
      throw new Error('Sync transport is not initialized');
    }

    let serviceIdentifierList:
      | ServiceIdentifier<CqrsCommandHandler>[]
      | undefined = this.#commandTypeToServiceIdentifierListMap.get(
      command.constructor,
    );

    if (serviceIdentifierList === undefined) {
      serviceIdentifierList =
        this.#getServiceIdentifierListByCommandIdentifier(command);
    }

    if (serviceIdentifierList === undefined) {
      throw new Error(
        `No handler found for command ${command.constructor.name}`,
      );
    }

    for (const serviceIdentifier of serviceIdentifierList) {
      const handler: CqrsCommandHandler =
        await this.#container.getAsync(serviceIdentifier);

      await this.#awaitHandler(handler, command);
    }
  }

  async #awaitHandler(
    handler: CqrsCommandHandler,
    command: object,
  ): Promise<void> {
    const execution: Promise<void> | void = handler.handle(command);

    if (isPromise(execution)) {
      await execution;
    }
  }

  #getServiceIdentifierListByCommandIdentifier(
    command: object,
  ): ServiceIdentifier<CqrsCommandHandler>[] | undefined {
    const commandIdentifier: string | symbol | undefined =
      getOwnReflectMetadata<CommandMetadata>(
        command.constructor,
        commandMetadataReflectKey,
      )?.identifier;

    if (commandIdentifier === undefined) {
      return undefined;
    }

    // oxlint-disable-next-line typescript/no-unsafe-function-type
    const mappedCommand: Function | undefined =
      this.#commandIdentifierToCommandMap.get(commandIdentifier);

    if (mappedCommand === undefined) {
      return undefined;
    }

    const serviceIdentifierList:
      | ServiceIdentifier<CqrsCommandHandler>[]
      | undefined =
      this.#commandTypeToServiceIdentifierListMap.get(mappedCommand);

    if (serviceIdentifierList === undefined) {
      return undefined;
    }

    this.#commandTypeToServiceIdentifierListMap.set(
      command.constructor,
      serviceIdentifierList,
    );

    return serviceIdentifierList;
  }

  #registerHandler(config: CommandHandlerConfig): void {
    const serviceIdentifier: ServiceIdentifier<CqrsCommandHandler> =
      (config.serviceIdentifier ??
        config.handler) as ServiceIdentifier<CqrsCommandHandler>;
    let serviceIdentifierList:
      | ServiceIdentifier<CqrsCommandHandler>[]
      | undefined = this.#commandTypeToServiceIdentifierListMap.get(
      config.command.type,
    );

    if (serviceIdentifierList === undefined) {
      serviceIdentifierList = [];

      this.#commandTypeToServiceIdentifierListMap.set(
        config.command.type,
        serviceIdentifierList,
      );
    }

    if (
      config.command.identifier !== undefined &&
      !this.#commandIdentifierToCommandMap.has(config.command.identifier)
    ) {
      this.#commandIdentifierToCommandMap.set(
        config.command.identifier,
        config.command.type,
      );
    }

    serviceIdentifierList.push(serviceIdentifier);
  }
}
