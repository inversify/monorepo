import { beforeAll, describe, expect, it } from 'vitest';

import { type Amqp1Dot0Message } from '../models/Amqp1Dot0Message.js';
import { Amqp1Dot0JsonSerializer } from './Amqp1Dot0JsonSerializer.js';

const UUID_PATTERN: RegExp =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/u;

function readData(message: Amqp1Dot0Message): string {
  const section: Uint8Array | undefined =
    message.body.kind === 'data' ? message.body.sections[0] : undefined;

  if (section === undefined) {
    throw new Error('Expected a data section');
  }

  return Buffer.from(section).toString('utf8');
}

describe(Amqp1Dot0JsonSerializer, () => {
  let amqp1Dot0JsonSerializer: Amqp1Dot0JsonSerializer;

  beforeAll(() => {
    amqp1Dot0JsonSerializer = new Amqp1Dot0JsonSerializer();
  });

  describe('.serialize', () => {
    describe('having a plain command', () => {
      let commandFixture: object;

      beforeAll(() => {
        commandFixture = { orderId: 'order-1' };
      });

      describe('when called', () => {
        let result: Amqp1Dot0Message;

        beforeAll(() => {
          result = amqp1Dot0JsonSerializer.serialize(commandFixture);
        });

        it('should return a durable JSON data message', () => {
          expect(readData(result)).toBe('{"orderId":"order-1"}');
          expect(result.header).toStrictEqual({ durable: true });
          expect(result.properties?.contentType).toBe('application/json');
          expect(result.properties?.messageId).toMatch(UUID_PATTERN);
        });
      });
    });

    describe('having a command with a toJSON method', () => {
      let commandFixture: object;

      beforeAll(() => {
        commandFixture = {
          toJSON: (): unknown => ({ id: 'order-2' }),
        };
      });

      describe('when called', () => {
        let result: Amqp1Dot0Message;

        beforeAll(() => {
          result = amqp1Dot0JsonSerializer.serialize(commandFixture);
        });

        it('should serialize the toJSON() output', () => {
          expect(readData(result)).toBe('{"id":"order-2"}');
        });
      });
    });

    describe('having a command with a bigint property', () => {
      let commandFixture: object;

      beforeAll(() => {
        commandFixture = { amount: 1n };
      });

      describe('when called', () => {
        let result: unknown;

        beforeAll(() => {
          try {
            amqp1Dot0JsonSerializer.serialize(commandFixture);
          } catch (error: unknown) {
            result = error;
          }
        });

        it('should throw a TypeError', () => {
          expect(result).toBeInstanceOf(TypeError);
        });
      });
    });
  });
});
