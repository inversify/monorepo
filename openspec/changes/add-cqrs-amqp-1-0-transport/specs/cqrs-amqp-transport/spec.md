# Spec Delta

## Purpose

Lets CQRS commands travel between processes over AMQP. The transport plugs into the CQRS transport provider contract, is broker-agnostic, and is versioned by AMQP protocol version (AMQP 1.0 first).

## ADDED Requirements

### Requirement: Versioned package entry points
The AMQP transport package SHALL NOT expose a root entry point. AMQP 1.0 support SHALL be exposed only through the `./v1Dot0` subpath, so other protocol versions can be added later as sibling subpaths.

#### Scenario: Importing the AMQP 1.0 entry point
- **WHEN** a consumer imports from `@inversifyjs/framework-cqrs-amqp/v1Dot0`
- **THEN** the transport provider, the transport declaration, the AMQP command handler type, the default JSON serializer, and their public types SHALL be available

#### Scenario: Importing the package root
- **WHEN** a consumer imports from `@inversifyjs/framework-cqrs-amqp`
- **THEN** module resolution SHALL fail because no root entry point is exported

### Requirement: AMQP 1.0 transport declaration
The AMQP 1.0 transport declaration SHALL implement the CQRS transport declaration contract. Its `identifier` SHALL equal the AMQP 1.0 transport provider identifier, and it SHALL carry a connection identifier (`string | symbol`) and an AMQP 1.0 address (`string`).

#### Scenario: Declaring a handler on an AMQP address
- **WHEN** a command handler is declared with an AMQP 1.0 transport declaration for connection `orders-broker` and address `orders.create`
- **THEN** the CQRS provider SHALL hand that handler configuration to the AMQP 1.0 transport provider during initialization, with the declaration's connection identifier and address

#### Scenario: Empty address
- **WHEN** an AMQP 1.0 transport declaration is created with an empty address
- **THEN** creation SHALL fail with an error stating that the address must be a non-empty string

### Requirement: Connection registration
The provider constructor SHALL accept any number of connection configurations. Each has an `identifier: string | symbol` and broker-agnostic AMQP 1.0 client connection options (host, port, TLS, SASL credentials, reconnect policy, container id, and so on), with no broker-specific assumptions.

#### Scenario: Registering several connections
- **WHEN** the provider is constructed with connections `primary` and `Symbol.for('audit')`
- **THEN** declarations referencing either identifier SHALL be routed to the matching connection

#### Scenario: Duplicate connection identifiers
- **WHEN** the provider is constructed with two connections sharing the same identifier
- **THEN** construction SHALL fail with an error naming the duplicated identifier

### Requirement: Initialization validates declarations
Initialization SHALL reject when any received handler configuration references an unregistered connection or does not carry an AMQP 1.0 declaration. It SHALL also reject when called a second time. Commands SHALL NOT be required to have a `@Command` identifier.

#### Scenario: Unknown connection identifier
- **WHEN** a handler declaration references connection `missing`, which was not registered
- **THEN** initialization SHALL reject with an error naming `missing` and the command

#### Scenario: Command without identifier
- **WHEN** a handler is declared on an AMQP address for a command that has no `@Command` identifier
- **THEN** initialization SHALL succeed and the command SHALL be routable by its address

#### Scenario: Initializing twice
- **WHEN** initialization is called on an already initialized provider
- **THEN** it SHALL reject with an "already initialized" error

### Requirement: Connections are established during initialization
Initialization SHALL open every registered connection that at least one handler declaration references, and SHALL resolve only after each of them is open. Connections that no declaration references SHALL NOT be opened.

#### Scenario: Peer reachable
- **WHEN** initialization runs and every referenced peer accepts the connection
- **THEN** initialization SHALL resolve

#### Scenario: Peer unreachable
- **WHEN** a referenced peer cannot be reached or refuses the connection during initialization
- **THEN** initialization SHALL reject with an error identifying the connection, SHALL close any connections already opened, and SHALL NOT keep retrying the failed connection in the background

