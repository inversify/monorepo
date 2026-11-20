import { describe, expectTypeOf, it } from 'vitest';

import { type CqrsCommandHandler } from '@inversifyjs/framework-cqrs';

import { type Amqp1Dot0CommandHandler } from './Amqp1Dot0CommandHandler.js';
import { type Amqp1Dot0Message } from './Amqp1Dot0Message.js';

class CreateOrder {
  constructor(public readonly orderId: string) {}
}

class SyncCreateOrderHandler {
  public deserialize(message: Amqp1Dot0Message): CreateOrder {
    const orderId: string =
      message.body.kind === 'value' && typeof message.body.value === 'string'
        ? message.body.value
        : '';

    return new CreateOrder(orderId);
  }

  public handle(_command: CreateOrder): void {}
}

class AsyncCreateOrderHandler {
  public async deserialize(
    message: Amqp1Dot0Message,
  ): Promise<CreateOrder | undefined> {
    const orderId: string =
      message.body.kind === 'value' && typeof message.body.value === 'string'
        ? message.body.value
        : '';

    return message.properties?.subject === 'CreateOrder'
      ? new CreateOrder(orderId)
      : undefined;
  }

  public async handle(_command: CreateOrder): Promise<void> {}
}

class SkippingCreateOrderHandler {
  public deserialize(): undefined {
    return undefined;
  }

  public handle(_command: CreateOrder): void {}
}

class StringDeserializingHandler {
  public deserialize(message: Amqp1Dot0Message): string {
    return message.properties?.subject ?? '';
  }

  public handle(_command: CreateOrder): void {}
}

describe('AMQP 1.0 command handler', () => {
  it('should be a CQRS command handler', () => {
    expectTypeOf<Amqp1Dot0CommandHandler<CreateOrder>>().toExtend<
      CqrsCommandHandler<CreateOrder>
    >();
  });

  it('should accept synchronous, asynchronous and skipping deserializers', () => {
    expectTypeOf<SyncCreateOrderHandler>().toExtend<
      Amqp1Dot0CommandHandler<CreateOrder>
    >();
    expectTypeOf<AsyncCreateOrderHandler>().toExtend<
      Amqp1Dot0CommandHandler<CreateOrder>
    >();
    expectTypeOf<SkippingCreateOrderHandler>().toExtend<
      Amqp1Dot0CommandHandler<CreateOrder>
    >();
  });

  it('should reject deserializers returning another type', () => {
    expectTypeOf<StringDeserializingHandler>().not.toExtend<
      Amqp1Dot0CommandHandler<CreateOrder>
    >();
  });
});
