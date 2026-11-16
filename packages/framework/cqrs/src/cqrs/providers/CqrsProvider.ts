import { getOwnReflectMetadata } from '@inversifyjs/reflect-metadata-utils';
import { type Container } from 'inversify';

import { commandHandlerMetadataReflectKey } from '../../reflectMetadata/data/commandHandlerMetadataReflectKey.js';
import { commandMetadataReflectKey } from '../../reflectMetadata/data/commandMetadataReflectKey.js';
import { type CommandBus } from '../models/CommandBus.js';
import { type CommandHandlerConfig } from '../models/CommandHandlerConfig.js';
import { type CommandHandlerMetadata } from '../models/CommandHandlerMetadata.js';
import { type CommandMetadata } from '../models/CommandMetadata.js';
import { type TransportProvider } from '../models/TransportProvider.js';
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
  > = new Map();
  // oxlint-disable-next-line typescript/no-explicit-any
  readonly #transportProviders: TransportProvider<any>[];
  #provided: boolean;

  // oxlint-disable-next-line typescript/no-explicit-any
  constructor(transportProviders: Iterable<TransportProvider<any>> = []) {
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
    this.#commandBus = this.#buildCommandBus(commandToTransportAndParamsMap);

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
}
