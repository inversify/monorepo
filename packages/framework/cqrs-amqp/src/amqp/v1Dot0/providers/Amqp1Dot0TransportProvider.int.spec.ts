import {
  afterAll,
  beforeAll,
  describe,
  expect,
  it,
  type Mocked,
  vitest,
} from 'vitest';

import 'reflect-metadata/lite';

import {
  type CommandBus,
  CommandHandler,
  CqrsProvider,
  Event,
  type EventBus,
  EventHandler,
  type CqrsEventHandler,
} from '@inversifyjs/framework-cqrs';
import { type Logger } from '@inversifyjs/logger';
import {
  Container,
  inject,
  type Newable,
  type ServiceIdentifier,
} from 'inversify';

import {
  AmqpTestPeer,
  type AmqpTestPeerDisposition,
} from '../../../test/peers/AmqpTestPeer.js';
import { Amqp1Dot0TransportDeclaration } from '../declarations/Amqp1Dot0TransportDeclaration.js';
import { type Amqp1Dot0CommandHandler } from '../models/Amqp1Dot0CommandHandler.js';
import { type Amqp1Dot0ConnectionConfig } from '../models/Amqp1Dot0ConnectionConfig.js';
import { type Amqp1Dot0Message } from '../models/Amqp1Dot0Message.js';
import { type Amqp1Dot0ReconnectOptions } from '../models/Amqp1Dot0ReconnectOptions.js';
import { type Amqp1Dot0Serializer } from '../models/Amqp1Dot0Serializer.js';
import { type Amqp1Dot0TransportProviderOptions } from '../models/Amqp1Dot0TransportProviderOptions.js';
import { Amqp1Dot0TransportProvider } from './Amqp1Dot0TransportProvider.js';

const PEER: string = 'peer';
const REFUSING_PEER: string = 'refusing-peer';

interface ThrottlingRecord {
  active: number;
  maxActive: number;
}

interface OrderRecords {
  readonly auditedOrderIds: string[];
  readonly cancelledOrderIds: string[];
  readonly createdOrders: CreateOrder[];
  readonly earlyOrderIds: string[];
  readonly loggedOrderIds: string[];
  readonly refundedOrderIds: string[];
  readonly throttling: ThrottlingRecord;
}

interface Closable {
  close(): Promise<void>;
}

interface ConnectionsOptions {
  readonly listenersEnabled?: boolean;
  readonly reconnect?: boolean | Amqp1Dot0ReconnectOptions;
}

interface ConsumerSetup {
  readonly records: OrderRecords;
  readonly transport: Amqp1Dot0TransportProvider;
}

interface ProducerSetup {
  readonly commandBus: CommandBus;
  readonly transport: Amqp1Dot0TransportProvider;
}

const orderRecordsServiceIdentifier: ServiceIdentifier<OrderRecords> =
  Symbol('OrderRecords');

const eventBusServiceIdentifier: ServiceIdentifier<EventBus> =
  Symbol('EventBus');

function buildOrderRecords(): OrderRecords {
  return {
    auditedOrderIds: [],
    cancelledOrderIds: [],
    createdOrders: [],
    earlyOrderIds: [],
    loggedOrderIds: [],
    refundedOrderIds: [],
    throttling: { active: 0, maxActive: 0 },
  };
}

function readBody(message: Amqp1Dot0Message): string {
  const section: Uint8Array | undefined =
    message.body.kind === 'data' ? message.body.sections[0] : undefined;

  if (section === undefined) {
    throw new Error('Expected a data section body');
  }

  return Buffer.from(section).toString('utf8');
}

function parseOrderId(message: Amqp1Dot0Message): string {
  const payload: unknown = JSON.parse(readBody(message));

  if (
    typeof payload !== 'object' ||
    payload === null ||
    !('orderId' in payload) ||
    typeof payload.orderId !== 'string'
  ) {
    throw new Error('Expected an order payload');
  }

  return payload.orderId;
}

class CreateOrder {
  constructor(public readonly orderId: string) {}
}

class CancelOrder {
  constructor(public readonly orderId: string) {}
}

class RefundOrder {
  constructor(public readonly orderId: string) {}
}

class EarlyOrder {
  constructor(public readonly orderId: string) {}
}

class FailingOrder {
  constructor(public readonly orderId: string) {}
}

