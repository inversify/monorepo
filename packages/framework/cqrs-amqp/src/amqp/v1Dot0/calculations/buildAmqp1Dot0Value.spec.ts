import { beforeAll, describe, expect, it } from 'vitest';

import { type Amqp1Dot0Value } from '../models/Amqp1Dot0Value.js';
import { buildAmqp1Dot0Value } from './buildAmqp1Dot0Value.js';

interface TypedFixture {
  array_constructor?: { descriptor?: TypedFixture; typecode?: number };
  descriptor?: TypedFixture;
  toRheaTyped: () => TypedFixture;
  type?: { typecode: number };
  value: unknown;
}

function typed(value: unknown, typecode?: number): TypedFixture {
  const fixture: TypedFixture = {
    toRheaTyped: (): TypedFixture => fixture,
    value,
  };

  if (typecode !== undefined) {
    fixture.type = { typecode };
  }

  return fixture;
}

describe(buildAmqp1Dot0Value, () => {
  describe.each<[string, unknown, Amqp1Dot0Value]>([
    ['undefined', undefined, null],
    ['null', null, null],
    ['a boolean', false, false],
    ['a number', 42, 42],
    ['a string', 'order-1', 'order-1'],
  ])(
    'having %s',
    (_: string, valueFixture: unknown, expectedResult: Amqp1Dot0Value) => {
      describe('when called', () => {
        let result: unknown;

        beforeAll(() => {
          result = buildAmqp1Dot0Value(valueFixture);
        });

        it('should return the expected value', () => {
          expect(result).toBe(expectedResult);
        });
      });
    },
  );

  describe('having nested lists and maps', () => {
    let valueFixture: unknown;

    beforeAll(() => {
      valueFixture = {
        items: [Buffer.from([1]), undefined],
        nested: { createdAt: new Date(0) },
      };
    });

    describe('when called', () => {
      let result: unknown;

      beforeAll(() => {
        result = buildAmqp1Dot0Value(valueFixture);
      });

      it('should return the value', () => {
        expect(result).toStrictEqual({
          entries: [
            ['items', { items: [Buffer.from([1]), null], kind: 'list' }],
            ['nested', { entries: [['createdAt', new Date(0)]], kind: 'map' }],
          ],
          kind: 'map',
        });
      });
    });
  });

  describe('having a described value', () => {
    let valueFixture: TypedFixture;

    beforeAll(() => {
      valueFixture = typed("color = 'red'");
      valueFixture.descriptor = typed('apache.org:selector-filter:string');
    });

    describe('when called', () => {
      let result: unknown;

      beforeAll(() => {
        result = buildAmqp1Dot0Value(valueFixture);
      });

      it('should keep the descriptor and the value', () => {
        const expected: Amqp1Dot0Value = {
          descriptor: 'apache.org:selector-filter:string',
          kind: 'described',
          value: "color = 'red'",
        };

        expect(result).toStrictEqual(expected);
      });
    });
  });

  describe('having a described map', () => {
    let valueFixture: TypedFixture;

    beforeAll(() => {
      const map: TypedFixture = typed([typed('tenant'), typed('acme')], 0xd1);
      map.descriptor = typed('example:tenant:map');
      valueFixture = map;
    });

    describe('when called', () => {
      let result: unknown;

      beforeAll(() => {
        result = buildAmqp1Dot0Value(valueFixture);
      });

      it('should keep the descriptor and the map entries', () => {
        const expected: Amqp1Dot0Value = {
          descriptor: 'example:tenant:map',
          kind: 'described',
          value: { entries: [['tenant', 'acme']], kind: 'map' },
        };

        expect(result).toStrictEqual(expected);
      });
    });
  });

  describe('having an array whose elements are described', () => {
    let valueFixture: TypedFixture;

    beforeAll(() => {
      valueFixture = typed([typed('red')], 0xf0);
      valueFixture.array_constructor = {
        descriptor: typed('example:color:string'),
        typecode: 0xa1,
      };
    });

    describe('when called', () => {
      let result: unknown;

      beforeAll(() => {
        result = buildAmqp1Dot0Value(valueFixture);
      });

      it('should keep one element type and one descriptor', () => {
        const expected: Amqp1Dot0Value = {
          elementDescriptor: 'example:color:string',
          elementType: 'string',
          items: ['red'],
          kind: 'array',
        };

        expect(result).toStrictEqual(expected);
      });
    });
  });

  describe('having an array of arrays', () => {
    let valueFixture: TypedFixture;

    beforeAll(() => {
      const inner: TypedFixture = typed(['red'], 0xf0);

      inner.array_constructor = { typecode: 0xa1 };
      inner.type = { typecode: 0xf0 };
      valueFixture = typed([inner], 0xf0);
      valueFixture.array_constructor = { typecode: 0xf0 };
      valueFixture.type = { typecode: 0xf0 };
    });

    describe('when called', () => {
      let result: unknown;

      beforeAll(() => {
        result = buildAmqp1Dot0Value(valueFixture);
      });

      it('should return a list of the inner array', () => {
        const expected: Amqp1Dot0Value = {
          items: [
            {
              elementType: 'string',
              items: ['red'],
              kind: 'array',
            },
          ],
          kind: 'list',
        };

        expect(result).toStrictEqual(expected);
      });
    });
  });

  describe('having an array of arrays with a descriptor', () => {
    let valueFixture: TypedFixture;

    beforeAll(() => {
      const inner: TypedFixture = typed(['red'], 0xf0);

      inner.array_constructor = { typecode: 0xa1 };
      inner.type = { typecode: 0xf0 };
      valueFixture = typed([inner], 0xf0);
      valueFixture.array_constructor = {
        descriptor: typed('example:color:array'),
        typecode: 0xf0,
      };
      valueFixture.type = { typecode: 0xf0 };
    });

    describe('when called', () => {
      let result: unknown;

      beforeAll(() => {
        result = buildAmqp1Dot0Value(valueFixture);
      });

      it('should wrap each list item with the constructor descriptor', () => {
        const expected: Amqp1Dot0Value = {
          items: [
            {
              descriptor: 'example:color:array',
              kind: 'described',
              value: {
                elementType: 'string',
                items: ['red'],
                kind: 'array',
              },
            },
          ],
          kind: 'list',
        };

        expect(result).toStrictEqual(expected);
      });
    });
  });

  describe('having a known composite', () => {
    class SelectorComposite {
      public static readonly descriptor: { readonly symbolic: string } = {
        symbolic: 'apache.org:selector-filter:string',
      };

      constructor(public readonly value: readonly unknown[]) {}
    }

    let valueFixture: SelectorComposite;

    beforeAll(() => {
      const described: TypedFixture = typed("color = 'red'");
      described.descriptor = typed('example:color:string');

      Object.defineProperty(SelectorComposite.prototype, 'expression', {
        enumerable: true,
        get(): string {
          return 'unwrapped';
        },
      });

      valueFixture = new SelectorComposite([described]);
    });

    describe('when called', () => {
      let result: unknown;

      beforeAll(() => {
        result = buildAmqp1Dot0Value(valueFixture);
      });

      it('should keep the symbolic descriptor and the raw fields', () => {
        const expected: Amqp1Dot0Value = {
          descriptor: 'apache.org:selector-filter:string',
          kind: 'described',
          value: {
            items: [
              {
                descriptor: 'example:color:string',
                kind: 'described',
                value: "color = 'red'",
              },
            ],
            kind: 'list',
          },
        };

        expect(result).toStrictEqual(expected);
      });
    });
  });

  describe('having a list typed value', () => {
    let valueFixture: TypedFixture;

    beforeAll(() => {
      valueFixture = typed(['order-1'], 0xd0);
    });

    describe('when called', () => {
      let result: unknown;

      beforeAll(() => {
        result = buildAmqp1Dot0Value(valueFixture);
      });

      it('should return the list', () => {
        expect(result).toStrictEqual({ items: ['order-1'], kind: 'list' });
      });
    });
  });

  describe('having a map with a described key', () => {
    let valueFixture: TypedFixture;

    beforeAll(() => {
      const key: TypedFixture = typed('name');
      key.descriptor = typed('example:key:string');
      valueFixture = typed([key, typed(1)], 0xd1);
    });

    describe('when called', () => {
      let result: unknown;

      beforeAll(() => {
        result = buildAmqp1Dot0Value(valueFixture);
      });

      it('should keep the described key', () => {
        expect(result).toStrictEqual({
          entries: [
            [
              {
                descriptor: 'example:key:string',
                kind: 'described',
                value: 'name',
              },
              1,
            ],
          ],
          kind: 'map',
        });
      });
    });
  });

  describe('having a bigint', () => {
    describe('when called', () => {
      let result: unknown;

      beforeAll(() => {
        try {
          buildAmqp1Dot0Value(1n);
        } catch (error: unknown) {
          result = error;
        }
      });

      it('should throw an Error', () => {
        expect(result).toStrictEqual(
          new Error('Unsupported AMQP 1.0 value of type "bigint"'),
        );
      });
    });
  });
});
