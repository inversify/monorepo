import { describe, expectTypeOf, it } from 'vitest';

import {
  type TransportDeclaration,
  type TransportProvider,
} from '@inversifyjs/framework-cqrs';

import {
  type Amqp1Dot0CommandHandler,
  type Amqp1Dot0ConnectionConfig,
  type Amqp1Dot0HandlerErrorOutcome,
  type Amqp1Dot0JsonSerializer,
  type Amqp1Dot0Serializer,
  type Amqp1Dot0TransportDeclaration,
  type Amqp1Dot0TransportParams,
  Amqp1Dot0TransportProvider,
  type Amqp1Dot0TransportProviderOptions,
} from './index.js';

describe('v1Dot0 entry point', () => {
  it('should expose a CQRS transport provider', () => {
    expectTypeOf<Amqp1Dot0TransportProvider>().toExtend<
      TransportProvider<Amqp1Dot0TransportParams>
    >();
    expectTypeOf(
      Amqp1Dot0TransportProvider,
    ).constructorParameters.toEqualTypeOf<
      [Amqp1Dot0TransportProviderOptions]
    >();
  });

  it('should expose a CQRS transport declaration', () => {
    expectTypeOf<Amqp1Dot0TransportDeclaration>().toExtend<
      TransportDeclaration & Amqp1Dot0TransportParams
    >();
  });

  it('should expose the default JSON serializer', () => {
    expectTypeOf<Amqp1Dot0JsonSerializer>().toExtend<Amqp1Dot0Serializer>();
  });

  it('should expose the configuration types', () => {
    expectTypeOf<Amqp1Dot0ConnectionConfig>().toHaveProperty(
      'connectionOptions',
    );
    expectTypeOf<Amqp1Dot0HandlerErrorOutcome>().toEqualTypeOf<
      'modified' | 'reject' | 'release'
    >();
    expectTypeOf<Amqp1Dot0CommandHandler>().toHaveProperty('deserialize');
  });
});
