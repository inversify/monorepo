import { isPromise } from '@inversifyjs/common';
import { ConsoleLogger, type Logger } from '@inversifyjs/logger';
import { getOwnReflectMetadata } from '@inversifyjs/reflect-metadata-utils';
import { type Container, type ServiceIdentifier } from 'inversify';

import { commandHandlerMetadataReflectKey } from '../../reflectMetadata/data/commandHandlerMetadataReflectKey.js';
import { commandMetadataReflectKey } from '../../reflectMetadata/data/commandMetadataReflectKey.js';
import { eventHandlerMetadataReflectKey } from '../../reflectMetadata/data/eventHandlerMetadataReflectKey.js';
import { eventMetadataReflectKey } from '../../reflectMetadata/data/eventMetadataReflectKey.js';
import { queryHandlerMetadataReflectKey } from '../../reflectMetadata/data/queryHandlerMetadataReflectKey.js';
import { queryMetadataReflectKey } from '../../reflectMetadata/data/queryMetadataReflectKey.js';
import { isCqrsHandler } from '../calculations/isCqrsHandler.js';
import { readServiceIdentifier } from '../calculations/readServiceIdentifier.js';
import { type CommandBus } from '../models/CommandBus.js';
import { type CommandHandlerConfig } from '../models/CommandHandlerConfig.js';
import { type CommandHandlerMetadata } from '../models/CommandHandlerMetadata.js';
import { type CommandMetadata } from '../models/CommandMetadata.js';
import { type CqrsProviderOptions } from '../models/CqrsProviderOptions.js';
import { type EventBus } from '../models/EventBus.js';
import { type EventHandlerMetadata } from '../models/EventHandlerMetadata.js';
import { type EventMetadata } from '../models/EventMetadata.js';
import { type QueryBus } from '../models/QueryBus.js';
import { type QueryHandlerMetadata } from '../models/QueryHandlerMetadata.js';
import { type QueryMetadata } from '../models/QueryMetadata.js';
import { type TransportProvider } from '../models/TransportProvider.js';
import { EventHandlerRouter } from '../routers/EventHandlerRouter.js';
import { QueryHandlerRouter } from '../routers/QueryHandlerRouter.js';
import {
  SyncTransportProvider,
  syncTransportIdentifier,
} from '../transports/SyncTransportProvider.js';

export class CqrsProvider {
  #commandBus: CommandBus | undefined;
  readonly #commandIdentifierToCommandMap: Map<
    string | symbol,
    // oxlint-disable-next-line typescript/no-unsafe-function-type
    Function
  >;
  #eventBus: EventBus | undefined;
  readonly #eventHandlerRouter: EventHandlerRouter;
  readonly #logger: Logger | undefined;
  #queryBus: QueryBus | undefined;
  readonly #queryHandlerRouter: QueryHandlerRouter;
  // oxlint-disable-next-line typescript/no-explicit-any
  readonly #transportProviders: TransportProvider<any>[];
  #provided: boolean;

