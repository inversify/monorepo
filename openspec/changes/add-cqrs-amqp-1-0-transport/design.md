# Design

## Context

- The CQRS core (`packages/framework/cqrs`) exposes `TransportProvider<TParams>`:
  - `getIdentifier()`.
  - `initialize(container, configList)`: receives only the `CommandHandlerConfig`s whose `transport.identifier` matches this provider.
  - `getConfigList()`: called by `CqrsProvider` after `initialize` to build the command type → `[provider, params][]` routing table.
  - `send(command, params)`.
- `CqrsProvider.provide()` awaits every provider's `initialize()` in parallel, then calls `getConfigList()`. `CommandBus.send()` awaits every matching `transport.send()`. `SyncTransportProvider` is the reference implementation.
- Each `CommandHandlerConfig` carries `command.type`, `handler` (the class), `serviceIdentifier`, and `transport` (the declaration instance). That is all the provider needs; no internal cqrs reflect keys are required.
- rhea 3.0.5 is CommonJS (`module.exports = new Container()`) and ships TypeScript typings. Its receivers deliver `message` events carrying a `Delivery` (`accept` / `reject` / `release` / `modified`). Its senders emit `accepted` / `rejected` / `released` / `modified` events keyed by `Delivery`.
- This package is ESM-only (`"type": "module"`, `tsc` → `lib/`), like the other framework packages.

## Goals / Non-Goals

**Goals:**

- Ship a broker-agnostic AMQP 1.0 transport that a single provider instance can run across many connections.
- Leave message-format decisions to userland: handlers deserialize, serializers are pluggable per address.
- Keep the CQRS core unchanged.
- Make the whole flow testable without Docker or any external broker.

**Non-Goals:**

- Events and queries over AMQP. The CQRS core only has transports for commands.
- Request/reply, RPC, or returning handler results to the sender.
- Routing received messages by command type, `subject`, or any other message property. Routing is by address only. Telling command types apart on a shared address is up to userland.
- Broker management: creating queues, topics, subscriptions, or bindings. Addresses are opaque strings and must already exist, unless the broker creates them automatically.
- First-class APIs for source filters or distribution modes, and the AMQP management/CBS protocols, such as Azure Service Bus claims-based auth. Receiver source settings (filters, distribution mode, and so on) and sender options are passed through raw to rhea, so advanced users can still use them.
- Explicit outbound routes for commands with no `@CommandHandler` declaration. Routes come from handler metadata only.
- AMQP 0-9-1. The `./v1Dot0` subpath leaves room for it later.

## Decisions

### D1. Package layout and exports

```
packages/framework/cqrs-amqp/
  package.json            exports: { "./v1Dot0": "./lib/amqp/v1Dot0/index.js" }
  src/amqp/v1Dot0/
    index.ts
    declarations/Amqp1Dot0TransportDeclaration.ts
    models/Amqp1Dot0CommandHandler.ts
    models/Amqp1Dot0ConnectionConfig.ts
    models/Amqp1Dot0HandlerErrorOutcome.ts
    models/Amqp1Dot0ReceiverOptions.ts
    models/Amqp1Dot0Serializer.ts
    models/Amqp1Dot0TransportParams.ts
    models/Amqp1Dot0TransportProviderOptions.ts
    providers/Amqp1Dot0TransportProvider.ts
    serializers/Amqp1Dot0JsonSerializer.ts
    actions/ / calculations/  (helpers: route building, serializer lookup, settlement mapping)
```

This mirrors `@inversifyjs/open-api-types` (`./v3Dot1` → `./lib/openApi/v3Dot1/index.js`), and there is no `"."` key. The name is `@inversifyjs/framework-cqrs-amqp`, matching `@inversifyjs/framework-cqrs`.

Dependencies:

