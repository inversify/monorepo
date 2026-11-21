import { isPromise, stringifyServiceIdentifier } from '@inversifyjs/common';
import {
  type CommandHandlerConfig,
  type TransportProvider,
  type TransportProviderConfig,
} from '@inversifyjs/framework-cqrs';
import { ConsoleLogger, type Logger } from '@inversifyjs/logger';
import { type Container, type ServiceIdentifier } from 'inversify';
import rhea, {
  type AmqpError,
  type Connection,
  type Delivery,
  type EventContext,
  type Message,
  type Container as RheaContainer,
  type Receiver,
  type Sender,
} from 'rhea';

import { waitForEvent } from '../actions/waitForEvent.js';
import { waitUnlessAborted } from '../actions/waitUnlessAborted.js';
import { buildAmqp1Dot0Message } from '../calculations/buildAmqp1Dot0Message.js';
import { buildRheaConnectionOptions } from '../calculations/buildRheaConnectionOptions.js';
import { buildRheaMessage } from '../calculations/buildRheaMessage.js';
import { buildRheaSource } from '../calculations/buildRheaSource.js';
import { buildRheaTerminusOptions } from '../calculations/buildRheaTerminusOptions.js';
import { describeError } from '../calculations/describeError.js';
import { getAbortReason } from '../calculations/getAbortReason.js';
import { isAmqp1Dot0TransportDeclaration } from '../calculations/isAmqp1Dot0TransportDeclaration.js';
import { isNullTerminus } from '../calculations/isNullTerminus.js';
import { amqp1Dot0TransportIdentifier } from '../data/amqp1Dot0TransportIdentifier.js';
import { type Amqp1Dot0CommandHandler } from '../models/Amqp1Dot0CommandHandler.js';
import { type Amqp1Dot0ConnectionConfig } from '../models/Amqp1Dot0ConnectionConfig.js';
import { type Amqp1Dot0HandlerErrorOutcome } from '../models/Amqp1Dot0HandlerErrorOutcome.js';
import { type Amqp1Dot0Message } from '../models/Amqp1Dot0Message.js';
import { type Amqp1Dot0Serializer } from '../models/Amqp1Dot0Serializer.js';
import { type Amqp1Dot0TransportParams } from '../models/Amqp1Dot0TransportParams.js';
import { type Amqp1Dot0TransportProviderOptions } from '../models/Amqp1Dot0TransportProviderOptions.js';
import { Amqp1Dot0JsonSerializer } from '../serializers/Amqp1Dot0JsonSerializer.js';

const CLOSE_TIMEOUT_MS: number = 5000;

// Node stores a timer delay in a signed 32-bit integer. A larger value is
// shortened, so it is rejected instead.
const MAX_SEND_TIMEOUT_MS: number = 2_147_483_647;

const DEFAULT_CREDIT_WINDOW: number = 100;

const HANDLER_FAILURE_DESCRIPTION: string =
  'The handler failed to process the message';

const SETTLEMENT_FAILURE_OUTCOMES: readonly string[] = [
  'modified',
  'rejected',
  'released',
];

// AMQP outcome descriptor codes. `received` is not terminal.
const AMQP_OUTCOME_ACCEPTED: number = 0x24;
const AMQP_OUTCOME_MODIFIED: number = 0x27;
const AMQP_OUTCOME_RECEIVED: number = 0x23;
const AMQP_OUTCOME_REJECTED: number = 0x25;
const AMQP_OUTCOME_RELEASED: number = 0x26;

type HandlerServiceIdentifier = ServiceIdentifier<
  Partial<Amqp1Dot0CommandHandler>
>;

type ProviderState = 'closed' | 'idle' | 'initialized' | 'initializing';

interface ConnectionEntry {
  readonly config: Amqp1Dot0ConnectionConfig;
  connection: RheaConnection | undefined;
  readonly downController: AbortController;
  readonly listenersEnabled: boolean;
  readonly receivers: Receiver[];
  reconnecting: boolean;
  readonly senderEntries: Set<SenderEntry>;
  readonly senders: Map<string, Promise<SenderEntry>>;
  // Aborted when the provider closes or the connection is down for good.
  readonly signal: AbortSignal;
}

interface OutboundRoute {
  readonly params: Amqp1Dot0TransportParams;
  // oxlint-disable-next-line typescript/no-unsafe-function-type
  readonly type: Function;
}

interface PendingDelivery {
  reject(error: Error): void;
  resolve(): void;
}

// Connection members missing from rhea's typings. rhea is pinned to an exact
// version because these are internals.
interface RheaConnection extends Connection {
  _is_fatal(condition: string): boolean;
  abort_socket(socket: unknown): void;
  scheduled_reconnect: ReturnType<typeof setTimeout> | undefined;
  set_reconnect(reconnect: boolean | number): void;
  socket: unknown;
}

interface SenderEntry {
  readonly address: string;
  readonly closed: AbortSignal;
  readonly pendingDeliveries: Map<Delivery, PendingDelivery>;
  readonly sender: Sender;
}

export class Amqp1Dot0TransportProvider implements TransportProvider<Amqp1Dot0TransportParams> {
  readonly #closeController: AbortController;
  #closePromise: Promise<void> | undefined;
  readonly #connectionEntries: Map<string | symbol, ConnectionEntry>;
  #container: Container | undefined;
  readonly #dispatchReady: Promise<void>;
  readonly #handlerErrorOutcome: Amqp1Dot0HandlerErrorOutcome;
  readonly #logger: Logger | undefined;
  readonly #outboundRoutes: OutboundRoute[];
  #resolveDispatchReady: () => void;
  readonly #rheaContainer: RheaContainer;
  readonly #sendTimeout: number | undefined;
  readonly #serializer: Amqp1Dot0Serializer;
  #state: ProviderState;