#### Scenario: Provider after a failed initialization
- **WHEN** initialization has rejected for any reason
- **THEN** the provider SHALL be closed, and any later initialization or send SHALL reject with a "closed" error

#### Scenario: Unreferenced connection
- **WHEN** a registered connection is not referenced by any declaration
- **THEN** no network connection SHALL be attempted for it

### Requirement: Outbound routes are inferred from handler declarations
The provider SHALL expose one outbound route per distinct (command type, connection, address) found in the AMQP 1.0 handler declarations it was initialized with. Listener flags SHALL NOT affect this.

#### Scenario: Listeners disabled
- **WHEN** listeners are disabled and a handler for `CreateOrder` is declared on connection `primary`, address `orders`
- **THEN** sending a `CreateOrder` command through the CQRS command bus SHALL deliver an AMQP message to address `orders` on connection `primary`

#### Scenario: Several handlers on the same address
- **WHEN** two handlers for `CreateOrder` are declared on the same connection and address
- **THEN** sending one `CreateOrder` command SHALL produce exactly one AMQP message for that address

#### Scenario: Handlers on different addresses
- **WHEN** handlers for `CreateOrder` are declared on addresses `orders` and `orders.audit`
- **THEN** sending one `CreateOrder` command SHALL produce one AMQP message on each address

### Requirement: Outgoing messages use the address serializer
Sending SHALL turn the command into an AMQP message with the serializer for the route's address. The serializer is picked in this order: the one registered for that address on that connection, then the provider-level serializer, then the built-in JSON serializer.

#### Scenario: Address-specific serializer
- **WHEN** connection `primary` registers a serializer for address `orders` and a command is sent to `orders` on `primary`
- **THEN** that serializer SHALL produce the message, and the provider-level serializer SHALL NOT be called

#### Scenario: Same address name on another connection
- **WHEN** connection `primary` registers a serializer for address `orders` and a command is sent to `orders` on connection `audit`, which registers none
- **THEN** the provider-level serializer SHALL be used, or the built-in JSON serializer when none is configured

#### Scenario: Provider-level serializer
- **WHEN** a provider-level serializer is configured and the address has no specific serializer
- **THEN** the provider-level serializer SHALL produce the message

### Requirement: Sending waits for peer acceptance
Sending SHALL transfer the serialized message unsettled to the route's address, and SHALL resolve only when the peer settles the delivery as accepted.

#### Scenario: Peer accepts
- **WHEN** a command is sent and the peer settles the delivery as accepted
- **THEN** the send SHALL resolve

#### Scenario: Peer does not accept
- **WHEN** a command is sent and the peer settles the delivery as rejected, released, or modified
- **THEN** the send SHALL reject with an error that includes the outcome and, when the peer provided them, the error condition and description

#### Scenario: Serializer failure
- **WHEN** the serializer throws
- **THEN** the send SHALL reject with that error, and no message SHALL be transferred

#### Scenario: Connection lost before settlement
- **WHEN** the connection is lost or closed before the delivery is settled
- **THEN** the send SHALL reject

#### Scenario: Sending before initialization
- **WHEN** send is called before initialization has completed
- **THEN** it SHALL reject with a "not initialized" error

### Requirement: Sends fail fast on connections that are down for good
A connection SHALL be down for good when it is lost or closed by the peer and will not reconnect. The failure SHALL then be logged, and every pending or later send on that connection SHALL reject with a "down and will not reconnect" error. Sends on a reconnecting connection SHALL keep waiting.

#### Scenario: Peer closes the connection without error, or with reconnection disabled
- **WHEN** the peer closes the connection without an error, or with any error while reconnection is disabled
- **THEN** the connection SHALL be down for good

