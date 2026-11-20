import { beforeAll, describe, expect, it } from 'vitest';

import { type Message } from 'rhea';

import { type Amqp1Dot0Message } from '../models/Amqp1Dot0Message.js';
import { buildAmqp1Dot0Message } from './buildAmqp1Dot0Message.js';

class RheaSectionFixture {
  constructor(
    public readonly typecode: number,
    public readonly content: unknown,
    public readonly multiple?: boolean,
  ) {}

  public collect_sections(): void {}
}

describe(buildAmqp1Dot0Message, () => {
  describe('having a message with a value body only', () => {
    let messageFixture: Message;

    beforeAll(() => {
      messageFixture = { body: 'order-1' };
    });

    describe('when called', () => {
      let result: unknown;

      beforeAll(() => {
        result = buildAmqp1Dot0Message(messageFixture);
      });

      it('should return a message without empty sections', () => {
        const expected: Amqp1Dot0Message = {
          body: { kind: 'value', value: 'order-1' },
        };

        expect(result).toStrictEqual(expected);
      });
    });
  });

  describe('having a message without body', () => {
    let messageFixture: Message;

    beforeAll(() => {
      messageFixture = {} as Message;
    });

    describe('when called', () => {
      let result: unknown;

      beforeAll(() => {
        result = buildAmqp1Dot0Message(messageFixture);
      });

      it('should return a message with a null value body', () => {
        const expected: Amqp1Dot0Message = {
          body: { kind: 'value', value: null },
        };

        expect(result).toStrictEqual(expected);
      });
    });
  });

  describe('having a message with a data body and every section', () => {
    let messageFixture: Message;

    beforeAll(() => {
      messageFixture = {
        absolute_expiry_time: new Date(2000),
        application_properties: { tags: ['priority'], tenant: 'acme' },
        body: new RheaSectionFixture(0x75, Buffer.from([1])),
        content_encoding: 'gzip',
        content_type: 'application/json',
        correlation_id: 7,
        creation_time: new Date(1000),
        delivery_annotations: { 'x-opt-delivery': 1 },
        delivery_count: 1,
        durable: true,
        first_acquirer: false,
        footer: { 'x-opt-trace': 'trace-1' },
        group_id: 'orders',
        group_sequence: 3,
        message_annotations: { 'x-opt-partition-key': 'acme' },
        message_id: 'message-1',
        priority: 5,
        reply_to: 'orders.replies',
        reply_to_group_id: 'replies',
        subject: 'CreateOrder',
        to: 'orders.create',
        ttl: 1000,
        user_id: Buffer.from([2]),
      } as unknown as Message;
    });

    describe('when called', () => {
      let result: unknown;

      beforeAll(() => {
        result = buildAmqp1Dot0Message(messageFixture);
      });

      it('should return the message', () => {
        const expected: Amqp1Dot0Message = {
          applicationProperties: {
            tags: { items: ['priority'], kind: 'list' },
            tenant: 'acme',
          },
          body: { kind: 'data', sections: [Buffer.from([1])] },
          deliveryAnnotations: { 'x-opt-delivery': 1 },
          footer: { 'x-opt-trace': 'trace-1' },
          header: {
            deliveryCount: 1,
            durable: true,
            firstAcquirer: false,
            priority: 5,
            ttl: 1000,
          },
          messageAnnotations: { 'x-opt-partition-key': 'acme' },
          properties: {
            absoluteExpiryTime: new Date(2000),
            contentEncoding: 'gzip',
            contentType: 'application/json',
            correlationId: 7,
            creationTime: new Date(1000),
            groupId: 'orders',
            groupSequence: 3,
            messageId: 'message-1',
            replyTo: 'orders.replies',
            replyToGroupId: 'replies',
            subject: 'CreateOrder',
            to: 'orders.create',
            userId: Buffer.from([2]),
          },
        };

        expect(result).toStrictEqual(expected);
      });
    });
  });

  describe('having a message with several data sections', () => {
    let messageFixture: Message;

    beforeAll(() => {
      messageFixture = {
        body: new RheaSectionFixture(
          0x75,
          [Buffer.from([1]), Buffer.from([2])],
          true,
        ),
      };
    });

    describe('when called', () => {
      let result: unknown;

      beforeAll(() => {
        result = buildAmqp1Dot0Message(messageFixture);
      });

      it('should return a data body with each section', () => {
        const expected: Amqp1Dot0Message = {
          body: {
            kind: 'data',
            sections: [Buffer.from([1]), Buffer.from([2])],
          },
        };

        expect(result).toStrictEqual(expected);
      });
    });
  });

  describe('having a message with several sequence sections', () => {
    let messageFixture: Message;

    beforeAll(() => {
      messageFixture = {
        body: new RheaSectionFixture(0x76, [['order-1'], ['order-2']], true),
      };
    });

    describe('when called', () => {
      let result: unknown;

      beforeAll(() => {
        result = buildAmqp1Dot0Message(messageFixture);
      });

      it('should return a sequence body with one list per section', () => {
        const expected: Amqp1Dot0Message = {
          body: {
            kind: 'sequence',
            sections: [
              { items: ['order-1'], kind: 'list' },
              { items: ['order-2'], kind: 'list' },
            ],
          },
        };

        expect(result).toStrictEqual(expected);
      });
    });
  });
});