  constructor(options: Amqp1Dot0TransportProviderOptions) {
    this.#closeController = new AbortController();
    this.#closePromise = undefined;
    this.#connectionEntries = this.#buildConnectionEntries(options);
    this.#sendTimeout = this.#buildSendTimeout(options);
    this.#container = undefined;
    this.#resolveDispatchReady = (): void => {};
    this.#dispatchReady = new Promise<void>((resolve: () => void): void => {
      this.#resolveDispatchReady = resolve;
    });
    this.#handlerErrorOutcome = options.handlerErrorOutcome ?? 'reject';
    this.#logger = this.#buildLogger(options);
    this.#outboundRoutes = [];
    this.#rheaContainer = this.#buildRheaContainer();
    this.#serializer = options.serializer ?? new Amqp1Dot0JsonSerializer();
    this.#state = 'idle';
  }

  public async close(): Promise<void> {
    this.#closePromise ??= this.#teardown();

    await this.#closePromise;
  }

  public getConfigList(): Iterable<
    TransportProviderConfig<Amqp1Dot0TransportParams>
  > {
    return this.#outboundRoutes.map(
      (
        route: OutboundRoute,
      ): TransportProviderConfig<Amqp1Dot0TransportParams> => ({
        params: route.params,
        type: route.type,
      }),
    );
  }

  public getIdentifier(): string | symbol {
    return amqp1Dot0TransportIdentifier;
  }

  public async initialize(
    container: Container,
    configList: Iterable<CommandHandlerConfig>,
  ): Promise<void> {
    this.#throwIfClosed();

    if (this.#state !== 'idle') {
      throw new Error('AMQP 1.0 transport is already initialized');
    }

    this.#state = 'initializing';
    this.#container = container;

    try {
      const inboundRoutes: Map<
        ConnectionEntry,
        Map<string, HandlerServiceIdentifier[]>
      > = this.#buildRoutes(configList);

      const referencedEntries: ConnectionEntry[] = Array.from(
        new Set(
          this.#outboundRoutes.map((route: OutboundRoute): ConnectionEntry =>
            this.#getConnectionEntry(route.params.connectionIdentifier),
          ),
        ),
      );

      await Promise.all(
        referencedEntries.map(async (entry: ConnectionEntry): Promise<void> =>
          this.#openConnection(entry),
        ),
      );

      this.#throwIfClosed();

      await Promise.all(
        Array.from(inboundRoutes).flatMap(
          ([entry, addressRoutes]: [
            ConnectionEntry,
            Map<string, HandlerServiceIdentifier[]>,
          ]): Promise<void>[] =>
            Array.from(addressRoutes).map(
              async ([address, serviceIdentifiers]: [
                string,
                HandlerServiceIdentifier[],
              ]): Promise<void> =>
                this.#openReceiver(entry, address, serviceIdentifiers),
            ),
        ),
      );

      this.#throwIfClosed();
    } catch (error: unknown) {
      await this.close();

      throw error;
    }

    this.#state = 'initialized';

    setImmediate(this.#resolveDispatchReady);
  }

  public async send(
    command: object,
    params: Amqp1Dot0TransportParams,
  ): Promise<void> {
    this.#assertCanSend();

    const entry: ConnectionEntry = this.#getConnectionEntry(
      params.connectionIdentifier,
    );

    const connection: Connection = this.#getUsableConnection(entry);

    const serializer: Amqp1Dot0Serializer =
      entry.config.serializers?.get(params.address) ?? this.#serializer;

    const message: Message = buildRheaMessage(serializer.serialize(command));

    if (this.#sendTimeout === undefined) {
      await this.#sendMessage(
        entry,
        connection,
        params.address,
        message,
        entry.signal,
      );

      return;
    }

    const timeoutController: AbortController = new AbortController();
    const sendTimeout: number = this.#sendTimeout;

    const timeout: ReturnType<typeof setTimeout> = setTimeout((): void => {
      timeoutController.abort(
        new Error(
          `AMQP 1.0 send to address "${params.address}" on connection "${String(params.connectionIdentifier)}" timed out after ${sendTimeout.toString()}ms`,
        ),
      );
    }, sendTimeout);

    try {
      await this.#sendMessage(
        entry,
        connection,
        params.address,
        message,
        AbortSignal.any([entry.signal, timeoutController.signal]),
      );
    } finally {
      clearTimeout(timeout);
    }
  }

  #assertCanSend(): void {
    this.#throwIfClosed();

    if (this.#state !== 'initialized') {
      throw new Error('AMQP 1.0 transport is not initialized');
    }
  }

  #attachConnectionListeners(
    entry: ConnectionEntry,
    connection: RheaConnection,
  ): void {
    connection.on('disconnected', (context: EventContext): void => {
      const connectionLostError: Error = new Error(
        `AMQP 1.0 connection "${String(entry.config.identifier)}" was lost before the message was settled`,
      );

      for (const senderEntry of entry.senderEntries) {
        this.#rejectPendingDeliveries(senderEntry, connectionLostError);
      }

      if (context.reconnecting !== true) {
        entry.reconnecting = false;
        this.#setConnectionDown(entry, context);
      } else {
        entry.reconnecting = true;

        if (this.#state !== 'closed') {
          this.#logger?.warn(
            `AMQP 1.0 connection "${String(entry.config.identifier)}" disconnected${this.#describeContextError(context)}, reconnecting`,
          );
        }
      }
    });

    connection.on('connection_open', (): void => {
      entry.reconnecting = false;
    });

    connection.on('connection_close', (context: EventContext): void => {
      if (!this.#willReconnectAfterClose(connection)) {
        this.#setConnectionDown(entry, context);
      }
    });

    connection.on('connection_error', (context: EventContext): void => {
      this.#logger?.error(
        `AMQP 1.0 connection "${String(entry.config.identifier)}" failed${this.#describeContextError(context)}`,
      );
    });
  }

  #buildClosedError(): Error {
    return new Error('AMQP 1.0 transport is closed');
  }

  #buildConnectionEntries(
    options: Amqp1Dot0TransportProviderOptions,
  ): Map<string | symbol, ConnectionEntry> {
    const connectionEntries: Map<string | symbol, ConnectionEntry> = new Map();

    for (const config of options.connections) {
      if (connectionEntries.has(config.identifier)) {
        throw new Error(
          `Duplicated AMQP 1.0 connection identifier "${String(config.identifier)}"`,
        );
      }

      const creditWindow: number | undefined =
        config.receiverOptions?.creditWindow;

      if (
        creditWindow !== undefined &&
        !(Number.isInteger(creditWindow) && creditWindow > 0)
      ) {
        throw new Error(
          `AMQP 1.0 creditWindow must be a positive integer (connection "${String(config.identifier)}")`,
        );
      }

      if (
        config.connectionOptions.sasl?.mechanism === 'external' &&
        config.connectionOptions.tls?.cert === undefined
      ) {
        throw new Error(
          `AMQP 1.0 SASL EXTERNAL requires a TLS client certificate (connection "${String(config.identifier)}")`,
        );
      }

      const downController: AbortController = new AbortController();

      connectionEntries.set(config.identifier, {
        config,
        connection: undefined,
        downController,
        listenersEnabled:
          config.listenersEnabled ?? options.listenersEnabled ?? false,
        receivers: [],
        reconnecting: false,
        senderEntries: new Set(),
        senders: new Map(),
        signal: AbortSignal.any([
          this.#closeController.signal,
          downController.signal,
        ]),
      });
    }

    return connectionEntries;
  }

  #buildLogger(options: Amqp1Dot0TransportProviderOptions): Logger | undefined {
    const loggerOption: boolean | Logger = options.logger ?? true;

    if (typeof loggerOption === 'boolean') {
      return loggerOption ? new ConsoleLogger() : undefined;
    }

    return loggerOption;
  }

  #buildRheaContainer(): RheaContainer {
    const rheaContainer: RheaContainer = rhea.create_container();

    rheaContainer.on('error', (error: unknown): void => {
      this.#logger?.error(`AMQP 1.0 transport error: ${describeError(error)}`);
    });

    // rhea writes unhandled "disconnected" events to console.warn. Only
    // connections that never opened reach this listener, and their failure
    // is already reported by initialize().
    rheaContainer.on('disconnected', (): void => {});

    for (const eventName of ['receiver_error', 'sender_error']) {
      rheaContainer.on(eventName, (context: EventContext): void => {
        this.#logger?.error(
          `AMQP 1.0 ${eventName.replace('_error', '')} link failed${this.#describeContextError(context)}`,
        );
      });
    }

    return rheaContainer;
  }

  #buildRoutes(
    configList: Iterable<CommandHandlerConfig>,
  ): Map<ConnectionEntry, Map<string, HandlerServiceIdentifier[]>> {
    const inboundRoutes: Map<
      ConnectionEntry,
      Map<string, HandlerServiceIdentifier[]>
    > = new Map();
    const outboundRouteKeys: Set<string> = new Set();
    // oxlint-disable-next-line typescript/no-unsafe-function-type
    const commandTypeIds: Map<Function, number> = new Map();
    const connectionIds: Map<string | symbol, number> = new Map();

    for (const config of configList) {
      const declaration: CommandHandlerConfig['transport'] = config.transport;

      if (!isAmqp1Dot0TransportDeclaration(declaration)) {
        throw new Error(
          `Handler "${config.handler.name}" for command "${config.command.type.name}" is routed to the AMQP 1.0 transport without an AMQP 1.0 transport declaration`,
        );
      }

      const entry: ConnectionEntry | undefined = this.#connectionEntries.get(
        declaration.connectionIdentifier,
      );

      if (entry === undefined) {
        throw new Error(
          `AMQP 1.0 connection "${String(declaration.connectionIdentifier)}" is not registered (declared by handler "${config.handler.name}" for command "${config.command.type.name}")`,
        );
      }

      const commandTypeId: number = this.#getOrSetId(
        commandTypeIds,
        config.command.type,
      );
      const connectionId: number = this.#getOrSetId(
        connectionIds,
        declaration.connectionIdentifier,
      );
      const outboundRouteKey: string = JSON.stringify([
        commandTypeId,
        connectionId,
        declaration.address,
      ]);

      if (!outboundRouteKeys.has(outboundRouteKey)) {
        outboundRouteKeys.add(outboundRouteKey);

        this.#outboundRoutes.push({
          params: {
            address: declaration.address,
            connectionIdentifier: declaration.connectionIdentifier,
          },
          type: config.command.type,
        });
      }

      if (entry.listenersEnabled) {
        this.#pushInboundRoute(
          inboundRoutes,
          entry,
          declaration.address,
          (config.serviceIdentifier ??
            config.handler) as HandlerServiceIdentifier,
        );
      }
    }

    return inboundRoutes;
  }

  #buildSendTimeout(
    options: Amqp1Dot0TransportProviderOptions,
  ): number | undefined {
    const sendTimeout: number | undefined = options.sendTimeout;

    if (sendTimeout === undefined) {
      return undefined;
    }

    if (!(Number.isInteger(sendTimeout) && sendTimeout > 0)) {
      throw new Error('AMQP 1.0 sendTimeout must be a positive integer');
    }

    if (sendTimeout > MAX_SEND_TIMEOUT_MS) {
      throw new Error(
        `AMQP 1.0 sendTimeout must be at most ${MAX_SEND_TIMEOUT_MS.toString()} milliseconds`,
      );
    }

    return sendTimeout;
  }

  async #closeConnection(connection: RheaConnection): Promise<void> {
    // A connection waiting to reconnect ignores close(), and its scheduled
    // reconnection would open it again.
    connection.set_reconnect(false);
    clearTimeout(connection.scheduled_reconnect);
    connection.scheduled_reconnect = undefined;

    const wasOpen: boolean = connection.is_open();

    connection.close();

    if (!wasOpen) {
      this.#forceCloseSocket(connection);

      return;
    }

    try {
      await waitForEvent<EventContext>({
        emitter: connection,
        resolveOn: ['connection_close', 'connection_error', 'disconnected'],
        signal: AbortSignal.timeout(CLOSE_TIMEOUT_MS),
      });
    } catch (_error: unknown) {
      this.#logger?.warn(
        `AMQP 1.0 connection did not close within ${CLOSE_TIMEOUT_MS.toString()}ms`,
      );
      this.#forceCloseSocket(connection);
    }
  }

  #forceCloseSocket(connection: RheaConnection): void {
    if (connection.socket === undefined) {
      return;
    }

    try {
      connection.abort_socket(connection.socket);
    } catch (error: unknown) {
      this.#logger?.warn(
        `Failed to destroy an AMQP 1.0 socket: ${describeError(error)}`,
      );
    }
  }

  #describeContextError(context: EventContext | undefined): string {
    if (context === undefined) {
      return '';
    }

    const error: AmqpError | Error | undefined =
      context.error ??
      context.sender?.error ??
      context.receiver?.error ??
      context.connection.error;

    if (error === undefined) {
      return '';
    }

    return `: ${this.#describeAmqpError(error)}`;
  }

  #describeAmqpError(error: AmqpError | Error): string {
    const amqpError: { condition?: string; description?: string } =
      error as unknown as { condition?: string; description?: string };
    const protocol: string = [amqpError.condition, amqpError.description]
      .filter(
        (value: string | undefined): value is string =>
          value !== undefined && value !== '',
      )
      .join(' - ');

    if (protocol !== '') {
      return protocol;
    }

    return error instanceof Error ? error.message : '';
  }

  async #dispatch(
    entry: ConnectionEntry,
    address: string,
    serviceIdentifiers: readonly HandlerServiceIdentifier[],
    context: EventContext,
  ): Promise<void> {
    await this.#dispatchReady;

    if (this.#state === 'closed') {
      return;
    }

    const container: Container | undefined = this.#container;
    const delivery: Delivery | undefined = context.delivery;
    const rheaMessage: Message | undefined = context.message;

    if (
      container === undefined ||
      delivery === undefined ||
      rheaMessage === undefined
    ) {
      return;
    }

    let handled: boolean = false;

    try {
      const message: Amqp1Dot0Message = buildAmqp1Dot0Message(rheaMessage);

      for (const serviceIdentifier of serviceIdentifiers) {
        handled =
          (await this.#runHandler(container, serviceIdentifier, message)) ||
          handled;
      }
    } catch (error: unknown) {
      this.#logger?.error(
        `AMQP 1.0 handler failed for a message received on address "${address}" (connection "${String(entry.config.identifier)}"): ${describeError(error)}`,
      );

      this.#settle((): void => {
        this.#settleHandlerFailure(delivery);
      });

      return;
    }

    if (!handled) {
      const description: string = `No handler accepted the message received on address "${address}"`;

      this.#logger?.error(
        `${description} (connection "${String(entry.config.identifier)}")`,
      );

      this.#settle((): void => {
        delivery.reject({ condition: 'amqp:not-found', description });
      });

      return;
    }

    this.#settle((): void => {
      delivery.accept();
    });
  }

  #getConnectionEntry(identifier: string | symbol): ConnectionEntry {
    const entry: ConnectionEntry | undefined =
      this.#connectionEntries.get(identifier);

    if (entry === undefined) {
      throw new Error(
        `AMQP 1.0 connection "${String(identifier)}" is not registered`,
      );
    }

    return entry;
  }

  #getOrSetId<TKey>(ids: Map<TKey, number>, key: TKey): number {
    let id: number | undefined = ids.get(key);

    if (id === undefined) {
      id = ids.size;

      ids.set(key, id);
    }

    return id;
  }

  async #getSenderEntry(
    entry: ConnectionEntry,
    connection: Connection,
    address: string,
  ): Promise<SenderEntry> {
    let senderEntryPromise: Promise<SenderEntry> | undefined =
      entry.senders.get(address);

    if (senderEntryPromise === undefined) {
      const openingSenderEntry: Promise<SenderEntry> = this.#openSender(
        entry,
        connection,
        address,
      );

      senderEntryPromise = openingSenderEntry;

      entry.senders.set(address, openingSenderEntry);

      openingSenderEntry.catch((): void => {
        if (entry.senders.get(address) === openingSenderEntry) {
          entry.senders.delete(address);
        }
      });
    }

    return senderEntryPromise;
  }

  #getUsableConnection(entry: ConnectionEntry): Connection {
    const connection: Connection | undefined = entry.connection;

    if (connection === undefined) {
      throw new Error(
        `AMQP 1.0 connection "${String(entry.config.identifier)}" is not open`,
      );
    }

    if (entry.signal.aborted) {
      throw getAbortReason(entry.signal);
    }

    return connection;
  }

  async #openConnection(entry: ConnectionEntry): Promise<void> {
    const connection: RheaConnection = this.#rheaContainer.connect({
      ...buildRheaConnectionOptions(entry.config.connectionOptions),
      reconnect: false,
    }) as RheaConnection;

    entry.connection = connection;

    await waitForEvent<EventContext>({
      buildError: (eventName: string, context: EventContext): Error =>
        new Error(
          `Failed to open AMQP 1.0 connection "${String(entry.config.identifier)}" (${eventName})${this.#describeContextError(context)}`,
        ),
      emitter: connection,
      rejectOn: ['connection_close', 'connection_error', 'disconnected'],
      resolveOn: ['connection_open'],
      signal: this.#closeController.signal,
    });

    // set_reconnect() reads the backoff settings from the connection options.
    connection.set_reconnect(
      entry.config.connectionOptions.reconnect !== false,
    );

    this.#attachConnectionListeners(entry, connection);
  }

  async #openReceiver(
    entry: ConnectionEntry,
    address: string,
    serviceIdentifiers: readonly HandlerServiceIdentifier[],
  ): Promise<void> {
    const connection: Connection | undefined = entry.connection;

    if (connection === undefined) {
      throw new Error(
        `AMQP 1.0 connection "${String(entry.config.identifier)}" is not open`,
      );
    }

    const creditWindow: number =
      entry.config.receiverOptions?.creditWindow ?? DEFAULT_CREDIT_WINDOW;

    const receiver: Receiver = connection.open_receiver({
      autoaccept: false,
      autosettle: true,
      // rhea's credit window refills on arrival, so credit is managed here
      // and returned on settlement to bound the messages being handled.
      credit_window: 0,
      source: buildRheaSource(address, entry.config.receiverOptions?.source),
    });

    entry.receivers.push(receiver);

    let inFlight: number = 0;

    // rhea resets the link credit on reconnection and emits receiver_open
    // again once the link is attached back.
    receiver.on('receiver_open', (): void => {
      if (this.#state !== 'closed' && !isNullTerminus(receiver.source)) {
        receiver.add_credit(creditWindow - inFlight);
      }
    });

    receiver.on('message', (context: EventContext): void => {
      ++inFlight;

      void this.#dispatch(entry, address, serviceIdentifiers, context).finally(
        (): void => {
          --inFlight;

          if (receiver.is_open()) {
            receiver.add_credit(1);
          }
        },
      );
    });

    const sessionEnded: AbortController = new AbortController();
    const attachSignal: AbortSignal = AbortSignal.any([
      entry.signal,
      sessionEnded.signal,
    ]);

    const onSessionEnded: (context: EventContext) => void = (
      context: EventContext,
    ): void => {
      sessionEnded.abort(
        new Error(
          `Failed to open AMQP 1.0 receiver for address "${address}" on connection "${String(entry.config.identifier)}" (session ended)${this.#describeContextError(context)}`,
        ),
      );
    };

    receiver.session.on('session_close', onSessionEnded);
    receiver.session.on('session_error', onSessionEnded);

    try {
      await this.#waitForLinkAttach(
        entry,
        receiver,
        'receiver',
        address,
        attachSignal,
      );
    } finally {
      receiver.session.removeListener('session_close', onSessionEnded);
      receiver.session.removeListener('session_error', onSessionEnded);
    }

    if (attachSignal.aborted) {
      throw getAbortReason(attachSignal);
    }

    let receiverClosureReported: boolean = false;

    const onReceiverClosed: (context: EventContext) => void = (
      context: EventContext,
    ): void => {
      if (receiverClosureReported || this.#state === 'closed') {
        return;
      }

      receiverClosureReported = true;

      this.#logger?.error(
        `AMQP 1.0 receiver for address "${address}" on connection "${String(entry.config.identifier)}" was closed by the peer${this.#describeContextError(context)}`,
      );
    };

    receiver.on('receiver_close', onReceiverClosed);
    receiver.on('receiver_error', onReceiverClosed);
  }

  async #openSender(
    entry: ConnectionEntry,
    connection: Connection,
    address: string,
  ): Promise<SenderEntry> {
    if (entry.reconnecting && !connection.is_open()) {
      await waitForEvent<EventContext>({
        emitter: connection,
        resolveOn: ['connection_open'],
        signal: entry.signal,
      });
    }

    const sender: Sender = connection.open_sender({
      autosettle: true,
      target: {
        ...buildRheaTerminusOptions(entry.config.senderOptions?.target),
        address,
      },
      // rhea otherwise emits released as well as modified.
      treat_modified_as_released: false,
    } as Parameters<Connection['open_sender']>[0]);

    const senderClosed: AbortController = new AbortController();
    const senderEntry: SenderEntry = {
      address,
      closed: senderClosed.signal,
      pendingDeliveries: new Map(),
      sender,
    };

    const senderState: { evicted: boolean; evictionError: Error | undefined } =
      {
        evicted: false,
        evictionError: undefined,
      };

    const evictSender: (error: Error) => void = (error: Error): void => {
      if (senderState.evicted) {
        return;
      }

      senderState.evicted = true;
      senderState.evictionError = error;
      sender.session.removeListener('session_close', onSessionEnded);
      sender.session.removeListener('session_error', onSessionEnded);
      sender.removeListener('sender_close', onSenderClosed);
      sender.removeListener('sender_error', onSenderClosed);
      entry.senders.delete(address);
      entry.senderEntries.delete(senderEntry);
      this.#rejectPendingDeliveries(senderEntry, error);

      // Wake attach and credit waits that have already missed the close event.
      // The cache entry is gone, so the next send opens a new link.
      senderClosed.abort(error);
    };

    const closedError: (context: EventContext) => Error = (
      context: EventContext,
    ): Error =>
      new Error(
        `AMQP 1.0 sender for address "${address}" on connection "${String(entry.config.identifier)}" was closed before the message was settled${this.#describeContextError(context)}`,
      );

    const onSenderClosed: (context: EventContext) => void = (
      context: EventContext,
    ): void => {
      evictSender(closedError(context));
    };

    const onSessionEnded: (context: EventContext) => void = (
      context: EventContext,
    ): void => {
      evictSender(closedError(context));
    };

    sender.session.on('session_close', onSessionEnded);
    sender.session.on('session_error', onSessionEnded);
    sender.on('sender_close', onSenderClosed);
    sender.on('sender_error', onSenderClosed);

    try {
      await this.#waitForLinkAttach(
        entry,
        sender,
        'sender',
        address,
        AbortSignal.any([entry.signal, senderClosed.signal]),
      );
    } catch (error: unknown) {
      evictSender(
        error instanceof Error
          ? error
          : new Error(
              `Failed to open AMQP 1.0 sender for address "${address}" on connection "${String(entry.config.identifier)}"`,
            ),
      );

      this.#settle((): void => {
        sender.close();
      });

      throw error;
    }

    if (senderState.evicted) {
      this.#settle((): void => {
        sender.close();
      });

      throw (
        senderState.evictionError ??
        new Error(
          `AMQP 1.0 sender for address "${address}" on connection "${String(entry.config.identifier)}" was closed before the message was settled`,
        )
      );
    }

    sender.on('accepted', (context: EventContext): void => {
      if (this.#settleOutgoingIfReceiverSettlesSecond(sender, context)) {
        this.#takePendingDelivery(senderEntry, context)?.resolve();
      }
    });

    sender.on('settled', (context: EventContext): void => {
      this.#completeSettledSend(entry, senderEntry, address, context);
    });

    for (const outcome of SETTLEMENT_FAILURE_OUTCOMES) {
      sender.on(outcome, (context: EventContext): void => {
        this.#settleOutgoingIfReceiverSettlesSecond(sender, context);

        this.#takePendingDelivery(senderEntry, context)?.reject(
          this.#buildOutcomeError(entry, address, outcome, context),
        );
      });
    }

    entry.senderEntries.add(senderEntry);

    return senderEntry;
  }

  #completeSettledSend(
    entry: ConnectionEntry,
    senderEntry: SenderEntry,
    address: string,
    context: EventContext,
  ): void {
    const remoteOutcome: string | undefined = this.#outcomeName(
      context.delivery?.remote_state,
    );
    const outcome: string | undefined = this.#isTerminalOutcome(remoteOutcome)
      ? remoteOutcome
      : this.#defaultTerminalOutcome(senderEntry.sender);
    const pendingDelivery: PendingDelivery | undefined =
      this.#takePendingDelivery(senderEntry, context);

    if (pendingDelivery === undefined) {
      return;
    }

    if (outcome === 'accepted') {
      pendingDelivery.resolve();

      return;
    }

    pendingDelivery.reject(
      outcome !== undefined && this.#isTerminalOutcome(outcome)
        ? this.#buildOutcomeError(entry, address, outcome, context)
        : new Error(
            `AMQP 1.0 sender for address "${address}" on connection "${String(entry.config.identifier)}" was settled without a recognized outcome`,
          ),
    );
  }

  #isTerminalOutcome(
    outcome: string | undefined,
  ): outcome is 'accepted' | 'modified' | 'rejected' | 'released' {
    return (
      outcome === 'accepted' ||
      outcome === 'modified' ||
      outcome === 'rejected' ||
      outcome === 'released'
    );
  }

  #defaultTerminalOutcome(sender: Sender): string | undefined {
    const source: unknown = sender.source;

    if (typeof source !== 'object' || source === null) {
      return 'accepted';
    }

    const defaultOutcome: unknown = (source as { default_outcome?: unknown })
      .default_outcome;

    if (defaultOutcome === undefined) {
      return 'accepted';
    }

    return this.#outcomeName(defaultOutcome);
  }

  #outcomeName(state: unknown): string | undefined {
    if (typeof state === 'string') {
      return this.#normalizeOutcomeName(state);
    }

    if (typeof state === 'number') {
      return this.#outcomeNameFromCode(state);
    }

    if (typeof state !== 'object' || state === null) {
      return undefined;
    }

    const compositeType: unknown = (
      state as { constructor?: { composite_type?: unknown } }
    ).constructor?.composite_type;

    if (typeof compositeType === 'string') {
      return this.#normalizeOutcomeName(compositeType);
    }

    return this.#outcomeNameFromDescriptor(
      (state as { descriptor?: unknown }).descriptor,
    );
  }

  #outcomeNameFromCode(code: number): string | undefined {
    switch (code) {
      case AMQP_OUTCOME_ACCEPTED:
        return 'accepted';
      case AMQP_OUTCOME_MODIFIED:
        return 'modified';
      case AMQP_OUTCOME_RECEIVED:
        return 'received';
      case AMQP_OUTCOME_REJECTED:
        return 'rejected';
      case AMQP_OUTCOME_RELEASED:
        return 'released';
      default:
        return undefined;
    }
  }

  #outcomeNameFromDescriptor(descriptor: unknown): string | undefined {
    if (typeof descriptor === 'string' || typeof descriptor === 'number') {
      return this.#outcomeName(descriptor);
    }

    if (typeof descriptor !== 'object' || descriptor === null) {
      return undefined;
    }

    const record: { numeric?: unknown; symbolic?: unknown; value?: unknown } =
      descriptor;

    if (typeof record.symbolic === 'string') {
      return this.#normalizeOutcomeName(record.symbolic);
    }

    if (typeof record.numeric === 'number') {
      return this.#outcomeNameFromCode(record.numeric);
    }

    if (typeof record.value === 'string' || typeof record.value === 'number') {
      return this.#outcomeName(record.value);
    }

    return undefined;
  }

  #normalizeOutcomeName(value: string): string {
    switch (value) {
      case 'accepted':
      case 'amqp:accepted:list':
        return 'accepted';
      case 'modified':
      case 'amqp:modified:list':
        return 'modified';
      case 'received':
      case 'amqp:received:list':
        return 'received';
      case 'rejected':
      case 'amqp:rejected:list':
        return 'rejected';
      case 'released':
      case 'amqp:released:list':
        return 'released';
      default:
        return value;
    }
  }

  #settleOutgoingIfReceiverSettlesSecond(
    sender: Sender,
    context: EventContext,
  ): boolean {
    if (sender.rcv_settle_mode !== 1) {
      return false;
    }

    const delivery: Delivery | undefined = context.delivery;

    if (delivery === undefined || delivery.settled) {
      return false;
    }

    let settledLocally: boolean = false;

    this.#settle((): void => {
      delivery.update(true);
      // rhea frees an outgoing delivery only after both sides have settled.
      // The disposition is already queued, so marking the peer settled lets
      // the next turn reclaim the slot while the peer remains unsettled.
      (delivery as { remote_settled: boolean }).remote_settled = true;
      settledLocally = true;
    });

    return settledLocally;
  }

  #buildOutcomeError(
    entry: ConnectionEntry,
    address: string,
    outcome: string,
    context: EventContext,
  ): Error {
    const remoteError: AmqpError | undefined = (
      context.delivery?.remote_state as { error?: AmqpError } | undefined
    )?.error;

    const details: string =
      remoteError === undefined
        ? ''
        : `: ${this.#describeAmqpError(remoteError)}`;

    return new Error(
      `AMQP 1.0 peer ${outcome} the message sent to address "${address}" on connection "${String(entry.config.identifier)}"${details}`,
    );
  }

  #pushInboundRoute(
    inboundRoutes: Map<
      ConnectionEntry,
      Map<string, HandlerServiceIdentifier[]>
    >,
    entry: ConnectionEntry,
    address: string,
    serviceIdentifier: HandlerServiceIdentifier,
  ): void {
    let addressRoutes: Map<string, HandlerServiceIdentifier[]> | undefined =
      inboundRoutes.get(entry);

    if (addressRoutes === undefined) {
      addressRoutes = new Map();

      inboundRoutes.set(entry, addressRoutes);
    }

    let serviceIdentifiers: HandlerServiceIdentifier[] | undefined =
      addressRoutes.get(address);

    if (serviceIdentifiers === undefined) {
      serviceIdentifiers = [];

      addressRoutes.set(address, serviceIdentifiers);
    }

    serviceIdentifiers.push(serviceIdentifier);
  }

  #rejectPendingDeliveries(senderEntry: SenderEntry, error: Error): void {
    const pendingDeliveries: PendingDelivery[] = Array.from(
      senderEntry.pendingDeliveries.values(),
    );

    senderEntry.pendingDeliveries.clear();

    for (const pendingDelivery of pendingDeliveries) {
      pendingDelivery.reject(error);
    }
  }

  async #runHandler(
    container: Container,
    serviceIdentifier: HandlerServiceIdentifier,
    message: Amqp1Dot0Message,
  ): Promise<boolean> {
    const handler: Partial<Amqp1Dot0CommandHandler> =
      await container.getAsync(serviceIdentifier);

    if (
      typeof handler.deserialize !== 'function' ||
      typeof handler.handle !== 'function'
    ) {
      throw new Error(
        `Handler "${stringifyServiceIdentifier(serviceIdentifier)}" must implement Amqp1Dot0CommandHandler (deserialize and handle) to receive AMQP 1.0 messages`,
      );
    }

    const deserialization: Promise<object | undefined> | object | undefined =
      handler.deserialize(message);

    const command: object | undefined = isPromise<object | undefined>(
      deserialization,
    )
      ? await deserialization
      : deserialization;

    if (command === undefined) {
      return false;
    }

    const execution: Promise<void> | void = handler.handle(command);

    if (isPromise(execution)) {
      await execution;
    }

    return true;
  }

  async #sendMessage(
    entry: ConnectionEntry,
    connection: Connection,
    address: string,
    message: Message,
    signal: AbortSignal,
  ): Promise<void> {
    const senderEntry: SenderEntry = await waitUnlessAborted(
      this.#getSenderEntry(entry, connection, address),
      signal,
    );
    const sendSignal: AbortSignal = AbortSignal.any([
      signal,
      senderEntry.closed,
    ]);

    while (!senderEntry.sender.is_open() || !senderEntry.sender.sendable()) {
      if (sendSignal.aborted) {
        throw getAbortReason(sendSignal);
      }

      const waitingForAttach: boolean = !senderEntry.sender.is_open();

      await waitForEvent<EventContext>({
        buildError: (eventName: string): Error =>
          new Error(
            `AMQP 1.0 sender for address "${address}" was closed (${eventName}) before the message could be sent`,
          ),
        emitter: senderEntry.sender,
        rejectOn: ['sender_close', 'sender_error'],
        resolveOn: waitingForAttach ? ['sender_open'] : ['sendable'],
        shouldResolve: (): boolean =>
          waitingForAttach ? !isNullTerminus(senderEntry.sender.target) : true,
        signal: sendSignal,
      });
    }

    if (sendSignal.aborted) {
      throw getAbortReason(sendSignal);
    }

    const delivery: Delivery = senderEntry.sender.send(message);

    try {
      await waitUnlessAborted(
        new Promise<void>(
          (resolve: () => void, reject: (error: Error) => void): void => {
            senderEntry.pendingDeliveries.set(delivery, { reject, resolve });
          },
        ),
        sendSignal,
      );
    } finally {
      senderEntry.pendingDeliveries.delete(delivery);
    }
  }

  #setConnectionDown(entry: ConnectionEntry, context: EventContext): void {
    if (this.#state === 'closed' || entry.downController.signal.aborted) {
      return;
    }

    const error: Error = new Error(
      `AMQP 1.0 connection "${String(entry.config.identifier)}" is down and will not reconnect${this.#describeContextError(context)}`,
    );

    this.#logger?.error(error.message);

    entry.downController.abort(error);
  }

  #settle(settlement: () => void): void {
    try {
      settlement();
    } catch (error: unknown) {
      this.#logger?.error(
        `Failed to settle an AMQP 1.0 message: ${describeError(error)}`,
      );
    }
  }

  #settleHandlerFailure(delivery: Delivery): void {
    switch (this.#handlerErrorOutcome) {
      case 'modified':
        delivery.modified({ delivery_failed: true });
        break;
      case 'reject':
        delivery.reject({
          condition: 'amqp:internal-error',
          description: HANDLER_FAILURE_DESCRIPTION,
        });
        break;
      case 'release':
        delivery.release();
        break;
    }
  }

  #takePendingDelivery(
    senderEntry: SenderEntry,
    context: EventContext,
  ): PendingDelivery | undefined {
    const delivery: Delivery | undefined = context.delivery;

    if (delivery === undefined) {
      return undefined;
    }

    const pendingDelivery: PendingDelivery | undefined =
      senderEntry.pendingDeliveries.get(delivery);

    senderEntry.pendingDeliveries.delete(delivery);

    return pendingDelivery;
  }

  async #waitForLinkAttach(
    entry: ConnectionEntry,
    link: Receiver | Sender,
    kind: 'receiver' | 'sender',
    address: string,
    signal: AbortSignal,
  ): Promise<void> {
    const buildError: (eventName: string, context: EventContext) => Error = (
      eventName: string,
      context: EventContext,
    ): Error =>
      new Error(
        `Failed to open AMQP 1.0 ${kind} for address "${address}" on connection "${String(entry.config.identifier)}" (${eventName})${this.#describeContextError(context)}`,
      );

    await waitForEvent<EventContext>({
      buildError,
      emitter: link,
      rejectOn: [`${kind}_close`, `${kind}_error`],
      resolveOn: [`${kind}_open`],
      // A peer refusing a link attaches with a null terminus and detaches right
      // after, so the link is only usable once the terminus is set.
      shouldResolve: (): boolean =>
        !isNullTerminus(kind === 'receiver' ? link.source : link.target),
      signal,
    });
  }

  async #teardown(): Promise<void> {
    this.#state = 'closed';

    this.#closeController.abort(this.#buildClosedError());

    // Held messages are left unsettled, so the peer redelivers them.
    this.#resolveDispatchReady();

    for (const entry of this.#connectionEntries.values()) {
      for (const receiver of entry.receivers) {
        this.#settle((): void => {
          receiver.close();
        });
      }

      for (const senderEntry of entry.senderEntries) {
        this.#settle((): void => {
          senderEntry.sender.close();
        });
      }
    }

    await Promise.all(
      Array.from(this.#connectionEntries.values()).map(
        async (entry: ConnectionEntry): Promise<void> => {
          if (entry.connection !== undefined) {
            await this.#closeConnection(entry.connection);
          }
        },
      ),
    );
  }

  #throwIfClosed(): void {
    if (this.#state === 'closed') {
      throw this.#buildClosedError();
    }
  }

  #willReconnectAfterClose(connection: RheaConnection): boolean {
    const error: { condition: string } | undefined = connection.get_error();

    return (
      error !== undefined &&
      Boolean(connection.options.reconnect) &&
      !connection._is_fatal(error.condition)
    );
  }
}
