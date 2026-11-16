import {
  afterAll,
  beforeAll,
  describe,
  expect,
  it,
  type Mocked,
  vitest,
} from 'vitest';

vitest.mock(import('@inversifyjs/reflect-metadata-utils'));

import { getOwnReflectMetadata } from '@inversifyjs/reflect-metadata-utils';
import { Container, type ServiceIdentifier } from 'inversify';

import { commandHandlerMetadataReflectKey } from '../../reflectMetadata/data/commandHandlerMetadataReflectKey.js';
import { commandMetadataReflectKey } from '../../reflectMetadata/data/commandMetadataReflectKey.js';
import { queryHandlerMetadataReflectKey } from '../../reflectMetadata/data/queryHandlerMetadataReflectKey.js';
import { queryMetadataReflectKey } from '../../reflectMetadata/data/queryMetadataReflectKey.js';
import { type CommandHandlerMetadata } from '../models/CommandHandlerMetadata.js';
import { type CommandMetadata } from '../models/CommandMetadata.js';
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
});
