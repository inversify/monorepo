import { afterAll, beforeAll, describe, expect, it, vitest } from 'vitest';

vitest.mock(import('rhea'), () => ({
  default: {
    types: {
      described: vitest.fn(),
      wrap: vitest.fn(),
      wrap_symbol: vitest.fn(),
      wrap_ulong: vitest.fn(),
    },
  } as unknown as typeof rhea,
}));

import rhea from 'rhea';

import { type Amqp1Dot0Value } from '../models/Amqp1Dot0Value.js';
import { buildRheaValue } from './buildRheaValue.js';

describe(buildRheaValue, () => {
  describe.each<[string, Amqp1Dot0Value]>([
    ['null', null],
    ['a boolean', true],
    ['a number', 42],
    ['a string', 'order-1'],
    ['a date', new Date(0)],
  ])('having %s', (_: string, valueFixture: Amqp1Dot0Value) => {
    describe('when called', () => {
      let result: unknown;

      beforeAll(() => {
        result = buildRheaValue(valueFixture);
      });

      it('should return the value', () => {
        expect(result).toBe(valueFixture);
      });
    });
  });

  describe('having nested lists and maps with binaries', () => {
    let valueFixture: Amqp1Dot0Value;

    beforeAll(() => {
      valueFixture = {
        entries: [
          ['items', { items: [new Uint8Array([1]), 'order-1'], kind: 'list' }],
          [
            'nested',
            { entries: [['bytes', new Uint8Array([2])]], kind: 'map' },
          ],
        ],
        kind: 'map',
      };
    });

    describe('when called', () => {
      let result: unknown;

      beforeAll(() => {
        result = buildRheaValue(valueFixture);
      });

      it('should return the value with Buffers', () => {
        expect(result).toStrictEqual(
          new Map<unknown, unknown>([
            ['items', [Buffer.from([1]), 'order-1']],
            [
              'nested',
              new Map<unknown, unknown>([['bytes', Buffer.from([2])]]),
            ],
          ]),
        );
      });
    });
  });

  describe.each<
    [string, number | string, string, 'wrap_symbol' | 'wrap_ulong']
  >([
    [
      'a symbolic descriptor',
      'apache.org:selector-filter:string',
      "color = 'red'",
      'wrap_symbol',
    ],
    ['a numeric descriptor', 0x1d, 'missing', 'wrap_ulong'],
  ])(
    'having a described value with %s',
    (
      _: string,
      descriptor: number | string,
      describedValue: string,
      wrapDescriptor: 'wrap_symbol' | 'wrap_ulong',
    ) => {
      describe('when called', () => {
        let describedResult: unknown;
        let encodedDescriptor: unknown;
        let encodedValue: unknown;
        let result: unknown;

        beforeAll(() => {
          describedResult = Symbol();
          encodedDescriptor = Symbol();
          encodedValue = Symbol();

          vitest
            .mocked(rhea.types[wrapDescriptor])
            .mockReturnValueOnce(encodedDescriptor as never);
          vitest
            .mocked(rhea.types.wrap)
            .mockReturnValueOnce(encodedValue as never);
          vitest
            .mocked(rhea.types.described)
            .mockReturnValueOnce(describedResult);

          result = buildRheaValue({
            descriptor,
            kind: 'described',
            value: describedValue,
          });
        });

        afterAll(() => {
          vitest.clearAllMocks();
        });

        it('should encode the descriptor in its AMQP form', () => {
          expect(rhea.types[wrapDescriptor]).toHaveBeenCalledExactlyOnceWith(
            descriptor,
          );
          expect(rhea.types.wrap).toHaveBeenCalledExactlyOnceWith(
            describedValue,
          );
        });

        it('should call rhea.types.described()', () => {
          expect(rhea.types.described).toHaveBeenCalledExactlyOnceWith(
            encodedDescriptor,
            encodedValue,
          );
          expect(result).toBe(describedResult);
        });
      });
    },
  );

  describe('having a nested array', () => {
    describe('when called', () => {
      let result: unknown;

      beforeAll(() => {
        try {
          buildRheaValue({
            elementType: 'array',
            items: [],
            kind: 'array',
          } as unknown as Amqp1Dot0Value);
        } catch (error: unknown) {
          result = error;
        }
      });

      it('should throw an Error', () => {
        expect(result).toStrictEqual(
          new Error('Nested AMQP 1.0 arrays cannot be encoded'),
        );
      });
    });
  });
});
