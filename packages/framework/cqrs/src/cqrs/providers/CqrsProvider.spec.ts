import {
  afterAll,
  beforeAll,
  describe,
  expect,
  it,
  type Mocked,
  type MockInstance,
  vitest,
} from 'vitest';

vitest.mock(import('@inversifyjs/reflect-metadata-utils'));

import { ConsoleLogger, type Logger } from '@inversifyjs/logger';
import { getOwnReflectMetadata } from '@inversifyjs/reflect-metadata-utils';
import { Container, type ServiceIdentifier } from 'inversify';

import { commandHandlerMetadataReflectKey } from '../../reflectMetadata/data/commandHandlerMetadataReflectKey.js';
import { commandMetadataReflectKey } from '../../reflectMetadata/data/commandMetadataReflectKey.js';
import { eventHandlerMetadataReflectKey } from '../../reflectMetadata/data/eventHandlerMetadataReflectKey.js';
import { eventMetadataReflectKey } from '../../reflectMetadata/data/eventMetadataReflectKey.js';
import { queryHandlerMetadataReflectKey } from '../../reflectMetadata/data/queryHandlerMetadataReflectKey.js';
import { queryMetadataReflectKey } from '../../reflectMetadata/data/queryMetadataReflectKey.js';
import { type CommandHandlerMetadata } from '../models/CommandHandlerMetadata.js';
import { type CommandMetadata } from '../models/CommandMetadata.js';
import { type EventHandlerMetadata } from '../models/EventHandlerMetadata.js';
import { type QueryHandlerMetadata } from '../models/QueryHandlerMetadata.js';
import { type TransportProvider } from '../models/TransportProvider.js';
import { SyncTransportProvider } from '../transports/SyncTransportProvider.js';
import { CqrsProvider } from './CqrsProvider.js';

class ReserveStock {}

class ReleaseStock {}

class ReserveStockHandler {}

class ReleaseStockHandler {}

class GetStock {
  public readonly sku: string;

  constructor(sku: string) {
    this.sku = sku;
  }
}

class GetRelease {}

class GetStockHandler {
  public handle(query: GetStock): string {
    return `stock:${query.sku}`;
  }
}

class AsyncGetStockHandler {
  public async handle(query: GetStock): Promise<string> {
    await Promise.resolve();

    return `async:${query.sku}`;
  }
}

class GetStockAuditHandler {}

class StockReserved {
  public readonly sku: string;

  constructor(sku: string) {
    this.sku = sku;
  }
}

class StockReservedHandler {
  public handle(event: StockReserved): void {
    handledSkus.push(`reserved:${event.sku}`);
  }
}

class StockReservedAuditHandler {
  public handle(event: StockReserved): void {
    handledSkus.push(`audit:${event.sku}`);
  }
}

class RejectingStockReservedHandler {
  public async handle(): Promise<void> {
    throw eventHandlerFailure.error;
  }
}

class ThrowingStockReservedHandler {
  public handle(): void {
    throw eventHandlerFailure.error;
  }
}

class ThrowingUnknownStockReservedHandler {
  public handle(): void {
    // oxlint-disable-next-line typescript/only-throw-error -- the failure value is intentionally not an Error
    throw unknownEventHandlerFailure.cause;
  }
}

class AsyncStockReservedHandler {
  public async handle(event: StockReserved): Promise<void> {
    handledSkus.push(`start:${event.sku}`);

    await asyncStockReserved.gate;

    handledSkus.push(`end:${event.sku}`);
  }
}

const handledSkus: string[] = [];

const eventHandlerFailure: { error: Error } = {
  error: new Error('projection failed'),
};

const unknownEventHandlerFailure: { cause: unknown } = {
  cause: 'audit log failed',
};

const asyncStockReserved: {
  gate: Promise<void>;
  release: () => void;
} = {
  gate: Promise.resolve(),
  release: () => {},
};

async function waitForEventHandlers(): Promise<void> {
  await Promise.resolve();
  await Promise.resolve();
}

function buildTransportProviderMock(
  identifier: string | symbol,
): Mocked<TransportProvider<string>> {
  const transportProviderMock: Mocked<TransportProvider<string>> = {
    getConfigList: vitest.fn(),
    getIdentifier: vitest.fn(() => identifier),
    initialize: vitest.fn(),
    send: vitest.fn(),
  };

  transportProviderMock.getConfigList.mockReturnValue([]);

  return transportProviderMock;
}

function buildLoggerMock(): Mocked<Logger> {
  return {
    debug: vitest.fn(),
    error: vitest.fn(),
    http: vitest.fn(),
    info: vitest.fn(),
    log: vitest.fn(),
    silly: vitest.fn(),
    verbose: vitest.fn(),
    warn: vitest.fn(),
  };
}

function buildEventHandlerFailureMessage(
  eventName: string,
  error: Error,
): string {
  return `Event handler failed for ${eventName}: ${error.stack ?? error.message}`;
}

