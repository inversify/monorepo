import { describe, expectTypeOf, it } from 'vitest';

import { type Amqp1Dot0ReceiverOptions } from './Amqp1Dot0ReceiverOptions.js';
import { type Amqp1Dot0SenderOptions } from './Amqp1Dot0SenderOptions.js';

describe('AMQP 1.0 receiver options', () => {
  it('should accept a credit window and source durability', () => {
    const options: Amqp1Dot0ReceiverOptions = {
      creditWindow: 5,
      source: { durable: 'configuration' },
    };

    expectTypeOf(options).toExtend<Amqp1Dot0ReceiverOptions>();
  });

  it('should reject autoaccept', () => {
    const options: Amqp1Dot0ReceiverOptions = {
      // @ts-expect-error settlement is managed by the provider
      autoaccept: true,
    };

    expectTypeOf(options).toEqualTypeOf<Amqp1Dot0ReceiverOptions>();
  });

  it('should reject a source address', () => {
    const options: Amqp1Dot0ReceiverOptions = {
      source: {
        // @ts-expect-error the address is set from the transport declaration
        address: 'orders.create',
      },
    };

    expectTypeOf(options).toEqualTypeOf<Amqp1Dot0ReceiverOptions>();
  });
});

describe('AMQP 1.0 sender options', () => {
  it('should accept target durability', () => {
    const options: Amqp1Dot0SenderOptions = {
      target: { durable: 'unsettledState' },
    };

    expectTypeOf(options).toExtend<Amqp1Dot0SenderOptions>();
  });

  it('should reject a target address', () => {
    const options: Amqp1Dot0SenderOptions = {
      target: {
        // @ts-expect-error the address is set from the transport declaration
        address: 'orders.create',
      },
    };

    expectTypeOf(options).toEqualTypeOf<Amqp1Dot0SenderOptions>();
  });

  it('should reject a settle mode', () => {
    const options: Amqp1Dot0SenderOptions = {
      // @ts-expect-error pre-settled sends would never be acknowledged
      snd_settle_mode: 1,
    };

    expectTypeOf(options).toEqualTypeOf<Amqp1Dot0SenderOptions>();
  });
});
