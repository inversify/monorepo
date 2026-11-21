import {
  afterAll,
  beforeAll,
  describe,
  expect,
  it,
  type Mocked,
  vitest,
} from 'vitest';

vitest.mock(import('rhea'), () => ({
  default: {
    create_container: vitest.fn(),
  } as unknown as typeof rhea,
}));
vitest.mock(import('@inversifyjs/logger'));
vitest.mock(import('../serializers/Amqp1Dot0JsonSerializer.js'));

import {
  type CommandHandlerConfig,
  type TransportProviderConfig,
} from '@inversifyjs/framework-cqrs';
import { ConsoleLogger, type Logger } from '@inversifyjs/logger';
import { Container, type ServiceIdentifier } from 'inversify';
import rhea, { type Message, type Container as RheaContainer } from 'rhea';

import {
  buildRemoteState,
  type FakeRheaConnection,
  FakeRheaContainer,
  type FakeRheaIncomingDelivery,
  type FakeRheaLink,
} from '../../../test/rhea/FakeRheaContainer.js';
import { amqp1Dot0TransportIdentifier } from '../data/amqp1Dot0TransportIdentifier.js';
import { Amqp1Dot0TransportDeclaration } from '../declarations/Amqp1Dot0TransportDeclaration.js';
import { type Amqp1Dot0CommandHandler } from '../models/Amqp1Dot0CommandHandler.js';
import { type Amqp1Dot0ConnectionConfig } from '../models/Amqp1Dot0ConnectionConfig.js';
import { type Amqp1Dot0Message } from '../models/Amqp1Dot0Message.js';
import { type Amqp1Dot0Serializer } from '../models/Amqp1Dot0Serializer.js';
import { type Amqp1Dot0TransportParams } from '../models/Amqp1Dot0TransportParams.js';
import { type Amqp1Dot0TransportProviderOptions } from '../models/Amqp1Dot0TransportProviderOptions.js';
import { Amqp1Dot0JsonSerializer } from '../serializers/Amqp1Dot0JsonSerializer.js';
import { Amqp1Dot0TransportProvider } from './Amqp1Dot0TransportProvider.js';

class CreateOrder {
  constructor(public readonly orderId: string) {}
}

class CancelOrder {
  constructor(public readonly orderId: string) {}
}

class CreateOrderHandler {}

class AuditOrderHandler {}

class CancelOrderHandler {}