class UnclaimedOrder {
  constructor(public readonly orderId: string) {}
}

class PeerRejectedOrder {
  constructor(public readonly orderId: string) {}
}

class RefusedOrder {}

class ThrottledOrder {
  constructor(public readonly orderId: string) {}
}

class UnsettledOrder {
  constructor(public readonly orderId: string) {}
}

@Event({})
class OrderLogged {
  constructor(public readonly orderId: string) {}
}

@EventHandler({ event: OrderLogged })
class OrderLoggedHandler implements CqrsEventHandler<OrderLogged> {
  constructor(
    @inject(orderRecordsServiceIdentifier)
    private readonly records: OrderRecords,
  ) {}

  public handle(event: OrderLogged): void {
    this.records.loggedOrderIds.push(event.orderId);
  }
}

@CommandHandler({
  command: CreateOrder,
  transports: [
    new Amqp1Dot0TransportDeclaration({
      address: 'orders.create',
      connectionIdentifier: PEER,
    }),
  ],
})
class CreateOrderHandler implements Amqp1Dot0CommandHandler<CreateOrder> {
  constructor(
    @inject(orderRecordsServiceIdentifier)
    private readonly records: OrderRecords,
  ) {}

  public deserialize(message: Amqp1Dot0Message): CreateOrder {
    return new CreateOrder(parseOrderId(message));
  }

  public handle(command: CreateOrder): void {
    this.records.createdOrders.push(command);
  }
}

@CommandHandler({
  command: CreateOrder,
  transports: [
    new Amqp1Dot0TransportDeclaration({
      address: 'orders.create',
      connectionIdentifier: PEER,
    }),
  ],
})
class AuditCreateOrderHandler implements Amqp1Dot0CommandHandler<CreateOrder> {
  constructor(
    @inject(orderRecordsServiceIdentifier)
    private readonly records: OrderRecords,
  ) {}

  public async deserialize(message: Amqp1Dot0Message): Promise<CreateOrder> {
    return new CreateOrder(parseOrderId(message));
  }

  public async handle(command: CreateOrder): Promise<void> {
    this.records.auditedOrderIds.push(command.orderId);
  }
}

@CommandHandler({
  command: CancelOrder,
  transports: [
    new Amqp1Dot0TransportDeclaration({
      address: 'orders.mixed',
      connectionIdentifier: PEER,
    }),
  ],
})
class CancelOrderHandler implements Amqp1Dot0CommandHandler<CancelOrder> {
  constructor(
    @inject(orderRecordsServiceIdentifier)
    private readonly records: OrderRecords,
  ) {}

  public deserialize(message: Amqp1Dot0Message): CancelOrder | undefined {
    if (message.properties?.subject !== CancelOrder.name) {
      return undefined;
    }

    return new CancelOrder(parseOrderId(message));
  }

  public handle(command: CancelOrder): void {
    this.records.cancelledOrderIds.push(command.orderId);
  }
}

@CommandHandler({
  command: RefundOrder,
  transports: [
    new Amqp1Dot0TransportDeclaration({
      address: 'orders.mixed',
      connectionIdentifier: PEER,
    }),
  ],
})
class RefundOrderHandler implements Amqp1Dot0CommandHandler<RefundOrder> {
  constructor(
    @inject(orderRecordsServiceIdentifier)
    private readonly records: OrderRecords,
  ) {}

  public deserialize(message: Amqp1Dot0Message): RefundOrder | undefined {
    if (message.properties?.subject !== RefundOrder.name) {
      return undefined;
    }

    return new RefundOrder(parseOrderId(message));
  }

  public handle(command: RefundOrder): void {
    this.records.refundedOrderIds.push(command.orderId);
  }
}

@CommandHandler({
  command: EarlyOrder,
  transports: [
    new Amqp1Dot0TransportDeclaration({
      address: 'orders.early',
      connectionIdentifier: PEER,
    }),
  ],
})
class EarlyOrderHandler implements Amqp1Dot0CommandHandler<EarlyOrder> {
  constructor(
    @inject(orderRecordsServiceIdentifier)
    private readonly records: OrderRecords,
    @inject(eventBusServiceIdentifier)
    private readonly eventBus: EventBus,
  ) {}

  public deserialize(message: Amqp1Dot0Message): EarlyOrder {
    return new EarlyOrder(parseOrderId(message));
  }

