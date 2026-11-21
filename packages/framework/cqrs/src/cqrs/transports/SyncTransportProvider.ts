import { isPromise } from '@inversifyjs/common';
import { type Container, type ServiceIdentifier } from 'inversify';

import {
  type CqrsHandler,
  isCqrsHandler,
} from '../calculations/isCqrsHandler.js';
import { readServiceIdentifier } from '../calculations/readServiceIdentifier.js';
import { type CommandHandlerConfig } from '../models/CommandHandlerConfig.js';
import { type TransportProvider } from '../models/TransportProvider.js';
import { type TransportProviderConfig } from '../models/TransportProviderConfig.js';
import { CommandHandlerRouter } from '../routers/CommandHandlerRouter.js';

export const syncTransportIdentifier: symbol = Symbol.for(
  '@inversifyjs/cqrs/syncTransportIdentifier',
);

export class SyncTransportProvider implements TransportProvider<undefined> {
  readonly #commandHandlerRouter: CommandHandlerRouter;
  #container: Container | undefined;
  #initialized: boolean;

  constructor() {
    this.#commandHandlerRouter = new CommandHandlerRouter();
    this.#container = undefined;
    this.#initialized = false;
  }

  public getConfigList(): Iterable<TransportProviderConfig<undefined>> {
    const configList: TransportProviderConfig<undefined>[] = [];

    for (const type of this.#commandHandlerRouter.getRegisteredTypes()) {
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

    const serviceIdentifierList: ServiceIdentifier[] | undefined =
      this.#commandHandlerRouter.route(command);

    if (serviceIdentifierList === undefined) {
      throw new Error(
        `No handler found for command ${command.constructor.name}`,
      );
    }

    for (const serviceIdentifier of serviceIdentifierList) {
      const resolved: unknown =
        await this.#container.getAsync(serviceIdentifier);

      if (!isCqrsHandler(resolved)) {
        throw new Error(
          `Handler for command ${command.constructor.name} does not implement handle`,
        );
      }

      await this.#awaitHandler(resolved, command);
    }
  }

  async #awaitHandler(handler: CqrsHandler, command: object): Promise<void> {
    const execution: unknown = handler.handle(command);

    if (isPromise(execution)) {
      await execution;
    }
  }

  #registerHandler(config: CommandHandlerConfig): void {
    const serviceIdentifier: ServiceIdentifier = readServiceIdentifier(
      config.serviceIdentifier ?? config.handler,
    );

    this.#commandHandlerRouter.register({
      identifier: config.command.identifier,
      serviceIdentifier,
      type: config.command.type,
    });
  }
}
