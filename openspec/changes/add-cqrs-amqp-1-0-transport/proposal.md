# Proposal

## Why

`@inversifyjs/framework-cqrs` defines a `TransportProvider` contract, but the only implementation is the in-process `SyncTransportProvider`. Applications that need commands to cross process boundaries (workers, services behind a broker) have no supported transport. AMQP 1.0 is an ISO/OASIS standard spoken by many brokers and cloud services (Apache ActiveMQ Artemis, Qpid, Azure Service Bus, Solace, RabbitMQ 4+, etc.), so a broker-agnostic AMQP 1.0 transport covers the widest range of deployments with one implementation.

## What Changes

- Add a new package `@inversifyjs/framework-cqrs-amqp` at `packages/framework/cqrs-amqp`, built on [rhea](https://github.com/amqp/rhea).
- The package SHALL NOT expose a root (`.`) export. It exposes a versioned subpath `./v1Dot0` for AMQP 1.0, following the `./v3Dot1` / `./v3Dot2` convention of the OpenAPI packages, so other AMQP protocol versions can be added later without breaking changes.
- `./v1Dot0` exports:
  - `Amqp1Dot0TransportDeclaration`: implements the CQRS `TransportDeclaration` and adds a connection identifier and an AMQP 1.0 address.
  - `Amqp1Dot0TransportProvider`: implements `TransportProvider<Amqp1Dot0TransportParams>`.
  - `Amqp1Dot0CommandHandler`: extends `CqrsCommandHandler` with a `deserialize(message)` method, so userland decides how a received AMQP message becomes a command.
  - `Amqp1Dot0Serializer` and a default JSON serializer.
  - Supporting types: connection config, provider options, transport params, handler error outcome.
- The provider constructor registers any number of **connection** configurations. Each one has an `identifier: string | symbol` and accepts plain rhea connection options, so it is not tied to any specific broker. Declarations reference connections by identifier.
- Address listeners (AMQP receivers) are opt-in: a global flag in the provider options, which each connection can override. When enabled, `initialize()` opens one receiver per declared address on that connection.
- Received messages are routed by **address only**. Every handler declared on a (connection, address) receives every message arriving there: it deserializes the message, then handles the command. A handler can decline a message by returning `undefined` from `deserialize`. Commands never need a `@Command` identifier, and telling command types apart on a shared address is up to userland.
- Messages that arrive while `initialize()` is still running are held until the `CqrsProvider` has finished providing, so handlers can always use the command, event and query buses.
- Connection-wide receiver source settings, such as filters and distribution mode, are passed through to rhea.
- Sending is always available. Outbound routes are inferred from `@CommandHandler` metadata, so a process with listeners disabled can still send. Commands are serialized by a provider-level serializer (JSON by default), which can be overridden per address. `send()` resolves only once the peer accepts the message.
- Received messages are accepted when every handler succeeds. Otherwise they get a configurable outcome (`reject` by default, or `release` / `modified`).
- The provider exposes a `close()` method for graceful shutdown.
- No changes to `@inversifyjs/framework-cqrs`.

## Capabilities

### New Capabilities

- `cqrs-amqp-transport`: Transporting CQRS commands over AMQP: connection registration, transport declarations, outbound sending with per-address serialization and peer acknowledgement, opt-in address listeners with handler-side deserialization, settlement outcomes, and shutdown.

### Modified Capabilities

<!-- None: the CQRS core contract is consumed as-is. -->

## Impact

- **New package**: `packages/framework/cqrs-amqp` (`@inversifyjs/framework-cqrs-amqp`). The existing `packages/framework/*` workspace glob covers it, so `pnpm-workspace.yaml` does not change.
- **New third-party dependency**: `rhea` (Apache-2.0, depends on `debug`).
- **Peer dependencies**: `@inversifyjs/framework-cqrs`, `inversify`.
- **Repo config**: `codecov.yml` entries for the new package, and a changeset.
- **Public API**: new and additive only.
