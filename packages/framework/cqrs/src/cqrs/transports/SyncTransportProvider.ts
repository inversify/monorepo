import { type Container, type ServiceIdentifier } from 'inversify';

import { type CommandHandlerConfig } from '../models/CommandHandlerConfig.js';
import { type CqrsCommandHandler } from '../models/CqrsCommandHandler.js';
import { type TransportProvider } from '../models/TransportProvider.js';
import { type TransportProviderConfig } from '../models/TransportProviderConfig.js';

export const syncTransportIdentifier: symbol = Symbol.for(
  '@inversifyjs/cqrs/syncTransportIdentifier',
);

export class SyncTransportProvider implements TransportProvider<undefined> {
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
    const container: Container | undefined = this.#container;

    if (container === undefined) {
      throw new Error('Sync transport is not initialized');
    }

    const serviceIdentifierList =
      this.#commandTypeToServiceIdentifierListMap.get(command.constructor);

    if (serviceIdentifierList === undefined) {
      throw new Error(
        `No handler found for command ${command.constructor.name}`,
      );
    }

    for (const serviceIdentifier of serviceIdentifierList) {
      const handler: CqrsCommandHandler =
        await container.getAsync(serviceIdentifier);

      await this.#awaitHandler(handler, command);
    }
  }

  async #awaitHandler(
    handler: CqrsCommandHandler,
    command: object,
  ): Promise<void> {
    const execution: Promise<void> | void = handler.handle(command);

    if (execution instanceof Promise) {
      await execution;
    }
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

    serviceIdentifierList.push(serviceIdentifier);
  }
}
