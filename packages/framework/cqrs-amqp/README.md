[![Test coverage](https://codecov.io/gh/inversify/monorepo/branch/main/graph/badge.svg?flag=%40inversifyjs%2Fframework-cqrs-amqp)](https://codecov.io/gh/inversify/monorepo/branch/main/graph/badge.svg?flag=%40inversifyjs%2Fframework-cqrs-amqp)
[![npm version](https://img.shields.io/github/package-json/v/inversify/monorepo?filename=packages%2Fframework%2Fcqrs-amqp%2Fpackage.json&style=plastic)](https://www.npmjs.com/package/@inversifyjs/framework-cqrs-amqp)

# @inversifyjs/framework-cqrs-amqp

AMQP transport for [`@inversifyjs/framework-cqrs`](https://www.npmjs.com/package/@inversifyjs/framework-cqrs) commands.

The package has no root entry point. Each protocol version lives under its own subpath. AMQP 1.0 support is built on [rhea](https://github.com/amqp/rhea), which stays inside the package: the public types follow the AMQP 1.0 specification and use camelCase.

```ts
import {
  Amqp1Dot0TransportDeclaration,
  Amqp1Dot0TransportProvider,
} from '@inversifyjs/framework-cqrs-amqp/v1Dot0';
```

The transport speaks plain AMQP 1.0, with no broker-specific behavior, so it works with any compliant peer: ActiveMQ Artemis, Azure Service Bus, Qpid, Solace, RabbitMQ (natively since 4.0), and so on.

## Quick start

Declare which AMQP 1.0 address carries a command, and implement `deserialize` so the handler can rebuild the command from a received message:

```ts
import { CommandHandler } from '@inversifyjs/framework-cqrs';
import {
  type Amqp1Dot0CommandHandler,
  type Amqp1Dot0Message,
  Amqp1Dot0TransportDeclaration,
} from '@inversifyjs/framework-cqrs-amqp/v1Dot0';

class CreateOrder {
  constructor(public readonly orderId: string) {}
}

@CommandHandler({
  command: CreateOrder,
  transports: [
    new Amqp1Dot0TransportDeclaration({
      address: 'orders.create',
      connectionIdentifier: 'broker',
    }),
  ],
})
class CreateOrderHandler implements Amqp1Dot0CommandHandler<CreateOrder> {
  public deserialize(message: Amqp1Dot0Message): CreateOrder {
    const section: Uint8Array | undefined =
      message.body.kind === 'data' ? message.body.sections[0] : undefined;

    if (section === undefined) {
      throw new Error('Expected a data section');
    }

    const payload: { orderId: string } = JSON.parse(
      Buffer.from(section).toString('utf8'),
    ) as { orderId: string };

    return new CreateOrder(payload.orderId);
  }

  public async handle(command: CreateOrder): Promise<void> {
    // ...
  }
}
```

Then register the connection and hand the transport provider to the `CqrsProvider`:

```ts
import { CqrsProvider } from '@inversifyjs/framework-cqrs';
import { Amqp1Dot0TransportProvider } from '@inversifyjs/framework-cqrs-amqp/v1Dot0';
import { Container } from 'inversify';

const container: Container = new Container();

container.bind(CreateOrderHandler).toSelf();

const amqpTransport: Amqp1Dot0TransportProvider =
  new Amqp1Dot0TransportProvider({
    connections: [
      {
        connectionOptions: { host: 'localhost', port: 5672 },
        identifier: 'broker',
      },
    ],
    listenersEnabled: true,
  });

const cqrsProvider: CqrsProvider = new CqrsProvider([amqpTransport]);

await cqrsProvider.provide(container);

// Resolves once the broker accepted the message.
await cqrsProvider.getCommandBus().send(new CreateOrder('order-1'));
```

Routes are inferred from the handler metadata: every `Amqp1Dot0TransportDeclaration` is both where the command bus sends the command and, when listeners are enabled, where the transport listens for it.

## Connections

The constructor takes any number of connections. Each one has an `identifier` (a string or a symbol) matched against the `connectionIdentifier` of the transport declarations, and AMQP 1.0 connection options: host, port, virtual host, frame size, idle timeout, SASL, TLS, and reconnection.

```ts
const amqpTransport: Amqp1Dot0TransportProvider =
  new Amqp1Dot0TransportProvider({
    connections: [
      // Plain TCP. No SASL layer is negotiated.
      {
        connectionOptions: { host: 'broker.internal', port: 5672 },
        identifier: 'broker',
      },
      // TLS with SASL PLAIN credentials.
      {
        connectionOptions: {
          host: 'my-namespace.servicebus.windows.net',
          port: 5671,
          sasl: {
            mechanism: 'plain',
            password: process.env['AMQP_PASSWORD'] ?? '',
            username: 'orders-service',
          },
          tls: {},
        },
        identifier: Symbol.for('cloud'),
      },
    ],
  });
```

Only the connections referenced by at least one declaration are opened, during `provide()`. Connection failures there reject `provide()`, so a misconfigured broker fails at startup. Once a connection has opened, `reconnect` applies. It defaults to `true`, which retries with exponential backoff (100 ms, doubling up to 60 s). Pass `false` to disable it, or `{ initialDelay, maxDelay, limit }` to change the backoff.

A connection is down for good when it is lost with reconnection disabled, or when the peer closes it and it will not reconnect: the close carries no error or a fatal one, or reconnection is disabled. Only `amqp:connection:forced` counts as non-fatal by default. Once a connection is down, the transport logs it and every pending or later send on it rejects right away. Build new providers to recover.

## Producers and consumers

Listeners are disabled by default: the transport only sends. Enable them globally, or per connection, where the connection value wins:

```ts
const amqpTransport: Amqp1Dot0TransportProvider =
  new Amqp1Dot0TransportProvider({
    connections: [
      { connectionOptions, identifier: 'orders', listenersEnabled: true },
      { connectionOptions: auditConnectionOptions, identifier: 'audit' },
    ],
  });
```

This enables a few topologies with the same handler code:

- **Producer only**: listeners disabled. A service sends commands handled by another service. The handlers still have to be declared so routes can be inferred, but they don't need to be bound in the container.
- **Consumer**: listeners enabled. The transport opens one receiver per declared address and dispatches messages to the handlers bound in the container.
- **Both**: a single service sends commands to itself through the broker, for durability or load balancing across replicas.

## Deserializing messages

The transport doesn't know how to rebuild a command from a message, so every handler receiving AMQP messages must implement `Amqp1Dot0CommandHandler`, which adds `deserialize(message)` to `CqrsCommandHandler`. It receives an `Amqp1Dot0Message`: the body, the header, the properties (`subject`, `messageId`, and the rest), `applicationProperties`, `deliveryAnnotations`, `messageAnnotations`, and `footer`. A data or sequence body keeps every section. An AMQP described value keeps its descriptor, except when that value is the whole amqp-value body: rhea drops it ([amqp/rhea#456](https://github.com/amqp/rhea/issues/456)). A list, a map, and an array each have their own kind, and an array carries one element type. It may be asynchronous.

A handler that doesn't implement `deserialize` fails on the first message it receives, and that failure is logged.

### Declining messages

`deserialize` may return `undefined` to decline a message. This is how several command types share an address:

```ts
class CancelOrderHandler implements Amqp1Dot0CommandHandler<CancelOrder> {
  public deserialize(message: Amqp1Dot0Message): CancelOrder | undefined {
    if (message.properties?.subject !== 'CancelOrder') {
      return undefined;
    }

    const body: string =
      message.body.kind === 'value' ? String(message.body.value) : '';

    return new CancelOrder(body);
  }

  public handle(command: CancelOrder): void {
    // ...
  }
}
```

A message is accepted once every handler declared on its address has handled or declined it, and at least one handled it. If every handler declines, the message is rejected with condition `amqp:not-found` and logged, whatever the configured failure outcome.

### Routing is by address only

AMQP gives no reliable way to tell which command a message carries, so the transport routes a message to every handler declared on its connection and address, in declaration order. Prefer one address per command type. When addresses are shared, use a serializer that tags messages, such as with `subject`, and decline the others in `deserialize`.

A handler class declared twice on the same address runs twice for each message, once per declaration.

## Serializers

By default, commands are sent as JSON data sections with content type `application/json`, the durable flag set, and a generated string `messageId`. The `deserialize` snippet in the quick start matches this format.

Replace the serializer for the whole provider, or for given addresses of a connection:

```ts
import {
  type Amqp1Dot0Message,
  type Amqp1Dot0Serializer,
} from '@inversifyjs/framework-cqrs-amqp/v1Dot0';

const subjectSerializer: Amqp1Dot0Serializer = {
  serialize: (command: object): Amqp1Dot0Message => ({
    body: {
      kind: 'data',
      sections: [Buffer.from(JSON.stringify(command))],
    },
    properties: { subject: command.constructor.name },
  }),
};

const amqpTransport: Amqp1Dot0TransportProvider =
  new Amqp1Dot0TransportProvider({
    connections: [
      {
        connectionOptions,
        identifier: 'broker',
        serializers: new Map([['orders.shared', subjectSerializer]]),
      },
    ],
    serializer: customDefaultSerializer,
  });
```

The lookup order is the connection's serializer for the address, then the provider `serializer`, then the JSON serializer. A serializer that throws makes `send()` reject before anything reaches the broker.

## Sending

`commandBus.send()` resolves once the peer settles the delivery as accepted. When the peer's receiver settle mode is second, it resolves once that accepted outcome is settled locally. It rejects when the peer rejects, releases, or modifies it, when the link or connection is lost before the outcome arrives, when the connection is down for good, and after `close()`. Senders are opened on the first send to an address and reused afterwards. A reconnecting disconnect rejects deliveries that were still unsettled and keeps the sender, so the next send waits for that link to reattach.

While a connection reconnects, sends wait for the sender to attach again and for fresh credit. Set `sendTimeout` to bound how long a send waits for its sender, for credit, and for the peer outcome. The timeout is a positive integer of at most 2147483647 milliseconds, which is the longest delay Node can schedule:

```ts
const amqpTransport: Amqp1Dot0TransportProvider =
  new Amqp1Dot0TransportProvider({
    connections: [{ connectionOptions, identifier: 'broker' }],
    sendTimeout: 5000,
  });
```

A rejected send isn't proof that the message wasn't delivered. When the connection drops or the timeout fires after the message left the process, the peer may already have it, or may receive it later. Retrying such a send can produce duplicates, which is one more reason for idempotent handlers.

## Failure outcomes

When `deserialize` or `handle` throws, the error is logged and the message is settled according to `handlerErrorOutcome`:

| Outcome | AMQP settlement | Typical broker behavior |
| --- | --- | --- |
| `'reject'` (default) | `rejected` with `amqp:internal-error` and a generic description | Dead-lettered when the queue has a dead-letter target, dropped otherwise. |
| `'release'` | `released` | Redelivered without counting the attempt, possibly right away. A message that always fails loops. |
| `'modified'` | `modified` with `delivery_failed: true` | Redelivered and counted, so brokers with a maximum delivery count (Artemis, Service Bus) eventually dead-letter it. |

The rejection description is always `The handler failed to process the message`, so error details never reach the broker. The full error is only logged locally.

Check your broker's dead-letter and redelivery settings before picking an outcome. With `'reject'` and no dead-letter configuration, failed messages are lost.

## Concurrency

Messages received on one address are handled concurrently, up to the receiver `creditWindow`, which defaults to 100. The transport grants credit when the receiver attaches and returns one credit every time a message is settled, so the window is a real bound on in-flight messages:

```ts
const config: Amqp1Dot0ConnectionConfig = {
  connectionOptions,
  identifier: 'broker',
  listenersEnabled: true,
  receiverOptions: {
    creditWindow: 10,
    source: { durable: 'configuration' },
  },
};
```

`creditWindow: 1` handles one message of an address at a time. That only gives strict ordering with a single consumer on the address and no redeliveries: competing consumers, and messages released, modified, or redelivered after a lost connection, can be handled out of order. Receiver options are `creditWindow` and `source` (distribution mode, filters, durability, expiry, capabilities, and timeout). Sender options are the `target` terminus settings. The address always comes from the declaration, and settlement is managed by the transport.

## Delivery guarantees

Messages are delivered at least once. A process crash or a lost connection between handling a message and settling it leads to a redelivery, so handlers should be idempotent, for example by deduplicating on `message.properties?.messageId`.

## Lifecycle

- **Failed startup**: if `provide()` rejects, the transport closes its connections and can't be initialized again. Build new `Amqp1Dot0TransportProvider` and `CqrsProvider` instances to retry.
- **One CQRS provider**: a transport provider instance can only be initialized once, so pass each instance to a single `CqrsProvider`.
- **Shutdown**: `close()` rejects pending sends, detaches receivers and senders, and closes the connections, including the ones waiting to reconnect, which stay closed. Messages being handled at that point, or arriving once `close()` started, stay unsettled and are redelivered by the broker; handlers don't run for the latter. Calling `close()` again waits for the same shutdown.
- **Closing during startup**: calling `close()` while `provide()` is running makes `provide()` reject.

```ts
await amqpTransport.close();
```

## Logging

Failures are logged with a `ConsoleLogger` by default. Pass `logger: false` to disable logging, or any `@inversifyjs/logger` `Logger` instance.