  public handle(command: EarlyOrder): void {
    this.records.earlyOrderIds.push(command.orderId);

    this.eventBus.send(new OrderLogged(command.orderId));
  }
}

@CommandHandler({
  command: FailingOrder,
  transports: [
    new Amqp1Dot0TransportDeclaration({
      address: 'orders.failing',
      connectionIdentifier: PEER,
    }),
  ],
})
class FailingOrderHandler implements Amqp1Dot0CommandHandler<FailingOrder> {
  public deserialize(message: Amqp1Dot0Message): FailingOrder {
    return new FailingOrder(parseOrderId(message));
  }

  public handle(): void {
    throw new Error('Inventory is unavailable');
  }
}

@CommandHandler({
  command: UnclaimedOrder,
  transports: [
    new Amqp1Dot0TransportDeclaration({
      address: 'orders.unclaimed',
      connectionIdentifier: PEER,
    }),
  ],
})
class UnclaimedOrderHandler implements Amqp1Dot0CommandHandler<UnclaimedOrder> {
  public deserialize(): undefined {
    return undefined;
  }

  public handle(): void {
    throw new Error('Unexpected handle() call');
  }
}

@CommandHandler({
  command: PeerRejectedOrder,
  transports: [
    new Amqp1Dot0TransportDeclaration({
      address: 'orders.peer-rejected',
      connectionIdentifier: PEER,
    }),
  ],
})
class PeerRejectedOrderHandler implements Amqp1Dot0CommandHandler<PeerRejectedOrder> {
  public deserialize(): undefined {
    return undefined;
  }

  public handle(): void {
    throw new Error('Unexpected handle() call');
  }
}

@CommandHandler({
  command: RefusedOrder,
  transports: [
    new Amqp1Dot0TransportDeclaration({
      address: 'orders.refused',
      connectionIdentifier: REFUSING_PEER,
    }),
  ],
})
class RefusedOrderHandler implements Amqp1Dot0CommandHandler<RefusedOrder> {
  public deserialize(): undefined {
    return undefined;
  }

  public handle(): void {
    throw new Error('Unexpected handle() call');
  }
}

@CommandHandler({
  command: ThrottledOrder,
  transports: [
    new Amqp1Dot0TransportDeclaration({
      address: 'orders.throttled',
      connectionIdentifier: PEER,
    }),
  ],
})
class ThrottledOrderHandler implements Amqp1Dot0CommandHandler<ThrottledOrder> {
  constructor(
    @inject(orderRecordsServiceIdentifier)
    private readonly records: OrderRecords,
  ) {}

  public deserialize(message: Amqp1Dot0Message): ThrottledOrder {
    return new ThrottledOrder(parseOrderId(message));
  }

  public async handle(): Promise<void> {
    const throttling: ThrottlingRecord = this.records.throttling;

    ++throttling.active;
    throttling.maxActive = Math.max(throttling.maxActive, throttling.active);

    await new Promise<void>((resolve: () => void): void => {
      setTimeout(resolve, 20);
    });

    --throttling.active;
  }
}

@CommandHandler({
  command: UnsettledOrder,
  transports: [
    new Amqp1Dot0TransportDeclaration({
      address: 'orders.unsettled',
      connectionIdentifier: PEER,
    }),
  ],
})
class UnsettledOrderHandler implements Amqp1Dot0CommandHandler<UnsettledOrder> {
  public deserialize(): undefined {
    return undefined;
  }

  public handle(): void {
    throw new Error('Unexpected handle() call');
  }
}

const subjectSerializer: Amqp1Dot0Serializer = {
  serialize: (command: object): Amqp1Dot0Message => ({
    body: {
      kind: 'data',
      sections: [Buffer.from(JSON.stringify(command), 'utf8')],
    },
    properties: { subject: command.constructor.name },
  }),
};

