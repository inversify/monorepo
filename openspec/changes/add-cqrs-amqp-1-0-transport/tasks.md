# Tasks

## 1. Package scaffolding

- [x] 1.1 Create `packages/framework/cqrs-amqp` by copying the cqrs package's config files: `tsconfig*.json`, `vitest.config.mjs`, `oxfmt.config.ts`, `oxlint.config.ts`, `stryker.config.mjs`, `vitest.config.stryker.mjs`. Add a `package.json` named `@inversifyjs/framework-cqrs-amqp` with `exports: { "./v1Dot0": "./lib/amqp/v1Dot0/index.js" }` and no `"."` key. Verify with `pnpm install` and then `pnpm run --filter "@inversifyjs/framework-cqrs-amqp" build`, which should emit `lib/amqp/v1Dot0/index.js`.
- [x] 1.2 Add the dependencies:
  - `rhea` (pinned to an exact version), `@inversifyjs/common`, and `@inversifyjs/logger` as dependencies.
  - `@inversifyjs/framework-cqrs` and `inversify` as peer dependencies.
  - `@inversifyjs/framework-cqrs: workspace:*` and `reflect-metadata` as dev dependencies.

  Verify that `pnpm install` succeeds and that `pnpm run unused` (knip) reports nothing for the package once the code from section 2 lands.
- [x] 1.3 Add `codecov.yml` flag and component entries for `@inversifyjs/framework-cqrs-amqp`, and confirm the `packages/framework/*` knip workspace glob covers the new package. Verify with `pnpm run unused`.
- [x] 1.4 Add a type test (`*.spec-d.ts`) checking that `import rhea from 'rhea'` exposes `create_container`, `generate_uuid`, and `message.data_section`, and the `ConnectionOptions`, `ReceiverOptions`, `SenderOptions`, and `Message` types. Verify with `pnpm run --filter "@inversifyjs/framework-cqrs-amqp" test`.

## 2. Public models and declaration

- [x] 2.1 Add the model types from the design's public API section:
  - `Amqp1Dot0TransportParams`
  - `Amqp1Dot0CommandHandler`
  - `Amqp1Dot0Serializer`
  - `Amqp1Dot0ConnectionConfig`
  - `Amqp1Dot0HandlerErrorOutcome`
  - `Amqp1Dot0ReceiverOptions`
  - `Amqp1Dot0TransportProviderOptions`

  Also add the `amqp1Dot0TransportIdentifier` symbol. Add a type test checking that:
  - an `Amqp1Dot0CommandHandler<CreateOrder>` is assignable to `CqrsCommandHandler<CreateOrder>`,
  - `deserialize` can be sync or async and may return `undefined`,
  - `Amqp1Dot0ReceiverOptions.source` rejects an `address` field.

  Verify with `tsc` and the type test.
- [x] 2.2 Implement `Amqp1Dot0TransportDeclaration`: its identifier is the transport symbol, it carries `connectionIdentifier` and `address`, and it throws on an empty address. Unit tests should cover the spec scenarios "Declaring a handler on an AMQP address" (the shape of the declaration) and "Empty address". Verify that the spec file passes.
- [x] 2.3 Create `src/amqp/v1Dot0/index.ts`, which exports the declaration, the provider, the JSON serializer, the identifier, and the types. Verify the public surface with a type test of the entry module (a self-referencing package import would depend on a prior build, which the `test` task does not run). Also verify that resolving the bare package root fails, by asserting in a unit test that `exports` only contains `"./v1Dot0"`.

## 3. Default JSON serializer

- [x] 3.1 Implement `Amqp1Dot0JsonSerializer`, which writes a JSON data section with content type `application/json`, the durable flag, and a `message_id`, and sets no subject. Unit tests should cover the spec scenario "Serializing a command", plus the `toJSON()` passthrough and a `bigint` throwing.

## 4. Provider: construction, initialization, and connections

- [x] 4.1 Implement the `Amqp1Dot0TransportProvider` constructor. It registers connections, throws on duplicate identifiers, applies option defaults (`listenersEnabled: false`, `handlerErrorOutcome: 'reject'`, logger `true`, JSON serializer), and creates a private rhea container. `getIdentifier()` returns the transport symbol. Unit tests should cover "Registering several connections" (constructor side) and "Duplicate connection identifiers".
- [x] 4.2 Implement the validation and route building in `initialize()`:
  - Reject on unknown connections, non-AMQP declarations, and a second initialization.
  - Build the deduplicated outbound routes, each with its serializer resolved.
  - Build the inbound routes as address → service identifiers, in declaration order.

  Unit tests should cover the spec scenarios "Unknown connection identifier", "Command without identifier", and "Initializing twice". They should also check that `getConfigList()` deduplicates, which covers "Several handlers on the same address" and "Handlers on different addresses" at the unit level.
