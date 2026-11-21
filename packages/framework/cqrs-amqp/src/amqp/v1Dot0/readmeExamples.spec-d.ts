import { describe, expectTypeOf, it } from 'vitest';

import {
  type Amqp1Dot0ConnectionConfig,
  type Amqp1Dot0ConnectionOptions,
  type Amqp1Dot0Message,
  type Amqp1Dot0Serializer,
  type Amqp1Dot0TransportProviderOptions,
} from './index.js';

describe('README examples', () => {
  it('should accept the connection examples', () => {
    const options: Amqp1Dot0TransportProviderOptions = {
      connections: [
        {
          connectionOptions: { host: 'broker.internal', port: 5672 },
          identifier: 'broker',
        },
        {
          connectionOptions: {
            host: 'my-namespace.servicebus.windows.net',
            port: 5671,
            sasl: {
              mechanism: 'plain',
              password: 'secret',
              username: 'orders-service',
            },
            tls: {},
          },
          identifier: Symbol.for('cloud'),
        },
      ],
    };

    expectTypeOf(options).toEqualTypeOf<Amqp1Dot0TransportProviderOptions>();
  });

  it('should accept the serializer and concurrency examples', () => {
    const connectionOptions: Amqp1Dot0ConnectionOptions = {
      host: 'localhost',
      port: 5672,
    };

    const subjectSerializer: Amqp1Dot0Serializer = {
      serialize: (command: object): Amqp1Dot0Message => ({
        body: {
          kind: 'data',
          sections: [Buffer.from(JSON.stringify(command))],
        },
        properties: { subject: command.constructor.name },
      }),
    };

    const config: Amqp1Dot0ConnectionConfig = {
      connectionOptions,
      identifier: 'broker',
      listenersEnabled: true,
      receiverOptions: {
        creditWindow: 10,
        source: { durable: 'configuration' },
      },
      serializers: new Map([['orders.shared', subjectSerializer]]),
    };

    expectTypeOf(config).toEqualTypeOf<Amqp1Dot0ConnectionConfig>();
  });

  it('should accept the send timeout example', () => {
    const connectionOptions: Amqp1Dot0ConnectionOptions = {
      host: 'localhost',
      port: 5672,
    };

    const options: Amqp1Dot0TransportProviderOptions = {
      connections: [{ connectionOptions, identifier: 'broker' }],
      sendTimeout: 5000,
    };

    expectTypeOf(options).toEqualTypeOf<Amqp1Dot0TransportProviderOptions>();
  });
});