- `dependencies`: `rhea`, `@inversifyjs/common` (`isPromise`), `@inversifyjs/logger`.
- `peerDependencies`: `@inversifyjs/framework-cqrs` (`workspace:^`), `inversify`. The cqrs core is a peer because the user's `CqrsProvider` and every transport module coexist in one application and must share a single copy of the core. This differs from HTTP adapters depending on `http-core`: adapters don't coexist, but cqrs transport modules do.
- `devDependencies`: the cqrs package as `workspace:*`, plus the usual tooling.

`@inversifyjs/logger` stays a regular dependency even though `Logger` appears in the options type: the transport only needs a structurally compatible logger, and a duplicated copy causes no shared state issues.

Alternative: put rhea in `peerDependencies`. Rejected, because users never need to construct rhea objects. The public types are our own AMQP 1.0 types. rhea types stay inside the mapping layer.

### D2. Public API

```ts
export interface Amqp1Dot0TransportParams {
  readonly address: string;
  readonly connectionIdentifier: string | symbol;
}

export class Amqp1Dot0TransportDeclaration implements TransportDeclaration {
  public readonly identifier: symbol; // internal transport symbol, not exported
  public readonly connectionIdentifier: string | symbol;
  public readonly address: string;
  constructor(params: Amqp1Dot0TransportParams);
}

export interface Amqp1Dot0CommandHandler<TCommand extends object = object>
  extends CqrsCommandHandler<TCommand> {
  // undefined means "not mine": this handler is skipped for the message
  deserialize(
    message: Amqp1Dot0Message,
  ): Promise<TCommand | undefined> | TCommand | undefined;
}

export interface Amqp1Dot0ReceiverOptions {
  creditWindow?: number;       // max messages handled at once per address, default 100 (D8)
  source?: Amqp1Dot0Source;    // filters, distributionMode, durable, ... no address
}

export interface Amqp1Dot0SenderOptions {
  target?: Amqp1Dot0Terminus;  // durable, expiryPolicy, capabilities, timeout. no address
}

export interface Amqp1Dot0Serializer {
  serialize(command: object): Amqp1Dot0Message;
}

export interface Amqp1Dot0ConnectionConfig {
  identifier: string | symbol;
  connectionOptions: Amqp1Dot0ConnectionOptions;           // host, port, virtualHost, sasl, tls, reconnect, ...
  listenersEnabled?: boolean;                              // overrides the global flag
  receiverOptions?: Amqp1Dot0ReceiverOptions;              // source address always comes from the declaration
  senderOptions?: Amqp1Dot0SenderOptions;
  serializers?: ReadonlyMap<string, Amqp1Dot0Serializer>;  // keyed by address on this connection
}

export type Amqp1Dot0HandlerErrorOutcome = 'modified' | 'reject' | 'release';

export interface Amqp1Dot0TransportProviderOptions {
  connections: Iterable<Amqp1Dot0ConnectionConfig>;
  handlerErrorOutcome?: Amqp1Dot0HandlerErrorOutcome;      // default: 'reject'
  listenersEnabled?: boolean;                              // default: false
  logger?: boolean | Logger;                               // default: true (ConsoleLogger), same as CqrsProviderOptions
  sendTimeout?: number;                                    // ms, positive integer, default: no timeout (D7)
  serializer?: Amqp1Dot0Serializer;                        // default: new Amqp1Dot0JsonSerializer()
}

export class Amqp1Dot0JsonSerializer implements Amqp1Dot0Serializer { ... }

export class Amqp1Dot0TransportProvider
  implements TransportProvider<Amqp1Dot0TransportParams>
{
  constructor(options: Amqp1Dot0TransportProviderOptions);
  close(): Promise<void>;
  // + TransportProvider members
}
```

Naming:

- "Connection", not "source": in AMQP 1.0, *source* is a link terminus.
- `Amqp1Dot0*` prefix, matching the `v1Dot0` subpath.

The constructor takes a single options object so new options can be added without breaking callers.

Per-address serializers hang off the connection config, not the provider options, because an address only means something within a connection: `orders` on broker A is not `orders` on broker B. A `Map` is used rather than a plain object so that addresses containing characters like `/` or `.` need no escaping, and so lookups never hit prototype keys.