- [x] 4.3 Implement opening connections in `initialize()`:
  - Only referenced connections are opened, and each open is awaited until `connection_open`.
  - The provider fails fast on `connection_error`, `disconnected`, or `error`. It explicitly closes the failed connection, which cancels rhea's scheduled reconnect, and closes every connection already opened.
  - Any rejection leaves the provider closed.

  Unit tests with an `EventEmitter`-based rhea fixture should cover "Peer reachable", "Peer unreachable" (asserting the failed connection is closed), "Provider after a failed initialization", and "Unreferenced connection".
- [x] 4.4 Implement the listener flags and opening receivers. The global flag applies unless a connection overrides it. Each enabled connection gets one receiver per distinct address, opened with `autoaccept: false`, with `receiverOptions` merged in, and with `source: { ...receiverOptions.source, address }`. Each receiver is awaited until `receiver_open`, failing on `receiver_error` or `receiver_close`. Unit tests should cover "Global default", "Per-connection override", "Several commands share an address", "Peer refuses the link", and "Source options without address".

- [x] 4.5 Implement settlement-based receiver credit: open receivers with rhea's `credit_window: 0`, grant `credit_window - inFlight` (default window 100) on every attached `receiver_open`, return one credit per finished dispatch while the receiver is open, and reject non-positive-integer windows in the constructor. Unit tests should cover "Default window", "Link attached again after a reconnection", and "Invalid window". The integration test should cover "Slow handlers" against a real rhea peer.

## 5. Provider: send path

- [x] 5.1 Implement serializer selection: the connection's address serializer, then the provider serializer, then the built-in JSON serializer. Unit tests should cover "Address-specific serializer", "Same address name on another connection", and "Provider-level serializer".
- [x] 5.2 Implement `send()`:
  - Reject when not initialized or closed.
  - Serialize first, rejecting without any I/O if the serializer throws.
  - Open a sender lazily and cache it per (connection, address), evicting on `sender_close` or `sender_error`.
  - Wait for `sendable`, then send and track the delivery.
  - Resolve on `accepted`. Reject on `rejected`, `released`, or `modified`, including the condition and description.
  - Reject pending deliveries on link or connection loss.

  Unit tests should cover "Peer accepts", "Peer does not accept" (all three outcomes), "Serializer failure", "Connection lost before settlement", and "Sending before initialization", plus sender reuse and re-attachment after the sender closes.

## 6. Provider: receive path

- [x] 6.1 Implement the dispatch gate. `message` listeners await a ready promise that is resolved from a `setImmediate` scheduled just before `initialize()` resolves. Unit tests should cover "Message arrives during initialization": a message emitted before `initialize()` resolves must not resolve any handler until after a `setImmediate` tick that follows the resolution.
- [x] 6.2 Implement message dispatch by address. For every declaration on the address, in order and without deduplication:
  1. Resolve the handler with `container.getAsync`.
  2. Check that `deserialize` exists, then call `deserialize(message)`.
  3. If it returns `undefined`, skip this handler. Otherwise call `handle(command)`.

  Await thenables at each step. Accept the message once every handler succeeds and at least one handled it. Unit tests should cover:
  - "Single handler", "Several command types share an address", "Same handler declared twice on one address", and "Handlers resolved from the container", including the fallback to the handler class when no service identifier is declared.
  - "Deserialize then handle", "Asynchronous deserialization", "Message metadata available", and "Handler skips the message".
- [x] 6.3 Implement settlement for skipped and failed messages:
  - If every handler skips, reject with `amqp:not-found` and log it.
  - A missing `deserialize`, or a `deserialize` or `handle` that throws, stops at that handler and is logged, unless the logger is disabled. The message is settled with `reject` (condition `amqp:internal-error`), `release`, or `modified` (`delivery_failed: true`).

  Unit tests should cover "Every handler skips the message", "Handler without deserialize", "Deserialization failure", "Default outcome", "Release outcome", "Modified outcome", and "Logging disabled".

## 7. Provider: shutdown

- [x] 7.1 Implement `close()`. It is idempotent: it marks the provider closed, rejects pending sends, closes receivers, then senders, then connections, and has a bounded wait. Unit tests should cover "Close with pending sends", "Send after close", and "Close twice".

## 8. Integration and documentation