#### Scenario: Connection lost without reconnection
- **WHEN** a send waits for sender credit and the connection is lost with reconnection disabled
- **THEN** the send SHALL reject with a "down and will not reconnect" error, and a later send on that connection SHALL reject the same way without opening a sender

#### Scenario: Peer closes the connection with a fatal error
- **WHEN** a send awaits settlement and the peer closes the connection with a fatal error condition
- **THEN** the send SHALL reject with an error that includes the condition and description, and later sends on that connection SHALL reject right away

#### Scenario: Peer forces the connection to close
- **WHEN** the peer closes the connection with condition `amqp:connection:forced` and reconnection is enabled
- **THEN** the connection SHALL reconnect, and a later send SHALL succeed once it has

### Requirement: Send timeout
The provider options SHALL accept an optional `sendTimeout`, in milliseconds, bounding how long a send waits for its sender, for credit, and for the peer outcome. There SHALL be no timeout by default. A `sendTimeout` that is not a positive integer SHALL be rejected at construction. A timed-out send SHALL NOT affect other sends sharing the same sender.

#### Scenario: Peer never settles
- **WHEN** `sendTimeout` is 100 and the peer never settles a sent message
- **THEN** the send SHALL reject after about 100 ms with an error naming the address, the connection, and the timeout

#### Scenario: Settled in time
- **WHEN** `sendTimeout` is set and the peer accepts the message before it elapses
- **THEN** the send SHALL resolve

#### Scenario: Invalid timeout
- **WHEN** the provider is constructed with a `sendTimeout` that is zero, negative, or not an integer
- **THEN** construction SHALL fail with an error stating that `sendTimeout` must be a positive integer

### Requirement: Listener enablement flags
The provider options SHALL accept a global flag that enables or disables address listeners. It defaults to disabled. Each connection configuration SHALL accept an optional flag that overrides the global value for that connection.

#### Scenario: Global default
- **WHEN** neither the provider options nor the connection set the listener flag
- **THEN** no listeners SHALL be opened on that connection

#### Scenario: Per-connection override
- **WHEN** listeners are enabled globally and connection `audit` disables them
- **THEN** listeners SHALL be opened on every other referenced connection and SHALL NOT be opened on `audit`

### Requirement: Listeners are opened during initialization
For each connection whose listeners are enabled, initialization SHALL open exactly one receiving link per distinct address declared on that connection, and SHALL resolve only once every such link is attached.

#### Scenario: Several commands share an address
- **WHEN** listeners are enabled and `CreateOrder` and `CancelOrder` are both declared on connection `primary`, address `orders`
- **THEN** exactly one receiving link SHALL be opened for `orders` on `primary`

#### Scenario: Peer refuses the link
- **WHEN** the peer refuses to attach a receiving link during initialization
- **THEN** initialization SHALL reject with an error identifying the connection and address

#### Scenario: Source options without address
- **WHEN** a connection's receiver options include source settings such as a filter or distribution mode
- **THEN** every receiving link on that connection SHALL be opened with those source settings and with the declared address as the source address

### Requirement: Receiver flow control
Each receiving link SHALL limit the number of messages being handled at once to the connection's receiver `creditWindow`, which defaults to 100. Credit SHALL be granted to the peer when the link attaches and returned one by one as messages are settled, not as they arrive. A `creditWindow` that is not a positive integer SHALL be rejected at construction.

#### Scenario: Slow handlers
- **WHEN** the receiver `creditWindow` of connection `primary` is 2 and the peer has six messages queued for a listened address whose handler takes a while
- **THEN** at most two of those messages SHALL be handled at the same time, and all six SHALL eventually be handled

#### Scenario: Default window
- **WHEN** a connection's receiver options do not set `creditWindow`
- **THEN** each receiving link on that connection SHALL allow at most 100 messages to be handled at once

#### Scenario: Link attached again after a reconnection
- **WHEN** a receiving link is attached again while some of its messages are still being handled
- **THEN** the credit granted SHALL be the window minus the messages still being handled

