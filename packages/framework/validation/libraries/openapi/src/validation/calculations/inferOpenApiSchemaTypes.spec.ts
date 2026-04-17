import { beforeAll, describe, expect, it, vitest } from 'vitest';

import { type JsonValue } from '@inversifyjs/json-schema-types';

import { inferOpenApiSchemaTypes } from './inferOpenApiSchemaTypes.js';

describe(inferOpenApiSchemaTypes, () => {
  describe.each<
    [
      string,
      Parameters<typeof inferOpenApiSchemaTypes>,
      ReturnType<typeof inferOpenApiSchemaTypes>,
    ]
  >([
    [
      'a $ref schema pointing to a non-existent schema',
      [
        {
          deepResolveReference: (): undefined => undefined,
          resolveReference: (): undefined => undefined,
        },
        { $ref: '#/components/schemas/NonExistent' },
      ],
      new Set(),
    ],
    [
      'a true schema',
      [
        {
          deepResolveReference: (): undefined => undefined,
          resolveReference: (): undefined => undefined,
        },
        true,
      ],
      new Set(['array', 'boolean', 'null', 'number', 'object', 'string']),
    ],
    [
      'a false schema',
      [
        {
          deepResolveReference: (): undefined => undefined,
          resolveReference: (): undefined => undefined,
        },
        false,
      ],
      new Set(),
    ],
    [
      'a schema with a single type',
      [
        {
          deepResolveReference: (): undefined => undefined,
          resolveReference: (): undefined => undefined,
        },
        { type: 'string' },
      ],
      new Set(['string']),
    ],
    [
      'a schema with multiple types',
      [
        {
          deepResolveReference: (): undefined => undefined,
          resolveReference: (): undefined => undefined,
        },
        { type: ['string', 'number'] },
      ],
      new Set(['string', 'number']),
    ],
    [
      'a $ref schema',
      [
        {
          deepResolveReference: vitest
            .fn<(reference: string) => JsonValue | undefined>()
            .mockReturnValueOnce({ type: 'object' }),
          resolveReference: (): undefined => undefined,
        },
        { $ref: '#/components/schemas/Target' },
      ],
      new Set(['object']),
    ],
    [
      'an allOf schema with overlapping types',
      [
        {
          deepResolveReference: (): undefined => undefined,
          resolveReference: (): undefined => undefined,
        },
        {
          allOf: [
            { type: ['string', 'number'] },
            { type: ['number', 'boolean'] },
          ],
        },
      ],
      new Set(['number']),
    ],
    [
      'an allOf schema with no overlapping types',
      [
        {
          deepResolveReference: (): undefined => undefined,
          resolveReference: (): undefined => undefined,
        },
        { allOf: [{ type: 'string' }, { type: 'number' }] },
      ],
      new Set(),
    ],
    [
      'an allOf schema with a type constraint',
      [
        {
          deepResolveReference: (): undefined => undefined,
          resolveReference: (): undefined => undefined,
        },
        {
          allOf: [
            { type: ['string', 'number'] },
            { type: ['string', 'boolean'] },
          ],
          type: 'string',
        },
      ],
      new Set(['string']),
    ],
    [
      'an allOf schema with $ref entries',
      [
        {
          deepResolveReference: vitest
            .fn<(reference: string) => JsonValue | undefined>()
            .mockReturnValueOnce({
              type: ['string', 'number', 'boolean'],
            }),
          resolveReference: (): undefined => undefined,
        },
        {
          allOf: [
            { $ref: '#/components/schemas/Base' },
            { type: ['string', 'number'] },
          ],
        },
      ],
      new Set(['string', 'number']),
    ],
    [
      'an anyOf schema',
      [
        {
          deepResolveReference: (): undefined => undefined,
          resolveReference: (): undefined => undefined,
        },
        { anyOf: [{ type: 'string' }, { type: 'number' }] },
      ],
      new Set(['string', 'number']),
    ],
    [
      'an anyOf schema with a type constraint',
      [
        {
          deepResolveReference: (): undefined => undefined,
          resolveReference: (): undefined => undefined,
        },
        {
          anyOf: [
            { type: ['string', 'number'] },
            { type: ['boolean', 'string'] },
          ],
          type: 'string',
        },
      ],
      new Set(['string']),
    ],
    [
      'an empty schema (no type, no composition)',
      [
        {
          deepResolveReference: (): undefined => undefined,
          resolveReference: (): undefined => undefined,
        },
        {},
      ],
      new Set(['array', 'boolean', 'null', 'number', 'object', 'string']),
    ],
    [
      'an allOf schema with a boolean true child',
      [
        {
          deepResolveReference: (): undefined => undefined,
          resolveReference: (): undefined => undefined,
        },
        { allOf: [true, { type: 'string' }] },
      ],
      new Set(['string']),
    ],
    [
      'an allOf schema with a boolean false child',
      [
        {
          deepResolveReference: (): undefined => undefined,
          resolveReference: (): undefined => undefined,
        },
        { allOf: [false, { type: 'string' }] },
      ],
      new Set(),
    ],
    [
      'a schema with integer type',
      [
        {
          deepResolveReference: (): undefined => undefined,
          resolveReference: (): undefined => undefined,
        },
        { type: 'integer' },
      ],
      new Set(['integer']),
    ],
    [
      'an allOf schema with number and integer',
      [
        {
          deepResolveReference: (): undefined => undefined,
          resolveReference: (): undefined => undefined,
        },
        { allOf: [{ type: 'number' }, { type: 'integer' }] },
      ],
      new Set(['integer']),
    ],
    [
      'an allOf schema with integer and constraint-only',
      [
        {
          deepResolveReference: (): undefined => undefined,
          resolveReference: (): undefined => undefined,
        },
        { allOf: [{ type: 'integer' }, { minimum: 1 }] },
      ],
      new Set(['integer']),
    ],
    [
      'an anyOf schema with number and integer',
      [
        {
          deepResolveReference: (): undefined => undefined,
          resolveReference: (): undefined => undefined,
        },
        { anyOf: [{ type: 'number' }, { type: 'integer' }] },
      ],
      new Set(['number']),
    ],
    [
      'a schema with type ["number", "integer"]',
      [
        {
          deepResolveReference: (): undefined => undefined,
          resolveReference: (): undefined => undefined,
        },
        { type: ['number', 'integer'] },
      ],
      new Set(['number']),
    ],
  ])(
    'having %s',
    (
      _: string,
      parameters: Parameters<typeof inferOpenApiSchemaTypes>,
      expected: ReturnType<typeof inferOpenApiSchemaTypes>,
    ) => {
      describe('when called', () => {
        let result: unknown;

        beforeAll(() => {
          result = inferOpenApiSchemaTypes(...parameters);
        });

        it('should return the expected result', () => {
          expect(result).toStrictEqual(expected);
        });
      });
    },
  );

  describe.each<[string, Parameters<typeof inferOpenApiSchemaTypes>]>([
    [
      'a schema with $dynamicRef',
      [
        {
          deepResolveReference: (): undefined => undefined,
          resolveReference: (): undefined => undefined,
        },
        { $dynamicRef: '#meta' },
      ],
    ],
    [
      'a schema with oneOf',
      [
        {
          deepResolveReference: (): undefined => undefined,
          resolveReference: (): undefined => undefined,
        },
        { oneOf: [{ type: 'string' }, { type: 'number' }] },
      ],
    ],
    [
      'a schema with not',
      [
        {
          deepResolveReference: (): undefined => undefined,
          resolveReference: (): undefined => undefined,
        },
        { not: { type: 'string' } },
      ],
    ],
  ])(
    'having %s',
    (_: string, parameters: Parameters<typeof inferOpenApiSchemaTypes>) => {
      describe('when called', () => {
        let result: unknown;

        beforeAll(() => {
          try {
            inferOpenApiSchemaTypes(...parameters);
          } catch (error: unknown) {
            result = error;
          }
        });

        it('should throw an error', () => {
          expect(result).toBeInstanceOf(Error);
        });
      });
    },
  );
});