`deserialize` receives an `Amqp1Dot0Message`, so userland can use `properties.subject`, `applicationProperties`, `messageAnnotations`, `properties.contentType`, and so on to decide how to decode the body, or to tell command types apart on a shared address. Returning `undefined` lets a handler on a shared address decline a message that belongs to another command type without failing it for everyone.

Property names are camelCase. The provider maps them to and from rhea internally (`buildRheaConnectionOptions`, `buildRheaSource`, `buildRheaMessage`, `buildAmqp1Dot0Message`). Terminus durability is `'none' | 'configuration' | 'unsettledState'`, mapped to the AMQP codes 0, 1, and 2. `reconnect` is `boolean | { initialDelay?, maxDelay?, limit? }`.

Receiver source settings are mapped onto rhea's source with the declared address. The declared address always wins, so a connection-wide filter or distribution mode applies to every address on that connection.

### D3. One transport identifier, one provider per process

`CqrsProvider` groups handler configs by `transport.identifier`, so every AMQP 1.0 declaration shares `amqp1Dot0TransportIdentifier`, and a single provider instance owns every connection. This is why the constructor takes many connections. Registering two `Amqp1Dot0TransportProvider`s in the same `CqrsProvider` would initialize both with the same configs. The README will call this out. We could later add an optional custom identifier to both the declaration and the provider without breaking anything.

### D4. Address-only routing, no command identifiers

Received messages are routed by (connection, address), never by command type. Every handler declared on an address gets every message on it, and each handler's `deserialize` is responsible for interpreting it. As a result:

- `@Command({ identifier })` is never required for AMQP-routed commands.
- The provider never reads or writes `subject` or any other property for routing purposes.
- Using one address per command type is the simplest topology. Sharing an address between command types works, but the handlers must cope with each other's messages. The README will document this.

Alternative: put a wire identifier in `subject` and route by it. Rejected by the user: it forces identifiers on every command, and message-format concerns belong to userland.

### D5. Routing tables built in `initialize()`

From `configList`, the provider builds:

1. `outboundRoutes`: a set of distinct `(commandType, connectionIdentifier, address)`, which `getConfigList()` returns as `{ type, params: { connectionIdentifier, address } }`. Deduplicating ensures two handlers for the same command on the same address produce one message, which then fans out to every local handler on the receiving side.
2. `inboundRoutes`: `Map<connectionIdentifier, Map<address, ServiceIdentifier<Amqp1Dot0CommandHandler>[]>>`, in declaration order, where each entry is `config.serviceIdentifier ?? config.handler`. It is built only for connections whose listeners are enabled. Entries are deliberately not deduplicated: one handler class declared twice on the same address, for two command types, is dispatched twice per message, once per declaration. This keeps a one-to-one mapping between declarations and dispatches.

The provider validates everything before opening any socket: the declaration type (it checks for `connectionIdentifier` and `address` and does not rely on `instanceof`, so duplicated package copies still work) and the registered connections.

### D6. Connection lifecycle

- `rhea.create_container({ id })` is called once per provider. The provider does not use the global rhea container, so separate instances or tests never share state. The import is `import rhea from 'rhea'`, a default import, because rhea's CommonJS export is a `Container` instance that Node cannot expose as named ESM exports.
- During `initialize`, only connections referenced by at least one declaration are opened. Each open is awaited until `connection_open`.
  - If a `connection_error`, a `disconnected`, or an `error` event arrives first, initialization rejects and every connection already opened is closed.
  - rhea schedules reconnects even when the first open never succeeded, and `reconnect` defaults to `true`. So connections are opened with `reconnect: false`, and the configured policy is restored with `set_reconnect(reconnect !== false)` once `connection_open` arrives. Otherwise the process keeps retrying in the background after `initialize()` has rejected. A reconnect object is mapped to `initial_reconnect_delay`, `max_reconnect_delay`, and `reconnect_limit`. `set_reconnect(true)` installs rhea's backoff from those fields.
  - Once a connection has opened, transient drops are absorbed by rhea's reconnect policy. rhea re-attaches existing sessions and links on reconnect, so cached senders and receivers stay valid.
