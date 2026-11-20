import { type Mock, vitest } from 'vitest';

import { EventEmitter } from 'node:events';

import {
  type AmqpError,
  type ConnectionOptions,
  type Message,
  type ReceiverOptions,
  type SenderOptions,
} from 'rhea';

export type FakeRheaConnectionBehavior = 'fail' | 'open';

export type FakeRheaLinkBehavior = 'attach' | 'pending' | 'refuse';

export type FakeRheaOutcome = 'accepted' | 'modified' | 'rejected' | 'released';

type LinkKind = 'receiver' | 'sender';

function getHost(options: ConnectionOptions): string {
  return (options as { host?: string }).host ?? '';
}

export class FakeRheaIncomingDelivery {
  public readonly accept: Mock<() => void>;
  public readonly modified: Mock<(params: object) => void>;
  public readonly reject: Mock<(error: AmqpError) => void>;
  public readonly release: Mock<() => void>;
  public readonly settled: Promise<void>;

  constructor() {
    let resolveSettled: () => void = (): void => {};

    this.settled = new Promise<void>((resolve: () => void): void => {
      resolveSettled = resolve;
    });

    this.accept = vitest.fn(resolveSettled);
    this.modified = vitest.fn(resolveSettled);
    this.reject = vitest.fn(resolveSettled);
    this.release = vitest.fn(resolveSettled);
  }
}

export interface FakeRheaOutgoingDelivery {
  remote_state: { error?: AmqpError } | undefined;
}

export interface FakeRheaSentMessage {
  readonly delivery: FakeRheaOutgoingDelivery;
  readonly message: Message;
}

export class FakeRheaLink extends EventEmitter {
  public readonly add_credit: Mock<(credit: number) => void>;
  public readonly close: Mock<(error?: AmqpError) => void>;
  public error: AmqpError | undefined;
  public readonly is_open: Mock<() => boolean>;
  public readonly send: Mock<(message: Message) => FakeRheaOutgoingDelivery>;
  public readonly sendable: Mock<() => boolean>;
  public readonly sent: FakeRheaSentMessage[];
  public source: unknown;
  public target: unknown;

  constructor(
    public readonly connection: FakeRheaConnection,
    public readonly kind: LinkKind,
    public readonly options: ReceiverOptions | SenderOptions,
    public readonly address: string,
  ) {
    super();

    this.add_credit = vitest.fn();
    this.close = vitest.fn((): void => {
      this.is_open.mockReturnValue(false);
    });
    this.error = undefined;
    this.is_open = vitest.fn((): boolean => true);
    this.sent = [];
    this.source = undefined;
    this.target = undefined;
    this.sendable = vitest.fn((): boolean => true);
    this.send = vitest.fn((message: Message): FakeRheaOutgoingDelivery => {
      const delivery: FakeRheaOutgoingDelivery = { remote_state: undefined };

      this.sent.push({ delivery, message });

      return delivery;
    });
  }