#### Scenario: Invalid window
- **WHEN** the provider is constructed with a connection whose receiver `creditWindow` is zero, negative, or not an integer
- **THEN** construction SHALL fail with an error naming the connection

### Requirement: Message dispatch starts after initialization completes
Messages received while initialization is still running SHALL be held, not dispatched. Dispatch SHALL begin only after initialization has resolved and the current event-loop turn has finished, so the caller can complete its own setup synchronously right after initialization resolves.

#### Scenario: Message arrives during initialization
- **WHEN** the peer delivers a message on a listened address before initialization has resolved
- **THEN** no handler SHALL be resolved or called until initialization has resolved and the current event-loop turn has finished, after which the message SHALL be dispatched normally

#### Scenario: Buses available inside handlers
- **WHEN** a handler dispatched by the AMQP transport calls `getCommandBus()`, `getEventBus()`, or `getQueryBus()` on the `CqrsProvider` whose `provide()` initialized the transport
- **THEN** the call SHALL succeed, even for messages that arrived during initialization

### Requirement: Received messages are routed by address
A message received on a listened address SHALL be passed to every handler declared on that connection and address, whatever command type each handler was declared for, one handler after another in declaration order. The message SHALL be accepted only after every handler completes and at least one handled it.

#### Scenario: Single handler
- **WHEN** a message arrives on address `orders`, where only `CreateOrderHandler` is declared, and the handler deserializes and handles it successfully
- **THEN** the message SHALL be settled as accepted

#### Scenario: Several command types share an address
- **WHEN** `CreateOrderHandler` and `CancelOrderHandler` are declared on the same connection and address and a message arrives there
- **THEN** both handlers SHALL receive the message, with no routing by command identifier or message subject

#### Scenario: Handlers resolved from the container
- **WHEN** a message is dispatched
- **THEN** each handler SHALL be resolved asynchronously from the container, using its declared service identifier or, when none was declared, the handler class

#### Scenario: Same handler declared twice on one address
- **WHEN** one handler class is declared on the same connection and address for two command types and a message arrives there
- **THEN** that handler SHALL be dispatched once per declaration, so it deserializes and possibly handles the message twice

### Requirement: Handlers deserialize received messages
For each received message, every resolved handler SHALL be asked to deserialize the complete AMQP message (properties, application properties, annotations, and body) into a command. A returned command SHALL be passed to that handler's `handle`; a returned `undefined` SHALL skip that handler.

#### Scenario: Deserialize then handle
- **WHEN** a handler's `deserialize` returns `new CreateOrder('42')` for a received message
- **THEN** that same instance SHALL be passed to the handler's `handle`

#### Scenario: Asynchronous deserialization
- **WHEN** `deserialize` returns a promise or thenable
- **THEN** `handle` SHALL be called with the resolved value

#### Scenario: Message metadata available
- **WHEN** a message carrying a subject, application properties, delivery annotations, and a footer is received
- **THEN** `deserialize` SHALL receive the subject as `properties.subject`, the application properties as `applicationProperties`, the delivery annotations as `deliveryAnnotations`, and the footer as `footer`, together with the body

#### Scenario: Described value
- **WHEN** a received described value is nested in a list, a map, a sequence section, or an application property
- **THEN** `deserialize` SHALL receive its descriptor and its value

#### Scenario: List, map, and array
- **WHEN** a received value is an AMQP list, map, or array
- **THEN** `deserialize` SHALL receive `kind: 'list'`, `kind: 'map'`, or `kind: 'array'`. An array SHALL carry one `elementType` and, when its elements are described, one `elementDescriptor`

#### Scenario: Several body sections
- **WHEN** a received body contains more than one data section or more than one sequence section
- **THEN** each section SHALL be available separately, in order

