import { beforeAll, describe, expect, it } from 'vitest';

import 'reflect-metadata/lite';

import { Container, type ServiceIdentifier } from 'inversify';

import { Command } from '../decorators/Command.js';
import { type CommandHandlerConfig } from '../models/CommandHandlerConfig.js';
import { type CqrsCommandHandler } from '../models/CqrsCommandHandler.js';
import {
  SyncTransportProvider,
  syncTransportIdentifier,
} from './SyncTransportProvider.js';

class ReserveStock {
  public readonly sku: string;

  constructor(sku: string) {
    this.sku = sku;
  }
}

class ReleaseStock {}

class ReserveStockHandler implements CqrsCommandHandler<ReserveStock> {
  public executedCommand: ReserveStock | undefined = undefined;

  public handle(command: ReserveStock): void {
    this.executedCommand = command;
  }
}

class UnusedHandler implements CqrsCommandHandler<ReserveStock> {
  public handle(): void {
    throw new Error('Resolved the handler class');
  }
}

function buildCommandHandlerConfig(input: {
  commandIdentifier: string | symbol | undefined;
  // oxlint-disable-next-line typescript/no-unsafe-function-type
  commandType: Function;
  // oxlint-disable-next-line typescript/no-unsafe-function-type
  handler: Function;
  serviceIdentifier: ServiceIdentifier | undefined;
}): CommandHandlerConfig {
  return {
    command: {
      identifier: input.commandIdentifier,
      type: input.commandType,
    },
    handler: input.handler,
    serviceIdentifier: input.serviceIdentifier,
    transport: {
      identifier: syncTransportIdentifier,
    },
  };
}

