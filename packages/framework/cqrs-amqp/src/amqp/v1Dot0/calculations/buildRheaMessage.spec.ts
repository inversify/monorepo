import { afterAll, beforeAll, describe, expect, it, vitest } from 'vitest';

vitest.mock(import('rhea'), () => ({
  default: {
    message: {
      data_section: vitest.fn(),
      sequence_section: vitest.fn(),
    },
    types: {
      wrap_binary: vitest.fn(),
    },
  } as unknown as typeof rhea,
}));

import rhea from 'rhea';

import { type Amqp1Dot0Message } from '../models/Amqp1Dot0Message.js';
import { buildRheaMessage } from './buildRheaMessage.js';

describe(buildRheaMessage, () => {
  describe('having a message with a value body', () => {
    let messageFixture: Amqp1Dot0Message;

    beforeAll(() => {
      messageFixture = {
        body: {
          kind: 'value',
          value: { entries: [['orderId', 'order-1']], kind: 'map' },
        },
      };
    });

    describe('when called', () => {
      let result: unknown;

      beforeAll(() => {
        result = buildRheaMessage(messageFixture);
      });

      it('should return a rhea message', () => {
        expect(result).toStrictEqual({
          body: new Map([['orderId', 'order-1']]),
        });
      });
    });
  });

  describe('having a message with a data body and every section', () => {
    let messageFixture: Amqp1Dot0Message;

    beforeAll(() => {
      messageFixture = {
        applicationProperties: { tenant: 'acme' },
        body: { kind: 'data', sections: [new Uint8Array([1])] },
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
          userId: new Uint8Array([2]),
        },
      };
    });

    describe('when called', () => {
      let bodyFixture: unknown;

      let result: unknown;

      beforeAll(() => {
        bodyFixture = Symbol();

        vitest
          .mocked(rhea.message.data_section)
          .mockReturnValueOnce(bodyFixture);

        result = buildRheaMessage(messageFixture);
      });

      afterAll(() => {
        vitest.clearAllMocks();
      });

      it('should call rhea.message.data_section()', () => {
        expect(rhea.message.data_section).toHaveBeenCalledExactlyOnceWith(
          Buffer.from([1]),
        );
      });

      it('should return a rhea message', () => {
        expect(result).toStrictEqual({
          absolute_expiry_time: new Date(2000),
          application_properties: { tenant: 'acme' },
          body: bodyFixture,
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
        });
      });
    });
  });

  describe('having a message with a sequence body and a binary message id', () => {
    let messageFixture: Amqp1Dot0Message;

    beforeAll(() => {
      messageFixture = {
        body: {
          kind: 'sequence',
          sections: [{ items: ['order-1', new Uint8Array([1])], kind: 'list' }],
        },
        properties: { messageId: new Uint8Array([3]) },
      };
    });

    describe('when called', () => {
      let bodyFixture: unknown;
      let messageIdFixture: unknown;

      let result: unknown;

      beforeAll(() => {
        bodyFixture = Symbol();
        messageIdFixture = Symbol();

        vitest
          .mocked(rhea.message.sequence_section)
          .mockReturnValueOnce(bodyFixture);
        vitest
          .mocked(rhea.types.wrap_binary)
          .mockReturnValueOnce(
            messageIdFixture as ReturnType<typeof rhea.types.wrap_binary>,
          );

        result = buildRheaMessage(messageFixture);
      });

      afterAll(() => {
        vitest.clearAllMocks();
      });

      it('should call rhea.message.sequence_section()', () => {
        expect(rhea.message.sequence_section).toHaveBeenCalledExactlyOnceWith([
          'order-1',
          Buffer.from([1]),
        ]);
      });

      it('should call rhea.types.wrap_binary()', () => {
        expect(rhea.types.wrap_binary).toHaveBeenCalledExactlyOnceWith(
          Buffer.from([3]),
        );
      });

      it('should return a rhea message', () => {
        expect(result).toStrictEqual({
          body: bodyFixture,
          message_id: messageIdFixture,
        });
      });
    });
  });
});