interface ProviderSetup {
  readonly provider: Amqp1Dot0TransportProvider;
  readonly rheaContainer: FakeRheaContainer;
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

function buildValueMessage(value: string): Amqp1Dot0Message {
  return { body: { kind: 'value', value } };
}

function buildHandlerMock(): Mocked<Amqp1Dot0CommandHandler> {
  return {
    deserialize: vitest.fn(),
    handle: vitest.fn(),
  };
}

function buildSerializerMock(): Mocked<Amqp1Dot0Serializer> {
  return {
    serialize: vitest.fn(),
  };
}

function buildConnectionConfig(
  identifier: string,
  overrides: Partial<Amqp1Dot0ConnectionConfig> = {},
): Amqp1Dot0ConnectionConfig {
  return {
    connectionOptions: { host: identifier, port: 5672 },
    identifier,
    ...overrides,
  };
}

function buildCommandHandlerConfig(input: {
  address: string;
  // oxlint-disable-next-line typescript/no-unsafe-function-type
  commandType: Function;
  connectionIdentifier: string;
  // oxlint-disable-next-line typescript/no-unsafe-function-type
  handler: Function;
  serviceIdentifier?: ServiceIdentifier;
}): CommandHandlerConfig {
  return {
    command: {
      identifier: undefined,
      type: input.commandType,
    },
    handler: input.handler,
    serviceIdentifier: input.serviceIdentifier,
    transport: new Amqp1Dot0TransportDeclaration({
      address: input.address,
      connectionIdentifier: input.connectionIdentifier,
    }),
  };
}

function buildProvider(
  options: Amqp1Dot0TransportProviderOptions,
): ProviderSetup {
  const rheaContainer: FakeRheaContainer = new FakeRheaContainer();

  vitest
    .mocked(rhea.create_container)
    .mockReturnValueOnce(rheaContainer as unknown as RheaContainer);

  return {
    provider: new Amqp1Dot0TransportProvider({ logger: false, ...options }),
    rheaContainer,
  };
}

async function captureError(run: () => Promise<unknown>): Promise<unknown> {
  try {
    await run();
  } catch (error: unknown) {
    return error;
  }

  return undefined;
}

async function waitUntil(predicate: () => boolean): Promise<void> {
  await vitest.waitFor((): void => {
    if (!predicate()) {
      throw new Error('Condition not met yet');
    }
  });
}

async function flushMicrotasks(): Promise<void> {
  for (let i: number = 0; i < 100; ++i) {
    await Promise.resolve();
  }
}

async function flushImmediates(): Promise<void> {
  await new Promise<void>((resolve: () => void): void => {
    setImmediate(resolve);
  });
}

function createOrderOnPrimary(
  overrides: Partial<Parameters<typeof buildCommandHandlerConfig>[0]> = {},
): CommandHandlerConfig {
  return buildCommandHandlerConfig({
    address: 'orders.create',
    commandType: CreateOrder,
    connectionIdentifier: 'primary',
    handler: CreateOrderHandler,
    ...overrides,
  });
}

describe(Amqp1Dot0TransportProvider, () => {
  describe('.constructor', () => {
    describe('having duplicated connection identifiers', () => {
      let optionsFixture: Amqp1Dot0TransportProviderOptions;

      beforeAll(() => {
        optionsFixture = {
          connections: [
            buildConnectionConfig('primary'),
            buildConnectionConfig('primary'),
          ],
        };
      });

      describe('when called', () => {
        let result: unknown;

        beforeAll(() => {
          try {
            new Amqp1Dot0TransportProvider(optionsFixture);
          } catch (error: unknown) {
            result = error;
          }
        });

        it('should throw an Error', () => {
          expect(result).toBeInstanceOf(Error);
          expect((result as Error).message).toBe(
            'Duplicated AMQP 1.0 connection identifier "primary"',
          );
        });
      });
    });

    describe.each<[string, number]>([
      ['a zero credit window', 0],
      ['a negative credit window', -1],
      ['a fractional credit window', 1.5],
    ])('having %s', (_: string, creditWindow: number) => {
      describe('when called', () => {
        let result: unknown;

        beforeAll(() => {
          try {
            new Amqp1Dot0TransportProvider({
              connections: [
                buildConnectionConfig('primary', {
                  receiverOptions: { creditWindow },
                }),
              ],
            });
          } catch (error: unknown) {
            result = error;
          }
        });

        it('should throw an Error', () => {
          expect(result).toBeInstanceOf(Error);
          expect((result as Error).message).toBe(
            'AMQP 1.0 creditWindow must be a positive integer (connection "primary")',
          );
        });
      });
    });

    describe.each<[string, number]>([
      ['a zero send timeout', 0],
      ['a negative send timeout', -1],
      ['a fractional send timeout', 1.5],
    ])('having %s', (_: string, sendTimeout: number) => {
      describe('when called', () => {
        let result: unknown;

        beforeAll(() => {
          try {
            new Amqp1Dot0TransportProvider({
              connections: [buildConnectionConfig('primary')],
              sendTimeout,
            });
          } catch (error: unknown) {
            result = error;
          }
        });

        it('should throw an Error', () => {
          expect(result).toStrictEqual(
            new Error('AMQP 1.0 sendTimeout must be a positive integer'),
          );
        });
      });
    });

    describe('having a send timeout above the timer limit', () => {
      describe('when called', () => {
        let result: unknown;

        beforeAll(() => {
          try {
            new Amqp1Dot0TransportProvider({
              connections: [buildConnectionConfig('primary')],
              sendTimeout: 2_147_483_648,
            });
          } catch (error: unknown) {
            result = error;
          }
        });

        it('should throw an Error', () => {
          expect(result).toStrictEqual(
            new Error(
              'AMQP 1.0 sendTimeout must be at most 2147483647 milliseconds',
            ),
          );
        });
      });
    });

    describe('having options without logger and serializer', () => {
      let optionsFixture: Amqp1Dot0TransportProviderOptions;

      beforeAll(() => {
        optionsFixture = {
          connections: [buildConnectionConfig('primary')],
        };
      });

      describe('when called', () => {
        beforeAll(() => {
          vitest
            .mocked(rhea.create_container)
            .mockReturnValueOnce(
              new FakeRheaContainer() as unknown as RheaContainer,
            );

          new Amqp1Dot0TransportProvider(optionsFixture);
        });

        afterAll(() => {
          vitest.clearAllMocks();
        });

        it('should call rhea.create_container()', () => {
          expect(rhea.create_container).toHaveBeenCalledExactlyOnceWith();
        });

        it('should instantiate a ConsoleLogger', () => {
          expect(ConsoleLogger).toHaveBeenCalledExactlyOnceWith();
        });

        it('should instantiate an Amqp1Dot0JsonSerializer', () => {
          expect(Amqp1Dot0JsonSerializer).toHaveBeenCalledExactlyOnceWith();
        });
      });
    });

    describe('having a logger', () => {
      let loggerMock: Mocked<Logger>;

      beforeAll(() => {
        loggerMock = buildLoggerMock();
      });

      describe('when called, and the rhea container emits errors', () => {
        beforeAll(() => {
          const { rheaContainer }: ProviderSetup = buildProvider({
            connections: [buildConnectionConfig('primary')],
            logger: loggerMock,
          });

          rheaContainer.emit('error', new Error('Unexpected frame'));
          rheaContainer.emit('sender_error', {
            sender: {
              error: { condition: 'amqp:not-allowed', description: 'Denied' },
            },
          });
          rheaContainer.emit('disconnected', {});
        });

        afterAll(() => {
          vitest.clearAllMocks();
        });

        it('should call logger.error()', () => {
          expect(loggerMock.error).toHaveBeenCalledTimes(2);
          expect(loggerMock.error).toHaveBeenNthCalledWith(
            1,
            'AMQP 1.0 transport error: Unexpected frame',
          );
          expect(loggerMock.error).toHaveBeenNthCalledWith(
            2,
            'AMQP 1.0 sender link failed: amqp:not-allowed - Denied',
          );
        });
      });
    });
  });

  describe('.getIdentifier', () => {
    describe('when called', () => {
      let result: unknown;

      beforeAll(() => {
        result = buildProvider({ connections: [] }).provider.getIdentifier();
      });

      afterAll(() => {
        vitest.clearAllMocks();
      });

      it('should return the AMQP 1.0 transport identifier', () => {
        expect(result).toBe(amqp1Dot0TransportIdentifier);
      });
    });
  });

  describe('.getConfigList', () => {
    describe('having a non initialized provider', () => {
      describe('when called', () => {
        let result: unknown;

        beforeAll(() => {
          result = Array.from(
            buildProvider({ connections: [] }).provider.getConfigList(),
          );
        });

        afterAll(() => {
          vitest.clearAllMocks();
        });

        it('should return an empty list', () => {
          expect(result).toStrictEqual([]);
        });
      });
    });

    describe('having a provider initialized with overlapping declarations', () => {
      let providerSetup: ProviderSetup;

      beforeAll(async () => {
        providerSetup = buildProvider({
          connections: [
            buildConnectionConfig('primary'),
            buildConnectionConfig('secondary'),
          ],
        });

        await providerSetup.provider.initialize(new Container(), [
          createOrderOnPrimary(),
          createOrderOnPrimary({ handler: AuditOrderHandler }),
          createOrderOnPrimary({ connectionIdentifier: 'secondary' }),
          buildCommandHandlerConfig({
            address: 'orders.cancel',
            commandType: CancelOrder,
            connectionIdentifier: 'primary',
            handler: CancelOrderHandler,
          }),
        ]);
      });

      afterAll(async () => {
        await providerSetup.provider.close();

        vitest.clearAllMocks();
      });

      describe('when called', () => {
        let result: unknown;

        beforeAll(() => {
          result = Array.from(providerSetup.provider.getConfigList());
        });

        it('should return one config per command type, connection and address', () => {
          const expected: TransportProviderConfig<Amqp1Dot0TransportParams>[] =
            [
              {
                params: {
                  address: 'orders.create',
                  connectionIdentifier: 'primary',
                },
                type: CreateOrder,
              },
              {
                params: {
                  address: 'orders.create',
                  connectionIdentifier: 'secondary',
                },
                type: CreateOrder,
              },
              {
                params: {
                  address: 'orders.cancel',
                  connectionIdentifier: 'primary',
                },
                type: CancelOrder,
              },
            ];

          expect(result).toStrictEqual(expected);
        });
      });
    });
  });

  describe('.initialize', () => {
    describe('having a declaration of another transport', () => {
      let configFixture: CommandHandlerConfig;

      beforeAll(() => {
        configFixture = {
          ...createOrderOnPrimary(),
          transport: { identifier: Symbol('another-transport') },
        };
      });

      describe('when called', () => {
        let providerSetup: ProviderSetup;
        let result: unknown;
        let sendResult: unknown;

        beforeAll(async () => {
          providerSetup = buildProvider({
            connections: [buildConnectionConfig('primary')],
          });

          result = await captureError(async () =>
            providerSetup.provider.initialize(new Container(), [configFixture]),
          );

          sendResult = await captureError(async () =>
            providerSetup.provider.send(new CreateOrder('order-1'), {
              address: 'orders.create',
              connectionIdentifier: 'primary',
            }),
          );
        });

        afterAll(() => {
          vitest.clearAllMocks();
        });

        it('should not connect', () => {
          expect(providerSetup.rheaContainer.connect).not.toHaveBeenCalled();
        });

        it('should throw an Error', () => {
          expect(result).toBeInstanceOf(Error);
          expect((result as Error).message).toBe(
            'Handler "CreateOrderHandler" for command "CreateOrder" is routed to the AMQP 1.0 transport without an AMQP 1.0 transport declaration',
          );
        });

        it('should leave the provider closed', () => {
          expect((sendResult as Error).message).toBe(
            'AMQP 1.0 transport is closed',
          );
        });
      });
    });

    describe('having a declaration with an unknown connection identifier', () => {
      describe('when called', () => {
        let result: unknown;

        beforeAll(async () => {
          const { provider }: ProviderSetup = buildProvider({
            connections: [buildConnectionConfig('primary')],
          });

          result = await captureError(async () =>
            provider.initialize(new Container(), [
              createOrderOnPrimary({ connectionIdentifier: 'missing' }),
            ]),
          );
        });

        afterAll(() => {
          vitest.clearAllMocks();
        });

        it('should throw an Error', () => {
          expect(result).toBeInstanceOf(Error);
          expect((result as Error).message).toBe(
            'AMQP 1.0 connection "missing" is not registered (declared by handler "CreateOrderHandler" for command "CreateOrder")',
          );
        });
      });
    });

    describe('having declarations on one of two connections', () => {
      describe('when called', () => {
        let providerSetup: ProviderSetup;
        let result: unknown;

        beforeAll(async () => {
          providerSetup = buildProvider({
            connections: [
              buildConnectionConfig('primary', {
                connectionOptions: {
                  host: 'primary',
                  port: 5672,
                  reconnect: { initialDelay: 10, limit: 4, maxDelay: 20 },
                },
              }),
              buildConnectionConfig('secondary'),
            ],
          });

          result = await providerSetup.provider.initialize(new Container(), [
            createOrderOnPrimary(),
          ]);
        });

        afterAll(async () => {
          await providerSetup.provider.close();

          vitest.clearAllMocks();
        });

        it('should connect only the referenced connection without automatic reconnection', () => {
          expect(
            providerSetup.rheaContainer.connect,
          ).toHaveBeenCalledExactlyOnceWith({
            host: 'primary',
            hostname: 'primary',
            initial_reconnect_delay: 10,
            max_reconnect_delay: 20,
            port: 5672,
            reconnect: false,
            reconnect_limit: 4,
          });
        });

        it('should restore the configured reconnection once open', () => {
          expect(
            providerSetup.rheaContainer.getConnection('primary').set_reconnect,
          ).toHaveBeenCalledExactlyOnceWith(true);
        });

        it('should return undefined', () => {
          expect(result).toBeUndefined();
        });
      });
    });

    describe('having a connection without reconnect option', () => {
      describe('when called', () => {
        let providerSetup: ProviderSetup;

        beforeAll(async () => {
          providerSetup = buildProvider({
            connections: [buildConnectionConfig('primary')],
          });

          await providerSetup.provider.initialize(new Container(), [
            createOrderOnPrimary(),
          ]);
        });

        afterAll(async () => {
          await providerSetup.provider.close();

          vitest.clearAllMocks();
        });

        it('should enable rhea reconnection once open', () => {
          expect(
            providerSetup.rheaContainer.getConnection('primary').set_reconnect,
          ).toHaveBeenCalledExactlyOnceWith(true);
        });
      });
    });

    describe('having an initialized provider', () => {
      describe('when called', () => {
        let providerSetup: ProviderSetup;
        let result: unknown;

        beforeAll(async () => {
          providerSetup = buildProvider({
            connections: [buildConnectionConfig('primary')],
          });

          await providerSetup.provider.initialize(new Container(), []);

          result = await captureError(async () =>
            providerSetup.provider.initialize(new Container(), []),
          );
        });

        afterAll(async () => {
          await providerSetup.provider.close();

          vitest.clearAllMocks();
        });

        it('should throw an Error', () => {
          expect(result).toBeInstanceOf(Error);
          expect((result as Error).message).toBe(
            'AMQP 1.0 transport is already initialized',
          );
        });
      });
    });

    describe('having a closed provider', () => {
      describe('when called', () => {
        let result: unknown;

        beforeAll(async () => {
          const { provider }: ProviderSetup = buildProvider({
            connections: [buildConnectionConfig('primary')],
          });

          await provider.close();

          result = await captureError(async () =>
            provider.initialize(new Container(), []),
          );
        });

        afterAll(() => {
          vitest.clearAllMocks();
        });

        it('should throw an Error', () => {
          expect(result).toBeInstanceOf(Error);
          expect((result as Error).message).toBe(
            'AMQP 1.0 transport is closed',
          );
        });
      });
    });

    describe('having an unreachable peer', () => {
      describe('when called', () => {
        let providerSetup: ProviderSetup;
        let result: unknown;
        let sendResult: unknown;

        beforeAll(async () => {
          providerSetup = buildProvider({
            connections: [buildConnectionConfig('primary')],
          });

          providerSetup.rheaContainer.connectionBehaviors.set(
            'primary',
            'fail',
          );

          result = await captureError(async () =>
            providerSetup.provider.initialize(new Container(), [
              createOrderOnPrimary(),
            ]),
          );

          sendResult = await captureError(async () =>
            providerSetup.provider.send(new CreateOrder('order-1'), {
              address: 'orders.create',
              connectionIdentifier: 'primary',
            }),
          );
        });

        afterAll(() => {
          vitest.clearAllMocks();
        });

        it('should close the connection', () => {
          expect(
            providerSetup.rheaContainer.getConnection('primary').close,
          ).toHaveBeenCalledExactlyOnceWith();
        });

        it('should only disable reconnection', () => {
          expect(
            providerSetup.rheaContainer.getConnection('primary').set_reconnect,
          ).toHaveBeenCalledExactlyOnceWith(false);
        });

        it('should throw an Error', () => {
          expect(result).toBeInstanceOf(Error);
          expect((result as Error).message).toBe(
            'Failed to open AMQP 1.0 connection "primary" (disconnected): connect ECONNREFUSED',
          );
        });

        it('should leave the provider closed', () => {
          expect((sendResult as Error).message).toBe(
            'AMQP 1.0 transport is closed',
          );
        });
      });
    });

    describe.each<[string, boolean | undefined, boolean | undefined, number]>([
      ['no listener flags', undefined, undefined, 0],
      ['listeners enabled globally', true, undefined, 1],
      [
        'listeners enabled globally and disabled on the connection',
        true,
        false,
        0,
      ],
      ['listeners enabled on the connection', undefined, true, 1],
    ])(
      'having %s',
      (
        _: string,
        globalListenersEnabled: boolean | undefined,
        connectionListenersEnabled: boolean | undefined,
        expectedReceivers: number,
      ) => {
        describe('when called', () => {
          let providerSetup: ProviderSetup;

          beforeAll(async () => {
            providerSetup = buildProvider({
              connections: [
                buildConnectionConfig('primary', {
                  ...(connectionListenersEnabled === undefined
                    ? {}
                    : { listenersEnabled: connectionListenersEnabled }),
                }),
              ],
              ...(globalListenersEnabled === undefined
                ? {}
                : { listenersEnabled: globalListenersEnabled }),
            });

            await providerSetup.provider.initialize(new Container(), [
              createOrderOnPrimary(),
            ]);
          });

          afterAll(async () => {
            await providerSetup.provider.close();

            vitest.clearAllMocks();
          });

          it(`should open ${expectedReceivers.toString()} receivers`, () => {
            expect(
              providerSetup.rheaContainer.getConnection('primary')
                .open_receiver,
            ).toHaveBeenCalledTimes(expectedReceivers);
          });
        });
      },
    );

    describe('having listeners and several commands sharing an address', () => {
      describe('when called', () => {
        let providerSetup: ProviderSetup;

        beforeAll(async () => {
          providerSetup = buildProvider({
            connections: [
              buildConnectionConfig('primary', {
                listenersEnabled: true,
                receiverOptions: {
                  creditWindow: 5,
                  source: { durable: 'configuration' },
                },
              }),
            ],
          });

          await providerSetup.provider.initialize(new Container(), [
            createOrderOnPrimary({ address: 'orders.shared' }),
            buildCommandHandlerConfig({
              address: 'orders.shared',
              commandType: CancelOrder,
              connectionIdentifier: 'primary',
              handler: CancelOrderHandler,
            }),
          ]);
        });

        afterAll(async () => {
          await providerSetup.provider.close();

          vitest.clearAllMocks();
        });

        it('should open a single receiver with the merged receiver options and manual credit', () => {
          expect(
            providerSetup.rheaContainer.getConnection('primary').open_receiver,
          ).toHaveBeenCalledExactlyOnceWith({
            autoaccept: false,
            autosettle: true,
            credit_window: 0,
            source: {
              address: 'orders.shared',
              durable: 1,
            },
          });
        });

        it('should grant the configured credit window once attached', () => {
          expect(
            providerSetup.rheaContainer.getConnection('primary').receivers[0]
              ?.add_credit,
          ).toHaveBeenCalledExactlyOnceWith(5);
        });
      });
    });

    describe('having listeners without credit window', () => {
      describe('when called', () => {
        let providerSetup: ProviderSetup;

        beforeAll(async () => {
          providerSetup = buildProvider({
            connections: [
              buildConnectionConfig('primary', { listenersEnabled: true }),
            ],
          });

          await providerSetup.provider.initialize(new Container(), [
            createOrderOnPrimary(),
          ]);
        });

        afterAll(async () => {
          await providerSetup.provider.close();

          vitest.clearAllMocks();
        });

        it('should grant the default credit window once attached', () => {
          expect(
            providerSetup.rheaContainer.getConnection('primary').receivers[0]
              ?.add_credit,
          ).toHaveBeenCalledExactlyOnceWith(100);
        });
      });
    });

    describe('having listeners and a peer refusing the address', () => {
      describe('when called', () => {
        let providerSetup: ProviderSetup;
        let result: unknown;

        beforeAll(async () => {
          providerSetup = buildProvider({
            connections: [
              buildConnectionConfig('primary', { listenersEnabled: true }),
            ],
          });

          providerSetup.rheaContainer.linkBehaviors.set(
            'orders.create',
            'refuse',
          );

          result = await captureError(async () =>
            providerSetup.provider.initialize(new Container(), [
              createOrderOnPrimary(),
            ]),
          );
        });

        afterAll(() => {
          vitest.clearAllMocks();
        });

        it('should close the receiver and the connection', () => {
          const connection: ReturnType<FakeRheaContainer['getConnection']> =
            providerSetup.rheaContainer.getConnection('primary');

          expect(connection.receivers[0]?.close).toHaveBeenCalledTimes(1);
          expect(connection.close).toHaveBeenCalledTimes(1);
        });

        it('should throw an Error', () => {
          expect(result).toBeInstanceOf(Error);
          expect((result as Error).message).toBe(
            'Failed to open AMQP 1.0 receiver for address "orders.create" on connection "primary" (receiver_error): amqp:not-found - Address "orders.create" is refused',
          );
        });
      });
    });

    describe('having listeners and close() called once the last receiver attaches', () => {
      describe('when called', () => {
        let providerSetup: ProviderSetup;
        let result: unknown;
        let sendResult: unknown;

        beforeAll(async () => {
          providerSetup = buildProvider({
            connections: [
              buildConnectionConfig('primary', { listenersEnabled: true }),
            ],
          });

          let closePromise: Promise<void> | undefined;

          providerSetup.rheaContainer.onLinkAttached = (): void => {
            closePromise = providerSetup.provider.close();
          };

          result = await captureError(async () =>
            providerSetup.provider.initialize(new Container(), [
              createOrderOnPrimary(),
            ]),
          );

          await closePromise;

          sendResult = await captureError(async () =>
            providerSetup.provider.send(new CreateOrder('order-1'), {
              address: 'orders.create',
              connectionIdentifier: 'primary',
            }),
          );
        });

        afterAll(() => {
          vitest.clearAllMocks();
        });

        it('should throw an Error', () => {
          expect(result).toStrictEqual(
            new Error('AMQP 1.0 transport is closed'),
          );
        });

        it('should leave the provider closed', () => {
          expect(sendResult).toStrictEqual(
            new Error('AMQP 1.0 transport is closed'),
          );
        });
      });
    });

    describe('having an initialized provider with an open connection', () => {
      let loggerMock: Mocked<Logger>;
      let providerSetup: ProviderSetup;

      beforeAll(async () => {
        loggerMock = buildLoggerMock();
        providerSetup = buildProvider({
          connections: [
            buildConnectionConfig('primary', { listenersEnabled: true }),
          ],
          logger: loggerMock,
        });

        await providerSetup.provider.initialize(new Container(), [
          createOrderOnPrimary(),
        ]);
      });

      afterAll(async () => {
        await providerSetup.provider.close();

        vitest.clearAllMocks();
      });

      describe('when the connection emits connection_error and disconnected events', () => {
        beforeAll(() => {
          const connection: ReturnType<FakeRheaContainer['getConnection']> =
            providerSetup.rheaContainer.getConnection('primary');

          connection.error = {
            condition: 'amqp:connection:forced',
            description: 'Broker shutdown',
          };

          connection.emit('connection_error', { connection });
          connection.emit('disconnected', { connection, reconnecting: true });
        });

        afterAll(() => {
          loggerMock.error.mockClear();
          loggerMock.warn.mockClear();
        });

        it('should call logger.error()', () => {
          expect(loggerMock.error).toHaveBeenCalledExactlyOnceWith(
            'AMQP 1.0 connection "primary" failed: amqp:connection:forced - Broker shutdown',
          );
        });

        it('should call logger.warn()', () => {
          expect(loggerMock.warn).toHaveBeenCalledExactlyOnceWith(
            'AMQP 1.0 connection "primary" disconnected: amqp:connection:forced - Broker shutdown, reconnecting',
          );
        });
      });

      describe('when the peer detaches the receiver with an error', () => {
        beforeAll(() => {
          providerSetup.rheaContainer
            .getConnection('primary')
            .receivers[0]?.closeRemotely({
              condition: 'amqp:resource-deleted',
              description: 'Queue deleted',
            });
        });

        afterAll(() => {
          loggerMock.error.mockClear();
        });

        it('should call logger.error() once', () => {
          expect(loggerMock.error).toHaveBeenCalledExactlyOnceWith(
            'AMQP 1.0 receiver for address "orders.create" on connection "primary" was closed by the peer: amqp:resource-deleted - Queue deleted',
          );
        });
      });
    });

    describe('having listeners and a message received before initialization completes', () => {
      describe('when called', () => {
        let deliveryFixture: FakeRheaIncomingDelivery | undefined;
        let handlerMock: Mocked<Amqp1Dot0CommandHandler>;
        let deserializeCallsAfterInitialize: number;
        let providerSetup: ProviderSetup;

        beforeAll(async () => {
          handlerMock = buildHandlerMock();
          handlerMock.deserialize.mockReturnValueOnce(
            new CreateOrder('order-1'),
          );

          const container: Container = new Container();

          container.bind(CreateOrderHandler).toConstantValue(handlerMock);

          providerSetup = buildProvider({
            connections: [
              buildConnectionConfig('primary', { listenersEnabled: true }),
            ],
          });

          providerSetup.rheaContainer.onLinkAttached = (
            link: FakeRheaLink,
          ): void => {
            deliveryFixture = link.receive({ body: 'early' });
          };

          await providerSetup.provider.initialize(container, [
            createOrderOnPrimary(),
          ]);

          await flushMicrotasks();

          deserializeCallsAfterInitialize =
            handlerMock.deserialize.mock.calls.length;

          await deliveryFixture?.settled;
        });

        afterAll(async () => {
          await providerSetup.provider.close();

          vitest.clearAllMocks();
        });

        it('should not dispatch within the microtasks following initialize()', () => {
          expect(deserializeCallsAfterInitialize).toBe(0);
        });

        it('should dispatch the message afterwards', () => {
          expect(handlerMock.deserialize).toHaveBeenCalledExactlyOnceWith({
            body: { kind: 'value', value: 'early' },
          });
          expect(deliveryFixture?.accept).toHaveBeenCalledTimes(1);
        });
      });
    });

    describe('having a receiver session that ends as the link attaches', () => {
      let providerSetup: ProviderSetup;
      let result: unknown;
      let sendResult: unknown;

      beforeAll(async () => {
        providerSetup = buildProvider({
          connections: [
            buildConnectionConfig('primary', { listenersEnabled: true }),
          ],
        });

        providerSetup.rheaContainer.onLinkAttached = (
          link: FakeRheaLink,
        ): void => {
          link.session.emit('session_close', {
            connection: link.connection,
            receiver: link,
          });
        };

        result = await captureError(async () =>
          providerSetup.provider.initialize(new Container(), [
            createOrderOnPrimary(),
          ]),
        );
        sendResult = await captureError(async () =>
          providerSetup.provider.send(new CreateOrder('order-1'), {
            address: 'orders.create',
            connectionIdentifier: 'primary',
          }),
        );
      });

      afterAll(() => {
        vitest.clearAllMocks();
      });

      it('should fail initialization and close the transport', () => {
        expect((result as Error).message).toBe(
          'Failed to open AMQP 1.0 receiver for address "orders.create" on connection "primary" (session ended)',
        );
        expect(sendResult).toStrictEqual(
          new Error('AMQP 1.0 transport is closed'),
        );
      });
    });
  });

  describe('.initialize (message dispatch)', () => {
    interface ListenerSetup extends ProviderSetup {
      readonly receiver: FakeRheaLink;
    }

    async function initializeListener(input: {
      configList: CommandHandlerConfig[];
      container: Container;
      options?: Partial<Amqp1Dot0TransportProviderOptions>;
    }): Promise<ListenerSetup> {
      const providerSetup: ProviderSetup = buildProvider({
        connections: [buildConnectionConfig('primary')],
        listenersEnabled: true,
        ...input.options,
      });

      await providerSetup.provider.initialize(
        input.container,
        input.configList,
      );

      await flushImmediates();

      const receiver: FakeRheaLink | undefined =
        providerSetup.rheaContainer.getConnection('primary').receivers[0];

      if (receiver === undefined) {
        throw new Error('Expected a receiver');
      }

      return { ...providerSetup, receiver };
    }

    describe('having a single handler', () => {
      let handlerMock: Mocked<Amqp1Dot0CommandHandler>;
      let listenerSetup: ListenerSetup;

      beforeAll(async () => {
        handlerMock = buildHandlerMock();

        const container: Container = new Container();

        container.bind(CreateOrderHandler).toConstantValue(handlerMock);

        listenerSetup = await initializeListener({
          configList: [createOrderOnPrimary()],
          container,
        });
      });

      afterAll(async () => {
        await listenerSetup.provider.close();

        vitest.clearAllMocks();
      });

      describe('when a message is received, and the handler deserializes and handles it', () => {
        let commandFixture: CreateOrder;
        let delivery: FakeRheaIncomingDelivery;
        let messageFixture: Message;

        beforeAll(async () => {
          commandFixture = new CreateOrder('order-1');
          messageFixture = {
            application_properties: { tenant: 'acme' },
            body: 'order-1',
            subject: 'CreateOrder',
          };

          handlerMock.deserialize.mockReturnValueOnce(commandFixture);

          delivery = listenerSetup.receiver.receive(messageFixture);

          await delivery.settled;
        });

        afterAll(() => {
          handlerMock.deserialize.mockClear();
          handlerMock.handle.mockClear();
        });

        it('should call handler.deserialize() with the message', () => {
          expect(handlerMock.deserialize).toHaveBeenCalledExactlyOnceWith({
            applicationProperties: { tenant: 'acme' },
            body: { kind: 'value', value: 'order-1' },
            properties: { subject: 'CreateOrder' },
          });
        });

        it('should call handler.handle() with the command', () => {
          expect(handlerMock.handle).toHaveBeenCalledExactlyOnceWith(
            commandFixture,
          );
        });

        it('should accept the delivery', () => {
          expect(delivery.accept).toHaveBeenCalledExactlyOnceWith();
        });
      });

      describe('when a message is received, and the handler deserializes and handles it asynchronously', () => {
        let commandFixture: CreateOrder;
        let delivery: FakeRheaIncomingDelivery;

        beforeAll(async () => {
          commandFixture = new CreateOrder('order-2');

          handlerMock.deserialize.mockResolvedValueOnce(commandFixture);
          handlerMock.handle.mockResolvedValueOnce(undefined);

          delivery = listenerSetup.receiver.receive({ body: 'order-2' });

          await delivery.settled;
        });

        afterAll(() => {
          handlerMock.deserialize.mockClear();
          handlerMock.handle.mockClear();
        });

        it('should call handler.handle() with the awaited command', () => {
          expect(handlerMock.handle).toHaveBeenCalledExactlyOnceWith(
            commandFixture,
          );
        });

        it('should accept the delivery', () => {
          expect(delivery.accept).toHaveBeenCalledExactlyOnceWith();
        });
      });

      describe('when a message is received, and the handler skips it', () => {
        let delivery: FakeRheaIncomingDelivery;

        beforeAll(async () => {
          handlerMock.deserialize.mockReturnValueOnce(undefined);

          delivery = listenerSetup.receiver.receive({ body: 'unknown' });

          await delivery.settled;
        });

        afterAll(() => {
          handlerMock.deserialize.mockClear();
        });

        it('should not call handler.handle()', () => {
          expect(handlerMock.handle).not.toHaveBeenCalled();
        });

        it('should reject the delivery as not found', () => {
          expect(delivery.reject).toHaveBeenCalledExactlyOnceWith({
            condition: 'amqp:not-found',
            description:
              'No handler accepted the message received on address "orders.create"',
          });
        });
      });
    });

    describe('having a handler still processing a message', () => {
      let handlerMock: Mocked<Amqp1Dot0CommandHandler>;
      let listenerSetup: ListenerSetup;
      let releaseHandler: () => void;

      beforeAll(async () => {
        handlerMock = buildHandlerMock();

        const container: Container = new Container();

        container.bind(CreateOrderHandler).toConstantValue(handlerMock);

        listenerSetup = await initializeListener({
          configList: [createOrderOnPrimary()],
          container,
        });
      });

      afterAll(async () => {
        await listenerSetup.provider.close();

        vitest.clearAllMocks();
      });

      describe('when the receiver is attached again, and the message is settled afterwards', () => {
        let creditsOnAttach: unknown[][];
        let delivery: FakeRheaIncomingDelivery;

        beforeAll(async () => {
          handlerMock.deserialize.mockReturnValueOnce(
            new CreateOrder('order-1'),
          );
          handlerMock.handle.mockReturnValueOnce(
            new Promise<void>((resolve: () => void): void => {
              releaseHandler = resolve;
            }),
          );

          delivery = listenerSetup.receiver.receive({ body: 'order-1' });

          await waitUntil(
            (): boolean => handlerMock.handle.mock.calls.length === 1,
          );

          listenerSetup.receiver.add_credit.mockClear();
          listenerSetup.receiver.emit('receiver_open', {
            receiver: listenerSetup.receiver,
          });

          creditsOnAttach = [...listenerSetup.receiver.add_credit.mock.calls];

          listenerSetup.receiver.add_credit.mockClear();

          releaseHandler();

          await delivery.settled;
          await flushMicrotasks();
        });

        it('should grant the credit window minus the messages in flight on attach', () => {
          expect(creditsOnAttach).toStrictEqual([[99]]);
        });

        it('should return one credit once the message is settled', () => {
          expect(
            listenerSetup.receiver.add_credit,
          ).toHaveBeenCalledExactlyOnceWith(1);
        });
      });

      describe('when a message is settled while the receiver is detached', () => {
        beforeAll(async () => {
          handlerMock.deserialize.mockReturnValueOnce(
            new CreateOrder('order-2'),
          );
          listenerSetup.receiver.is_open.mockReturnValueOnce(false);
          listenerSetup.receiver.add_credit.mockClear();

          await listenerSetup.receiver.receive({ body: 'order-2' }).settled;
          await flushMicrotasks();
        });

        it('should not return credit', () => {
          expect(listenerSetup.receiver.add_credit).not.toHaveBeenCalled();
        });
      });
    });

    describe('having a provider being closed', () => {
      let handlerMock: Mocked<Amqp1Dot0CommandHandler>;
      let listenerSetup: ListenerSetup;

      beforeAll(async () => {
        handlerMock = buildHandlerMock();

        const container: Container = new Container();

        container.bind(CreateOrderHandler).toConstantValue(handlerMock);

        listenerSetup = await initializeListener({
          configList: [createOrderOnPrimary()],
          container,
        });
      });

      afterAll(() => {
        vitest.clearAllMocks();
      });

      describe('when a message is received, and the receiver is attached again', () => {
        let delivery: FakeRheaIncomingDelivery;

        beforeAll(async () => {
          const closePromise: Promise<void> = listenerSetup.provider.close();

          listenerSetup.receiver.add_credit.mockClear();

          delivery = listenerSetup.receiver.receive({ body: 'order-1' });

          listenerSetup.receiver.emit('receiver_open', {
            receiver: listenerSetup.receiver,
          });

          await closePromise;
          await flushImmediates();
        });

        it('should not call any handler', () => {
          expect(handlerMock.deserialize).not.toHaveBeenCalled();
          expect(handlerMock.handle).not.toHaveBeenCalled();
        });

        it('should leave the message unsettled', () => {
          expect(delivery.accept).not.toHaveBeenCalled();
          expect(delivery.modified).not.toHaveBeenCalled();
          expect(delivery.reject).not.toHaveBeenCalled();
          expect(delivery.release).not.toHaveBeenCalled();
        });

        it('should not grant credit', () => {
          expect(listenerSetup.receiver.add_credit).not.toHaveBeenCalled();
        });
      });
    });

    describe('having several command types sharing an address', () => {
      let cancelHandlerMock: Mocked<Amqp1Dot0CommandHandler>;
      let createHandlerMock: Mocked<Amqp1Dot0CommandHandler>;
      let listenerSetup: ListenerSetup;

      beforeAll(async () => {
        cancelHandlerMock = buildHandlerMock();
        createHandlerMock = buildHandlerMock();

        const container: Container = new Container();

        container.bind(CreateOrderHandler).toConstantValue(createHandlerMock);
        container.bind(CancelOrderHandler).toConstantValue(cancelHandlerMock);

        listenerSetup = await initializeListener({
          configList: [
            createOrderOnPrimary({ address: 'orders.shared' }),
            buildCommandHandlerConfig({
              address: 'orders.shared',
              commandType: CancelOrder,
              connectionIdentifier: 'primary',
              handler: CancelOrderHandler,
            }),
          ],
          container,
        });
      });

      afterAll(async () => {
        await listenerSetup.provider.close();

        vitest.clearAllMocks();
      });

      describe('when a message is received, and only one handler accepts it', () => {
        let commandFixture: CancelOrder;
        let delivery: FakeRheaIncomingDelivery;
        let deserializeOrder: string[];

        beforeAll(async () => {
          commandFixture = new CancelOrder('order-1');

          deserializeOrder = [];

          createHandlerMock.deserialize.mockImplementationOnce(
            (): undefined => {
              deserializeOrder.push('create');

              return undefined;
            },
          );
          cancelHandlerMock.deserialize.mockImplementationOnce(
            (): CancelOrder => {
              deserializeOrder.push('cancel');

              return commandFixture;
            },
          );

          delivery = listenerSetup.receiver.receive({ body: 'cancel' });

          await delivery.settled;
        });

        it('should call every handler.deserialize() in declaration order', () => {
          expect(deserializeOrder).toStrictEqual(['create', 'cancel']);
        });

        it('should only call handle() on the accepting handler', () => {
          expect(createHandlerMock.handle).not.toHaveBeenCalled();
          expect(cancelHandlerMock.handle).toHaveBeenCalledExactlyOnceWith(
            commandFixture,
          );
        });

        it('should accept the delivery', () => {
          expect(delivery.accept).toHaveBeenCalledExactlyOnceWith();
        });
      });
    });

    describe('having the same handler declared twice on one address', () => {
      let handlerMock: Mocked<Amqp1Dot0CommandHandler>;
      let listenerSetup: ListenerSetup;

      beforeAll(async () => {
        handlerMock = buildHandlerMock();

        const container: Container = new Container();

        container.bind(CreateOrderHandler).toConstantValue(handlerMock);

        listenerSetup = await initializeListener({
          configList: [
            createOrderOnPrimary(),
            buildCommandHandlerConfig({
              address: 'orders.create',
              commandType: CancelOrder,
              connectionIdentifier: 'primary',
              handler: CreateOrderHandler,
            }),
          ],
          container,
        });
      });

      afterAll(async () => {
        await listenerSetup.provider.close();

        vitest.clearAllMocks();
      });

      describe('when a message is received', () => {
        let delivery: FakeRheaIncomingDelivery;

        beforeAll(async () => {
          handlerMock.deserialize.mockReturnValue(new CreateOrder('order-1'));

          delivery = listenerSetup.receiver.receive({ body: 'order-1' });

          await delivery.settled;
        });

        it('should dispatch the message once per declaration', () => {
          expect(handlerMock.deserialize).toHaveBeenCalledTimes(2);
          expect(handlerMock.handle).toHaveBeenCalledTimes(2);
        });

        it('should accept the delivery', () => {
          expect(delivery.accept).toHaveBeenCalledExactlyOnceWith();
        });
      });
    });

    describe('having a handler declared with a service identifier', () => {
      let handlerMock: Mocked<Amqp1Dot0CommandHandler>;
      let listenerSetup: ListenerSetup;

      beforeAll(async () => {
        handlerMock = buildHandlerMock();

        const serviceIdentifierFixture: symbol = Symbol('CreateOrderHandler');
        const container: Container = new Container();

        container.bind(serviceIdentifierFixture).toConstantValue(handlerMock);

        listenerSetup = await initializeListener({
          configList: [
            createOrderOnPrimary({
              serviceIdentifier: serviceIdentifierFixture,
            }),
          ],
          container,
        });
      });

      afterAll(async () => {
        await listenerSetup.provider.close();

        vitest.clearAllMocks();
      });

      describe('when a message is received', () => {
        let delivery: FakeRheaIncomingDelivery;

        beforeAll(async () => {
          handlerMock.deserialize.mockReturnValueOnce(
            new CreateOrder('order-1'),
          );

          delivery = listenerSetup.receiver.receive({ body: 'order-1' });

          await delivery.settled;
        });

        it('should resolve the handler from the service identifier', () => {
          expect(handlerMock.handle).toHaveBeenCalledTimes(1);
          expect(delivery.accept).toHaveBeenCalledTimes(1);
        });
      });
    });

    describe('having a handler without deserialize', () => {
      let loggerMock: Mocked<Logger>;
      let listenerSetup: ListenerSetup;

      beforeAll(async () => {
        loggerMock = buildLoggerMock();

        const container: Container = new Container();

        container
          .bind(CreateOrderHandler)
          .toConstantValue({ handle: vitest.fn() });

        listenerSetup = await initializeListener({
          configList: [createOrderOnPrimary()],
          container,
          options: { logger: loggerMock },
        });
      });

      afterAll(async () => {
        await listenerSetup.provider.close();

        vitest.clearAllMocks();
      });

      describe('when a message is received', () => {
        let delivery: FakeRheaIncomingDelivery;

        beforeAll(async () => {
          delivery = listenerSetup.receiver.receive({ body: 'order-1' });

          await delivery.settled;
        });

        it('should call logger.error()', () => {
          expect(loggerMock.error).toHaveBeenCalledExactlyOnceWith(
            'AMQP 1.0 handler failed for a message received on address "orders.create" (connection "primary"): Handler "CreateOrderHandler" must implement Amqp1Dot0CommandHandler (deserialize and handle) to receive AMQP 1.0 messages',
          );
        });

        it('should reject the delivery without the error details', () => {
          expect(delivery.reject).toHaveBeenCalledExactlyOnceWith({
            condition: 'amqp:internal-error',
            description: 'The handler failed to process the message',
          });
        });
      });
    });

    describe.each<
      [
        string,
        Amqp1Dot0TransportProviderOptions['handlerErrorOutcome'],
        keyof Pick<FakeRheaIncomingDelivery, 'modified' | 'reject' | 'release'>,
        unknown[],
      ]
    >([
      [
        'the default handler error outcome',
        undefined,
        'reject',
        [
          {
            condition: 'amqp:internal-error',
            description: 'The handler failed to process the message',
          },
        ],
      ],
      ['the release handler error outcome', 'release', 'release', []],
      [
        'the modified handler error outcome',
        'modified',
        'modified',
        [{ delivery_failed: true }],
      ],
    ])(
      'having %s',
      (
        _: string,
        handlerErrorOutcome: Amqp1Dot0TransportProviderOptions['handlerErrorOutcome'],
        expectedSettlement: 'modified' | 'reject' | 'release',
        expectedArgs: unknown[],
      ) => {
        let handlerMock: Mocked<Amqp1Dot0CommandHandler>;
        let listenerSetup: ListenerSetup;

        beforeAll(async () => {
          handlerMock = buildHandlerMock();

          const container: Container = new Container();

          container.bind(CreateOrderHandler).toConstantValue(handlerMock);

          listenerSetup = await initializeListener({
            configList: [createOrderOnPrimary()],
            container,
            options:
              handlerErrorOutcome === undefined ? {} : { handlerErrorOutcome },
          });
        });

        afterAll(async () => {
          await listenerSetup.provider.close();

          vitest.clearAllMocks();
        });

        describe('when a message is received, and handler.handle() throws', () => {
          let delivery: FakeRheaIncomingDelivery;

          beforeAll(async () => {
            handlerMock.deserialize.mockReturnValueOnce(
              new CreateOrder('order-1'),
            );
            handlerMock.handle.mockImplementationOnce((): never => {
              throw new Error('Inventory is unavailable');
            });

            delivery = listenerSetup.receiver.receive({ body: 'order-1' });

            await delivery.settled;
          });

          afterAll(() => {
            handlerMock.deserialize.mockClear();
            handlerMock.handle.mockClear();
          });

          it(`should ${expectedSettlement} the delivery`, () => {
            expect(
              delivery[expectedSettlement],
            ).toHaveBeenCalledExactlyOnceWith(...expectedArgs);
            expect(delivery.accept).not.toHaveBeenCalled();
          });
        });

        describe('when a message is received, and handler.deserialize() rejects', () => {
          let delivery: FakeRheaIncomingDelivery;

          beforeAll(async () => {
            handlerMock.deserialize.mockRejectedValueOnce(
              new Error('Inventory is unavailable'),
            );

            delivery = listenerSetup.receiver.receive({ body: 'order-1' });

            await delivery.settled;
          });

          afterAll(() => {
            handlerMock.deserialize.mockClear();
          });

          it('should not call handler.handle()', () => {
            expect(handlerMock.handle).not.toHaveBeenCalled();
          });

          it(`should ${expectedSettlement} the delivery`, () => {
            expect(
              delivery[expectedSettlement],
            ).toHaveBeenCalledExactlyOnceWith(...expectedArgs);
          });
        });
      },
    );

    describe('having a logger', () => {
      let handlerMock: Mocked<Amqp1Dot0CommandHandler>;
      let loggerMock: Mocked<Logger>;
      let listenerSetup: ListenerSetup;

      beforeAll(async () => {
        handlerMock = buildHandlerMock();
        loggerMock = buildLoggerMock();

        const container: Container = new Container();

        container.bind(CreateOrderHandler).toConstantValue(handlerMock);

        listenerSetup = await initializeListener({
          configList: [createOrderOnPrimary()],
          container,
          options: { logger: loggerMock },
        });
      });

      afterAll(async () => {
        await listenerSetup.provider.close();

        vitest.clearAllMocks();
      });

      describe('when a message is received, and every handler skips it', () => {
        beforeAll(async () => {
          handlerMock.deserialize.mockReturnValueOnce(undefined);

          await listenerSetup.receiver.receive({ body: 'unknown' }).settled;
        });

        afterAll(() => {
          loggerMock.error.mockClear();
        });

        it('should call logger.error()', () => {
          expect(loggerMock.error).toHaveBeenCalledExactlyOnceWith(
            'No handler accepted the message received on address "orders.create" (connection "primary")',
          );
        });
      });

      describe('when a message is received, and the settlement throws', () => {
        beforeAll(async () => {
          handlerMock.deserialize.mockReturnValueOnce(
            new CreateOrder('order-1'),
          );

          const delivery: FakeRheaIncomingDelivery =
            listenerSetup.receiver.receive({ body: 'order-1' });

          delivery.accept.mockImplementationOnce((): never => {
            throw new Error('Link detached');
          });

          await waitUntil(
            (): boolean => delivery.accept.mock.calls.length === 1,
          );
        });

        afterAll(() => {
          loggerMock.error.mockClear();
        });

        it('should call logger.error()', () => {
          expect(loggerMock.error).toHaveBeenCalledExactlyOnceWith(
            'Failed to settle an AMQP 1.0 message: Link detached',
          );
        });
      });
    });
  });

  describe('.send', () => {
    let commandFixture: CreateOrder;
    let paramsFixture: Amqp1Dot0TransportParams;

    beforeAll(() => {
      commandFixture = new CreateOrder('order-1');
      paramsFixture = {
        address: 'orders.create',
        connectionIdentifier: 'primary',
      };
    });

    async function initializeSender(
      options: Partial<Amqp1Dot0TransportProviderOptions> = {},
    ): Promise<ProviderSetup> {
      const providerSetup: ProviderSetup = buildProvider({
        connections: [buildConnectionConfig('primary')],
        ...options,
      });

      await providerSetup.provider.initialize(new Container(), [
        createOrderOnPrimary(),
      ]);

      return providerSetup;
    }

    async function waitForSentMessages(
      providerSetup: ProviderSetup,
      count: number,
    ): Promise<FakeRheaLink> {
      let sender: FakeRheaLink | undefined;

      await waitUntil((): boolean => {
        sender = providerSetup.rheaContainer
          .getConnection('primary')
          .senders.at(-1);

        return sender?.sent.length === count;
      });

      return sender as FakeRheaLink;
    }

    describe('having a non initialized provider', () => {
      describe('when called', () => {
        let result: unknown;

        beforeAll(async () => {
          const { provider }: ProviderSetup = buildProvider({
            connections: [buildConnectionConfig('primary')],
          });

          result = await captureError(async () =>
            provider.send(commandFixture, paramsFixture),
          );
        });

        afterAll(() => {
          vitest.clearAllMocks();
        });

        it('should throw an Error', () => {
          expect((result as Error).message).toBe(
            'AMQP 1.0 transport is not initialized',
          );
        });
      });
    });

    describe('having params with an unregistered connection', () => {
      describe('when called', () => {
        let providerSetup: ProviderSetup;
        let result: unknown;

        beforeAll(async () => {
          providerSetup = await initializeSender();

          result = await captureError(async () =>
            providerSetup.provider.send(commandFixture, {
              address: 'orders.create',
              connectionIdentifier: 'missing',
            }),
          );
        });

        afterAll(async () => {
          await providerSetup.provider.close();

          vitest.clearAllMocks();
        });

        it('should throw an Error', () => {
          expect((result as Error).message).toBe(
            'AMQP 1.0 connection "missing" is not registered',
          );
        });
      });
    });

    describe('having params with a connection that was not opened', () => {
      describe('when called', () => {
        let providerSetup: ProviderSetup;
        let result: unknown;

        beforeAll(async () => {
          providerSetup = await initializeSender({
            connections: [
              buildConnectionConfig('primary'),
              buildConnectionConfig('secondary'),
            ],
          });

          result = await captureError(async () =>
            providerSetup.provider.send(commandFixture, {
              address: 'orders.create',
              connectionIdentifier: 'secondary',
            }),
          );
        });

        afterAll(async () => {
          await providerSetup.provider.close();

          vitest.clearAllMocks();
        });

        it('should throw an Error', () => {
          expect((result as Error).message).toBe(
            'AMQP 1.0 connection "secondary" is not open',
          );
        });
      });
    });

    describe('having a provider serializer', () => {
      let messageFixture: Amqp1Dot0Message;
      let serializerMock: Mocked<Amqp1Dot0Serializer>;

      beforeAll(() => {
        messageFixture = buildValueMessage('order-1');
        serializerMock = buildSerializerMock();
      });

      describe('when called, and the peer accepts the message', () => {
        let providerSetup: ProviderSetup;
        let sender: FakeRheaLink;
        let result: unknown;

        beforeAll(async () => {
          serializerMock.serialize.mockReturnValueOnce(messageFixture);

          providerSetup = await initializeSender({
            connections: [
              buildConnectionConfig('primary', {
                senderOptions: {
                  target: { durable: 'configuration' },
                },
              }),
            ],
            serializer: serializerMock,
          });

          const sendPromise: Promise<void> = providerSetup.provider.send(
            commandFixture,
            paramsFixture,
          );

          sender = await waitForSentMessages(providerSetup, 1);

          sender.settle(
            sender.sent[0] as FakeRheaLink['sent'][number],
            'accepted',
          );

          result = await sendPromise;
        });

        afterAll(async () => {
          await providerSetup.provider.close();

          vitest.clearAllMocks();
        });

        it('should call serializer.serialize()', () => {
          expect(serializerMock.serialize).toHaveBeenCalledExactlyOnceWith(
            commandFixture,
          );
        });

        it('should open a sender', () => {
          expect(
            providerSetup.rheaContainer.getConnection('primary').open_sender,
          ).toHaveBeenCalledExactlyOnceWith({
            autosettle: true,
            target: { address: 'orders.create', durable: 1 },
            treat_modified_as_released: false,
          });
        });

        it('should send the serialized message', () => {
          expect(sender.send).toHaveBeenCalledExactlyOnceWith({
            body: 'order-1',
          });
        });

        it('should return undefined', () => {
          expect(result).toBeUndefined();
        });
      });

      describe('when called, and the peer settles without an outcome', () => {
        let providerSetup: ProviderSetup;
        let result: unknown;

        beforeAll(async () => {
          serializerMock.serialize.mockReturnValueOnce(messageFixture);

          providerSetup = await initializeSender({
            serializer: serializerMock,
          });

          const sendPromise: Promise<void> = providerSetup.provider.send(
            commandFixture,
            paramsFixture,
          );
          const sender: FakeRheaLink = await waitForSentMessages(
            providerSetup,
            1,
          );

          sender.emit('settled', {
            delivery: (sender.sent[0] as FakeRheaLink['sent'][number]).delivery,
            sender,
          });

          result = await sendPromise;
        });

        afterAll(async () => {
          await providerSetup.provider.close();

          vitest.clearAllMocks();
        });

        it('should resolve the send as accepted', () => {
          expect(result).toBeUndefined();
        });
      });

      describe('when called, and the link default outcome is rejected', () => {
        let providerSetup: ProviderSetup;
        let result: unknown;

        beforeAll(async () => {
          serializerMock.serialize.mockReturnValueOnce(messageFixture);

          providerSetup = await initializeSender({
            serializer: serializerMock,
          });

          const sendPromise: Promise<void> = providerSetup.provider.send(
            commandFixture,
            paramsFixture,
          );
          const sender: FakeRheaLink = await waitForSentMessages(
            providerSetup,
            1,
          );

          sender.source = { default_outcome: 'rejected' };

          sender.emit('settled', {
            delivery: (sender.sent[0] as FakeRheaLink['sent'][number]).delivery,
            sender,
          });

          result = await sendPromise.catch((error: unknown): unknown => error);
        });

        afterAll(async () => {
          await providerSetup.provider.close();

          vitest.clearAllMocks();
        });

        it('should reject the send with the default outcome', () => {
          expect(result).toStrictEqual(
            new Error(
              'AMQP 1.0 peer rejected the message sent to address "orders.create" on connection "primary"',
            ),
          );
        });
      });

      describe('when called, and the default outcome is an encoded accepted', () => {
        let providerSetup: ProviderSetup;
        let result: unknown;

        beforeAll(async () => {
          serializerMock.serialize.mockReturnValueOnce(messageFixture);

          providerSetup = await initializeSender({
            serializer: serializerMock,
          });

          const sendPromise: Promise<void> = providerSetup.provider.send(
            commandFixture,
            paramsFixture,
          );
          const sender: FakeRheaLink = await waitForSentMessages(
            providerSetup,
            1,
          );

          sender.source = { default_outcome: { descriptor: { value: 0x24 } } };

          sender.emit('settled', {
            delivery: (sender.sent[0] as FakeRheaLink['sent'][number]).delivery,
            sender,
          });

          result = await sendPromise;
        });

        afterAll(async () => {
          await providerSetup.provider.close();

          vitest.clearAllMocks();
        });

        it('should resolve the send as accepted', () => {
          expect(result).toBeUndefined();
        });
      });

      describe('when called, and the default outcome is an encoded rejection', () => {
        let providerSetup: ProviderSetup;
        let result: unknown;

        beforeAll(async () => {
          serializerMock.serialize.mockReturnValueOnce(messageFixture);

          providerSetup = await initializeSender({
            serializer: serializerMock,
          });

          const sendPromise: Promise<void> = providerSetup.provider.send(
            commandFixture,
            paramsFixture,
          );
          const sender: FakeRheaLink = await waitForSentMessages(
            providerSetup,
            1,
          );

          sender.source = {
            default_outcome: { descriptor: { value: 'amqp:rejected:list' } },
          };

          sender.emit('settled', {
            delivery: (sender.sent[0] as FakeRheaLink['sent'][number]).delivery,
            sender,
          });

          result = await sendPromise.catch((error: unknown): unknown => error);
        });

        afterAll(async () => {
          await providerSetup.provider.close();

          vitest.clearAllMocks();
        });

        it('should reject the send with the default outcome', () => {
          expect(result).toStrictEqual(
            new Error(
              'AMQP 1.0 peer rejected the message sent to address "orders.create" on connection "primary"',
            ),
          );
        });
      });

      describe('when called, and the peer reports a non-terminal outcome', () => {
        let providerSetup: ProviderSetup;
        let result: unknown;

        beforeAll(async () => {
          serializerMock.serialize.mockReturnValueOnce(messageFixture);

          providerSetup = await initializeSender({
            serializer: serializerMock,
          });

          const sendPromise: Promise<void> = providerSetup.provider.send(
            commandFixture,
            paramsFixture,
          );
          const sender: FakeRheaLink = await waitForSentMessages(
            providerSetup,
            1,
          );
          const sent: FakeRheaLink['sent'][number] = sender
            .sent[0] as FakeRheaLink['sent'][number];

          sender.source = {
            default_outcome: { descriptor: { numeric: 0x25 } },
          };
          sent.delivery.remote_state = buildRemoteState('received');

          sender.emit('settled', { delivery: sent.delivery, sender });

          result = await sendPromise.catch((error: unknown): unknown => error);
        });

        afterAll(async () => {
          await providerSetup.provider.close();

          vitest.clearAllMocks();
        });

        it('should reject the send with the default outcome', () => {
          expect(result).toStrictEqual(
            new Error(
              'AMQP 1.0 peer rejected the message sent to address "orders.create" on connection "primary"',
            ),
          );
        });
      });

      describe('when called, and the peer receiver settles second', () => {
        let delivery: FakeRheaLink['sent'][number]['delivery'];
        let providerSetup: ProviderSetup;
        let result: unknown;
        let update: ReturnType<typeof vitest.fn<(settled: boolean) => void>>;

        beforeAll(async () => {
          serializerMock.serialize.mockReturnValueOnce(messageFixture);

          providerSetup = await initializeSender({
            serializer: serializerMock,
          });

          const sendPromise: Promise<void> = providerSetup.provider.send(
            commandFixture,
            paramsFixture,
          );
          const sender: FakeRheaLink = await waitForSentMessages(
            providerSetup,
            1,
          );
          const sent: FakeRheaLink['sent'][number] = sender
            .sent[0] as FakeRheaLink['sent'][number];

          delivery = sent.delivery;
          update = vitest.fn<(settled: boolean) => void>();
          sent.delivery.update = update;
          sender.rcv_settle_mode = 1;

          sender.emitOutcome(sent, 'accepted');

          result = await sendPromise;
        });

        afterAll(async () => {
          await providerSetup.provider.close();

          vitest.clearAllMocks();
        });

        it('should settle the delivery locally and then resolve', () => {
          expect(update).toHaveBeenCalledExactlyOnceWith(true);
          expect(delivery.remote_settled).toBe(true);
          expect(result).toBeUndefined();
        });
      });

      describe('when called twice', () => {
        let providerSetup: ProviderSetup;

        beforeAll(async () => {
          serializerMock.serialize.mockReturnValue(messageFixture);

          providerSetup = await initializeSender({
            serializer: serializerMock,
          });

          const sendPromises: Promise<void>[] = [
            providerSetup.provider.send(commandFixture, paramsFixture),
            providerSetup.provider.send(commandFixture, paramsFixture),
          ];

          const sender: FakeRheaLink = await waitForSentMessages(
            providerSetup,
            2,
          );

          for (const sentMessage of sender.sent) {
            sender.settle(sentMessage, 'accepted');
          }

          await Promise.all(sendPromises);
        });

        afterAll(async () => {
          serializerMock.serialize.mockReset();

          await providerSetup.provider.close();

          vitest.clearAllMocks();
        });

        it('should reuse the sender', () => {
          expect(
            providerSetup.rheaContainer.getConnection('primary').open_sender,
          ).toHaveBeenCalledTimes(1);
        });
      });

      describe.each<[string, 'modified' | 'rejected' | 'released', string]>([
        [
          'rejects',
          'rejected',
          'AMQP 1.0 peer rejected the message sent to address "orders.create" on connection "primary": amqp:precondition-failed - Invalid order',
        ],
        [
          'releases',
          'released',
          'AMQP 1.0 peer released the message sent to address "orders.create" on connection "primary": amqp:precondition-failed - Invalid order',
        ],
        [
          'modifies',
          'modified',
          'AMQP 1.0 peer modified the message sent to address "orders.create" on connection "primary": amqp:precondition-failed - Invalid order',
        ],
      ])(
        'when called, and the peer %s the message',
        (
          _: string,
          outcome: 'modified' | 'rejected' | 'released',
          expectedMessage: string,
        ) => {
          let providerSetup: ProviderSetup;
          let result: unknown;

          beforeAll(async () => {
            serializerMock.serialize.mockReturnValueOnce(messageFixture);

            providerSetup = await initializeSender({
              serializer: serializerMock,
            });

            const sendResult: Promise<unknown> = captureError(async () =>
              providerSetup.provider.send(commandFixture, paramsFixture),
            );

            const sender: FakeRheaLink = await waitForSentMessages(
              providerSetup,
              1,
            );

            sender.settle(
              sender.sent[0] as FakeRheaLink['sent'][number],
              outcome,
              {
                condition: 'amqp:precondition-failed',
                description: 'Invalid order',
              },
            );

            result = await sendResult;
          });

          afterAll(async () => {
            await providerSetup.provider.close();

            vitest.clearAllMocks();
          });

          it('should throw an Error', () => {
            expect((result as Error).message).toBe(expectedMessage);
          });
        },
      );

      describe('when called, and the peer releases the message without error', () => {
        let providerSetup: ProviderSetup;
        let result: unknown;

        beforeAll(async () => {
          serializerMock.serialize.mockReturnValueOnce(messageFixture);

          providerSetup = await initializeSender({
            serializer: serializerMock,
          });

          const sendResult: Promise<unknown> = captureError(async () =>
            providerSetup.provider.send(commandFixture, paramsFixture),
          );

          const sender: FakeRheaLink = await waitForSentMessages(
            providerSetup,
            1,
          );

          sender.settle(
            sender.sent[0] as FakeRheaLink['sent'][number],
            'released',
          );

          result = await sendResult;
        });

        afterAll(async () => {
          await providerSetup.provider.close();

          vitest.clearAllMocks();
        });

        it('should throw an Error', () => {
          expect((result as Error).message).toBe(
            'AMQP 1.0 peer released the message sent to address "orders.create" on connection "primary"',
          );
        });
      });

      describe('when called, and serializer.serialize() throws', () => {
        let errorFixture: Error;
        let providerSetup: ProviderSetup;
        let result: unknown;

        beforeAll(async () => {
          errorFixture = new Error('Cannot serialize');

          serializerMock.serialize.mockImplementationOnce((): never => {
            throw errorFixture;
          });

          providerSetup = await initializeSender({
            serializer: serializerMock,
          });

          result = await captureError(async () =>
            providerSetup.provider.send(commandFixture, paramsFixture),
          );
        });

        afterAll(async () => {
          await providerSetup.provider.close();

          vitest.clearAllMocks();
        });

        it('should not open a sender', () => {
          expect(
            providerSetup.rheaContainer.getConnection('primary').open_sender,
          ).not.toHaveBeenCalled();
        });

        it('should throw the serializer error', () => {
          expect(result).toBe(errorFixture);
        });
      });

      describe('when called, and the connection is lost before settlement', () => {
        let loggerMock: Mocked<Logger>;
        let providerSetup: ProviderSetup;
        let result: unknown;

        beforeAll(async () => {
          loggerMock = buildLoggerMock();

          serializerMock.serialize.mockReturnValueOnce(messageFixture);

          providerSetup = await initializeSender({
            logger: loggerMock,
            serializer: serializerMock,
          });

          const sendResult: Promise<unknown> = captureError(async () =>
            providerSetup.provider.send(commandFixture, paramsFixture),
          );

          await waitForSentMessages(providerSetup, 1);

          const connection: ReturnType<FakeRheaContainer['getConnection']> =
            providerSetup.rheaContainer.getConnection('primary');

          connection.emit('disconnected', { connection, reconnecting: true });

          result = await sendResult;
        });

        afterAll(async () => {
          await providerSetup.provider.close();

          vitest.clearAllMocks();
        });

        it('should call logger.warn()', () => {
          expect(loggerMock.warn).toHaveBeenCalledExactlyOnceWith(
            'AMQP 1.0 connection "primary" disconnected, reconnecting',
          );
        });

        it('should throw an Error', () => {
          expect((result as Error).message).toBe(
            'AMQP 1.0 connection "primary" was lost before the message was settled',
          );
        });
      });

      describe('when called, and the sender is closed before settlement', () => {
        let providerSetup: ProviderSetup;
        let result: unknown;

        beforeAll(async () => {
          serializerMock.serialize.mockReturnValue(messageFixture);

          providerSetup = await initializeSender({
            serializer: serializerMock,
          });

          const sendResult: Promise<unknown> = captureError(async () =>
            providerSetup.provider.send(commandFixture, paramsFixture),
          );

          const sender: FakeRheaLink = await waitForSentMessages(
            providerSetup,
            1,
          );

          sender.closeRemotely({
            condition: 'amqp:resource-deleted',
            description: 'Queue deleted',
          });

          result = await sendResult;

          const nextSendPromise: Promise<void> = providerSetup.provider.send(
            commandFixture,
            paramsFixture,
          );

          const nextSender: FakeRheaLink = await waitForSentMessages(
            providerSetup,
            1,
          );

          nextSender.settle(
            nextSender.sent[0] as FakeRheaLink['sent'][number],
            'accepted',
          );

          await nextSendPromise;
        });

        afterAll(async () => {
          serializerMock.serialize.mockReset();

          await providerSetup.provider.close();

          vitest.clearAllMocks();
        });

        it('should throw an Error', () => {
          expect((result as Error).message).toBe(
            'AMQP 1.0 sender for address "orders.create" on connection "primary" was closed before the message was settled: amqp:resource-deleted - Queue deleted',
          );
        });

        it('should open a new sender for the next message', () => {
          expect(
            providerSetup.rheaContainer.getConnection('primary').open_sender,
          ).toHaveBeenCalledTimes(2);
        });
      });

      describe('when called, and the peer refuses the sender', () => {
        let providerSetup: ProviderSetup;
        let result: unknown;
        let nextResult: unknown;

        beforeAll(async () => {
          serializerMock.serialize.mockReturnValue(messageFixture);

          providerSetup = await initializeSender({
            serializer: serializerMock,
          });

          providerSetup.rheaContainer.linkBehaviors.set(
            'orders.create',
            'refuse',
          );

          result = await captureError(async () =>
            providerSetup.provider.send(commandFixture, paramsFixture),
          );

          nextResult = await captureError(async () =>
            providerSetup.provider.send(commandFixture, paramsFixture),
          );
        });

        afterAll(async () => {
          serializerMock.serialize.mockReset();

          await providerSetup.provider.close();

          vitest.clearAllMocks();
        });

        it('should close the refused sender', () => {
          expect(
            providerSetup.rheaContainer.getConnection('primary').senders[0]
              ?.close,
          ).toHaveBeenCalledTimes(1);
        });

        it('should throw an Error', () => {
          expect((result as Error).message).toBe(
            'AMQP 1.0 sender for address "orders.create" on connection "primary" was closed before the message was settled: amqp:not-found - Address "orders.create" is refused',
          );
        });

        it('should open a new sender for the next message', () => {
          expect(
            providerSetup.rheaContainer.getConnection('primary').open_sender,
          ).toHaveBeenCalledTimes(2);
          expect((nextResult as Error).message).toBe(
            'AMQP 1.0 sender for address "orders.create" on connection "primary" was closed before the message was settled: amqp:not-found - Address "orders.create" is refused',
          );
        });
      });

      describe('when called, and the sender is closed while waiting for credit', () => {
        let providerSetup: ProviderSetup;
        let result: unknown;

        beforeAll(async () => {
          serializerMock.serialize.mockReturnValueOnce(messageFixture);

          providerSetup = await initializeSender({
            serializer: serializerMock,
          });

          let sender: FakeRheaLink | undefined;

          providerSetup.rheaContainer.onLinkAttached = (
            link: FakeRheaLink,
          ): void => {
            link.sendable.mockReturnValue(false);
            sender = link;
          };

          const sendResult: Promise<unknown> = captureError(async () =>
            providerSetup.provider.send(commandFixture, paramsFixture),
          );

          await waitUntil((): boolean => sender !== undefined);
          await flushImmediates();

          sender?.closeRemotely();

          result = await sendResult;
        });

        afterAll(async () => {
          await providerSetup.provider.close();

          vitest.clearAllMocks();
        });

        it('should throw an Error', () => {
          expect((result as Error).message).toBe(
            'AMQP 1.0 sender for address "orders.create" on connection "primary" was closed before the message was settled',
          );
        });
      });

      describe('when called, and the sender session ends while waiting for credit', () => {
        let providerSetup: ProviderSetup;
        let result: unknown;

        beforeAll(async () => {
          serializerMock.serialize.mockReturnValue(messageFixture);

          providerSetup = await initializeSender({
            serializer: serializerMock,
          });

          let sender: FakeRheaLink | undefined;

          providerSetup.rheaContainer.onLinkAttached = (
            link: FakeRheaLink,
          ): void => {
            link.sendable.mockReturnValue(false);
            sender = link;
            providerSetup.rheaContainer.onLinkAttached = undefined;
          };

          const sendResult: Promise<unknown> = captureError(async () =>
            providerSetup.provider.send(commandFixture, paramsFixture),
          );

          await waitUntil((): boolean => sender !== undefined);
          await flushImmediates();

          const attachedSender: FakeRheaLink = sender as FakeRheaLink;

          attachedSender.session.emit('session_close', {
            connection: attachedSender.connection,
            sender: attachedSender,
          });

          result = await sendResult;

          const nextSendPromise: Promise<void> = providerSetup.provider.send(
            commandFixture,
            paramsFixture,
          );
          const nextSender: FakeRheaLink = await waitForSentMessages(
            providerSetup,
            1,
          );

          nextSender.settle(
            nextSender.sent[0] as FakeRheaLink['sent'][number],
            'accepted',
          );

          await nextSendPromise;
        });

        afterAll(async () => {
          serializerMock.serialize.mockReset();

          await providerSetup.provider.close();

          vitest.clearAllMocks();
        });

        it('should throw an Error', () => {
          expect((result as Error).message).toBe(
            'AMQP 1.0 sender for address "orders.create" on connection "primary" was closed before the message was settled',
          );
        });

        it('should open a new sender for the next message', () => {
          expect(
            providerSetup.rheaContainer.getConnection('primary').open_sender,
          ).toHaveBeenCalledTimes(2);
        });
      });

      describe('when called, and the sender has no credit yet', () => {
        let providerSetup: ProviderSetup;
        let sentBeforeCredit: number;

        beforeAll(async () => {
          serializerMock.serialize.mockReturnValueOnce(messageFixture);

          providerSetup = await initializeSender({
            serializer: serializerMock,
          });

          let sender: FakeRheaLink | undefined;

          providerSetup.rheaContainer.onLinkAttached = (
            link: FakeRheaLink,
          ): void => {
            link.sendable.mockReturnValue(false);
            sender = link;
          };

          const sendPromise: Promise<void> = providerSetup.provider.send(
            commandFixture,
            paramsFixture,
          );

          await waitUntil((): boolean => sender !== undefined);

          const attachedSender: FakeRheaLink = sender as FakeRheaLink;

          await flushImmediates();

          sentBeforeCredit = attachedSender.sent.length;

          attachedSender.sendable.mockReturnValue(true);
          attachedSender.emit('sendable', { sender: attachedSender });

          await waitUntil((): boolean => attachedSender.sent.length === 1);

          attachedSender.settle(
            attachedSender.sent[0] as FakeRheaLink['sent'][number],
            'accepted',
          );

          await sendPromise;
        });

        afterAll(async () => {
          await providerSetup.provider.close();

          vitest.clearAllMocks();
        });

        it('should wait for credit before sending', () => {
          expect(sentBeforeCredit).toBe(0);
        });
      });
    });

    describe('having a connection that goes down', () => {
      let messageFixture: Amqp1Dot0Message;
      let serializerMock: Mocked<Amqp1Dot0Serializer>;

      beforeAll(() => {
        messageFixture = buildValueMessage('order-1');
        serializerMock = buildSerializerMock();

        serializerMock.serialize.mockReturnValue(messageFixture);
      });

      afterAll(() => {
        serializerMock.serialize.mockReset();
      });

      describe.each<[string, (connection: FakeRheaConnection) => void, string]>(
        [
          [
            'the connection is lost without reconnection',
            (connection: FakeRheaConnection): void => {
              connection.disconnect(false);
            },
            'AMQP 1.0 connection "primary" is down and will not reconnect',
          ],
          [
            'the peer closes the connection with a fatal error',
            (connection: FakeRheaConnection): void => {
              connection.closeRemotely({
                condition: 'amqp:unauthorized-access',
                description: 'Credentials revoked',
              });
            },
            'AMQP 1.0 connection "primary" is down and will not reconnect: amqp:unauthorized-access - Credentials revoked',
          ],
          [
            'the peer closes the connection without error',
            (connection: FakeRheaConnection): void => {
              connection.closeRemotely();
            },
            'AMQP 1.0 connection "primary" is down and will not reconnect',
          ],
          [
            'the peer closes the connection with a non fatal error and reconnection is disabled',
            (connection: FakeRheaConnection): void => {
              connection.options.reconnect = false;
              connection.closeRemotely({
                condition: 'amqp:connection:forced',
                description: 'Broker restart',
              });
            },
            'AMQP 1.0 connection "primary" is down and will not reconnect: amqp:connection:forced - Broker restart',
          ],
        ],
      )(
        'when called, and %s while the sender waits for credit',
        (
          _: string,
          goDown: (connection: FakeRheaConnection) => void,
          expectedMessage: string,
        ) => {
          let loggerMock: Mocked<Logger>;
          let providerSetup: ProviderSetup;
          let result: unknown;
          let nextResult: unknown;

          beforeAll(async () => {
            loggerMock = buildLoggerMock();

            providerSetup = await initializeSender({
              logger: loggerMock,
              serializer: serializerMock,
            });

            let sender: FakeRheaLink | undefined;

            providerSetup.rheaContainer.onLinkAttached = (
              link: FakeRheaLink,
            ): void => {
              link.sendable.mockReturnValue(false);
              sender = link;
            };

            const sendResult: Promise<unknown> = captureError(async () =>
              providerSetup.provider.send(commandFixture, paramsFixture),
            );

            await waitUntil((): boolean => sender !== undefined);
            await flushImmediates();

            goDown(providerSetup.rheaContainer.getConnection('primary'));

            result = await sendResult;
            nextResult = await captureError(async () =>
              providerSetup.provider.send(commandFixture, paramsFixture),
            );
          });

          afterAll(async () => {
            await providerSetup.provider.close();

            vitest.clearAllMocks();
          });

          it('should call logger.error()', () => {
            expect(loggerMock.error).toHaveBeenCalledWith(expectedMessage);
          });

          it('should throw an Error', () => {
            expect(result).toStrictEqual(new Error(expectedMessage));
          });

          it('should reject later sends without opening a sender', () => {
            expect(nextResult).toStrictEqual(new Error(expectedMessage));
            expect(
              providerSetup.rheaContainer.getConnection('primary').open_sender,
            ).toHaveBeenCalledTimes(1);
          });
        },
      );

      describe('when called, and the connection is lost without reconnection before the sender attaches', () => {
        let providerSetup: ProviderSetup;
        let result: unknown;

        beforeAll(async () => {
          providerSetup = await initializeSender({
            serializer: serializerMock,
          });

          providerSetup.rheaContainer.linkBehaviors.set(
            'orders.create',
            'pending',
          );

          const connection: FakeRheaConnection =
            providerSetup.rheaContainer.getConnection('primary');

          const sendResult: Promise<unknown> = captureError(async () =>
            providerSetup.provider.send(commandFixture, paramsFixture),
          );

          await waitUntil(
            (): boolean => connection.open_sender.mock.calls.length === 1,
          );

          connection.disconnect(false);

          result = await sendResult;
        });

        afterAll(async () => {
          await providerSetup.provider.close();

          vitest.clearAllMocks();
        });

        it('should throw an Error', () => {
          expect(result).toStrictEqual(
            new Error(
              'AMQP 1.0 connection "primary" is down and will not reconnect',
            ),
          );
        });
      });

      describe('when called after the peer closed the connection with a non fatal error', () => {
        let loggerMock: Mocked<Logger>;
        let providerSetup: ProviderSetup;
        let result: unknown;

        beforeAll(async () => {
          loggerMock = buildLoggerMock();

          providerSetup = await initializeSender({
            logger: loggerMock,
            serializer: serializerMock,
          });

          providerSetup.rheaContainer.getConnection('primary').closeRemotely({
            condition: 'amqp:connection:forced',
            description: 'Broker restart',
          });

          const sendPromise: Promise<void> = providerSetup.provider.send(
            commandFixture,
            paramsFixture,
          );

          const sender: FakeRheaLink = await waitForSentMessages(
            providerSetup,
            1,
          );

          sender.settle(
            sender.sent[0] as FakeRheaLink['sent'][number],
            'accepted',
          );

          result = await sendPromise;
        });

        afterAll(async () => {
          await providerSetup.provider.close();

          vitest.clearAllMocks();
        });

        it('should only log the connection failure', () => {
          expect(loggerMock.error).toHaveBeenCalledExactlyOnceWith(
            'AMQP 1.0 connection "primary" failed: amqp:connection:forced - Broker restart',
          );
        });

        it('should send the message', () => {
          expect(result).toBeUndefined();
        });
      });

      describe('when called while the connection is reconnecting', () => {
        let connection: ReturnType<FakeRheaContainer['getConnection']>;
        let openedWhileReconnecting: boolean;
        let providerSetup: ProviderSetup;
        let result: unknown;

        beforeAll(async () => {
          serializerMock.serialize.mockReturnValueOnce(messageFixture);

          providerSetup = await initializeSender({
            serializer: serializerMock,
          });
          connection = providerSetup.rheaContainer.getConnection('primary');
          connection.is_open.mockReturnValue(false);
          connection.emit('disconnected', { connection, reconnecting: true });

          const sendPromise: Promise<void> = providerSetup.provider.send(
            commandFixture,
            paramsFixture,
          );

          await flushImmediates();
          openedWhileReconnecting =
            connection.open_sender.mock.calls.length > 0;

          connection.is_open.mockReturnValue(true);
          connection.emit('connection_open', { connection });

          const sender: FakeRheaLink = await waitForSentMessages(
            providerSetup,
            1,
          );

          sender.settle(
            sender.sent[0] as FakeRheaLink['sent'][number],
            'accepted',
          );

          result = await sendPromise;
        });

        afterAll(async () => {
          await providerSetup.provider.close();

          vitest.clearAllMocks();
        });

        it('should send once the connection is open again', () => {
          expect(openedWhileReconnecting).toBe(false);
          expect(result).toBeUndefined();
          expect(connection.open_sender).toHaveBeenCalledTimes(1);
        });
      });
    });

    describe('having a send timeout', () => {
      let messageFixture: Amqp1Dot0Message;
      let serializerMock: Mocked<Amqp1Dot0Serializer>;

      beforeAll(() => {
        messageFixture = buildValueMessage('order-1');
        serializerMock = buildSerializerMock();

        serializerMock.serialize.mockReturnValue(messageFixture);
      });

      afterAll(() => {
        serializerMock.serialize.mockReset();
      });

      describe('when called, and the sender never gets credit', () => {
        let attachedSender: FakeRheaLink | undefined;
        let providerSetup: ProviderSetup;
        let result: unknown;

        beforeAll(async () => {
          providerSetup = await initializeSender({
            sendTimeout: 20,
            serializer: serializerMock,
          });

          providerSetup.rheaContainer.onLinkAttached = (
            link: FakeRheaLink,
          ): void => {
            attachedSender = link;
            link.sendable.mockReturnValue(false);
          };

          result = await captureError(async () =>
            providerSetup.provider.send(commandFixture, paramsFixture),
          );
        });

        afterAll(async () => {
          await providerSetup.provider.close();

          vitest.clearAllMocks();
        });

        it('should throw an Error', () => {
          expect(result).toStrictEqual(
            new Error(
              'AMQP 1.0 send to address "orders.create" on connection "primary" timed out after 20ms',
            ),
          );
          expect(attachedSender?.send).not.toHaveBeenCalled();
        });
      });

      describe('when called, and the peer settles the message after the timeout', () => {
        let providerSetup: ProviderSetup;
        let result: unknown;

        beforeAll(async () => {
          providerSetup = await initializeSender({
            sendTimeout: 20,
            serializer: serializerMock,
          });

          result = await captureError(async () =>
            providerSetup.provider.send(commandFixture, paramsFixture),
          );

          const sender: FakeRheaLink = await waitForSentMessages(
            providerSetup,
            1,
          );

          sender.settle(
            sender.sent[0] as FakeRheaLink['sent'][number],
            'rejected',
          );
        });

        afterAll(async () => {
          await providerSetup.provider.close();

          vitest.clearAllMocks();
        });

        it('should throw an Error', () => {
          expect(result).toStrictEqual(
            new Error(
              'AMQP 1.0 send to address "orders.create" on connection "primary" timed out after 20ms',
            ),
          );
        });
      });

      describe('when called, and the peer accepts the message in time', () => {
        let providerSetup: ProviderSetup;
        let result: unknown;

        beforeAll(async () => {
          providerSetup = await initializeSender({
            sendTimeout: 1000,
            serializer: serializerMock,
          });

          const sendPromise: Promise<void> = providerSetup.provider.send(
            commandFixture,
            paramsFixture,
          );

          const sender: FakeRheaLink = await waitForSentMessages(
            providerSetup,
            1,
          );

          sender.settle(
            sender.sent[0] as FakeRheaLink['sent'][number],
            'accepted',
          );

          result = await sendPromise;
        });

        afterAll(async () => {
          await providerSetup.provider.close();

          vitest.clearAllMocks();
        });

        it('should return undefined', () => {
          expect(result).toBeUndefined();
        });
      });
    });

    describe('having serializers at connection and provider level', () => {
      let addressSerializerMock: Mocked<Amqp1Dot0Serializer>;
      let providerSerializerMock: Mocked<Amqp1Dot0Serializer>;
      let providerSetup: ProviderSetup;

      beforeAll(async () => {
        addressSerializerMock = buildSerializerMock();
        providerSerializerMock = buildSerializerMock();

        addressSerializerMock.serialize.mockReturnValue(
          buildValueMessage('address'),
        );
        providerSerializerMock.serialize.mockReturnValue(
          buildValueMessage('provider'),
        );

        providerSetup = buildProvider({
          connections: [
            buildConnectionConfig('primary', {
              serializers: new Map([['orders.create', addressSerializerMock]]),
            }),
            buildConnectionConfig('secondary'),
          ],
          serializer: providerSerializerMock,
        });

        await providerSetup.provider.initialize(new Container(), [
          createOrderOnPrimary(),
          createOrderOnPrimary({ connectionIdentifier: 'secondary' }),
        ]);
      });

      afterAll(async () => {
        await providerSetup.provider.close();

        vitest.clearAllMocks();
      });

      describe.each<[string, string, Message]>([
        [
          'the connection with an address serializer',
          'primary',
          { body: 'address' },
        ],
        [
          'another connection with the same address',
          'secondary',
          { body: 'provider' },
        ],
      ])(
        'when called with %s',
        (_: string, connectionIdentifier: string, expectedMessage: Message) => {
          let sender: FakeRheaLink | undefined;

          beforeAll(async () => {
            const sendPromise: Promise<void> = providerSetup.provider.send(
              commandFixture,
              { address: 'orders.create', connectionIdentifier },
            );

            await waitUntil((): boolean => {
              sender = providerSetup.rheaContainer
                .getConnection(connectionIdentifier)
                .senders.at(-1);

              return sender?.sent.length === 1;
            });

            sender?.settle(
              sender.sent[0] as FakeRheaLink['sent'][number],
              'accepted',
            );

            await sendPromise;
          });

          it('should send the message built by the matching serializer', () => {
            expect(sender?.send).toHaveBeenCalledExactlyOnceWith(
              expectedMessage,
            );
          });
        },
      );
    });

    describe('having no serializer option', () => {
      describe('when called', () => {
        let messageFixture: Amqp1Dot0Message;
        let providerSetup: ProviderSetup;
        let sender: FakeRheaLink;

        beforeAll(async () => {
          messageFixture = buildValueMessage('json');

          providerSetup = await initializeSender();

          const jsonSerializer: Amqp1Dot0JsonSerializer = vitest.mocked(
            Amqp1Dot0JsonSerializer,
          ).mock.instances[0] as Amqp1Dot0JsonSerializer;

          vitest
            .mocked(jsonSerializer.serialize)
            .mockReturnValueOnce(messageFixture);

          const sendPromise: Promise<void> = providerSetup.provider.send(
            commandFixture,
            paramsFixture,
          );

          sender = await waitForSentMessages(providerSetup, 1);

          sender.settle(
            sender.sent[0] as FakeRheaLink['sent'][number],
            'accepted',
          );

          await sendPromise;
        });

        afterAll(async () => {
          await providerSetup.provider.close();

          vitest.clearAllMocks();
        });

        it('should send the message built by the JSON serializer', () => {
          expect(sender.send).toHaveBeenCalledExactlyOnceWith({ body: 'json' });
        });
      });
    });
  });

  describe('.close', () => {
    describe('having an initialized provider with receivers and a pending send', () => {
      describe('when called twice', () => {
        let providerSetup: ProviderSetup;
        let sendResult: unknown;
        let nextSendResult: unknown;

        beforeAll(async () => {
          const serializerMock: Mocked<Amqp1Dot0Serializer> =
            buildSerializerMock();

          serializerMock.serialize.mockReturnValue(buildValueMessage('order'));

          providerSetup = buildProvider({
            connections: [
              buildConnectionConfig('primary', { listenersEnabled: true }),
            ],
            serializer: serializerMock,
          });

          await providerSetup.provider.initialize(new Container(), [
            createOrderOnPrimary(),
          ]);

          const pendingSend: Promise<unknown> = captureError(async () =>
            providerSetup.provider.send(new CreateOrder('order-1'), {
              address: 'orders.create',
              connectionIdentifier: 'primary',
            }),
          );

          await waitUntil(
            (): boolean =>
              providerSetup.rheaContainer.getConnection('primary').senders[0]
                ?.sent.length === 1,
          );

          await Promise.all([
            providerSetup.provider.close(),
            providerSetup.provider.close(),
          ]);

          sendResult = await pendingSend;
          nextSendResult = await captureError(async () =>
            providerSetup.provider.send(new CreateOrder('order-2'), {
              address: 'orders.create',
              connectionIdentifier: 'primary',
            }),
          );
        });

        afterAll(() => {
          vitest.clearAllMocks();
        });

        it('should close the receiver, the sender and the connection once', () => {
          const connection: ReturnType<FakeRheaContainer['getConnection']> =
            providerSetup.rheaContainer.getConnection('primary');

          expect(connection.receivers[0]?.close).toHaveBeenCalledTimes(1);
          expect(connection.senders[0]?.close).toHaveBeenCalledTimes(1);
          expect(connection.close).toHaveBeenCalledTimes(1);
        });

        it('should reject the pending send', () => {
          expect((sendResult as Error).message).toBe(
            'AMQP 1.0 transport is closed',
          );
        });

        it('should reject later sends', () => {
          expect((nextSendResult as Error).message).toBe(
            'AMQP 1.0 transport is closed',
          );
        });
      });
    });

    describe('having an initialized provider whose connection waits to reconnect', () => {
      describe('when called', () => {
        let connection: FakeRheaConnection;

        beforeAll(async () => {
          const providerSetup: ProviderSetup = buildProvider({
            connections: [buildConnectionConfig('primary')],
          });

          await providerSetup.provider.initialize(new Container(), [
            createOrderOnPrimary(),
          ]);

          connection = providerSetup.rheaContainer.getConnection('primary');

          connection.set_reconnect.mockClear();
          connection.disconnect(true);

          await providerSetup.provider.close();
          await new Promise<void>((resolve: () => void): void => {
            setTimeout(resolve, 10);
          });
        });

        afterAll(() => {
          vitest.clearAllMocks();
        });

        it('should disable reconnection', () => {
          expect(connection.set_reconnect).toHaveBeenCalledExactlyOnceWith(
            false,
          );
        });

        it('should cancel the scheduled reconnection', () => {
          expect(connection.scheduled_reconnect).toBeUndefined();
          expect(connection.reconnect).not.toHaveBeenCalled();
        });
      });
    });
  });
});