#### Scenario: Handler skips the message
- **WHEN** `CreateOrderHandler` and `CancelOrderHandler` share an address, a message arrives, `CancelOrderHandler.deserialize` returns `undefined`, and `CreateOrderHandler` handles the message successfully
- **THEN** `CancelOrderHandler.handle` SHALL NOT be called, and the message SHALL be settled as accepted

#### Scenario: Every handler skips the message
- **WHEN** every handler on the address returns `undefined` from `deserialize`
- **THEN** no `handle` SHALL be called, the message SHALL be settled as rejected with condition `amqp:not-found`, and this SHALL be reported to the configured logger

#### Scenario: Handler without deserialize
- **WHEN** a resolved handler does not implement `deserialize`
- **THEN** this SHALL be treated as a handler failure, with an error explaining that AMQP handlers must implement `deserialize`

### Requirement: Handler failure outcome
When a handler's `deserialize` or `handle` throws or rejects, the message SHALL be settled with the configured failure outcome: `reject` (the default), `release`, or `modified` (delivery failed). The failure SHALL be reported to the configured logger, and later handlers for that message SHALL NOT run. Failure details SHALL NOT be sent to the peer.

#### Scenario: Default outcome
- **WHEN** a handler fails and no failure outcome is configured
- **THEN** the message SHALL be settled as rejected with condition `amqp:internal-error` and the generic description `The handler failed to process the message`, and the full error SHALL only be logged

#### Scenario: Release outcome
- **WHEN** a handler fails and the failure outcome is `release`
- **THEN** the message SHALL be settled as released

#### Scenario: Modified outcome
- **WHEN** a handler fails and the failure outcome is `modified`
- **THEN** the message SHALL be settled as modified with delivery-failed set

#### Scenario: Deserialization failure
- **WHEN** a handler's `deserialize` throws
- **THEN** that handler's `handle` SHALL NOT be called, and the message SHALL be settled with the configured failure outcome

#### Scenario: Logging disabled
- **WHEN** a handler fails and the logger option is `false`
- **THEN** nothing SHALL be logged, and the message SHALL still be settled with the configured outcome

### Requirement: Default JSON serializer
The built-in serializer SHALL put the command's JSON serialization in an AMQP data section, set the content type to `application/json`, and set the durable flag. It SHALL NOT require or set any command identifier.

#### Scenario: Serializing a command
- **WHEN** `new CreateOrder('42')` with an own property `orderId` is serialized by the built-in serializer
- **THEN** the message SHALL have content type `application/json`, the durable flag set, and a data section whose UTF-8 bytes parse as JSON to `{ "orderId": "42" }`

### Requirement: Graceful shutdown
The provider SHALL expose a close operation that detaches all links, closes all connections, and rejects pending sends. After close, sends SHALL reject, connections SHALL NOT reconnect, and received messages SHALL NOT be dispatched. Calling close more than once SHALL be harmless.

#### Scenario: Close while a connection waits to reconnect
- **WHEN** close is called while a connection is waiting to reconnect after being lost
- **THEN** the scheduled reconnection SHALL be cancelled, and no connection to the peer SHALL be opened afterwards

#### Scenario: Message received after close started
- **WHEN** a message arrives, or a held message is released by the dispatch gate, once close has started
- **THEN** no handler SHALL be resolved or called, the message SHALL be left unsettled so the peer redelivers it, and no credit SHALL be granted to receiving links attached afterwards

#### Scenario: Close during initialization
- **WHEN** close is called while initialization is still running
- **THEN** initialization SHALL reject with a "closed" error

#### Scenario: Close with pending sends
- **WHEN** close is called while a send is awaiting settlement
- **THEN** that send SHALL reject, and close SHALL resolve once every connection is closed

#### Scenario: Send after close
- **WHEN** send is called after close
- **THEN** it SHALL reject with a "closed" error

#### Scenario: Close twice
- **WHEN** close is called on an already closed provider
- **THEN** it SHALL resolve without error