describe(SyncTransportProvider, () => {
  describe('.getIdentifier', () => {
    describe('when called', () => {
      let result: string | symbol;

      beforeAll(() => {
        result = new SyncTransportProvider().getIdentifier();
      });

      it('should return the sync transport identifier', () => {
        expect(result).toBe(syncTransportIdentifier);
      });
    });
  });

  describe('.getConfigList', () => {
    describe('having no initialized handlers', () => {
      describe('when called', () => {
        let result: Iterable<CommandHandlerConfig['command']['type']>;

        beforeAll(() => {
          result = Array.from(new SyncTransportProvider().getConfigList()).map(
            (config: { type: CommandHandlerConfig['command']['type'] }) =>
              config.type,
          );
        });

        it('should return an empty list', () => {
          expect(result).toStrictEqual([]);
        });
      });
    });

    describe('having initialized handlers for two commands', () => {
      describe('when called', () => {
        let transportProvider: SyncTransportProvider;

        beforeAll(async () => {
          transportProvider = new SyncTransportProvider();

          await transportProvider.initialize(new Container(), [
            buildCommandHandlerConfig({
              commandIdentifier: 'stock.reserve',
              commandType: ReserveStock,
              handler: ReserveStockHandler,
              serviceIdentifier: undefined,
            }),
            buildCommandHandlerConfig({
              commandIdentifier: 'stock.release',
              commandType: ReleaseStock,
              handler: ReserveStockHandler,
              serviceIdentifier: undefined,
            }),
          ]);
        });

        it('should return one config for each command', () => {
          expect(Array.from(transportProvider.getConfigList())).toStrictEqual([
            {
              params: undefined,
              type: ReserveStock,
            },
            {
              params: undefined,
              type: ReleaseStock,
            },
          ]);
        });
      });
    });

    describe('having two handlers for the same command', () => {
      describe('when called', () => {
        let transportProvider: SyncTransportProvider;

        beforeAll(async () => {
          transportProvider = new SyncTransportProvider();

          await transportProvider.initialize(new Container(), [
            buildCommandHandlerConfig({
              commandIdentifier: 'stock.reserve',
              commandType: ReserveStock,
              handler: ReserveStockHandler,
              serviceIdentifier: undefined,
            }),
            buildCommandHandlerConfig({
              commandIdentifier: 'stock.reserve',
              commandType: ReserveStock,
              handler: UnusedHandler,
              serviceIdentifier: Symbol('reserve-stock-audit'),
            }),
          ]);
        });

        it('should return one config for the command', () => {
          expect(Array.from(transportProvider.getConfigList())).toStrictEqual([
            {
              params: undefined,
              type: ReserveStock,
            },
          ]);
        });
      });
    });
  });

  describe('.initialize', () => {
    describe('when called, and initialize() was already called', () => {
      let errorFixture: unknown;
      let transportProvider: SyncTransportProvider;

      beforeAll(async () => {
        transportProvider = new SyncTransportProvider();

        await transportProvider.initialize(new Container(), [
          buildCommandHandlerConfig({
            commandIdentifier: 'stock.reserve',
            commandType: ReserveStock,
            handler: ReserveStockHandler,
            serviceIdentifier: undefined,
          }),
        ]);

        try {
          await transportProvider.initialize(new Container(), [
            buildCommandHandlerConfig({
              commandIdentifier: 'stock.release',
              commandType: ReleaseStock,
              handler: ReserveStockHandler,
              serviceIdentifier: undefined,
            }),
          ]);
        } catch (error: unknown) {
          errorFixture = error;
        }
      });

      it('should throw an Error', () => {
        expect(errorFixture).toBeInstanceOf(Error);
        expect((errorFixture as Error).message).toBe(
          'Sync transport is already initialized',
        );
      });

      it('should keep the handlers from the first initialize()', () => {
        expect(Array.from(transportProvider.getConfigList())).toStrictEqual([
          {
            params: undefined,
            type: ReserveStock,
          },
        ]);
      });
    });

    describe('having handler configs', () => {
      describe('when called', () => {
        let executed: boolean;

        beforeAll(async () => {
          executed = false;

          class RecordingHandler implements CqrsCommandHandler<ReserveStock> {
            public handle(): void {
              executed = true;
            }
          }

          const container: Container = new Container();

          container
            .bind(RecordingHandler)
            .toConstantValue(new RecordingHandler());

          await new SyncTransportProvider().initialize(container, [
            buildCommandHandlerConfig({
              commandIdentifier: undefined,
              commandType: ReserveStock,
              handler: RecordingHandler,
              serviceIdentifier: undefined,
            }),
          ]);
        });

        it('should not execute the handler', () => {
          expect(executed).toBe(false);
        });
      });
    });
  });

  describe('.send', () => {
    describe('having a handler bound to its class', () => {
      let commandFixture: ReserveStock;
      let handlerFixture: ReserveStockHandler;

      beforeAll(async () => {
        commandFixture = new ReserveStock('sku-1');
        handlerFixture = new ReserveStockHandler();

        const container: Container = new Container();

        container.bind(ReserveStockHandler).toConstantValue(handlerFixture);

        const transportProvider: SyncTransportProvider =
          new SyncTransportProvider();

        await transportProvider.initialize(container, [
          buildCommandHandlerConfig({
            commandIdentifier: 'stock.reserve',
            commandType: ReserveStock,
            handler: ReserveStockHandler,
            serviceIdentifier: undefined,
          }),
        ]);
        await transportProvider.send(commandFixture, undefined);
      });

      it('should await the handler with the command', () => {
        expect(handlerFixture.executedCommand).toBe(commandFixture);
      });
    });

    describe('having a handler bound to a service identifier', () => {
      let commandFixture: ReserveStock;
      let handlerFixture: ReserveStockHandler;

      beforeAll(async () => {
        const serviceIdentifierFixture: ServiceIdentifier = Symbol(
          'reserve-stock-handler',
        );

        commandFixture = new ReserveStock('sku-1');
        handlerFixture = new ReserveStockHandler();

        const container: Container = new Container();

        container
          .bind(serviceIdentifierFixture)
          .toConstantValue(handlerFixture);

        const transportProvider: SyncTransportProvider =
          new SyncTransportProvider();

        await transportProvider.initialize(container, [
          buildCommandHandlerConfig({
            commandIdentifier: 'stock.reserve',
            commandType: ReserveStock,
            handler: UnusedHandler,
            serviceIdentifier: serviceIdentifierFixture,
          }),
        ]);
        await transportProvider.send(commandFixture, undefined);
      });

      it('should await the handler bound to the service identifier', () => {
        expect(handlerFixture.executedCommand).toBe(commandFixture);
      });
    });

    describe('having handlers registered for a command identifier', () => {
      describe('when called, and the command type is not registered and has that identifier', () => {
        let commandFixture: object;
        let eventsFixture: string[];
        let executedCommandFixture: object | undefined;
        let transportProvider: SyncTransportProvider;

        beforeAll(async () => {
          eventsFixture = [];
          executedCommandFixture = undefined;

          @Command({
            identifier: 'stock.reserve',
          })
          class PhantomReserveStock {
            public readonly sku: string;

            constructor(sku: string) {
              this.sku = sku;
            }
          }

          class FirstHandler implements CqrsCommandHandler {
            public handle(command: object): void {
              executedCommandFixture = command;
              eventsFixture.push('first');
            }
          }

          class SecondHandler implements CqrsCommandHandler {
            public handle(): void {
              eventsFixture.push('second');
            }
          }

          commandFixture = new PhantomReserveStock('sku-phantom');

          const container: Container = new Container();

          container.bind(FirstHandler).toConstantValue(new FirstHandler());
          container.bind(SecondHandler).toConstantValue(new SecondHandler());

          transportProvider = new SyncTransportProvider();

          await transportProvider.initialize(container, [
            buildCommandHandlerConfig({
              commandIdentifier: 'stock.reserve',
              commandType: ReserveStock,
              handler: FirstHandler,
              serviceIdentifier: undefined,
            }),
            buildCommandHandlerConfig({
              commandIdentifier: 'stock.reserve',
              commandType: ReserveStock,
              handler: SecondHandler,
              serviceIdentifier: undefined,
            }),
          ]);
          await transportProvider.send(commandFixture, undefined);
          await transportProvider.send(commandFixture, undefined);
        });

        it('should await each registered handler with the command', () => {
          expect(eventsFixture).toStrictEqual([
            'first',
            'second',
            'first',
            'second',
          ]);
          expect(executedCommandFixture).toBe(commandFixture);
        });

        it('should map the command type to the registered handler list', () => {
          expect(Array.from(transportProvider.getConfigList())).toStrictEqual([
            {
              params: undefined,
              type: ReserveStock,
            },
            {
              params: undefined,
              type: commandFixture.constructor,
            },
          ]);
        });
      });
    });

    describe('having a handler that returns a promise', () => {
      let eventsFixture: string[];

      beforeAll(async () => {
        eventsFixture = [];

        let markHandlerWaiting: () => void = (): void => undefined;
        let releaseHandler: () => void = (): void => undefined;
        const handlerWaiting: Promise<void> = new Promise<void>(
          (resolve: () => void): void => {
            markHandlerWaiting = resolve;
          },
        );

        class AsyncReserveStockHandler implements CqrsCommandHandler<ReserveStock> {
          public async handle(): Promise<void> {
            eventsFixture.push('handler-start');
            markHandlerWaiting();

            await new Promise<void>((resolve: () => void): void => {
              releaseHandler = (): void => {
                eventsFixture.push('handler-end');
                resolve();
              };
            });
          }
        }

        const container: Container = new Container();

        container
          .bind(AsyncReserveStockHandler)
          .toConstantValue(new AsyncReserveStockHandler());

        const transportProvider: SyncTransportProvider =
          new SyncTransportProvider();

        await transportProvider.initialize(container, [
          buildCommandHandlerConfig({
            commandIdentifier: 'stock.reserve',
            commandType: ReserveStock,
            handler: AsyncReserveStockHandler,
            serviceIdentifier: undefined,
          }),
        ]);

        const sent: Promise<void> = transportProvider.send(
          new ReserveStock('sku-1'),
          undefined,
        );

        await handlerWaiting;
        eventsFixture.push('before-release');
        releaseHandler();
        await sent;
        eventsFixture.push('after-send');
      });

      it('should resolve after the handler', () => {
        expect(eventsFixture).toStrictEqual([
          'handler-start',
          'before-release',
          'handler-end',
          'after-send',
        ]);
      });
    });

    describe('having two handlers for the command', () => {
      let eventsFixture: string[];

      beforeAll(async () => {
        eventsFixture = [];

        let markFirstWaiting: () => void = (): void => undefined;
        let releaseFirst: () => void = (): void => undefined;
        const firstWaiting: Promise<void> = new Promise<void>(
          (resolve: () => void): void => {
            markFirstWaiting = resolve;
          },
        );

        class FirstHandler implements CqrsCommandHandler<ReserveStock> {
          public async handle(): Promise<void> {
            eventsFixture.push('first-start');
            markFirstWaiting();

            await new Promise<void>((resolve: () => void): void => {
              releaseFirst = (): void => {
                eventsFixture.push('first-end');
                resolve();
              };
            });
          }
        }

        class SecondHandler implements CqrsCommandHandler<ReserveStock> {
          public handle(): void {
            eventsFixture.push('second');
          }
        }

        const container: Container = new Container();

        container.bind(FirstHandler).toConstantValue(new FirstHandler());
        container.bind(SecondHandler).toConstantValue(new SecondHandler());

        const transportProvider: SyncTransportProvider =
          new SyncTransportProvider();

        await transportProvider.initialize(container, [
          buildCommandHandlerConfig({
            commandIdentifier: 'stock.reserve',
            commandType: ReserveStock,
            handler: FirstHandler,
            serviceIdentifier: undefined,
          }),
          buildCommandHandlerConfig({
            commandIdentifier: 'stock.reserve',
            commandType: ReserveStock,
            handler: SecondHandler,
            serviceIdentifier: undefined,
          }),
        ]);

        const sent: Promise<void> = transportProvider.send(
          new ReserveStock('sku-1'),
          undefined,
        );

        await firstWaiting;
        eventsFixture.push('before-release');
        releaseFirst();
        await sent;
        eventsFixture.push('after-send');
      });

      it('should await each handler before the next one', () => {
        expect(eventsFixture).toStrictEqual([
          'first-start',
          'before-release',
          'first-end',
          'second',
          'after-send',
        ]);
      });
    });

    describe('when called, and the transport is not initialized', () => {
      let errorFixture: unknown;

      beforeAll(async () => {
        try {
          await new SyncTransportProvider().send(
            new ReserveStock('sku-1'),
            undefined,
          );
        } catch (error: unknown) {
          errorFixture = error;
        }
      });

      it('should throw an Error', () => {
        expect(errorFixture).toBeInstanceOf(Error);
        expect((errorFixture as Error).message).toBe(
          'Sync transport is not initialized',
        );
      });
    });

    describe('when called, and no handler is registered for the command', () => {
      let errorFixture: unknown;

      beforeAll(async () => {
        const transportProvider: SyncTransportProvider =
          new SyncTransportProvider();

        await transportProvider.initialize(new Container(), [
          buildCommandHandlerConfig({
            commandIdentifier: 'stock.release',
            commandType: ReleaseStock,
            handler: ReserveStockHandler,
            serviceIdentifier: undefined,
          }),
        ]);

        try {
          await transportProvider.send(new ReserveStock('sku-1'), undefined);
        } catch (error: unknown) {
          errorFixture = error;
        }
      });

      it('should throw an Error', () => {
        expect(errorFixture).toBeInstanceOf(Error);
        expect((errorFixture as Error).message).toBe(
          'No handler found for command ReserveStock',
        );
      });
    });

    describe('when called, and the command identifier is not mapped', () => {
      let errorFixture: unknown;
      let transportProvider: SyncTransportProvider;

      beforeAll(async () => {
        @Command({
          identifier: 'stock.reserve',
        })
        class UnmappedReserveStock {}

        transportProvider = new SyncTransportProvider();

        await transportProvider.initialize(new Container(), [
          buildCommandHandlerConfig({
            commandIdentifier: 'stock.release',
            commandType: ReleaseStock,
            handler: ReserveStockHandler,
            serviceIdentifier: undefined,
          }),
        ]);

        try {
          await transportProvider.send(new UnmappedReserveStock(), undefined);
        } catch (error: unknown) {
          errorFixture = error;
        }
      });

      it('should throw an Error', () => {
        expect(errorFixture).toBeInstanceOf(Error);
        expect((errorFixture as Error).message).toBe(
          'No handler found for command UnmappedReserveStock',
        );
      });

      it('should keep the registered command list', () => {
        expect(Array.from(transportProvider.getConfigList())).toStrictEqual([
          {
            params: undefined,
            type: ReleaseStock,
          },
        ]);
      });
    });

    describe('when called, and handler.handle() throws', () => {
      let errorFixture: unknown;
      let secondExecuted: boolean;

      beforeAll(async () => {
        secondExecuted = false;

        class ThrowingHandler implements CqrsCommandHandler<ReserveStock> {
          public handle(): void {
            throw new Error('handler failed');
          }
        }

        class SecondHandler implements CqrsCommandHandler<ReserveStock> {
          public handle(): void {
            secondExecuted = true;
          }
        }

        const container: Container = new Container();

        container.bind(ThrowingHandler).toConstantValue(new ThrowingHandler());
        container.bind(SecondHandler).toConstantValue(new SecondHandler());

        const transportProvider: SyncTransportProvider =
          new SyncTransportProvider();

        await transportProvider.initialize(container, [
          buildCommandHandlerConfig({
            commandIdentifier: 'stock.reserve',
            commandType: ReserveStock,
            handler: ThrowingHandler,
            serviceIdentifier: undefined,
          }),
          buildCommandHandlerConfig({
            commandIdentifier: 'stock.reserve',
            commandType: ReserveStock,
            handler: SecondHandler,
            serviceIdentifier: undefined,
          }),
        ]);

        try {
          await transportProvider.send(new ReserveStock('sku-1'), undefined);
        } catch (error: unknown) {
          errorFixture = error;
        }
      });

      it('should throw the handler error', () => {
        expect(errorFixture).toBeInstanceOf(Error);
        expect((errorFixture as Error).message).toBe('handler failed');
      });

      it('should not execute the next handler', () => {
        expect(secondExecuted).toBe(false);
      });
    });

    describe('when called, and handler.handle() rejects', () => {
      let errorFixture: unknown;
      let secondExecuted: boolean;

      beforeAll(async () => {
        secondExecuted = false;

        class RejectingHandler implements CqrsCommandHandler<ReserveStock> {
          public async handle(): Promise<void> {
            await Promise.reject(new Error('handler failed'));
          }
        }

        class SecondHandler implements CqrsCommandHandler<ReserveStock> {
          public handle(): void {
            secondExecuted = true;
          }
        }

        const container: Container = new Container();

        container
          .bind(RejectingHandler)
          .toConstantValue(new RejectingHandler());
        container.bind(SecondHandler).toConstantValue(new SecondHandler());

        const transportProvider: SyncTransportProvider =
          new SyncTransportProvider();

        await transportProvider.initialize(container, [
          buildCommandHandlerConfig({
            commandIdentifier: 'stock.reserve',
            commandType: ReserveStock,
            handler: RejectingHandler,
            serviceIdentifier: undefined,
          }),
          buildCommandHandlerConfig({
            commandIdentifier: 'stock.reserve',
            commandType: ReserveStock,
            handler: SecondHandler,
            serviceIdentifier: undefined,
          }),
        ]);

        try {
          await transportProvider.send(new ReserveStock('sku-1'), undefined);
        } catch (error: unknown) {
          errorFixture = error;
        }
      });

      it('should throw the handler error', () => {
        expect(errorFixture).toBeInstanceOf(Error);
        expect((errorFixture as Error).message).toBe('handler failed');
      });

      it('should not execute the next handler', () => {
        expect(secondExecuted).toBe(false);
      });
    });
  });
});