- **Connection down for good.** Each connection has an `AbortController`, combined with the provider's close controller into a per-connection `signal` through `AbortSignal.any`. The connection is marked down, logged, and its controller aborted with a "down and will not reconnect" error when:
  - `disconnected` arrives with `reconnecting !== true`, or
  - `connection_close` arrives and rhea won't reconnect after it: `get_error()` is undefined, reconnection is disabled, or `_is_fatal(condition)` is true. Only `amqp:connection:forced` is non-fatal by default. rhea emits no `disconnected` for a fatal peer close, so `connection_close` is the only signal.
- rhea internals (`_is_fatal`, `scheduled_reconnect`, `set_reconnect`) are typed through a local `RheaConnection` interface. rhea is pinned to an exact version for this reason.
- Receivers are opened during `initialize` and awaited until `receiver_open`. If `receiver_error` or `receiver_close` arrives first, initialization rejects.
- Any rejection from `initialize` runs the same teardown as `close()` and leaves the provider closed for good. A retry would not help anyway: `CqrsProvider` initializes the `SyncTransportProvider` in parallel, and that provider refuses a second `initialize`, so recovery needs new `CqrsProvider` and `Amqp1Dot0TransportProvider` instances. The README will say so.
- Senders are opened lazily on the first `send` for a (connection, address) and cached as a promise.
  - The cache entry is evicted on `sender_close`, `sender_error`, `session_close`, or `session_error`, so the next send re-attaches.
  - Rationale: a producer may have hundreds of routes but use few, and opening senders lazily avoids holding broker link credit.
  - Alternative: open senders eagerly in `initialize`. Rejected for that reason. We could add it later as an option.

### D7. Send path (at-least-once with peer acknowledgement)

1. Throw if the provider is not initialized or is closed, and throw the abort reason if the connection is down for good (D6).
2. Pick the serializer: `connection.serializers?.get(address) ?? options.serializer ?? defaultJsonSerializer`. The lookup can be precomputed per outbound route in `initialize`.
3. `const message = serializer.serialize(command)`, then map it with `buildRheaMessage`. A throw rejects the send before any I/O.
4. Build the send signal: the connection signal, combined with a timer-based `AbortController` through `AbortSignal.any` when `sendTimeout` is set. The timer is cleared once the send settles.
5. Resolve the sender. Every wait on that shared opening promise uses one completion handler and a removable set of waiters: a send that times out drops only its waiter, and a later attach notifies the waiters still active. A delivery is enqueued only once `sender.is_open()` and `sender.sendable()` are both true, rechecked after every wake-up, with no further await between that check and `send()`. After a reconnect the same sender is waited on until it attaches again, then its credit is checked again. One send's timeout never cancels the sender promise other sends share. An uncached sender waits for `connection_open` while that connection is reconnecting and not open. The wait ends if the connection is shut down or down for good. A cached sender is used as it is, and a connection that is already open is used immediately.
6. `const delivery = sender.send(rheaMessage)`. Senders are opened with `autosettle: true`, `treat_modified_as_released: false`, and the default `snd_settle_mode` (mixed), and deliveries are sent unsettled. The target is the declared address plus the mapped `senderOptions.target`. Without `treat_modified_as_released: false`, rhea also emits `released` for a modified disposition.
7. Store `delivery → { resolve, reject }` in a per-sender map, raced against the send signal, and removed once settled. The `settled` event resolves the entry when the outcome is accepted. If `remote_state` is absent, that outcome is the link source's `default_outcome`, or accepted when the link does not define one, and the pending entry is removed either way. When the peer's receiver settle mode is `second`, a terminal outcome is settled locally with `delivery.update(true)` so the peer can finish settlement. The `accepted` event does not resolve the send: rhea emits `accepted` and then `settled` for a disposition that is already settled. `rejected`, `released`, and `modified` reject with an `Error` that includes the outcome and `context.delivery.remote_state.error` when present.
8. On `sender_close`, `sender_error`, `session_close`, `session_error`, or `disconnected`, every pending entry for that sender is rejected and the sender is evicted, so the next send opens a new link. Those sender listeners are installed before the attach wait, and a sender already evicted is not registered or returned. Session end aborts the attach, credit, and settlement waits. `close()` and a connection going down reject them through the signal. The session events are the public `session_close` and `session_error` events on `sender.session`.