function buildConnections(
  port: number,
  options: ConnectionsOptions = {},
): Amqp1Dot0ConnectionConfig[] {
  const connectionOptions: Amqp1Dot0ConnectionConfig['connectionOptions'] = {
    host: '127.0.0.1',
    port,
    reconnect: options.reconnect ?? false,
  };

  return [
    {
      connectionOptions,
      identifier: PEER,
      listenersEnabled: options.listenersEnabled ?? false,
      receiverOptions: { creditWindow: 2 },
      serializers: new Map([['orders.mixed', subjectSerializer]]),
    },
    {
      connectionOptions,
      identifier: REFUSING_PEER,
      listenersEnabled: false,
    },
  ];
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

async function captureError(run: () => Promise<unknown>): Promise<unknown> {
  try {
    await run();
  } catch (error: unknown) {
    return error;
  }

  return undefined;
}

async function closeAll(closables: readonly Closable[]): Promise<void> {
  for (const closable of closables) {
    await closable.close();
  }
}

async function sleep(milliseconds: number): Promise<void> {
  await new Promise<void>((resolve: () => void): void => {
    setTimeout(resolve, milliseconds);
  });
}

async function waitUntil(predicate: () => boolean): Promise<void> {
  await vitest.waitFor((): void => {
    if (!predicate()) {
      throw new Error('Condition not met yet');
    }
  });
}

async function startPeer(): Promise<AmqpTestPeer> {
  const peer: AmqpTestPeer = await AmqpTestPeer.start();

  peer.refuseLinks('orders.refused');
  peer.setIncomingOutcome('orders.peer-rejected', 'reject');
  peer.setIncomingOutcome('orders.unsettled', 'hold');

  return peer;
}

async function startProducer(
  peer: AmqpTestPeer,
  options: Partial<Amqp1Dot0TransportProviderOptions> = {},
): Promise<ProducerSetup> {
  const transport: Amqp1Dot0TransportProvider = new Amqp1Dot0TransportProvider({
    connections: buildConnections(peer.port),
    logger: false,
    ...options,
  });
  const cqrsProvider: CqrsProvider = new CqrsProvider([transport], {
    logger: false,
  });

  await cqrsProvider.provide(new Container());

  return { commandBus: cqrsProvider.getCommandBus(), transport };
}

async function startConsumer(peer: AmqpTestPeer): Promise<ConsumerSetup> {
  const records: OrderRecords = buildOrderRecords();
  const transport: Amqp1Dot0TransportProvider = new Amqp1Dot0TransportProvider({
    connections: buildConnections(peer.port, { listenersEnabled: true }),
    logger: false,
  });
  const cqrsProvider: CqrsProvider = new CqrsProvider([transport], {
    logger: false,
  });
  const container: Container = new Container();

  container.bind(orderRecordsServiceIdentifier).toConstantValue(records);
  container
    .bind(eventBusServiceIdentifier)
    .toDynamicValue((): EventBus => cqrsProvider.getEventBus());

  const handlerTypes: Newable[] = [
    AuditCreateOrderHandler,
    CancelOrderHandler,
    CreateOrderHandler,
    EarlyOrderHandler,
    FailingOrderHandler,
    OrderLoggedHandler,
    PeerRejectedOrderHandler,
    RefundOrderHandler,
    RefusedOrderHandler,
    ThrottledOrderHandler,
    UnclaimedOrderHandler,
    UnsettledOrderHandler,
  ];

  for (const handlerType of handlerTypes) {
    container.bind(handlerType).toSelf();
  }

  await cqrsProvider.provide(container);

  return { records, transport };
}

describe(Amqp1Dot0TransportProvider, () => {
  describe('having a message queued before the consumer was provided', () => {
    let peer: AmqpTestPeer;
    let producer: ProducerSetup;
    let consumer: ConsumerSetup;
    let dispositions: AmqpTestPeerDisposition[];

    beforeAll(async () => {
      peer = await startPeer();
      producer = await startProducer(peer);

      await producer.commandBus.send(new EarlyOrder('order-early'));
      await peer.waitForQueuedMessages('orders.early', 1);

      consumer = await startConsumer(peer);
      dispositions = await peer.waitForDispositions('orders.early', 1);
    });

    afterAll(async () => {
      await closeAll([producer.transport, consumer.transport, peer]);
    });

    it('should handle the message once the CQRS provider finished providing', () => {
      expect(consumer.records.earlyOrderIds).toStrictEqual(['order-early']);
      expect(
        dispositions.map(
          (disposition: AmqpTestPeerDisposition) => disposition.outcome,
        ),
      ).toStrictEqual(['accepted']);
    });

    it('should let the handler use the event bus', () => {
      expect(consumer.records.loggedOrderIds).toStrictEqual(['order-early']);
    });
  });

  describe('having two handlers for the same command on the same address', () => {
    let peer: AmqpTestPeer;
    let producer: ProducerSetup;
    let consumer: ConsumerSetup;
    let dispositions: AmqpTestPeerDisposition[];

    beforeAll(async () => {
      peer = await startPeer();
      producer = await startProducer(peer);
      consumer = await startConsumer(peer);

      await producer.commandBus.send(new CreateOrder('order-1'));

      dispositions = await peer.waitForDispositions('orders.create', 1);
    });

    afterAll(async () => {
      await closeAll([producer.transport, consumer.transport, peer]);
    });

    it('should send a single JSON message', () => {
      expect(dispositions).toHaveLength(1);
      expect(dispositions[0]?.message?.content_type).toBe('application/json');
    });

    it('should handle the command built by the handler deserializer', () => {
      expect(consumer.records.createdOrders).toStrictEqual([
        new CreateOrder('order-1'),
      ]);
    });

    it('should dispatch the message to every handler', () => {
      expect(consumer.records.auditedOrderIds).toStrictEqual(['order-1']);
    });

    it('should accept the message', () => {
      expect(dispositions[0]?.outcome).toBe('accepted');
    });
  });

  describe('having handlers for different commands sharing an address with an address serializer', () => {
    let peer: AmqpTestPeer;
    let producer: ProducerSetup;
    let consumer: ConsumerSetup;
    let dispositions: AmqpTestPeerDisposition[];

    beforeAll(async () => {
      peer = await startPeer();
      producer = await startProducer(peer);
      consumer = await startConsumer(peer);

      await producer.commandBus.send(new CancelOrder('order-2'));

      dispositions = await peer.waitForDispositions('orders.mixed', 1);
    });

    afterAll(async () => {
      await closeAll([producer.transport, consumer.transport, peer]);
    });

    it('should serialize the message with the address serializer', () => {
      expect(dispositions[0]?.message?.subject).toBe(CancelOrder.name);
    });

    it('should only handle the command in the handler that did not decline it', () => {
      expect(consumer.records.cancelledOrderIds).toStrictEqual(['order-2']);
      expect(consumer.records.refundedOrderIds).toStrictEqual([]);
    });

    it('should accept the message', () => {
      expect(dispositions[0]?.outcome).toBe('accepted');
    });
  });

  describe('having a failing handler', () => {
    let peer: AmqpTestPeer;
    let producer: ProducerSetup;
    let consumer: ConsumerSetup;
    let dispositions: AmqpTestPeerDisposition[];

    beforeAll(async () => {
      peer = await startPeer();
      producer = await startProducer(peer);
      consumer = await startConsumer(peer);

      await producer.commandBus.send(new FailingOrder('order-3'));

      dispositions = await peer.waitForDispositions('orders.failing', 1);
    });

    afterAll(async () => {
      await closeAll([producer.transport, consumer.transport, peer]);
    });

    it('should reject the message without the error details', () => {
      expect(dispositions[0]?.outcome).toBe('rejected');
      expect(dispositions[0]?.error?.condition).toBe('amqp:internal-error');
      expect(dispositions[0]?.error?.description).toBe(
        'The handler failed to process the message',
      );
    });
  });

  describe('having every handler declining the message', () => {
    let peer: AmqpTestPeer;
    let producer: ProducerSetup;
    let consumer: ConsumerSetup;
    let dispositions: AmqpTestPeerDisposition[];

    beforeAll(async () => {
      peer = await startPeer();
      producer = await startProducer(peer);
      consumer = await startConsumer(peer);

      await producer.commandBus.send(new UnclaimedOrder('order-4'));

      dispositions = await peer.waitForDispositions('orders.unclaimed', 1);
    });

    afterAll(async () => {
      await closeAll([producer.transport, consumer.transport, peer]);
    });

    it('should reject the message as not found', () => {
      expect(dispositions[0]?.outcome).toBe('rejected');
      expect(dispositions[0]?.error?.condition).toBe('amqp:not-found');
    });
  });

  describe('having a credit window of two messages and a slow handler', () => {
    let peer: AmqpTestPeer;
    let producer: ProducerSetup;
    let consumer: ConsumerSetup;
    let dispositions: AmqpTestPeerDisposition[];

    beforeAll(async () => {
      peer = await startPeer();
      producer = await startProducer(peer);
      consumer = await startConsumer(peer);

      await Promise.all(
        ['a', 'b', 'c', 'd', 'e', 'f'].map(
          async (orderId: string): Promise<void> =>
            producer.commandBus.send(new ThrottledOrder(orderId)),
        ),
      );

      dispositions = await peer.waitForDispositions('orders.throttled', 6);
    });

    afterAll(async () => {
      await closeAll([producer.transport, consumer.transport, peer]);
    });

    it('should handle at most two messages at once', () => {
      expect(consumer.records.throttling.maxActive).toBe(2);
    });

    it('should accept every message', () => {
      expect(
        dispositions.map(
          (disposition: AmqpTestPeerDisposition) => disposition.outcome,
        ),
      ).toStrictEqual(Array(6).fill('accepted'));
    });
  });

  describe('having a peer rejecting the sent message', () => {
    let peer: AmqpTestPeer;
    let producer: ProducerSetup;
    let result: unknown;

    beforeAll(async () => {
      peer = await startPeer();
      producer = await startProducer(peer);

      result = await captureError(async () =>
        producer.commandBus.send(new PeerRejectedOrder('order-5')),
      );
    });

    afterAll(async () => {
      await closeAll([producer.transport, peer]);
    });

    it('should reject the send with the peer outcome', () => {
      expect(result).toStrictEqual(
        new Error(
          'AMQP 1.0 peer rejected the message sent to address "orders.peer-rejected" on connection "peer": amqp:precondition-failed - Address "orders.peer-rejected" rejects every message',
        ),
      );
    });
  });

  describe('having a peer refusing a listened address', () => {
    let peer: AmqpTestPeer;
    let transport: Amqp1Dot0TransportProvider;
    let result: unknown;
    let sendResult: unknown;

    beforeAll(async () => {
      peer = await startPeer();

      transport = new Amqp1Dot0TransportProvider({
        connections: buildConnections(peer.port).map(
          (config: Amqp1Dot0ConnectionConfig): Amqp1Dot0ConnectionConfig => ({
            ...config,
            listenersEnabled: config.identifier === REFUSING_PEER,
          }),
        ),
        logger: false,
      });

      result = await captureError(async () =>
        new CqrsProvider([transport], { logger: false }).provide(
          new Container(),
        ),
      );

      sendResult = await captureError(async () =>
        transport.send(new RefusedOrder(), {
          address: 'orders.refused',
          connectionIdentifier: REFUSING_PEER,
        }),
      );
    });

    afterAll(async () => {
      await closeAll([transport, peer]);
    });

    it('should fail to provide', () => {
      expect(result).toStrictEqual(
        new Error(
          'Failed to open AMQP 1.0 receiver for address "orders.refused" on connection "refusing-peer" (receiver_error): amqp:not-found - Address "orders.refused" is refused',
        ),
      );
    });

    it('should leave the transport closed', () => {
      expect(sendResult).toStrictEqual(
        new Error('AMQP 1.0 transport is closed'),
      );
    });
  });

  describe('having an unreachable peer', () => {
    let result: unknown;

    beforeAll(async () => {
      const unreachablePeer: AmqpTestPeer = await AmqpTestPeer.start();
      const unreachablePort: number = unreachablePeer.port;

      await unreachablePeer.close();

      result = await captureError(async () =>
        new CqrsProvider(
          [
            new Amqp1Dot0TransportProvider({
              connections: buildConnections(unreachablePort),
              logger: false,
            }),
          ],
          { logger: false },
        ).provide(new Container()),
      );
    });

    it('should fail to provide', () => {
      expect(result).toBeInstanceOf(Error);
      expect(result).toHaveProperty(
        'message',
        expect.stringMatching(
          /^Failed to open AMQP 1\.0 connection "(peer|refusing-peer)" \(disconnected\): connect ECONNREFUSED/,
        ),
      );
    });
  });

  describe('having a send awaiting settlement when the peer closes the connection with a fatal error', () => {
    let peer: AmqpTestPeer;
    let producer: ProducerSetup;
    let result: unknown;
    let nextResult: unknown;

    beforeAll(async () => {
      peer = await startPeer();
      producer = await startProducer(peer, {
        connections: buildConnections(peer.port, {
          reconnect: { initialDelay: 50, maxDelay: 50 },
        }),
      });

      const sendResult: Promise<unknown> = captureError(async () =>
        producer.commandBus.send(new UnsettledOrder('order-6')),
      );

      await peer.waitForReceivedMessages('orders.unsettled', 1);

      peer.closeConnections({
        condition: 'amqp:internal-error',
        description: 'Broker shutdown',
      });

      result = await sendResult;
      nextResult = await captureError(async () =>
        producer.commandBus.send(new CreateOrder('order-7')),
      );
    });

    afterAll(async () => {
      await closeAll([producer.transport, peer]);
    });

    it('should reject the pending send', () => {
      expect(result).toStrictEqual(
        new Error(
          'AMQP 1.0 connection "peer" is down and will not reconnect: Broker shutdown',
        ),
      );
    });

    it('should reject later sends right away', () => {
      expect(nextResult).toStrictEqual(
        new Error(
          'AMQP 1.0 connection "peer" is down and will not reconnect: Broker shutdown',
        ),
      );
    });
  });

  describe('having a peer forcing the connection to close', () => {
    let peer: AmqpTestPeer;
    let producer: ProducerSetup;
    let result: unknown;

    beforeAll(async () => {
      peer = await startPeer();
      producer = await startProducer(peer, {
        connections: buildConnections(peer.port, {
          reconnect: { initialDelay: 50, maxDelay: 50 },
        }),
      });

      peer.closeConnections({
        condition: 'amqp:connection:forced',
        description: 'Broker restart',
      });

      await peer.waitForOpenedConnections(4);

      result = await captureError(async () =>
        producer.commandBus.send(new CreateOrder('order-8')),
      );
    });

    afterAll(async () => {
      await closeAll([producer.transport, peer]);
    });

    it('should reconnect and send the message', () => {
      expect(result).toBeUndefined();
      expect(peer.getQueuedMessages('orders.create')).toHaveLength(1);
    });
  });

  describe('having a send timeout and a peer that never settles', () => {
    let peer: AmqpTestPeer;
    let producer: ProducerSetup;
    let result: unknown;

    beforeAll(async () => {
      peer = await startPeer();
      producer = await startProducer(peer, { sendTimeout: 100 });

      result = await captureError(async () =>
        producer.commandBus.send(new UnsettledOrder('order-9')),
      );
    });

    afterAll(async () => {
      await closeAll([producer.transport, peer]);
    });

    it('should reject the send once the timeout elapses', () => {
      expect(result).toStrictEqual(
        new Error(
          'AMQP 1.0 send to address "orders.unsettled" on connection "peer" timed out after 100ms',
        ),
      );
    });
  });

  describe('having a transport closed while waiting to reconnect', () => {
    let peer: AmqpTestPeer;
    let openedConnectionsOnClose: number;

    beforeAll(async () => {
      peer = await startPeer();

      const loggerMock: Mocked<Logger> = buildLoggerMock();
      const transport: Amqp1Dot0TransportProvider =
        new Amqp1Dot0TransportProvider({
          connections: buildConnections(peer.port, {
            reconnect: { initialDelay: 300, maxDelay: 300 },
          }),
          logger: loggerMock,
        });

      await new CqrsProvider([transport], { logger: false }).provide(
        new Container(),
      );

      peer.dropConnections();

      await waitUntil((): boolean => loggerMock.warn.mock.calls.length === 2);

      await transport.close();

      openedConnectionsOnClose = peer.openedConnectionCount;

      await sleep(500);
    });

    afterAll(async () => {
      await peer.close();
    });

    it('should not reconnect', () => {
      expect(peer.openedConnectionCount).toBe(openedConnectionsOnClose);
    });
  });

  describe('having a closed producer', () => {
    let peer: AmqpTestPeer;
    let result: unknown;

    beforeAll(async () => {
      peer = await startPeer();

      const producer: ProducerSetup = await startProducer(peer);

      await producer.transport.close();

      result = await captureError(async () =>
        producer.commandBus.send(new CreateOrder('order-10')),
      );
    });

    afterAll(async () => {
      await peer.close();
    });

    it('should reject sends', () => {
      expect(result).toStrictEqual(new Error('AMQP 1.0 transport is closed'));
    });
  });
});
