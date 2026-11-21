import { type AddressInfo, type Server, type Socket } from 'node:net';

import rhea, {
  type AmqpError,
  type Connection,
  type Container,
  type Delivery,
  type EventContext,
  type Message,
  type Receiver,
  type Sender,
  type SenderOptions,
} from 'rhea';

export type AmqpTestPeerIncomingOutcome =
  | 'accept'
  | 'hold'
  | 'modified'
  | 'reject'
  | 'release';

export interface AmqpTestPeerDisposition {
  readonly address: string;
  readonly error: AmqpError | undefined;
  readonly message: Message | undefined;
  readonly outcome: AmqpTestPeerOutgoingOutcome;
}

export interface AmqpTestPeerReceiverDisposition {
  readonly address: string;
  readonly settled: boolean;
}

type AmqpTestPeerOutgoingOutcome =
  | 'accepted'
  | 'modified'
  | 'rejected'
  | 'released';

interface Waiter {
  readonly predicate: () => boolean;
  readonly resolve: () => void;
}

const OUTGOING_OUTCOMES: readonly AmqpTestPeerOutgoingOutcome[] = [
  'accepted',
  'modified',
  'rejected',
  'released',
];

/**
 * Minimal AMQP 1.0 peer: every address is a queue, and messages sent to an
 * address are delivered to the links consuming from it.
 */
export class AmqpTestPeer {
  public readonly dispositions: AmqpTestPeerDisposition[];

  readonly #connections: Set<Connection>;
  readonly #consumers: Map<string, Sender[]>;
  readonly #incomingLinks: Map<string, Receiver[]>;
  readonly #incomingOutcomes: Map<string, AmqpTestPeerIncomingOutcome>;
  #openedConnectionCount: number;
  readonly #outgoingMessages: WeakMap<Delivery, Message>;
  readonly #queues: Map<string, Message[]>;
  readonly #receivedMessages: Map<string, Message[]>;
  readonly #receiverDispositions: AmqpTestPeerReceiverDisposition[];
  readonly #receiverSettlements: string[];
  readonly #refusedAddresses: Set<string>;
  readonly #secondSettleAddresses: Set<string>;
  readonly #server: Server;
  readonly #sockets: Set<Socket>;
  readonly #waiters: Set<Waiter>;

  private constructor(server: Server, sockets: Set<Socket>) {
    this.dispositions = [];
    this.#connections = new Set();
    this.#consumers = new Map();
    this.#incomingLinks = new Map();
    this.#incomingOutcomes = new Map();
    this.#openedConnectionCount = 0;
    this.#outgoingMessages = new WeakMap();
    this.#queues = new Map();
    this.#receivedMessages = new Map();
    this.#receiverDispositions = [];
    this.#receiverSettlements = [];
    this.#refusedAddresses = new Set();
    this.#secondSettleAddresses = new Set();
    this.#server = server;
    this.#sockets = sockets;
    this.#waiters = new Set();
  }

  public get openedConnectionCount(): number {
    return this.#openedConnectionCount;
  }

