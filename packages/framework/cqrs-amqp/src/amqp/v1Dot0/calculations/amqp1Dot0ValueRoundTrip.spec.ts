import { beforeAll, describe, expect, it } from 'vitest';

import rhea, { type Message } from 'rhea';

import { type Amqp1Dot0Message } from '../models/Amqp1Dot0Message.js';
import { type Amqp1Dot0Value } from '../models/Amqp1Dot0Value.js';
import { buildAmqp1Dot0Message } from './buildAmqp1Dot0Message.js';
import { buildAmqp1Dot0Value } from './buildAmqp1Dot0Value.js';
import { buildRheaMessage } from './buildRheaMessage.js';
import { buildRheaValue } from './buildRheaValue.js';

function roundTripValue(value: Amqp1Dot0Value): Amqp1Dot0Value {
  return buildAmqp1Dot0Value(buildRheaValue(value));
}

function roundTripMessage(message: Amqp1Dot0Message): Amqp1Dot0Message {
  return buildAmqp1Dot0Message(
    rhea.message.decode(
      rhea.message.encode(buildRheaMessage(message)),
    ) as unknown as Message,
  );
}

describe('AMQP 1.0 value round trip', () => {
  describe('having a described value', () => {
    let valueFixture: Amqp1Dot0Value;

    beforeAll(() => {
      valueFixture = {
        descriptor: 'apache.org:selector-filter:string',
        kind: 'described',
        value: "color = 'red'",
      };
    });

    describe('when encoded and read back', () => {
      let result: unknown;

      beforeAll(() => {
        result = roundTripValue(valueFixture);
      });

      it('should keep the descriptor and the value', () => {
        expect(result).toStrictEqual(valueFixture);
      });
    });
  });

  describe('having a described value with a numeric descriptor', () => {
    let valueFixture: Amqp1Dot0Value;

    beforeAll(() => {
      valueFixture = {
        descriptor: 0x1d,
        kind: 'described',
        value: 'missing',
      };
    });

    describe('when encoded and read back', () => {
      let result: unknown;

      beforeAll(() => {
        result = roundTripValue(valueFixture);
      });

      it('should keep the numeric descriptor', () => {
        expect(result).toStrictEqual(valueFixture);
      });
    });
  });

  describe('having a message with described values and several data sections', () => {
    let messageFixture: Amqp1Dot0Message;

    beforeAll(() => {
      messageFixture = {
        applicationProperties: {
          color: {
            descriptor: 'example:color:string',
            kind: 'described',
            value: 'red',
          },
          tags: { items: ['priority'], kind: 'list' },
        },
        body: {
          kind: 'data',
          sections: [Buffer.from([1]), Buffer.from([2])],
        },
        deliveryAnnotations: { 'x-opt-lock': 'lock-1' },
        footer: { trace: 'trace-1' },
        properties: { subject: 'CreateOrder' },
      };
    });

    describe('when encoded and read back', () => {
      let result: unknown;

      beforeAll(() => {
        result = roundTripMessage(messageFixture);
      });

      it('should keep the sections, the descriptor, and the maps', () => {
        expect(result).toStrictEqual(messageFixture);
      });
    });
  });

  describe('having a sequence of described values', () => {
    let messageFixture: Amqp1Dot0Message;

    beforeAll(() => {
      messageFixture = {
        body: {
          kind: 'sequence',
          sections: [
            {
              items: [
                {
                  descriptor: 'example:color:string',
                  kind: 'described',
                  value: 'red',
                },
              ],
              kind: 'list',
            },
          ],
        },
      };
    });

    describe('when encoded and read back', () => {
      let result: unknown;

      beforeAll(() => {
        result = roundTripMessage(messageFixture);
      });

      it('should keep the described value in the sequence', () => {
        expect(result).toStrictEqual(messageFixture);
      });
    });
  });

  describe('having a plain amqp-value', () => {
    let messageFixture: Amqp1Dot0Message;

    beforeAll(() => {
      messageFixture = { body: { kind: 'value', value: 'red' } };
    });

    describe('when encoded and read back', () => {
      let result: unknown;

      beforeAll(() => {
        result = roundTripMessage(messageFixture);
      });

      it('should return the value', () => {
        expect(result).toStrictEqual(messageFixture);
      });
    });
  });

  describe('having an amqp-value that is described', () => {
    let messageFixture: Amqp1Dot0Message;

    beforeAll(() => {
      messageFixture = {
        body: {
          kind: 'value',
          value: {
            descriptor: 'example:color:string',
            kind: 'described',
            value: 'red',
          },
        },
      };
    });

    describe('when encoded and read back', () => {
      let result: unknown;

      beforeAll(() => {
        result = roundTripMessage(messageFixture);
      });

      it('should return the bare value', () => {
        expect(result).toStrictEqual({
          body: { kind: 'value', value: 'red' },
        });
      });
    });
  });

  describe.each<[string, Amqp1Dot0Value]>([
    ['a list', { items: ['red', 1], kind: 'list' }],
    [
      'a map',
      {
        entries: [
          ['tenant', 'acme'],
          [1, 'one'],
        ],
        kind: 'map',
      },
    ],
    [
      'an array',
      { elementType: 'string', items: ['red', 'blue'], kind: 'array' },
    ],
    [
      'an array of described strings',
      {
        elementDescriptor: 'example:color:string',
        elementType: 'string',
        items: ['red', 'blue'],
        kind: 'array',
      },
    ],
  ])('having %s', (_: string, valueFixture: Amqp1Dot0Value) => {
    describe('when encoded and read back', () => {
      let result: unknown;

      beforeAll(() => {
        result = roundTripValue(valueFixture);
      });

      it('should keep the value', () => {
        expect(result).toStrictEqual(valueFixture);
      });
    });
  });

  describe('having a message whose value is a map', () => {
    let messageFixture: Amqp1Dot0Message;

    beforeAll(() => {
      messageFixture = {
        body: {
          kind: 'value',
          value: { entries: [['orderId', 'order-1']], kind: 'map' },
        },
      };
    });

    describe('when encoded and read back', () => {
      let result: unknown;

      beforeAll(() => {
        result = roundTripMessage(messageFixture);
      });

      it('should keep the map', () => {
        expect(result).toStrictEqual(messageFixture);
      });
    });
  });
});