  public attach(behavior: FakeRheaLinkBehavior): void {
    if (behavior === 'attach') {
      if (this.kind === 'receiver') {
        this.source = { address: this.address };
      } else {
        this.target = { address: this.address };
      }
    } else {
      this.source = { type: {}, value: null };
      this.target = { type: {}, value: null };
    }

    this.emit(`${this.kind}_open`, this.#buildContext());

    if (behavior === 'refuse') {
      this.closeRemotely({
        condition: 'amqp:not-found',
        description: `Address "${this.address}" is refused`,
      });
    }
  }

  public closeRemotely(error?: AmqpError): void {
    this.error = error;

    if (error !== undefined) {
      this.emit(`${this.kind}_error`, this.#buildContext());
    }

    this.emit(`${this.kind}_close`, this.#buildContext());
  }

  public receive(message: Message): FakeRheaIncomingDelivery {
    const delivery: FakeRheaIncomingDelivery = new FakeRheaIncomingDelivery();

    this.emit('message', { ...this.#buildContext(), delivery, message });

    return delivery;
  }

  public settle(
    sentMessage: FakeRheaSentMessage,
    outcome: FakeRheaOutcome,
    error?: AmqpError,
  ): void {
    sentMessage.delivery.remote_state = error === undefined ? {} : { error };

    this.emit(outcome, {
      ...this.#buildContext(),
      delivery: sentMessage.delivery,
    });
  }

  #buildContext(): Record<string, unknown> {
    return {
      connection: this.connection,
      [this.kind]: this,
    };
  }
}

export class FakeRheaConnection extends EventEmitter {
  public readonly _is_fatal: Mock<(condition: string) => boolean>;
  public readonly close: Mock<() => void>;
  public error: AmqpError | undefined;
  public readonly get_error: Mock<() => AmqpError | undefined>;
  public readonly open_receiver: Mock<
    (options: ReceiverOptions) => FakeRheaLink
  >;
  public readonly open_sender: Mock<(options: SenderOptions) => FakeRheaLink>;
  public readonly options: ConnectionOptions;
  public readonly receivers: FakeRheaLink[];
  public readonly reconnect: Mock<() => void>;
  public scheduled_reconnect: ReturnType<typeof setTimeout> | undefined;
  public readonly senders: FakeRheaLink[];
  public readonly set_reconnect: Mock<(reconnect: boolean | number) => void>;
  public silentClose: boolean;
  #open: boolean;

  constructor(
    container: FakeRheaContainer,
    options: ConnectionOptions,
    behavior: FakeRheaConnectionBehavior,
  ) {
    super();

    this._is_fatal = vitest.fn(
      (condition: string): boolean => condition !== 'amqp:connection:forced',
    );
    this.error = undefined;
    this.get_error = vitest.fn((): AmqpError | undefined => this.error);
    this.options = { ...options };
    this.receivers = [];
    this.reconnect = vitest.fn();
    this.scheduled_reconnect = undefined;
    this.senders = [];
    this.silentClose = false;
    this.#open = false;

    this.close = vitest.fn((): void => {
      const wasOpen: boolean = this.#open;

      this.#open = false;

      if (wasOpen && !this.silentClose) {
        process.nextTick((): void => {
          this.emit('connection_close', { connection: this });
        });
      }
    });

    // rhea's set_reconnect(true) stores a backoff function, which is truthy.
    this.set_reconnect = vitest.fn((reconnect: boolean | number): void => {
      this.options.reconnect = reconnect;
    });

    this.open_receiver = vitest.fn((options: ReceiverOptions): FakeRheaLink => {
      const address: string = (options.source as { address: string }).address;

      return this.#openLink(
        container,
        this.receivers,
        'receiver',
        options,
        address,
      );
    });

    this.open_sender = vitest.fn((options: SenderOptions): FakeRheaLink => {
      const address: string = (options.target as { address: string }).address;

      return this.#openLink(
        container,
        this.senders,
        'sender',
        options,
        address,
      );
    });

    process.nextTick((): void => {
      if (behavior === 'open') {
        this.#open = true;
        this.emit('connection_open', { connection: this });
      } else {
        this.emit('disconnected', {
          connection: this,
          error: new Error('connect ECONNREFUSED'),
          reconnecting: false,
        });
      }
    });
  }

  public closeRemotely(error?: AmqpError): void {
    this.error = error;
    this.#open = false;

    if (error !== undefined) {
      this.emit('connection_error', { connection: this, error });
    }

    this.emit('connection_close', { connection: this, error });
  }

  public disconnect(reconnecting: boolean): void {
    this.#open = false;

    if (reconnecting) {
      this.scheduled_reconnect = setTimeout((): void => {
        this.scheduled_reconnect = undefined;
        this.reconnect();
      }, 0);
    }

    this.emit('disconnected', { connection: this, reconnecting });
  }

  public is_open(): boolean {
    return this.#open;
  }

  #openLink(
    container: FakeRheaContainer,
    links: FakeRheaLink[],
    kind: LinkKind,
    options: ReceiverOptions | SenderOptions,
    address: string,
  ): FakeRheaLink {
    const link: FakeRheaLink = new FakeRheaLink(this, kind, options, address);

    links.push(link);

    const behavior: FakeRheaLinkBehavior =
      container.linkBehaviors.get(address) ?? 'attach';

    if (behavior !== 'pending') {
      process.nextTick((): void => {
        link.attach(behavior);
        container.onLinkAttached?.(link);
      });
    }

    return link;
  }
}

export class FakeRheaContainer extends EventEmitter {
  public readonly connect: Mock<
    (options: ConnectionOptions) => FakeRheaConnection
  >;
  public readonly connectionBehaviors: Map<string, FakeRheaConnectionBehavior>;
  public readonly connections: FakeRheaConnection[];
  public readonly linkBehaviors: Map<string, FakeRheaLinkBehavior>;
  public onLinkAttached: ((link: FakeRheaLink) => void) | undefined;

  constructor() {
    super();

    this.connectionBehaviors = new Map();
    this.connections = [];
    this.linkBehaviors = new Map();
    this.onLinkAttached = undefined;

    this.connect = vitest.fn(
      (options: ConnectionOptions): FakeRheaConnection => {
        const connection: FakeRheaConnection = new FakeRheaConnection(
          this,
          options,
          this.connectionBehaviors.get(getHost(options)) ?? 'open',
        );

        this.connections.push(connection);

        return connection;
      },
    );
  }

  public getConnection(host: string): FakeRheaConnection {
    const connection: FakeRheaConnection | undefined = this.connections.find(
      (candidate: FakeRheaConnection): boolean =>
        getHost(candidate.options) === host,
    );

    if (connection === undefined) {
      throw new Error(`No connection to "${host}"`);
    }

    return connection;
  }
}