A rejected send is ambiguous: when the connection drops or the timeout fires after the transfer left the process, the peer may already have the message. This is inherent to AMQP 1.0 without transactions, and is documented in the README alongside handler idempotency.

Alternative: fire-and-forget pre-settled sends. Rejected: `send()` must mean the broker took ownership.

### D8. Receive path

- Receivers are opened with `autoaccept: false` and `autosettle: true`. The attach wait also fails if the receiver's session emits `session_close` or `session_error`, including while the connection stays open. Those listeners are removed when the wait settles. A non-null source still completes the attach.
- **Settlement-based credit.** `receiverOptions.creditWindow` is the maximum number of messages being handled at once per listened address. It defaults to 100 and must be a positive integer, which the constructor checks.
  - Why: rhea's own credit window refills on message arrival, not on settlement, and dispatch is not serialized. Left to rhea, handler concurrency would be unbounded whatever `creditWindow` says. The public name is `creditWindow`. rhea's `credit_window` stays an internal knob and is set to 0.
  - Receivers are opened with rhea's `credit_window: 0`, which disables its flow controller.
  - Every `receiver_open` with a non-null source grants `creditWindow - inFlight`, unless the provider is closed. This covers the first attach and re-attaches after a reconnection, where rhea resets the link credit to zero.
  - Each finished dispatch decrements `inFlight` and returns one credit while the receiver is open. Credit returned while detached would be dropped by rhea's reset, and the next re-attach grant accounts for it.
- **Dispatch gate.** Every `message` listener first awaits a provider-level `#dispatchReady` promise. This promise is resolved from a `setImmediate` scheduled right before `initialize()` resolves.
  - Why: `CqrsProvider.provide()` awaits every transport `initialize()`, then builds its buses synchronously. A broker can send the attach reply and queued transfers in the same socket read, so without the gate a handler could run before `getEventBus()` or `getCommandBus()` work. There is no core callback for that construction. An optional `start()` hook on `TransportProvider` was rejected so the core stays unchanged, and this provider does not add one.
  - `setImmediate` runs on the next turn, after the microtasks of the turn in which this `initialize()` settled. When this transport is the only one, or the last `initialize()` to finish, those microtasks include the rest of `provide()`, so the buses exist before a held message runs.
  - When another transport's `initialize()` is still pending, that timer can run before `provide()` builds the buses. This provider cannot see that completion. Messages that then fail because a bus is missing are still settled with the configured handler error outcome.
  - Messages are not lost while held: they stay unsettled, and the credit window limits how many can pile up.
  - `close()` also resolves the gate. A listener that finds the provider closed once the gate opens returns without settling, so the peer redelivers the message elsewhere.
- Then, for each service identifier in `inboundRoutes[connection][address]`, in order:
  1. `handler = await container.getAsync(serviceIdentifier)`.
  2. If `typeof handler.deserialize !== 'function'`, fail with an error saying AMQP handlers must implement `Amqp1Dot0CommandHandler`.
  3. `command = await deserialize(buildAmqp1Dot0Message(context.message))`, awaited only if `isPromise`.
  4. If `command === undefined`, skip this handler and continue with the next.
  5. Otherwise, `await handle(command)`, awaited only if `isPromise`, and count it as handled.
