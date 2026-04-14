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
      'an OpenApi object and a pointer to a true schema',
      [
        {
          deepResolveReference: (): JsonValue => true,
          resolveReference: (): undefined => undefined,
        },
        '#/components/schemas/Any',
      ],
      new Set(['array', 'boolean', 'null', 'number', 'object', 'string']),
    ],
    [
      'an OpenApi object and a pointer to a false schema',
      [
        {
          deepResolveReference: (): JsonValue => false,
          resolveReference: (): undefined => undefined,
        },
        '#/components/schemas/None',
      ],
      new Set(),
    ],
    [
      'an OpenApi object and a pointer to a schema with a single type',
      [
        {
          deepResolveReference: (): JsonValue => ({ type: 'string' }),
          resolveReference: (): undefined => undefined,
        },
        '#/components/schemas/MyString',
      ],
      new Set(['string']),
    ],
    [
      'an OpenApi object and a pointer to a schema with multiple types',
      [
        {
          deepResolveReference: (): JsonValue => ({
            type: ['string', 'number'],
          }),
          resolveReference: (): undefined => undefined,
        },
        '#/components/schemas/StringOrNumber',
      ],
      new Set(['string', 'number']),
    ],
    [
      'an OpenApi object and a pointer to a $ref schema',
      [
        {
          deepResolveReference: vitest
            .fn<(reference: string) => JsonValue | undefined>()
            .mockReturnValueOnce({ $ref: '#/components/schemas/Target' })
            .mockReturnValueOnce({ type: 'object' }),
          resolveReference: (): undefined => undefined,
        },
        '#/components/schemas/Ref',
      ],
      new Set(['object']),
    ],
    [
      'an OpenApi object and a pointer to an allOf schema with overlapping types',
      [
        {
          deepResolveReference: (): JsonValue => ({
            allOf: [
              { type: ['string', 'number'] },
              { type: ['number', 'boolean'] },
            ],
          }),
          resolveReference: (): undefined => undefined,
        },
        '#/components/schemas/Combined',
      ],
      new Set(['number']),
    ],
    [
      'an OpenApi object and a pointer to an allOf schema with no overlapping types',
      [
        {
          deepResolveReference: (): JsonValue => ({
            allOf: [{ type: 'string' }, { type: 'number' }],
          }),
          resolveReference: (): undefined => undefined,
        },
        '#/components/schemas/Empty',
      ],
      new Set(),
    ],
    [
      'an OpenApi object and a pointer to an allOf schema with a type constraint',
      [
        {
          deepResolveReference: (): JsonValue => ({
            allOf: [
              { type: ['string', 'number'] },
              { type: ['string', 'boolean'] },
            ],
            type: 'string',
          }),
          resolveReference: (): undefined => undefined,
        },
        '#/components/schemas/Constrained',
      ],
      new Set(['string']),
    ],
    [
      'an OpenApi object and a pointer to an allOf schema with $ref entries',
      [
        {
          deepResolveReference: vitest
            .fn<(reference: string) => JsonValue | undefined>()
            .mockReturnValueOnce({
              allOf: [
                { $ref: '#/components/schemas/Base' },
                { type: ['string', 'number'] },
              ],
            })
            .mockReturnValueOnce({
              type: ['string', 'number', 'boolean'],
            }),
          resolveReference: (): undefined => undefined,
        },
        '#/components/schemas/Combined',
      ],
      new Set(['string', 'number']),
    ],
    [
      'an OpenApi object and a pointer to an anyOf schema',
      [
        {
          deepResolveReference: (): JsonValue => ({
            anyOf: [{ type: 'string' }, { type: 'number' }],
          }),
          resolveReference: (): undefined => undefined,
        },
        '#/components/schemas/Union',
      ],
      new Set(['string', 'number']),
    ],
    [
      'an OpenApi object and a pointer to an anyOf schema with a type constraint',
      [
        {
          deepResolveReference: (): JsonValue => ({
            anyOf: [
              { type: ['string', 'number'] },
              { type: ['boolean', 'string'] },
            ],
            type: 'string',
          }),
          resolveReference: (): undefined => undefined,
        },
        '#/components/schemas/Constrained',
      ],
      new Set(['string']),
    ],
    [
      'an OpenApi object and a pointer to an empty schema (no type, no composition)',
      [
        {
          deepResolveReference: (): JsonValue => ({}),
          resolveReference: (): undefined => undefined,
        },
        '#/components/schemas/Empty',
      ],
      new Set(['array', 'boolean', 'null', 'number', 'object', 'string']),
    ],
    [
      'an OpenApi object and a pointer to an allOf schema with a boolean true child',
      [
        {
          deepResolveReference: (): JsonValue => ({
            allOf: [true, { type: 'string' }],
          }),
          resolveReference: (): undefined => undefined,
        },
        '#/components/schemas/Combined',
      ],
      new Set(['string']),
    ],
    [
      'an OpenApi object and a pointer to an allOf schema with a boolean false child',
      [
        {
          deepResolveReference: (): JsonValue => ({
            allOf: [false, { type: 'string' }],
          }),
          resolveReference: (): undefined => undefined,
        },
        '#/components/schemas/Combined',
      ],
      new Set(),
    ],
    [
      'an OpenApi object and a pointer to a schema with integer type',
      [
        {
          deepResolveReference: (): JsonValue => ({ type: 'integer' }),
          resolveReference: (): undefined => undefined,
        },
        '#/components/schemas/MyInteger',
      ],
      new Set(['integer']),
    ],
    [
      'an OpenApi object and a pointer to an allOf schema with number and integer',
      [
        {
          deepResolveReference: (): JsonValue => ({
            allOf: [{ type: 'number' }, { type: 'integer' }],
          }),
          resolveReference: (): undefined => undefined,
        },
        '#/components/schemas/Combined',
      ],
      new Set(['integer']),
    ],
    [
      'an OpenApi object and a pointer to an allOf schema with integer and constraint-only',
      [
        {
          deepResolveReference: (): JsonValue => ({
            allOf: [{ type: 'integer' }, { minimum: 1 }],
          }),
          resolveReference: (): undefined => undefined,
        },
        '#/components/schemas/Combined',
      ],
      new Set(['integer']),
    ],
    [
      'an OpenApi object and a pointer to an anyOf schema with number and integer',
      [
        {
          deepResolveReference: (): JsonValue => ({
            anyOf: [{ type: 'number' }, { type: 'integer' }],
          }),
          resolveReference: (): undefined => undefined,
        },
        '#/components/schemas/Union',
      ],
      new Set(['number']),
    ],
    [
      'an OpenApi object and a pointer to a schema with type ["number", "integer"]',
      [
        {
          deepResolveReference: (): JsonValue => ({
            type: ['number', 'integer'],
          }),
          resolveReference: (): undefined => undefined,
        },
        '#/components/schemas/NumberOrInteger',
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
      'an OpenApi object and a pointer to a schema with $dynamicRef',
      [
        {
          deepResolveReference: (): JsonValue => ({
            $dynamicRef: '#meta',
          }),
          resolveReference: (): undefined => undefined,
        },
        '#/components/schemas/Dynamic',
      ],
    ],
    [
      'an OpenApi object and a pointer to a schema with oneOf',
      [
        {
          deepResolveReference: (): JsonValue => ({
            oneOf: [{ type: 'string' }, { type: 'number' }],
          }),
          resolveReference: (): undefined => undefined,
        },
        '#/components/schemas/OneOf',
      ],
    ],
    [
      'an OpenApi object and a pointer to a schema with not',
      [
        {
          deepResolveReference: (): JsonValue => ({
            not: { type: 'string' },
          }),
          resolveReference: (): undefined => undefined,
        },
        '#/components/schemas/Not',
      ],
    ],
    [
      'an OpenApi object and a pointer to a non-existent schema',
      [
        {
          deepResolveReference: (): undefined => undefined,
          resolveReference: (): undefined => undefined,
        },
        '#/components/schemas/NonExistent',
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