  public get port(): number {
    return (this.#server.address() as AddressInfo).port;
  }

  public static async start(): Promise<AmqpTestPeer> {
    const container: Container = rhea.create_container();
    const sockets: Set<Socket> = new Set();

    const server: Server = container.listen({
      host: '127.0.0.1',
      port: 0,
      receiver_options: { autoaccept: false },
      sender_options: {
        treat_modified_as_released: false,
      } as SenderOptions,
    });

    server.on('connection', (socket: Socket): void => {
      sockets.add(socket);

      socket.on('close', (): void => {
        sockets.delete(socket);
      });
    });

    const peer: AmqpTestPeer = new AmqpTestPeer(server, sockets);

    peer.#listen(container);

    await new Promise<void>(
      (resolve: () => void, reject: (error: Error) => void): void => {
        if (server.listening) {
          resolve();

          return;
        }

        const onError = (error: Error): void => {
          server.off('listening', onListening);
          reject(error);
        };
        const onListening = (): void => {
          server.off('error', onError);
          resolve();
        };

        server.once('error', onError);
        server.once('listening', onListening);
      },
    );

    return peer;
  }

  public async close(): Promise<void> {
    this.dropConnections();

    await new Promise<void>((resolve: () => void): void => {
      this.#server.close((): void => {
        resolve();
      });
    });
  }

  /**
   * Closes every open connection with an AMQP close frame.
   */
  public closeConnections(error?: AmqpError): void {
    for (const connection of this.#connections) {
      connection.close(error);
    }
  }

  public closeIncomingLinks(address: string): void {
    for (const receiver of this.#incomingLinks.get(address) ?? []) {
      receiver.close();
    }
  }

  /**
   * Destroys every socket without closing the AMQP connections, as a network
   * failure would.
   */
  public dropConnections(): void {
    for (const socket of this.#sockets) {
      socket.destroy();
    }
  }

  public getDispositions(address: string): AmqpTestPeerDisposition[] {
    return this.dispositions.filter(
      (disposition: AmqpTestPeerDisposition): boolean =>
        disposition.address === address,
    );
  }

  public getQueuedMessages(address: string): readonly Message[] {
    return this.#queues.get(address) ?? [];
  }

  public getReceivedMessages(address: string): readonly Message[] {
    return this.#receivedMessages.get(address) ?? [];
  }

  public getReceiverDispositions(
    address: string,
  ): readonly AmqpTestPeerReceiverDisposition[] {
    return this.#receiverDispositions.filter(
      (disposition: AmqpTestPeerReceiverDisposition): boolean =>
        disposition.address === address,
    );
  }

  public refuseLinks(address: string): void {
    this.#refusedAddresses.add(address);
  }

  public setIncomingOutcome(
    address: string,
    outcome: AmqpTestPeerIncomingOutcome,
  ): void {
    this.#incomingOutcomes.set(address, outcome);
  }

  public setReceiverSettlesSecond(address: string): void {
    this.#secondSettleAddresses.add(address);
  }

  public async waitForDispositions(
    address: string,
    count: number,
  ): Promise<AmqpTestPeerDisposition[]> {
    await this.#waitFor(
      (): boolean => this.getDispositions(address).length >= count,
    );

    return this.getDispositions(address);
  }

  public async waitForOpenedConnections(count: number): Promise<void> {
    await this.#waitFor((): boolean => this.#openedConnectionCount >= count);
  }

  public async waitForQueuedMessages(
    address: string,
    count: number,
  ): Promise<void> {
    await this.#waitFor(
      (): boolean => this.getQueuedMessages(address).length >= count,
    );
  }

  public async waitForReceivedMessages(
    address: string,
    count: number,
  ): Promise<void> {
    await this.#waitFor(
      (): boolean => this.getReceivedMessages(address).length >= count,
    );
  }

  public async waitForReceiverSettlements(
    address: string,
    count: number,
  ): Promise<void> {
    await this.#waitFor(
      (): boolean =>
        this.#receiverSettlements.filter(
          (settledAddress: string): boolean => settledAddress === address,
        ).length >= count,
    );
  }

  #flush(address: string): void {
    const queue: Message[] = this.#queues.get(address) ?? [];

    for (const consumer of this.#consumers.get(address) ?? []) {
      while (queue.length > 0 && consumer.sendable()) {
        const message: Message = queue.shift() as Message;

        this.#outgoingMessages.set(consumer.send(message), message);
      }
    }

    this.#notify();
  }

  #getMessages(
    messagesByAddress: Map<string, Message[]>,
    address: string,
  ): Message[] {
    let messages: Message[] | undefined = messagesByAddress.get(address);

    if (messages === undefined) {
      messages = [];

      messagesByAddress.set(address, messages);
    }

    return messages;
  }

  #listen(container: Container): void {
    container.on('connection_open', (context: EventContext): void => {
      this.#connections.add(context.connection);
      ++this.#openedConnectionCount;

      this.#notify();
    });

    container.on('connection_close', (context: EventContext): void => {
      this.#connections.delete(context.connection);
    });

    container.on('sender_open', (context: EventContext): void => {
      this.#onConsumerAttached(context.sender as Sender);
    });

    container.on('receiver_open', (context: EventContext): void => {
      this.#onProducerAttached(context.receiver as Receiver);
    });

    container.on('settled', (context: EventContext): void => {
      if (context.receiver === undefined || context.sender !== undefined) {
        return;
      }

      this.#receiverSettlements.push(context.receiver.target.address);
      this.#notify();
    });

    container.on('message', (context: EventContext): void => {
      this.#onMessage(context);
    });

    container.on('sendable', (context: EventContext): void => {
      const sender: Sender | undefined = context.sender;

      if (sender !== undefined) {
        this.#flush(sender.source.address);
      }
    });

    container.on('sender_close', (context: EventContext): void => {
      this.#removeConsumer(context.sender as Sender);
    });

    container.on('disconnected', (context: EventContext): void => {
      this.#connections.delete(context.connection);

      for (const consumers of this.#consumers.values()) {
        for (const consumer of [...consumers]) {
          if (consumer.connection === context.connection) {
            this.#removeConsumer(consumer);
          }
        }
      }
    });

    container.on('error', (): void => {});

    for (const outcome of OUTGOING_OUTCOMES) {
      container.on(outcome, (context: EventContext): void => {
        this.#onDisposition(context, outcome);
      });
    }
  }

  #notify(): void {
    for (const waiter of this.#waiters) {
      if (waiter.predicate()) {
        this.#waiters.delete(waiter);
        waiter.resolve();
      }
    }
  }

  #onConsumerAttached(sender: Sender): void {
    const address: string = sender.source.address;

    if (this.#refusedAddresses.has(address)) {
      sender.close({
        condition: 'amqp:not-found',
        description: `Address "${address}" is refused`,
      });

      return;
    }

    sender.set_source({ address });

    let consumers: Sender[] | undefined = this.#consumers.get(address);

    if (consumers === undefined) {
      consumers = [];

      this.#consumers.set(address, consumers);
    }

    consumers.push(sender);
  }

  #onDisposition(
    context: EventContext,
    outcome: AmqpTestPeerOutgoingOutcome,
  ): void {
    const sender: Sender | undefined = context.sender;
    const delivery: Delivery | undefined = context.delivery;

    if (sender === undefined || delivery === undefined) {
      return;
    }

    const remoteState: unknown = delivery.remote_state;

    this.dispositions.push({
      address: sender.source.address,
      error: (remoteState as { error?: AmqpError } | undefined)?.error,
      message: this.#outgoingMessages.get(delivery),
      outcome,
    });

    this.#notify();
  }

  #onMessage(context: EventContext): void {
    const receiver: Receiver | undefined = context.receiver;
    const delivery: Delivery | undefined = context.delivery;
    const message: Message | undefined = context.message;

    if (
      receiver === undefined ||
      delivery === undefined ||
      message === undefined
    ) {
      return;
    }

    const address: string = receiver.target.address;

    this.#getMessages(this.#receivedMessages, address).push(message);

    switch (this.#incomingOutcomes.get(address) ?? 'accept') {
      case 'accept':
        if (this.#secondSettleAddresses.has(address)) {
          this.#recordReceiverDisposition(address, delivery);
        }

        this.#getMessages(this.#queues, address).push(message);
        delivery.accept();
        this.#flush(address);
        break;
      case 'hold':
        break;
      case 'modified':
        delivery.modified({ delivery_failed: true });
        break;
      case 'reject':
        delivery.reject({
          condition: 'amqp:precondition-failed',
          description: `Address "${address}" rejects every message`,
        });
        break;
      case 'release':
        delivery.release();
        break;
    }

    this.#notify();
  }

  #onProducerAttached(receiver: Receiver): void {
    const address: string = receiver.target.address;

    if (this.#secondSettleAddresses.has(address)) {
      (
        receiver as unknown as {
          local: { attach: { rcv_settle_mode: number } };
        }
      ).local.attach.rcv_settle_mode = 1;
    }

    if (this.#refusedAddresses.has(address)) {
      receiver.close({
        condition: 'amqp:not-found',
        description: `Address "${address}" is refused`,
      });

      return;
    }

    receiver.set_target({ address });

    let links: Receiver[] | undefined = this.#incomingLinks.get(address);

    if (links === undefined) {
      links = [];

      this.#incomingLinks.set(address, links);
    }

    links.push(receiver);
  }

  #recordReceiverDisposition(address: string, delivery: Delivery): void {
    const update: Delivery['update'] = delivery.update.bind(delivery);

    delivery.update = (settled: boolean, state?: unknown): void => {
      update(settled, state);

      this.#receiverDispositions.push({
        address,
        settled: delivery.settled,
      });
      this.#notify();
    };
  }

  #removeConsumer(sender: Sender): void {
    for (const consumers of this.#consumers.values()) {
      const index: number = consumers.indexOf(sender);

      if (index !== -1) {
        consumers.splice(index, 1);
      }
    }
  }

  async #waitFor(predicate: () => boolean): Promise<void> {
    if (predicate()) {
      return;
    }

    await new Promise<void>((resolve: () => void): void => {
      this.#waiters.add({ predicate, resolve });
    });
  }
}