describe(CqrsProvider, () => {
  describe('constructor', () => {
    describe('having a sync transport provider', () => {
      describe('when called', () => {
        let errorFixture: unknown;

        beforeAll(() => {
          try {
            new CqrsProvider([new SyncTransportProvider()]);
          } catch (error: unknown) {
            errorFixture = error;
          }
        });

        it('should throw an Error', () => {
          expect(errorFixture).toBeInstanceOf(Error);
          expect((errorFixture as Error).message).toBe(
            'SyncTransportProvider is created by CqrsProvider',
          );
        });
      });
    });
  });

  describe('.provide', () => {
    describe('having transport providers and no command handler metadata', () => {
      let containerFixture: Container;
      let transportProviderMock: Mocked<TransportProvider<string>>;

      beforeAll(() => {
        containerFixture = new Container();
        transportProviderMock = buildTransportProviderMock('amqp');
      });

      describe('when called', () => {
        beforeAll(async () => {
          vitest
            .mocked(getOwnReflectMetadata)
            .mockReturnValueOnce(undefined)
            .mockReturnValueOnce(undefined);

          await new CqrsProvider([transportProviderMock]).provide(
            containerFixture,
          );
        });

        afterAll(() => {
          vitest.clearAllMocks();
        });

        it('should read command handler metadata', () => {
          expect(getOwnReflectMetadata).toHaveBeenNthCalledWith(
            1,
            Reflect,
            commandHandlerMetadataReflectKey,
          );
        });

        it('should read query handler metadata', () => {
          expect(getOwnReflectMetadata).toHaveBeenNthCalledWith(
            2,
            Reflect,
            queryHandlerMetadataReflectKey,
          );
        });

        it('should read event handler metadata', () => {
          expect(getOwnReflectMetadata).toHaveBeenNthCalledWith(
            3,
            Reflect,
            eventHandlerMetadataReflectKey,
          );
        });

        it('should call transportProvider.initialize() with an empty config list', () => {
          expect(
            transportProviderMock.initialize,
          ).toHaveBeenCalledExactlyOnceWith(containerFixture, []);
        });

        it('should call transportProvider.getConfigList()', () => {
          expect(
            transportProviderMock.getConfigList,
          ).toHaveBeenCalledExactlyOnceWith();
        });
      });
    });

    describe('having command handler metadata for the transport', () => {
      let commandMetadataFixture: CommandMetadata;
      let containerFixture: Container;
      let handlerMetadataFixture: CommandHandlerMetadata;
      let serviceIdentifierFixture: ServiceIdentifier;
      let transportIdentifierFixture: symbol;
      let transportProviderMock: Mocked<TransportProvider<string>>;

      beforeAll(() => {
        commandMetadataFixture = {
          identifier: 'stock.reserve',
        };
        containerFixture = new Container();
        serviceIdentifierFixture = Symbol('reserve-stock-handler');
        transportIdentifierFixture = Symbol('amqp');
        transportProviderMock = buildTransportProviderMock(
          transportIdentifierFixture,
        );
        handlerMetadataFixture = {
          command: ReserveStock,
          serviceIdentifier: serviceIdentifierFixture,
          target: ReserveStockHandler,
          transports: [
            {
              identifier: transportIdentifierFixture,
            },
          ],
        };
      });

      describe('when called', () => {
        beforeAll(async () => {
          vitest
            .mocked(getOwnReflectMetadata)
            .mockReturnValueOnce([handlerMetadataFixture])
            .mockReturnValueOnce(commandMetadataFixture);

          await new CqrsProvider([transportProviderMock]).provide(
            containerFixture,
          );
        });

        afterAll(() => {
          vitest.clearAllMocks();
        });

        it('should read command metadata from the command class', () => {
          expect(getOwnReflectMetadata).toHaveBeenNthCalledWith(
            1,
            Reflect,
            commandHandlerMetadataReflectKey,
          );
          expect(getOwnReflectMetadata).toHaveBeenNthCalledWith(
            2,
            ReserveStock,
            commandMetadataReflectKey,
          );
        });

        it('should call transportProvider.initialize()', () => {
          expect(
            transportProviderMock.initialize,
          ).toHaveBeenCalledExactlyOnceWith(containerFixture, [
            {
              command: {
                identifier: commandMetadataFixture.identifier,
                type: ReserveStock,
              },
              handler: ReserveStockHandler,
              serviceIdentifier: serviceIdentifierFixture,
              transport: handlerMetadataFixture.transports[0],
            },
          ]);
        });
      });
    });

    describe('having command handler metadata without command metadata', () => {
      let containerFixture: Container;
      let handlerMetadataFixture: CommandHandlerMetadata;
      let transportProviderMock: Mocked<TransportProvider<string>>;

      beforeAll(() => {
        containerFixture = new Container();
        transportProviderMock = buildTransportProviderMock('in-process');
        handlerMetadataFixture = {
          command: ReserveStock,
          serviceIdentifier: undefined,
          target: ReserveStockHandler,
          transports: [
            {
              identifier: 'in-process',
            },
          ],
        };
      });

      describe('when called', () => {
        beforeAll(async () => {
          vitest
            .mocked(getOwnReflectMetadata)
            .mockReturnValueOnce([handlerMetadataFixture])
            .mockReturnValueOnce(undefined);

          await new CqrsProvider([transportProviderMock]).provide(
            containerFixture,
          );
        });

        afterAll(() => {
          vitest.clearAllMocks();
        });

        it('should call transportProvider.initialize() with an undefined identifier', () => {
          expect(
            transportProviderMock.initialize,
          ).toHaveBeenCalledExactlyOnceWith(containerFixture, [
            {
              command: {
                identifier: undefined,
                type: ReserveStock,
              },
              handler: ReserveStockHandler,
              serviceIdentifier: undefined,
              transport: handlerMetadataFixture.transports[0],
            },
          ]);
        });
      });
    });

    describe('having two command handlers for the same transport', () => {
      let containerFixture: Container;
      let firstHandlerMetadataFixture: CommandHandlerMetadata;
      let secondHandlerMetadataFixture: CommandHandlerMetadata;
      let transportProviderMock: Mocked<TransportProvider<string>>;

      beforeAll(() => {
        containerFixture = new Container();
        transportProviderMock = buildTransportProviderMock('amqp');
        firstHandlerMetadataFixture = {
          command: ReserveStock,
          serviceIdentifier: Symbol('reserve-stock-handler'),
          target: ReserveStockHandler,
          transports: [
            {
              identifier: 'amqp',
            },
          ],
        };
        secondHandlerMetadataFixture = {
          command: ReleaseStock,
          serviceIdentifier: Symbol('release-stock-handler'),
          target: ReleaseStockHandler,
          transports: [
            {
              identifier: 'amqp',
            },
          ],
        };
      });

      describe('when called', () => {
        beforeAll(async () => {
          vitest
            .mocked(getOwnReflectMetadata)
            .mockReturnValueOnce([
              firstHandlerMetadataFixture,
              secondHandlerMetadataFixture,
            ])
            .mockReturnValueOnce({
              identifier: 'stock.reserve',
            })
            .mockReturnValueOnce({
              identifier: 'stock.release',
            });

          await new CqrsProvider([transportProviderMock]).provide(
            containerFixture,
          );
        });

        afterAll(() => {
          vitest.clearAllMocks();
        });

        it('should call transportProvider.initialize() with both handlers', () => {
          expect(
            transportProviderMock.initialize,
          ).toHaveBeenCalledExactlyOnceWith(containerFixture, [
            {
              command: {
                identifier: 'stock.reserve',
                type: ReserveStock,
              },
              handler: ReserveStockHandler,
              serviceIdentifier: firstHandlerMetadataFixture.serviceIdentifier,
              transport: firstHandlerMetadataFixture.transports[0],
            },
            {
              command: {
                identifier: 'stock.release',
                type: ReleaseStock,
              },
              handler: ReleaseStockHandler,
              serviceIdentifier: secondHandlerMetadataFixture.serviceIdentifier,
              transport: secondHandlerMetadataFixture.transports[0],
            },
          ]);
        });
      });
    });

    describe('having command handlers for different transports', () => {
      let amqpTransportProviderMock: Mocked<TransportProvider<string>>;
      let containerFixture: Container;
      let inProcessTransportProviderMock: Mocked<TransportProvider<string>>;

      beforeAll(() => {
        containerFixture = new Container();
        amqpTransportProviderMock = buildTransportProviderMock('amqp');
        inProcessTransportProviderMock =
          buildTransportProviderMock('in-process');
      });

      describe('when called', () => {
        let amqpHandlerMetadataFixture: CommandHandlerMetadata;
        let inProcessHandlerMetadataFixture: CommandHandlerMetadata;

        beforeAll(async () => {
          amqpHandlerMetadataFixture = {
            command: ReserveStock,
            serviceIdentifier: undefined,
            target: ReserveStockHandler,
            transports: [
              {
                identifier: 'amqp',
              },
            ],
          };
          inProcessHandlerMetadataFixture = {
            command: ReleaseStock,
            serviceIdentifier: undefined,
            target: ReleaseStockHandler,
            transports: [
              {
                identifier: 'in-process',
              },
            ],
          };

          vitest
            .mocked(getOwnReflectMetadata)
            .mockReturnValueOnce([
              amqpHandlerMetadataFixture,
              inProcessHandlerMetadataFixture,
            ])
            .mockReturnValueOnce({
              identifier: 'stock.reserve',
            })
            .mockReturnValueOnce({
              identifier: 'stock.release',
            });

          await new CqrsProvider([
            amqpTransportProviderMock,
            inProcessTransportProviderMock,
          ]).provide(containerFixture);
        });

        afterAll(() => {
          vitest.clearAllMocks();
        });

        it('should call amqpTransportProvider.initialize()', () => {
          expect(
            amqpTransportProviderMock.initialize,
          ).toHaveBeenCalledExactlyOnceWith(containerFixture, [
            {
              command: {
                identifier: 'stock.reserve',
                type: ReserveStock,
              },
              handler: ReserveStockHandler,
              serviceIdentifier: undefined,
              transport: amqpHandlerMetadataFixture.transports[0],
            },
          ]);
        });

        it('should call inProcessTransportProvider.initialize()', () => {
          expect(
            inProcessTransportProviderMock.initialize,
          ).toHaveBeenCalledExactlyOnceWith(containerFixture, [
            {
              command: {
                identifier: 'stock.release',
                type: ReleaseStock,
              },
              handler: ReleaseStockHandler,
              serviceIdentifier: undefined,
              transport: inProcessHandlerMetadataFixture.transports[0],
            },
          ]);
        });
      });
    });

    describe('having command handler metadata for another transport', () => {
      let containerFixture: Container;
      let transportProviderMock: Mocked<TransportProvider<string>>;

      beforeAll(() => {
        containerFixture = new Container();
        transportProviderMock = buildTransportProviderMock('amqp');
      });

      describe('when called', () => {
        beforeAll(async () => {
          const handlerMetadataFixture: CommandHandlerMetadata = {
            command: ReserveStock,
            serviceIdentifier: undefined,
            target: ReserveStockHandler,
            transports: [
              {
                identifier: 'in-process',
              },
            ],
          };

          vitest
            .mocked(getOwnReflectMetadata)
            .mockReturnValueOnce([handlerMetadataFixture])
            .mockReturnValueOnce({
              identifier: 'stock.reserve',
            });

          await new CqrsProvider([transportProviderMock]).provide(
            containerFixture,
          );
        });

        afterAll(() => {
          vitest.clearAllMocks();
        });

        it('should call transportProvider.initialize() with an empty config list', () => {
          expect(
            transportProviderMock.initialize,
          ).toHaveBeenCalledExactlyOnceWith(containerFixture, []);
        });

        it('should call transportProvider.getConfigList()', () => {
          expect(
            transportProviderMock.getConfigList,
          ).toHaveBeenCalledExactlyOnceWith();
        });
      });
    });

    describe('when called, and transportProvider.initialize() rejects', () => {
      let errorFixture: unknown;

      beforeAll(async () => {
        const containerFixture: Container = new Container();
        const transportProviderMock: Mocked<TransportProvider<string>> =
          buildTransportProviderMock('amqp');
        const handlerMetadataFixture: CommandHandlerMetadata = {
          command: ReserveStock,
          serviceIdentifier: undefined,
          target: ReserveStockHandler,
          transports: [
            {
              identifier: 'amqp',
            },
          ],
        };

        vitest
          .mocked(getOwnReflectMetadata)
          .mockReturnValueOnce([handlerMetadataFixture])
          .mockReturnValueOnce(undefined);
        transportProviderMock.initialize.mockRejectedValueOnce(
          new Error('connection failed'),
        );

        try {
          await new CqrsProvider([transportProviderMock]).provide(
            containerFixture,
          );
        } catch (error: unknown) {
          errorFixture = error;
        }
      });

      afterAll(() => {
        vitest.clearAllMocks();
      });

      it('should throw the initialization error', () => {
        expect(errorFixture).toBeInstanceOf(Error);
        expect((errorFixture as Error).message).toBe('connection failed');
      });
    });

    describe('when called, and provide() was already called', () => {
      let errorFixture: unknown;

      beforeAll(async () => {
        vitest.mocked(getOwnReflectMetadata).mockReturnValue(undefined);

        const provider: CqrsProvider = new CqrsProvider([
          buildTransportProviderMock('amqp'),
        ]);

        await provider.provide(new Container());

        try {
          await provider.provide(new Container());
        } catch (error: unknown) {
          errorFixture = error;
        }
      });

      afterAll(() => {
        vitest.clearAllMocks();
      });

      it('should throw an Error', () => {
        expect(errorFixture).toBeInstanceOf(Error);
        expect((errorFixture as Error).message).toBe(
          'Cannot provide CQRS more than once',
        );
      });
    });

    describe('having two query handlers for the same query', () => {
      let errorFixture: unknown;

      beforeAll(async () => {
        const firstHandlerMetadataFixture: QueryHandlerMetadata = {
          query: GetStock,
          serviceIdentifier: Symbol('get-stock-handler'),
          target: GetStockHandler,
        };
        const secondHandlerMetadataFixture: QueryHandlerMetadata = {
          query: GetStock,
          serviceIdentifier: Symbol('get-stock-audit-handler'),
          target: GetStockAuditHandler,
        };

        vitest
          .mocked(getOwnReflectMetadata)
          .mockReturnValueOnce(undefined)
          .mockReturnValueOnce([
            firstHandlerMetadataFixture,
            secondHandlerMetadataFixture,
          ])
          .mockReturnValueOnce({
            identifier: 'stock.get',
          })
          .mockReturnValueOnce({
            identifier: 'stock.get',
          });

        try {
          await new CqrsProvider().provide(new Container());
        } catch (error: unknown) {
          errorFixture = error;
        }
      });

      afterAll(() => {
        vitest.clearAllMocks();
      });

      it('should throw an Error', () => {
        expect(errorFixture).toBeInstanceOf(Error);
        expect((errorFixture as Error).message).toBe(
          'Query handler already defined for "GetStock".',
        );
      });
    });

    describe('having two query handlers for the same query identifier', () => {
      let errorFixture: unknown;

      beforeAll(async () => {
        const firstHandlerMetadataFixture: QueryHandlerMetadata = {
          query: GetStock,
          serviceIdentifier: undefined,
          target: GetStockHandler,
        };
        const secondHandlerMetadataFixture: QueryHandlerMetadata = {
          query: GetRelease,
          serviceIdentifier: undefined,
          target: GetStockAuditHandler,
        };

        vitest
          .mocked(getOwnReflectMetadata)
          .mockReturnValueOnce(undefined)
          .mockReturnValueOnce([
            firstHandlerMetadataFixture,
            secondHandlerMetadataFixture,
          ])
          .mockReturnValueOnce({
            identifier: 'stock.get',
          })
          .mockReturnValueOnce({
            identifier: 'stock.get',
          });

        try {
          await new CqrsProvider().provide(new Container());
        } catch (error: unknown) {
          errorFixture = error;
        }
      });

      afterAll(() => {
        vitest.clearAllMocks();
      });

      it('should throw an Error', () => {
        expect(errorFixture).toBeInstanceOf(Error);
        expect((errorFixture as Error).message).toBe(
          'Query handler already defined for "GetRelease".',
        );
      });
    });
  });

  describe('.getCommandBus', () => {
    describe('when called, and provide() has not been called', () => {
      let errorFixture: unknown;

      beforeAll(() => {
        try {
          new CqrsProvider().getCommandBus();
        } catch (error: unknown) {
          errorFixture = error;
        }
      });

      it('should throw an Error', () => {
        expect(errorFixture).toBeInstanceOf(Error);
        expect((errorFixture as Error).message).toBe(
          'Command bus not initialized. Ensure .provide() has been called first.',
        );
      });
    });

    describe('.send', () => {
      describe('having a transport config for the command', () => {
        let commandFixture: ReserveStock;
        let paramsFixture: string;
        let transportProviderMock: Mocked<TransportProvider<string>>;

        beforeAll(async () => {
          commandFixture = new ReserveStock();
          paramsFixture = 'stock';
          transportProviderMock = buildTransportProviderMock('amqp');
          transportProviderMock.getConfigList.mockReturnValue([
            {
              params: paramsFixture,
              type: ReserveStock,
            },
          ]);

          vitest.mocked(getOwnReflectMetadata).mockReturnValueOnce(undefined);

          const provider: CqrsProvider = new CqrsProvider([
            transportProviderMock,
          ]);

          await provider.provide(new Container());
          await provider.getCommandBus().send(commandFixture);
        });

        afterAll(() => {
          vitest.clearAllMocks();
        });

        it('should call transportProvider.send()', () => {
          expect(transportProviderMock.send).toHaveBeenCalledExactlyOnceWith(
            commandFixture,
            paramsFixture,
          );
        });
      });

      describe('having two transport configs for the command', () => {
        let commandFixture: ReserveStock;
        let transportProviderMock: Mocked<TransportProvider<string>>;

        beforeAll(async () => {
          commandFixture = new ReserveStock();
          transportProviderMock = buildTransportProviderMock('amqp');
          transportProviderMock.getConfigList.mockReturnValue([
            {
              params: 'reserve',
              type: ReserveStock,
            },
            {
              params: 'audit',
              type: ReserveStock,
            },
          ]);

          vitest.mocked(getOwnReflectMetadata).mockReturnValueOnce(undefined);

          const provider: CqrsProvider = new CqrsProvider([
            transportProviderMock,
          ]);

          await provider.provide(new Container());
          await provider.getCommandBus().send(commandFixture);
        });

        afterAll(() => {
          vitest.clearAllMocks();
        });

        it('should call transportProvider.send() for every config', () => {
          expect(transportProviderMock.send).toHaveBeenNthCalledWith(
            1,
            commandFixture,
            'reserve',
          );
          expect(transportProviderMock.send).toHaveBeenNthCalledWith(
            2,
            commandFixture,
            'audit',
          );
        });
      });

      describe('having two transport providers for the command', () => {
        let commandFixture: ReserveStock;
        let firstTransportProviderMock: Mocked<TransportProvider<string>>;
        let secondTransportProviderMock: Mocked<TransportProvider<string>>;

        beforeAll(async () => {
          commandFixture = new ReserveStock();
          firstTransportProviderMock = buildTransportProviderMock('amqp');
          secondTransportProviderMock = buildTransportProviderMock('audit');
          firstTransportProviderMock.getConfigList.mockReturnValue([
            {
              params: 'reserve',
              type: ReserveStock,
            },
          ]);
          secondTransportProviderMock.getConfigList.mockReturnValue([
            {
              params: 'audit',
              type: ReserveStock,
            },
          ]);

          vitest.mocked(getOwnReflectMetadata).mockReturnValueOnce(undefined);

          const provider: CqrsProvider = new CqrsProvider([
            firstTransportProviderMock,
            secondTransportProviderMock,
          ]);

          await provider.provide(new Container());
          await provider.getCommandBus().send(commandFixture);
        });

        afterAll(() => {
          vitest.clearAllMocks();
        });

        it('should call the first transportProvider.send()', () => {
          expect(
            firstTransportProviderMock.send,
          ).toHaveBeenCalledExactlyOnceWith(commandFixture, 'reserve');
        });

        it('should call the second transportProvider.send()', () => {
          expect(
            secondTransportProviderMock.send,
          ).toHaveBeenCalledExactlyOnceWith(commandFixture, 'audit');
        });
      });

      describe('having transport providers from a one-shot iterable', () => {
        let commandFixture: ReserveStock;
        let transportProviderMock: Mocked<TransportProvider<string>>;

        beforeAll(async () => {
          commandFixture = new ReserveStock();
          transportProviderMock = buildTransportProviderMock('amqp');
          transportProviderMock.getConfigList.mockReturnValue([
            {
              params: 'stock',
              type: ReserveStock,
            },
          ]);

          function* createTransportProviders(): Generator<
            TransportProvider<string>
          > {
            yield transportProviderMock;
          }

          vitest.mocked(getOwnReflectMetadata).mockReturnValueOnce(undefined);

          const provider: CqrsProvider = new CqrsProvider(
            createTransportProviders(),
          );

          await provider.provide(new Container());
          await provider.getCommandBus().send(commandFixture);
        });

        afterAll(() => {
          vitest.clearAllMocks();
        });

        it('should call transportProvider.send()', () => {
          expect(transportProviderMock.send).toHaveBeenCalledExactlyOnceWith(
            commandFixture,
            'stock',
          );
        });
      });

      describe('having no transport config for the command', () => {
        let errorFixture: unknown;

        beforeAll(async () => {
          const transportProviderMock: Mocked<TransportProvider<string>> =
            buildTransportProviderMock('amqp');

          transportProviderMock.getConfigList.mockReturnValue([
            {
              params: 'stock',
              type: ReserveStock,
            },
          ]);

          vitest.mocked(getOwnReflectMetadata).mockReturnValueOnce(undefined);

          const provider: CqrsProvider = new CqrsProvider([
            transportProviderMock,
          ]);

          await provider.provide(new Container());

          try {
            await provider.getCommandBus().send(new ReleaseStock());
          } catch (error: unknown) {
            errorFixture = error;
          }
        });

        afterAll(() => {
          vitest.clearAllMocks();
        });

        it('should throw an Error', () => {
          expect(errorFixture).toBeInstanceOf(Error);
          expect((errorFixture as Error).message).toBe(
            'No transport provider found for command ReleaseStock',
          );
        });
      });

      describe('when called, and transportProvider.send() rejects', () => {
        let errorFixture: unknown;
        let firstTransportProviderMock: Mocked<TransportProvider<string>>;
        let secondTransportProviderMock: Mocked<TransportProvider<string>>;

        beforeAll(async () => {
          const commandFixture: ReserveStock = new ReserveStock();

          firstTransportProviderMock = buildTransportProviderMock('amqp');
          secondTransportProviderMock = buildTransportProviderMock('audit');
          firstTransportProviderMock.getConfigList.mockReturnValue([
            {
              params: 'reserve',
              type: ReserveStock,
            },
          ]);
          secondTransportProviderMock.getConfigList.mockReturnValue([
            {
              params: 'audit',
              type: ReserveStock,
            },
          ]);
          secondTransportProviderMock.send.mockRejectedValueOnce(
            new Error('publish failed'),
          );

          vitest.mocked(getOwnReflectMetadata).mockReturnValueOnce(undefined);

          const provider: CqrsProvider = new CqrsProvider([
            firstTransportProviderMock,
            secondTransportProviderMock,
          ]);

          await provider.provide(new Container());

          try {
            await provider.getCommandBus().send(commandFixture);
          } catch (error: unknown) {
            errorFixture = error;
          }
        });

        afterAll(() => {
          vitest.clearAllMocks();
        });

        it('should call both transportProvider.send() methods', () => {
          expect(firstTransportProviderMock.send).toHaveBeenCalledTimes(1);
          expect(secondTransportProviderMock.send).toHaveBeenCalledTimes(1);
        });

        it('should throw the transport error', () => {
          expect(errorFixture).toBeInstanceOf(Error);
          expect((errorFixture as Error).message).toBe('publish failed');
        });
      });
    });
  });

  describe('.getQueryBus', () => {
    describe('when called, and provide() has not been called', () => {
      let errorFixture: unknown;

      beforeAll(() => {
        try {
          new CqrsProvider().getQueryBus();
        } catch (error: unknown) {
          errorFixture = error;
        }
      });

      it('should throw an Error', () => {
        expect(errorFixture).toBeInstanceOf(Error);
        expect((errorFixture as Error).message).toBe(
          'Query bus not initialized. Ensure .provide() has been called first.',
        );
      });
    });

    describe('.send', () => {
      describe('having a query handler', () => {
        let handlerMetadataFixture: QueryHandlerMetadata;
        let queryFixture: GetStock;
        let result: unknown;

        beforeAll(async () => {
          queryFixture = new GetStock('sku-1');
          handlerMetadataFixture = {
            query: GetStock,
            serviceIdentifier: undefined,
            target: GetStockHandler,
          };

          const container: Container = new Container();

          container.bind(GetStockHandler).toSelf();

          vitest
            .mocked(getOwnReflectMetadata)
            .mockReturnValueOnce(undefined)
            .mockReturnValueOnce([handlerMetadataFixture])
            .mockReturnValueOnce({
              identifier: 'stock.get',
            });

          const provider: CqrsProvider = new CqrsProvider();

          await provider.provide(container);

          result = await provider.getQueryBus().send(queryFixture);
        });

        afterAll(() => {
          vitest.clearAllMocks();
        });

        it('should read query handler metadata', () => {
          expect(getOwnReflectMetadata).toHaveBeenNthCalledWith(
            1,
            Reflect,
            commandHandlerMetadataReflectKey,
          );
          expect(getOwnReflectMetadata).toHaveBeenNthCalledWith(
            2,
            Reflect,
            queryHandlerMetadataReflectKey,
          );
          expect(getOwnReflectMetadata).toHaveBeenNthCalledWith(
            3,
            GetStock,
            queryMetadataReflectKey,
          );
        });

        it('should return the handler result', () => {
          expect(result).toBe('stock:sku-1');
        });
      });

      describe('having a query handler service identifier', () => {
        let queryFixture: GetStock;
        let result: unknown;
        let serviceIdentifierFixture: ServiceIdentifier;

        beforeAll(async () => {
          queryFixture = new GetStock('sku-1');
          serviceIdentifierFixture = Symbol('get-stock-handler');

          const container: Container = new Container();

          container.bind(serviceIdentifierFixture).to(GetStockHandler);

          vitest
            .mocked(getOwnReflectMetadata)
            .mockReturnValueOnce(undefined)
            .mockReturnValueOnce([
              {
                query: GetStock,
                serviceIdentifier: serviceIdentifierFixture,
                target: GetStockAuditHandler,
              },
            ])
            .mockReturnValueOnce(undefined);

          const provider: CqrsProvider = new CqrsProvider();

          await provider.provide(container);

          result = await provider.getQueryBus().send(queryFixture);
        });

        afterAll(() => {
          vitest.clearAllMocks();
        });

        it('should return the bound handler result', () => {
          expect(result).toBe('stock:sku-1');
        });
      });

      describe('having a query handler that returns a promise', () => {
        let queryFixture: GetStock;
        let result: unknown;

        beforeAll(async () => {
          queryFixture = new GetStock('sku-1');

          const container: Container = new Container();

          container.bind(AsyncGetStockHandler).toSelf();

          vitest
            .mocked(getOwnReflectMetadata)
            .mockReturnValueOnce(undefined)
            .mockReturnValueOnce([
              {
                query: GetStock,
                serviceIdentifier: undefined,
                target: AsyncGetStockHandler,
              },
            ])
            .mockReturnValueOnce({
              identifier: 'stock.get',
            });

          const provider: CqrsProvider = new CqrsProvider();

          await provider.provide(container);

          result = await provider.getQueryBus().send(queryFixture);
        });

        afterAll(() => {
          vitest.clearAllMocks();
        });

        it('should return the resolved handler result', () => {
          expect(result).toBe('async:sku-1');
        });
      });

      describe('having query handler metadata without query metadata', () => {
        let queryFixture: GetStock;
        let result: unknown;

        beforeAll(async () => {
          queryFixture = new GetStock('sku-1');

          const container: Container = new Container();

          container.bind(GetStockHandler).toSelf();

          vitest
            .mocked(getOwnReflectMetadata)
            .mockReturnValueOnce(undefined)
            .mockReturnValueOnce([
              {
                query: GetStock,
                serviceIdentifier: undefined,
                target: GetStockHandler,
              },
            ])
            .mockReturnValueOnce(undefined);

          const provider: CqrsProvider = new CqrsProvider();

          await provider.provide(container);

          result = await provider.getQueryBus().send(queryFixture);
        });

        afterAll(() => {
          vitest.clearAllMocks();
        });

        it('should return the handler result', () => {
          expect(result).toBe('stock:sku-1');
        });
      });

      describe('having no query handler for the query', () => {
        let errorFixture: unknown;

        beforeAll(async () => {
          vitest
            .mocked(getOwnReflectMetadata)
            .mockReturnValueOnce(undefined)
            .mockReturnValueOnce(undefined);

          const provider: CqrsProvider = new CqrsProvider();

          await provider.provide(new Container());

          try {
            await provider.getQueryBus().send(new GetStock('sku-1'));
          } catch (error: unknown) {
            errorFixture = error;
          }
        });

        afterAll(() => {
          vitest.clearAllMocks();
        });

        it('should throw an Error', () => {
          expect(errorFixture).toBeInstanceOf(Error);
          expect((errorFixture as Error).message).toBe(
            'No handler found for query GetStock',
          );
        });
      });
    });
  });

  describe('.getEventBus', () => {
    describe('when called, and provide() has not been called', () => {
      let errorFixture: unknown;

      beforeAll(() => {
        try {
          new CqrsProvider().getEventBus();
        } catch (error: unknown) {
          errorFixture = error;
        }
      });

      it('should throw an Error', () => {
        expect(errorFixture).toBeInstanceOf(Error);
        expect((errorFixture as Error).message).toBe(
          'Event bus not initialized. Ensure .provide() has been called first.',
        );
      });
    });

    describe('.send', () => {
      describe('having an event handler', () => {
        let eventFixture: StockReserved;
        let handlerMetadataFixture: EventHandlerMetadata;
        let handlerRanDuringSend: boolean;
        let sendResult: unknown;

        beforeAll(async () => {
          eventFixture = new StockReserved('sku-1');
          handledSkus.length = 0;
          handlerMetadataFixture = {
            event: StockReserved,
            serviceIdentifier: undefined,
            target: StockReservedHandler,
          };

          const container: Container = new Container();

          container.bind(StockReservedHandler).toSelf();

          vitest
            .mocked(getOwnReflectMetadata)
            .mockReturnValueOnce(undefined)
            .mockReturnValueOnce(undefined)
            .mockReturnValueOnce([handlerMetadataFixture])
            .mockReturnValueOnce({
              identifier: 'stock.reserved',
            });

          const provider: CqrsProvider = new CqrsProvider();

          await provider.provide(container);

          sendResult = provider.getEventBus().send(eventFixture);
          handlerRanDuringSend = handledSkus.length > 0;

          await waitForEventHandlers();
        });

        afterAll(() => {
          vitest.clearAllMocks();
        });

        it('should read event handler metadata', () => {
          expect(getOwnReflectMetadata).toHaveBeenNthCalledWith(
            1,
            Reflect,
            commandHandlerMetadataReflectKey,
          );
          expect(getOwnReflectMetadata).toHaveBeenNthCalledWith(
            2,
            Reflect,
            queryHandlerMetadataReflectKey,
          );
          expect(getOwnReflectMetadata).toHaveBeenNthCalledWith(
            3,
            Reflect,
            eventHandlerMetadataReflectKey,
          );
          expect(getOwnReflectMetadata).toHaveBeenNthCalledWith(
            4,
            StockReserved,
            eventMetadataReflectKey,
          );
        });

        it('should return undefined', () => {
          expect(sendResult).toBeUndefined();
        });

        it('should return before the handler runs', () => {
          expect(handlerRanDuringSend).toBe(false);
        });

        it('should run the handler', () => {
          expect(handledSkus).toStrictEqual(['reserved:sku-1']);
        });
      });

      describe('having an event handler service identifier', () => {
        let serviceIdentifierFixture: ServiceIdentifier;

        beforeAll(async () => {
          handledSkus.length = 0;
          serviceIdentifierFixture = Symbol('stock-reserved-handler');

          const container: Container = new Container();

          container.bind(serviceIdentifierFixture).to(StockReservedHandler);

          vitest
            .mocked(getOwnReflectMetadata)
            .mockReturnValueOnce(undefined)
            .mockReturnValueOnce(undefined)
            .mockReturnValueOnce([
              {
                event: StockReserved,
                serviceIdentifier: serviceIdentifierFixture,
                target: StockReservedAuditHandler,
              },
            ])
            .mockReturnValueOnce(undefined);

          const provider: CqrsProvider = new CqrsProvider();

          await provider.provide(container);

          provider.getEventBus().send(new StockReserved('sku-1'));

          await waitForEventHandlers();
        });

        afterAll(() => {
          vitest.clearAllMocks();
        });

        it('should run the bound handler', () => {
          expect(handledSkus).toStrictEqual(['reserved:sku-1']);
        });
      });

      describe('having event handler metadata without event metadata', () => {
        beforeAll(async () => {
          handledSkus.length = 0;

          const container: Container = new Container();

          container.bind(StockReservedHandler).toSelf();

          vitest
            .mocked(getOwnReflectMetadata)
            .mockReturnValueOnce(undefined)
            .mockReturnValueOnce(undefined)
            .mockReturnValueOnce([
              {
                event: StockReserved,
                serviceIdentifier: undefined,
                target: StockReservedHandler,
              },
            ])
            .mockReturnValueOnce(undefined);

          const provider: CqrsProvider = new CqrsProvider();

          await provider.provide(container);

          provider.getEventBus().send(new StockReserved('sku-1'));

          await waitForEventHandlers();
        });

        afterAll(() => {
          vitest.clearAllMocks();
        });

        it('should run the handler', () => {
          expect(handledSkus).toStrictEqual(['reserved:sku-1']);
        });
      });

      describe('having two event handlers for the same event', () => {
        beforeAll(async () => {
          handledSkus.length = 0;

          const container: Container = new Container();

          container.bind(StockReservedHandler).toSelf();
          container.bind(StockReservedAuditHandler).toSelf();

          vitest
            .mocked(getOwnReflectMetadata)
            .mockReturnValueOnce(undefined)
            .mockReturnValueOnce(undefined)
            .mockReturnValueOnce([
              {
                event: StockReserved,
                serviceIdentifier: undefined,
                target: StockReservedHandler,
              },
              {
                event: StockReserved,
                serviceIdentifier: undefined,
                target: StockReservedAuditHandler,
              },
            ])
            .mockReturnValueOnce({
              identifier: 'stock.reserved',
            })
            .mockReturnValueOnce({
              identifier: 'stock.reserved',
            });

          const provider: CqrsProvider = new CqrsProvider();

          await provider.provide(container);

          provider.getEventBus().send(new StockReserved('sku-1'));

          await waitForEventHandlers();
        });

        afterAll(() => {
          vitest.clearAllMocks();
        });

        it('should run every handler in registration order', () => {
          expect(handledSkus).toStrictEqual(['reserved:sku-1', 'audit:sku-1']);
        });
      });

      describe('having an event handler that returns a promise', () => {
        let settledDuringSend: boolean;

        beforeAll(async () => {
          handledSkus.length = 0;
          settledDuringSend = false;

          asyncStockReserved.gate = new Promise<void>((resolve: () => void) => {
            asyncStockReserved.release = resolve;
          });

          const container: Container = new Container();

          container.bind(AsyncStockReservedHandler).toSelf();

          vitest
            .mocked(getOwnReflectMetadata)
            .mockReturnValueOnce(undefined)
            .mockReturnValueOnce(undefined)
            .mockReturnValueOnce([
              {
                event: StockReserved,
                serviceIdentifier: undefined,
                target: AsyncStockReservedHandler,
              },
            ])
            .mockReturnValueOnce({
              identifier: 'stock.reserved',
            });

          const provider: CqrsProvider = new CqrsProvider();

          await provider.provide(container);

          provider.getEventBus().send(new StockReserved('sku-1'));
          settledDuringSend = handledSkus.includes('end:sku-1');
        });

        afterAll(() => {
          asyncStockReserved.release();
          asyncStockReserved.gate = Promise.resolve();
          vitest.clearAllMocks();
        });

        it('should return before the handler settles', () => {
          expect(settledDuringSend).toBe(false);
          expect(handledSkus).not.toContain('end:sku-1');
        });

        describe('when the handler settles', () => {
          beforeAll(async () => {
            asyncStockReserved.release();

            await waitForEventHandlers();
          });

          it('should finish the handler', () => {
            expect(handledSkus).toStrictEqual(['start:sku-1', 'end:sku-1']);
          });
        });
      });

      describe('having no event handler for the event', () => {
        let errorFixture: unknown;

        beforeAll(async () => {
          vitest
            .mocked(getOwnReflectMetadata)
            .mockReturnValueOnce(undefined)
            .mockReturnValueOnce(undefined)
            .mockReturnValueOnce(undefined);

          const provider: CqrsProvider = new CqrsProvider();

          await provider.provide(new Container());

          try {
            provider.getEventBus().send(new StockReserved('sku-1'));
          } catch (error: unknown) {
            errorFixture = error;
          }
        });

        afterAll(() => {
          vitest.clearAllMocks();
        });

        it('should throw an Error', () => {
          expect(errorFixture).toBeInstanceOf(Error);
          expect((errorFixture as Error).message).toBe(
            'No handler found for event StockReserved',
          );
        });
      });

      describe('having an event handler that rejects', () => {
        let loggerMock: Mocked<Logger>;
        let sendErrorFixture: unknown;

        beforeAll(async () => {
          eventHandlerFailure.error = new Error('projection failed');
          handledSkus.length = 0;
          loggerMock = buildLoggerMock();

          const container: Container = new Container();

          container.bind(RejectingStockReservedHandler).toSelf();
          container.bind(StockReservedAuditHandler).toSelf();

          vitest
            .mocked(getOwnReflectMetadata)
            .mockReturnValueOnce(undefined)
            .mockReturnValueOnce(undefined)
            .mockReturnValueOnce([
              {
                event: StockReserved,
                serviceIdentifier: undefined,
                target: RejectingStockReservedHandler,
              },
              {
                event: StockReserved,
                serviceIdentifier: undefined,
                target: StockReservedAuditHandler,
              },
            ])
            .mockReturnValueOnce({
              identifier: 'stock.reserved',
            })
            .mockReturnValueOnce({
              identifier: 'stock.reserved',
            });

          const provider: CqrsProvider = new CqrsProvider([], {
            logger: loggerMock,
          });

          await provider.provide(container);

          try {
            provider.getEventBus().send(new StockReserved('sku-1'));
          } catch (error: unknown) {
            sendErrorFixture = error;
          }

          await waitForEventHandlers();
        });

        afterAll(() => {
          vitest.clearAllMocks();
        });

        it('should return without throwing', () => {
          expect(sendErrorFixture).toBeUndefined();
        });

        it('should log the handler error', () => {
          expect(loggerMock.error).toHaveBeenCalledExactlyOnceWith(
            buildEventHandlerFailureMessage(
              'StockReserved',
              eventHandlerFailure.error,
            ),
          );
        });

        it('should run the other handler', () => {
          expect(handledSkus).toStrictEqual(['audit:sku-1']);
        });
      });

      describe('having an event handler that throws', () => {
        let loggerMock: Mocked<Logger>;

        beforeAll(async () => {
          eventHandlerFailure.error = new Error('audit log failed');
          handledSkus.length = 0;
          loggerMock = buildLoggerMock();

          const container: Container = new Container();

          container.bind(ThrowingStockReservedHandler).toSelf();
          container.bind(StockReservedAuditHandler).toSelf();

          vitest
            .mocked(getOwnReflectMetadata)
            .mockReturnValueOnce(undefined)
            .mockReturnValueOnce(undefined)
            .mockReturnValueOnce([
              {
                event: StockReserved,
                serviceIdentifier: undefined,
                target: ThrowingStockReservedHandler,
              },
              {
                event: StockReserved,
                serviceIdentifier: undefined,
                target: StockReservedAuditHandler,
              },
            ])
            .mockReturnValueOnce(undefined)
            .mockReturnValueOnce(undefined);

          const provider: CqrsProvider = new CqrsProvider([], {
            logger: loggerMock,
          });

          await provider.provide(container);

          provider.getEventBus().send(new StockReserved('sku-1'));

          await waitForEventHandlers();
        });

        afterAll(() => {
          vitest.clearAllMocks();
        });

        it('should log the handler error', () => {
          expect(loggerMock.error).toHaveBeenCalledExactlyOnceWith(
            buildEventHandlerFailureMessage(
              'StockReserved',
              eventHandlerFailure.error,
            ),
          );
        });

        it('should run the other handler', () => {
          expect(handledSkus).toStrictEqual(['audit:sku-1']);
        });
      });

      describe('having an event handler that throws a non-Error', () => {
        let loggerMock: Mocked<Logger>;

        beforeAll(async () => {
          unknownEventHandlerFailure.cause = 'audit log failed';
          handledSkus.length = 0;
          loggerMock = buildLoggerMock();

          const container: Container = new Container();

          container.bind(ThrowingUnknownStockReservedHandler).toSelf();
          container.bind(StockReservedAuditHandler).toSelf();

          vitest
            .mocked(getOwnReflectMetadata)
            .mockReturnValueOnce(undefined)
            .mockReturnValueOnce(undefined)
            .mockReturnValueOnce([
              {
                event: StockReserved,
                serviceIdentifier: undefined,
                target: ThrowingUnknownStockReservedHandler,
              },
              {
                event: StockReserved,
                serviceIdentifier: undefined,
                target: StockReservedAuditHandler,
              },
            ])
            .mockReturnValueOnce(undefined)
            .mockReturnValueOnce(undefined);

          const provider: CqrsProvider = new CqrsProvider([], {
            logger: loggerMock,
          });

          await provider.provide(container);

          provider.getEventBus().send(new StockReserved('sku-1'));

          await waitForEventHandlers();
        });

        afterAll(() => {
          vitest.clearAllMocks();
        });

        it('should log the thrown value', () => {
          expect(loggerMock.error).toHaveBeenCalledExactlyOnceWith(
            'Event handler failed for StockReserved: audit log failed',
          );
        });

        it('should run the other handler', () => {
          expect(handledSkus).toStrictEqual(['audit:sku-1']);
        });
      });

      describe('having an event handler that throws a non-Error object', () => {
        let loggerMock: Mocked<Logger>;

        beforeAll(async () => {
          unknownEventHandlerFailure.cause = {
            code: 'E_FAIL',
          };
          handledSkus.length = 0;
          loggerMock = buildLoggerMock();

          const container: Container = new Container();

          container.bind(ThrowingUnknownStockReservedHandler).toSelf();
          container.bind(StockReservedAuditHandler).toSelf();

          vitest
            .mocked(getOwnReflectMetadata)
            .mockReturnValueOnce(undefined)
            .mockReturnValueOnce(undefined)
            .mockReturnValueOnce([
              {
                event: StockReserved,
                serviceIdentifier: undefined,
                target: ThrowingUnknownStockReservedHandler,
              },
              {
                event: StockReserved,
                serviceIdentifier: undefined,
                target: StockReservedAuditHandler,
              },
            ])
            .mockReturnValueOnce(undefined)
            .mockReturnValueOnce(undefined);

          const provider: CqrsProvider = new CqrsProvider([], {
            logger: loggerMock,
          });

          await provider.provide(container);

          provider.getEventBus().send(new StockReserved('sku-1'));

          await waitForEventHandlers();
        });

        afterAll(() => {
          vitest.clearAllMocks();
        });

        it('should log the thrown value', () => {
          expect(loggerMock.error).toHaveBeenCalledExactlyOnceWith(
            'Event handler failed for StockReserved: {"code":"E_FAIL"}',
          );
        });

        it('should run the other handler', () => {
          expect(handledSkus).toStrictEqual(['audit:sku-1']);
        });
      });

      describe('having logger set to false', () => {
        let consoleLoggerErrorSpy: MockInstance;

        beforeAll(async () => {
          eventHandlerFailure.error = new Error('audit log failed');
          handledSkus.length = 0;
          consoleLoggerErrorSpy = vitest
            .spyOn(ConsoleLogger.prototype, 'error')
            .mockImplementation(() => undefined);

          const container: Container = new Container();

          container.bind(ThrowingStockReservedHandler).toSelf();
          container.bind(StockReservedAuditHandler).toSelf();

          vitest
            .mocked(getOwnReflectMetadata)
            .mockReturnValueOnce(undefined)
            .mockReturnValueOnce(undefined)
            .mockReturnValueOnce([
              {
                event: StockReserved,
                serviceIdentifier: undefined,
                target: ThrowingStockReservedHandler,
              },
              {
                event: StockReserved,
                serviceIdentifier: undefined,
                target: StockReservedAuditHandler,
              },
            ])
            .mockReturnValueOnce(undefined)
            .mockReturnValueOnce(undefined);

          const provider: CqrsProvider = new CqrsProvider([], {
            logger: false,
          });

          await provider.provide(container);

          provider.getEventBus().send(new StockReserved('sku-1'));

          await waitForEventHandlers();
        });

        afterAll(() => {
          consoleLoggerErrorSpy.mockRestore();
          vitest.clearAllMocks();
        });

        it('should not log the handler error', () => {
          expect(consoleLoggerErrorSpy).not.toHaveBeenCalled();
        });

        it('should run the other handler', () => {
          expect(handledSkus).toStrictEqual(['audit:sku-1']);
        });
      });

      describe('having the default logger', () => {
        let consoleLoggerErrorSpy: MockInstance;

        beforeAll(async () => {
          eventHandlerFailure.error = new Error('audit log failed');
          consoleLoggerErrorSpy = vitest
            .spyOn(ConsoleLogger.prototype, 'error')
            .mockImplementation(() => undefined);

          const container: Container = new Container();

          container.bind(ThrowingStockReservedHandler).toSelf();

          vitest
            .mocked(getOwnReflectMetadata)
            .mockReturnValueOnce(undefined)
            .mockReturnValueOnce(undefined)
            .mockReturnValueOnce([
              {
                event: StockReserved,
                serviceIdentifier: undefined,
                target: ThrowingStockReservedHandler,
              },
            ])
            .mockReturnValueOnce(undefined);

          const provider: CqrsProvider = new CqrsProvider();

          await provider.provide(container);

          provider.getEventBus().send(new StockReserved('sku-1'));

          await waitForEventHandlers();
        });

        afterAll(() => {
          consoleLoggerErrorSpy.mockRestore();
          vitest.clearAllMocks();
        });

        it('should log the handler error with a ConsoleLogger', () => {
          expect(consoleLoggerErrorSpy).toHaveBeenCalledExactlyOnceWith(
            buildEventHandlerFailureMessage(
              'StockReserved',
              eventHandlerFailure.error,
            ),
          );
        });
      });

      describe('having logger set to true', () => {
        let consoleLoggerErrorSpy: MockInstance;

        beforeAll(async () => {
          eventHandlerFailure.error = new Error('audit log failed');
          consoleLoggerErrorSpy = vitest
            .spyOn(ConsoleLogger.prototype, 'error')
            .mockImplementation(() => undefined);

          const container: Container = new Container();

          container.bind(ThrowingStockReservedHandler).toSelf();

          vitest
            .mocked(getOwnReflectMetadata)
            .mockReturnValueOnce(undefined)
            .mockReturnValueOnce(undefined)
            .mockReturnValueOnce([
              {
                event: StockReserved,
                serviceIdentifier: undefined,
                target: ThrowingStockReservedHandler,
              },
            ])
            .mockReturnValueOnce(undefined);

          const provider: CqrsProvider = new CqrsProvider([], {
            logger: true,
          });

          await provider.provide(container);

          provider.getEventBus().send(new StockReserved('sku-1'));

          await waitForEventHandlers();
        });

        afterAll(() => {
          consoleLoggerErrorSpy.mockRestore();
          vitest.clearAllMocks();
        });

        it('should log the handler error with a ConsoleLogger', () => {
          expect(consoleLoggerErrorSpy).toHaveBeenCalledExactlyOnceWith(
            buildEventHandlerFailureMessage(
              'StockReserved',
              eventHandlerFailure.error,
            ),
          );
        });
      });
    });
  });
});