- [x] 8.1 Build an in-process AMQP 1.0 test peer on rhea's `container.listen({ port: 0 })`. It keeps per-address queues and can be configured to settle with accept, reject, or release, or to refuse links. Use it in `Amqp1Dot0TransportProvider.int.spec.ts` with two real `CqrsProvider`s: a producer with listeners off and a consumer with listeners on. Cover:
  - an end-to-end send, deserialize, and handle using the default JSON serializer,
  - a per-address custom serializer paired with a matching `deserialize`,
  - fan-out to several handlers on one address, including one that declines by returning `undefined`,
  - "Buses available inside handlers": messages already queued at the peer before `provide()` is called are handled by a handler that calls `getEventBus().send(...)` successfully,
  - multiple addresses,
  - a peer rejection surfacing on `commandBus.send()`,
  - a handler failure producing the configured outcome at the peer,
  - `close()`.

  Verify with `pnpm run --filter "@inversifyjs/framework-cqrs-amqp" test:integration`.
- [x] 8.2 Write the package `README.md`. It should cover:
  - the `./v1Dot0` import,
  - connection configuration examples for a generic broker and for TLS with SASL,
  - the listener flags and producer/consumer topologies,
  - implementing `Amqp1Dot0CommandHandler.deserialize`, including the snippet matching the default JSON serializer and declining messages with `undefined`,
  - recovering from a failed `provide()`, which needs new `CqrsProvider` and provider instances,
  - one dispatch per declaration when a handler class is declared twice on the same address,
  - per-address serializers,
  - address-only routing and the advice to use one address per command type,
  - each failure outcome and its broker implications,
  - the `creditWindow` concurrency guidance,
  - at-least-once and idempotency,
  - the one-provider-per-`CqrsProvider` constraint,
  - `close()`.

  Verify that the README snippets compile by mirroring them in a type test or the integration test.
- [x] 8.3 Add a changeset introducing `@inversifyjs/framework-cqrs-amqp` (minor). Then run `pnpm run --filter "@inversifyjs/framework-cqrs-amqp" build lint test`, and `pnpm run unused` at the repo root. Verify that all of them pass.

## 9. Review follow-ups

- [x] 9.1 Make `close()` cancel a pending reconnection: disable reconnection and clear rhea's `scheduled_reconnect` before closing, and only wait for a close event when the connection was open. Restore numeric `reconnect` delays by assigning `connection.options.reconnect` before `set_reconnect()`. Cover "Close while a connection waits to reconnect" with a unit test and an integration test that drops the peer's sockets.
- [x] 9.2 Fail sends fast on connections that are down for good, through a per-connection abort signal, and add the optional `sendTimeout`, validated in the constructor. Cover "Connection lost without reconnection", "Peer closes the connection with a fatal error", "Peer forces the connection to close", "Peer never settles", "Settled in time", and "Invalid timeout".
- [x] 9.3 Stop dispatching once `close()` starts: resolve the dispatch gate on close, skip dispatch when closed, and grant no credit on re-attach. Cover "Message received after close started".
- [x] 9.4 Make `initialize()` reject when `close()` runs concurrently. Cover "Close during initialization".
- [x] 9.5 Reject failed messages with a generic description, logging the full error locally. Update "Default outcome" and "Handler without deserialize".
- [x] 9.6 Rewrite the integration test with typed message bodies, a records object injected into handlers per scenario, and one peer per scenario.
- [x] 9.7 Document fail-fast sends, `sendTimeout`, ambiguous rejected sends, the generic rejection description, the `creditWindow: 1` ordering caveat, and the shutdown semantics in the README, mirroring the `sendTimeout` snippet in the README type test.
- [x] 9.8 Finish the public-type migration. README, type tests, unit tests, integration tests, and this change describe `Amqp1Dot0Message`, `creditWindow`, camelCase connection options (`sasl`, `tls`, `reconnect: boolean | { initialDelay, maxDelay, limit }`), and terminus durability as `'none' | 'configuration' | 'unsettledState'`. The transport identifier stays unexported. Handlers read `properties.subject`. Serializers return `Amqp1Dot0Message`.
- [x] 9.9 Represent AMQP values without dropping information rhea still has. A described value keeps its descriptor and value. Data and sequence bodies keep every section. Application properties keep lists, maps, and described values. Delivery annotations and the footer are on the message. An amqp-value whose value is described stays described.
- [x] 9.10 Represent lists, maps, and arrays as tagged values. An array carries one element type and one optional element descriptor. A map keeps entry order and key types. A known composite is a described list of its raw fields. Sequence sections are lists.
- [x] 9.11 Do not patch rhea. A described value used as the amqp-value body loses its descriptor. Tracked as [amqp/rhea#456](https://github.com/amqp/rhea/issues/456).

## Workflow follow-up

- Archive the change once implementation is reviewed and merged.