  constructor(
    // oxlint-disable-next-line typescript/no-explicit-any
    transportProviders: Iterable<TransportProvider<any>> = [],
    options: CqrsProviderOptions = {},
  ) {
    this.#commandBus = undefined;
    this.#commandIdentifierToCommandMap = new Map();
    this.#eventBus = undefined;
    this.#eventHandlerRouter = new EventHandlerRouter();
    this.#logger = this.#buildLogger(options);
    this.#queryBus = undefined;
    this.#queryHandlerRouter = new QueryHandlerRouter();
    this.#provided = false;

    // oxlint-disable-next-line typescript/no-explicit-any
    const externalTransportProviders: TransportProvider<any>[] = [];

    for (const transportProvider of transportProviders) {
      if (transportProvider.getIdentifier() === syncTransportIdentifier) {
        throw new Error('SyncTransportProvider is created by CqrsProvider');
      }

      externalTransportProviders.push(transportProvider);
    }

    this.#transportProviders = [
      new SyncTransportProvider(),
      ...externalTransportProviders,
    ];
  }

  public getCommandBus(): CommandBus {
    if (this.#commandBus === undefined) {
      throw new Error(
        'Command bus not initialized. Ensure .provide() has been called first.',
      );
    }

    return this.#commandBus;
  }

  public getEventBus(): EventBus {
    if (this.#eventBus === undefined) {
      throw new Error(
        'Event bus not initialized. Ensure .provide() has been called first.',
      );
    }

    return this.#eventBus;
  }

  public getQueryBus(): QueryBus {
    if (this.#queryBus === undefined) {
      throw new Error(
        'Query bus not initialized. Ensure .provide() has been called first.',
      );
    }

    return this.#queryBus;
  }

  public async provide(container: Container): Promise<void> {
    if (this.#provided) {
      throw new Error('Cannot provide CQRS more than once');
    }

    await this.#configureTransportProviders(
      container,
      this.#transportProviders,
    );

    const commandToTransportAndParamsMap: Map<
      // oxlint-disable-next-line typescript/no-unsafe-function-type
      Function,
      // oxlint-disable-next-line typescript/no-explicit-any
      [TransportProvider<any>, unknown][]
    > = this.#buildCommandToTransportAndParamsMap(this.#transportProviders);
    this.#registerQueryHandlers();
    this.#registerEventHandlers();
    this.#commandBus = this.#buildCommandBus(commandToTransportAndParamsMap);
    this.#eventBus = this.#buildEventBus(container);
    this.#queryBus = this.#buildQueryBus(container);

    this.#provided = true;
  }

  #buildCommandBus(
    commandToTransportAndParamsMap: Map<
      // oxlint-disable-next-line typescript/no-unsafe-function-type
      Function,
      // oxlint-disable-next-line typescript/no-explicit-any
      [TransportProvider<any>, unknown][]
    >,
  ): CommandBus {
    return {
      send: async (command) => {
        const transportAndParams: // oxlint-disable-next-line typescript/no-explicit-any
          [TransportProvider<any>, unknown][] | undefined =
          this.#getTransportAndParams(command, commandToTransportAndParamsMap);

        if (transportAndParams === undefined) {
          throw new Error(
            `No transport provider found for command ${command.constructor.name}`,
          );
        }

        await Promise.all(
          transportAndParams.map(async ([transportProvider, params]) => {
            await transportProvider.send(command, params);
          }),
        );
      },
    };
  }

  #buildCommandToTransportAndParamsMap(
    // oxlint-disable-next-line typescript/no-explicit-any
    transportProviders: Iterable<TransportProvider<any>>,
    // oxlint-disable-next-line typescript/no-explicit-any typescript/no-unsafe-function-type
  ): Map<Function, [TransportProvider<any>, unknown][]> {
    const commandToTransportAndParamsMap: Map<
      // oxlint-disable-next-line typescript/no-unsafe-function-type
      Function,
      // oxlint-disable-next-line typescript/no-explicit-any
      [TransportProvider<any>, unknown][]
    > = new Map();

    for (const transportProvider of transportProviders) {
      for (const config of transportProvider.getConfigList()) {
        let transportAndParams: // oxlint-disable-next-line typescript/no-explicit-any
          [TransportProvider<any>, unknown][] | undefined =
          commandToTransportAndParamsMap.get(config.type);

        if (transportAndParams === undefined) {
          transportAndParams = [];

          commandToTransportAndParamsMap.set(config.type, transportAndParams);
        }

        transportAndParams.push([transportProvider, config.params]);
      }
    }

    return commandToTransportAndParamsMap;
  }

  #buildEventBus(container: Container): EventBus {
    return {
      send: (event: object): void => {
        const serviceIdentifierList: ServiceIdentifier[] | undefined =
          this.#eventHandlerRouter.route(event);

        if (serviceIdentifierList === undefined) {
          throw new Error(
            `No handler found for event ${event.constructor.name}`,
          );
        }

        for (const serviceIdentifier of serviceIdentifierList) {
          // send() returns before handlers finish. A failure is logged so
          // it cannot escape send() or cancel the other handlers.
          this.#runEventHandler(container, serviceIdentifier, event).catch(
            (error: unknown) => {
              this.#reportEventHandlerFailure(event, error);
            },
          );
        }
      },
    };
  }

  #buildLogger(options: CqrsProviderOptions): Logger | undefined {
    const loggerOption: boolean | Logger = options.logger ?? true;

    if (typeof loggerOption === 'boolean') {
      return loggerOption ? new ConsoleLogger() : undefined;
    }

    return loggerOption;
  }

  #buildQueryBus(container: Container): QueryBus {
    return {
      send: async <TResult = unknown>(query: object): Promise<TResult> => {
        const serviceIdentifier: ServiceIdentifier | undefined =
          this.#queryHandlerRouter.route(query);

        if (serviceIdentifier === undefined) {
          throw new Error(
            `No handler found for query ${query.constructor.name}`,
          );
        }

        const resolved: unknown = await container.getAsync(serviceIdentifier);

        if (!isCqrsHandler(resolved)) {
          throw new Error(
            `Handler for query ${query.constructor.name} does not implement handle`,
          );
        }

        const execution: unknown = resolved.handle(query);
        const result: unknown = isPromise(execution)
          ? await execution
          : execution;

        // The handler is registered against the query type, not against the
        // result type the caller asks for.
        return result as TResult;
      },
    };
  }

  #buildTransportProviderToCommandHandlerConfigMap(): Map<
    string | symbol,
    CommandHandlerConfig[]
  > {
    const map = new Map<string | symbol, CommandHandlerConfig[]>();

    const commandHandlerMetadataList = getOwnReflectMetadata<
      CommandHandlerMetadata[]
    >(Reflect, commandHandlerMetadataReflectKey);

    if (commandHandlerMetadataList === undefined) {
      return map;
    }

    for (const commandHandlerMetadata of commandHandlerMetadataList) {
      for (const transport of commandHandlerMetadata.transports) {
        let commandHandlerConfigs: CommandHandlerConfig[] | undefined = map.get(
          transport.identifier,
        );

        if (commandHandlerConfigs === undefined) {
          commandHandlerConfigs = [];

          map.set(transport.identifier, commandHandlerConfigs);
        }

        const commandMetadata = getOwnReflectMetadata<CommandMetadata>(
          commandHandlerMetadata.command,
          commandMetadataReflectKey,
        );

        const commandIdentifier: string | symbol | undefined =
          commandMetadata?.identifier;

        if (
          commandIdentifier !== undefined &&
          !this.#commandIdentifierToCommandMap.has(commandIdentifier)
        ) {
          this.#commandIdentifierToCommandMap.set(
            commandIdentifier,
            commandHandlerMetadata.command,
          );
        }

        commandHandlerConfigs.push({
          command: {
            identifier: commandIdentifier,
            type: commandHandlerMetadata.command,
          },
          handler: commandHandlerMetadata.target,
          serviceIdentifier: commandHandlerMetadata.serviceIdentifier,
          transport,
        });
      }
    }

    return map;
  }

  #getTransportAndParams(
    command: object,
    commandToTransportAndParamsMap: Map<
      // oxlint-disable-next-line typescript/no-unsafe-function-type
      Function,
      // oxlint-disable-next-line typescript/no-explicit-any
      [TransportProvider<any>, unknown][]
    >,
    // oxlint-disable-next-line typescript/no-explicit-any
  ): [TransportProvider<any>, unknown][] | undefined {
    const transportAndParams: // oxlint-disable-next-line typescript/no-explicit-any
      [TransportProvider<any>, unknown][] | undefined =
      commandToTransportAndParamsMap.get(command.constructor);

    if (transportAndParams !== undefined) {
      return transportAndParams;
    }

    return this.#getTransportAndParamsByCommandIdentifier(
      command,
      commandToTransportAndParamsMap,
    );
  }

  #getTransportAndParamsByCommandIdentifier(
    command: object,
    commandToTransportAndParamsMap: Map<
      // oxlint-disable-next-line typescript/no-unsafe-function-type
      Function,
      // oxlint-disable-next-line typescript/no-explicit-any
      [TransportProvider<any>, unknown][]
    >,
    // oxlint-disable-next-line typescript/no-explicit-any
  ): [TransportProvider<any>, unknown][] | undefined {
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

    const transportAndParams: // oxlint-disable-next-line typescript/no-explicit-any
      [TransportProvider<any>, unknown][] | undefined =
      commandToTransportAndParamsMap.get(mappedCommand);

    if (transportAndParams === undefined) {
      return undefined;
    }

    commandToTransportAndParamsMap.set(command.constructor, transportAndParams);

    return transportAndParams;
  }

  async #configureTransportProviders(
    container: Container,
    // oxlint-disable-next-line typescript/no-explicit-any
    transportProviders: Iterable<TransportProvider<any>>,
  ): Promise<void> {
    const transportProviderToCommandHandlerConfigMap =
      this.#buildTransportProviderToCommandHandlerConfigMap();

    await Promise.all(
      Array.from(transportProviders).map(
        // oxlint-disable-next-line typescript/no-explicit-any
        async (transportProvider: TransportProvider<any>) => {
          const commandHandlerConfigs =
            transportProviderToCommandHandlerConfigMap.get(
              transportProvider.getIdentifier(),
            ) ?? [];

          await transportProvider.initialize(container, commandHandlerConfigs);
        },
      ),
    );
  }

  #registerEventHandlers(): void {
    const eventHandlerMetadataList: EventHandlerMetadata[] | undefined =
      getOwnReflectMetadata<EventHandlerMetadata[]>(
        Reflect,
        eventHandlerMetadataReflectKey,
      );

    if (eventHandlerMetadataList === undefined) {
      return;
    }

    for (const eventHandlerMetadata of eventHandlerMetadataList) {
      const eventMetadata: EventMetadata | undefined =
        getOwnReflectMetadata<EventMetadata>(
          eventHandlerMetadata.event,
          eventMetadataReflectKey,
        );

      const serviceIdentifier: ServiceIdentifier = readServiceIdentifier(
        eventHandlerMetadata.serviceIdentifier ?? eventHandlerMetadata.target,
      );

      this.#eventHandlerRouter.register({
        identifier: eventMetadata?.identifier,
        serviceIdentifier,
        type: eventHandlerMetadata.event,
      });
    }
  }

  #describeEventHandlerFailure(error: unknown): string {
    if (error instanceof Error) {
      return error.stack ?? error.message;
    }

    if (typeof error === 'string') {
      return error;
    }

    if (
      typeof error === 'number' ||
      typeof error === 'boolean' ||
      typeof error === 'bigint' ||
      typeof error === 'symbol' ||
      typeof error === 'function'
    ) {
      return error.toString();
    }

    if (error === undefined) {
      return 'undefined';
    }

    if (error === null) {
      return 'null';
    }

    try {
      return JSON.stringify(error);
    } catch (_serializationError: unknown) {
      return Object.prototype.toString.call(error);
    }
  }

  #reportEventHandlerFailure(event: object, error: unknown): void {
    if (this.#logger === undefined) {
      return;
    }

    this.#logger.error(
      `Event handler failed for ${event.constructor.name}: ${this.#describeEventHandlerFailure(error)}`,
    );
  }

  async #runEventHandler(
    container: Container,
    serviceIdentifier: ServiceIdentifier,
    event: object,
  ): Promise<void> {
    const resolved: unknown = await container.getAsync(serviceIdentifier);

    if (!isCqrsHandler(resolved)) {
      throw new Error(
        `Handler for event ${event.constructor.name} does not implement handle`,
      );
    }

    const execution: unknown = resolved.handle(event);

    if (isPromise(execution)) {
      await execution;
    }
  }

  #registerQueryHandlers(): void {
    const queryHandlerMetadataList: QueryHandlerMetadata[] | undefined =
      getOwnReflectMetadata<QueryHandlerMetadata[]>(
        Reflect,
        queryHandlerMetadataReflectKey,
      );

    if (queryHandlerMetadataList === undefined) {
      return;
    }

    for (const queryHandlerMetadata of queryHandlerMetadataList) {
      const queryMetadata: QueryMetadata | undefined =
        getOwnReflectMetadata<QueryMetadata>(
          queryHandlerMetadata.query,
          queryMetadataReflectKey,
        );

      const serviceIdentifier: ServiceIdentifier = readServiceIdentifier(
        queryHandlerMetadata.serviceIdentifier ?? queryHandlerMetadata.target,
      );

      this.#queryHandlerRouter.register({
        identifier: queryMetadata?.identifier,
        serviceIdentifier,
        type: queryHandlerMetadata.query,
      });
    }
  }
}