- If every handler succeeds and at least one handled the message, call `delivery.accept()`.
- If every handler skipped, log it and settle with `reject({ condition: 'amqp:not-found', description })`, regardless of `handlerErrorOutcome`. Nobody in this process claims the message, so redelivering it to the same consumers would loop.
- On the first failure (resolution, missing `deserialize`, `deserialize`, or `handle`):
  - Log through the logger, using the same failure description as `CqrsProvider`.
  - Settle by `handlerErrorOutcome`: `reject({ condition: 'amqp:internal-error', description: 'The handler failed to process the message' })`, `release()`, or `modified({ delivery_failed: true })`. The description is generic so error details, which may hold sensitive data, never reach the broker.
  - Do not run the remaining handlers.

Messages are settled only after handling, so a crash mid-handler leads to redelivery (at-least-once). The README will tell users their handlers must be idempotent.

`deserialize` is resolved per message from the handler instance, not once at initialization. Handlers are only resolvable once the container is fully configured, and they may have non-singleton scopes.

### D9. Default JSON serializer (`Amqp1Dot0JsonSerializer`)

`serialize(command)` returns:

```ts
{
  body: {
    kind: 'data',
    sections: [Buffer.from(JSON.stringify(command), 'utf8')],
  },
  header: { durable: true },
  properties: {
    contentType: 'application/json',
    messageId: randomUUID(), // an AMQP string, not an AMQP uuid
  },
}
```

- The body goes in a *data* section, the most interoperable choice across brokers and non-JS clients. Several data or sequence sections stay as `sections`, one entry each. `buildRheaMessage` turns one section into rhea's single-section helper and several into the multiple-section helper.
- An AMQP described value is `{ kind: 'described', descriptor, value }`. The descriptor is kept. A string descriptor is encoded as a symbol and a numeric one as an unsigned long. A list is `{ kind: 'list', items }`, a map is `{ kind: 'map', entries }` (each entry keeps its key type and the entry order), and an array is `{ kind: 'array', elementType, elementDescriptor?, items }`. Every array item shares `elementType`, which is not `array`: a nested array is decoded as a list so it can be sent again. When the items are described, the descriptor is stored once. A known composite rhea has already decoded, such as an error, is that descriptor plus a list of its raw fields, in field order. Nested described values in those fields are kept, because rhea's field getters unwrap them.
- A described value inside a sequence, a map, or an application property keeps its descriptor. A described value used as the amqp-value body does not. rhea keeps one descriptor on a value and uses that slot for the section code `0x77`, and its reader keeps only the first descriptor. Tracked as [amqp/rhea#456](https://github.com/amqp/rhea/issues/456). Symbol versus string, and integer width, stay JavaScript strings and numbers. An array that rhea has already unwrapped while decoding a message comes back as a list; encoding `kind: 'array'` still writes an array.
- Delivery annotations and the footer are part of `Amqp1Dot0Message`. Annotation map keys are strings in the model; rhea encodes the annotation maps with symbol keys.
- The matching userland `deserialize` reads the first data section: `JSON.parse(Buffer.from(message.body.sections[0]).toString('utf8'))`, then constructs the command. The README shows this.
- `JSON.stringify` follows standard rules: `toJSON()` is honored, `#private` fields are dropped, and `bigint` throws. Users with richer types plug in their own serializer.

### D10. Shutdown

`close()` is a provider-specific method, not part of `TransportProvider`, because the core contract has no lifecycle hook. It:

1. marks the provider closed,
2. aborts the close controller, which rejects pending sends through their signals,
3. resolves the dispatch gate, so held messages are dropped unsettled (D8),
4. closes receivers, then senders, then connections, awaiting `connection_close` or `disconnected` with a bounded timeout.

A connection waiting to reconnect has `local_open = false`, so rhea ignores `close()`, and its pending `scheduled_reconnect` timer would open it again. Before closing, the provider calls `set_reconnect(false)` and clears that timer. It only waits for a close event when the connection was open. If the connection never opened, or that wait exceeds the timeout, it calls rhea's `abort_socket` on the connection socket. `connection.close()` alone does not destroy a socket whose peer never finishes the handshake. A peer that completes the handshake is left to that handshake.

`initialize()` checks for closure again after opening connections and after attaching receivers, so a `close()` racing it makes it reject instead of resolving on a closed provider.

`close()` is idempotent.

### D11. Testing strategy

- **Unit tests** (`*.spec.ts`): follow the repo's four-layer describe structure and use `vitest.mock('rhea')`. rhea connections, links, and deliveries are faked as `EventEmitter`-based fixtures, so tests can emit `connection_open`, `accepted`, `message`, and similar events deterministically.
- **Integration tests** (`*.int.spec.ts`): use rhea's own `container.listen({ port: 0 })` as a tiny in-process AMQP 1.0 peer with per-address queues and controllable settlement. The tests run two real `CqrsProvider`s, each with its own `Amqp1Dot0TransportProvider`: one producer (listeners off) and one consumer (listeners on), over real sockets with no Docker. Handler metadata is global on `Reflect`, so both see the same declarations, as two separate processes sharing code would. The peer can be configured to reject, release, hold messages unsettled, or refuse links, and to close or drop its connections, to cover the failure scenarios. Every scenario starts its own peer and consumer container, and handlers receive a per-scenario records object through constructor injection, so scenarios never share state.
- Optionally, later: a manual smoke test against RabbitMQ 4 / Artemis containers. This is not part of CI.

## Risks / Trade-offs

- [Two AMQP providers in one `CqrsProvider` get the same configs (D3)] → Document it. We could add a configurable identifier later without breaking anything.
- [On a shared address, every handler receives every message, including messages for other command types (D4)] → Intentional, and left to userland. Handlers decline foreign messages by returning `undefined` from `deserialize`. The README recommends one address per command type and shows how to tell types apart with `application_properties` and a custom serializer.
- [The `setImmediate` dispatch gate (D8) relies on `CqrsProvider.provide()` finishing synchronously after it awaits the transports' `initialize()`] → An integration test asserts that handlers can call `getEventBus()` for messages queued before `provide()` was called. That test breaks loudly if the core ever adds an `await` after transport initialization. The long-term fix is a core `start()` hook.
- [A handler class declared twice on one address runs twice per message (D5)] → Intentional, one dispatch per declaration. Documented.
- [`@CommandHandler` is not typed against transports, so a handler declared on AMQP without `deserialize` only fails when the first message arrives] → The failure is explicit and logged. A type-level guard would need changes to the core, which are out of scope.
- [Handlers on one address run concurrently, up to `creditWindow` (default 100)] → Documented. A window of 1 handles one message at a time, which only gives strict order with a single consumer and no redeliveries.
- [A rejected or timed-out send may still have been delivered] → Inherent to AMQP 1.0 without transactions. Documented, and covered by handler idempotency.
- [The fixes for reconnection and fatal closes rely on rhea internals (`_is_fatal`, `scheduled_reconnect`, `set_reconnect`)] → rhea is pinned to an exact version, and integration tests against a real rhea peer cover close-while-reconnecting, fatal closes, and forced closes.
- [At-least-once delivery means duplicates after crashes or redeliveries] → Document handler idempotency. Exactly-once is out of scope.
- [The default `reject` outcome may drop messages on brokers without a dead-letter configuration] → It is configurable, and the README explains each outcome per common broker.
- [Failing fast on initial connect makes startup depend on the broker being available] → Intentional, so misconfiguration surfaces early. Orchestrators restart the process. Retry-until-available could be added later as an option.
- [rhea is CommonJS, and its default-import typing could shift between rhea versions] → Pin the exact version, matching the repo's pinned-version policy. A type test guards the import shape.
- [The core `TransportProvider` has no `close()`] → It is exposed on the concrete class. A follow-up could propose an optional lifecycle method in the core.

## Migration Plan

Additive only: a new package with nothing to migrate. Rollback means unpublishing or deprecating the package. No existing package changes.
