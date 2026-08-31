import { beforeAll, describe, expect, it, vitest } from 'vitest';

import { type JsonValue } from '@inversifyjs/json-schema-types';

import { type JsonSchemaResolutionResult } from '../services/OpenApiResolver.js';
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
          resolveJsonSchema: vitest
            .fn<(schema: JsonValue) => JsonSchemaResolutionResult>()
            .mockReturnValueOnce({
              isRight: false,
              value: {
                reason: 'Failed to resolve resource',
                resolutionContextStack: [],
              },
            }),
          resolveOpenApiReference: vitest.fn(),
        },
        { $ref: '#/components/schemas/NonExistent' },
      ],
      new Set(),
    ],
    [
      'a true schema',
      [
        {
          resolveJsonSchema: vitest.fn(),
          resolveOpenApiReference: vitest.fn(),
        },
        true,
      ],
      new Set(['array', 'boolean', 'null', 'number', 'object', 'string']),
    ],
    [
      'a false schema',
      [
        {
          resolveJsonSchema: vitest.fn(),
          resolveOpenApiReference: vitest.fn(),
        },
        false,
      ],
      new Set(),
    ],
    [
      'a schema with a single type',
      [
        {
          resolveJsonSchema: vitest.fn(),
          resolveOpenApiReference: vitest.fn(),
        },
        { type: 'string' },
      ],
      new Set(['string']),
    ],
    [
      'a schema with multiple types',
      [
        {
          resolveJsonSchema: vitest.fn(),
          resolveOpenApiReference: vitest.fn(),
        },
        { type: ['string', 'number'] },
      ],
      new Set(['string', 'number']),
    ],
    [
      'a $ref schema',
      [
        {
          resolveJsonSchema: vitest
            .fn<(schema: JsonValue) => JsonSchemaResolutionResult>()
            .mockReturnValueOnce({
              isRight: true,
              value: {
                $dynamicRef: undefined,
                $ref: {
                  $dynamicRef: undefined,
                  $ref: undefined,
                  dynamicScopeEntries: [],
                  value: { type: 'object' },
                },
                dynamicScopeEntries: [],
              },
            }),
          resolveOpenApiReference: vitest.fn(),
        },
        { $ref: '#/components/schemas/Target' },
      ],
      new Set(['object']),
    ],
    [
      'a $ref schema with a local type constraint',
      [
        {
          resolveJsonSchema: vitest
            .fn<(schema: JsonValue) => JsonSchemaResolutionResult>()
            .mockReturnValueOnce({
              isRight: true,
              value: {
                $dynamicRef: undefined,
                $ref: {
                  $dynamicRef: undefined,
                  $ref: undefined,
                  dynamicScopeEntries: [],
                  value: { type: ['string', 'number'] },
                },
                dynamicScopeEntries: [],
              },
            }),
          resolveOpenApiReference: vitest.fn(),
        },
        { $ref: '#/components/schemas/Target', type: 'string' },
      ],
      new Set(['string']),
    ],
    [
      'a $ref schema resolving to a chain of further $ref schemas',
      [
        {
          resolveJsonSchema: vitest
            .fn<(schema: JsonValue) => JsonSchemaResolutionResult>()
            .mockReturnValueOnce({
              isRight: true,
              value: {
                $dynamicRef: undefined,
                $ref: {
                  $dynamicRef: undefined,
                  $ref: {
                    $dynamicRef: undefined,
                    $ref: undefined,
                    dynamicScopeEntries: [],
                    value: { type: 'string' },
                  },
                  dynamicScopeEntries: [],
                  value: {
                    $ref: '#/components/schemas/Base',
                    type: ['string', 'number'],
                  },
                },
                dynamicScopeEntries: [],
              },
            }),
          resolveOpenApiReference: vitest.fn(),
        },
        { $ref: '#/components/schemas/Target' },
      ],
      new Set(['string']),
    ],
    [
      'a $dynamicRef schema',
      [
        {
          resolveJsonSchema: vitest
            .fn<(schema: JsonValue) => JsonSchemaResolutionResult>()
            .mockReturnValueOnce({
              isRight: true,
              value: {
                $dynamicRef: {
                  $dynamicRef: undefined,
                  $ref: undefined,
                  dynamicScopeEntries: [],
                  value: { type: 'string' },
                },
                $ref: undefined,
                dynamicScopeEntries: [],
              },
            }),
          resolveOpenApiReference: vitest.fn(),
        },
        { $dynamicRef: '#meta' },
      ],
      new Set(['string']),
    ],
    [
      'a schema with both $ref and $dynamicRef',
      [
        {
          resolveJsonSchema: vitest
            .fn<(schema: JsonValue) => JsonSchemaResolutionResult>()
            .mockReturnValueOnce({
              isRight: true,
              value: {
                $dynamicRef: {
                  $dynamicRef: undefined,
                  $ref: undefined,
                  dynamicScopeEntries: [],
                  value: { type: ['string', 'number'] },
                },
                $ref: {
                  $dynamicRef: undefined,
                  $ref: undefined,
                  dynamicScopeEntries: [],
                  value: { type: ['string', 'boolean'] },
                },
                dynamicScopeEntries: [],
              },
            }),
          resolveOpenApiReference: vitest.fn(),
        },
        { $dynamicRef: '#meta', $ref: '#/components/schemas/Target' },
      ],
      new Set(['string']),
    ],
    [
      'an allOf schema with overlapping types',
      [
        {
          resolveJsonSchema: vitest.fn(),
          resolveOpenApiReference: vitest.fn(),
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
          resolveJsonSchema: vitest.fn(),
          resolveOpenApiReference: vitest.fn(),
        },
        { allOf: [{ type: 'string' }, { type: 'number' }] },
      ],
      new Set(),
    ],
    [
      'an allOf schema with a type constraint',
      [
        {
          resolveJsonSchema: vitest.fn(),
          resolveOpenApiReference: vitest.fn(),
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
          resolveJsonSchema: vitest
            .fn<(schema: JsonValue) => JsonSchemaResolutionResult>()
            .mockReturnValueOnce({
              isRight: true,
              value: {
                $dynamicRef: undefined,
                $ref: {
                  $dynamicRef: undefined,
                  $ref: undefined,
                  dynamicScopeEntries: [],
                  value: { type: ['string', 'number', 'boolean'] },
                },
                dynamicScopeEntries: [],
              },
            }),
          resolveOpenApiReference: vitest.fn(),
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
          resolveJsonSchema: vitest.fn(),
          resolveOpenApiReference: vitest.fn(),
        },
        { anyOf: [{ type: 'string' }, { type: 'number' }] },
      ],
      new Set(['string', 'number']),
    ],
    [
      'an anyOf schema with a type constraint',
      [
        {
          resolveJsonSchema: vitest.fn(),
          resolveOpenApiReference: vitest.fn(),
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
          resolveJsonSchema: vitest.fn(),
          resolveOpenApiReference: vitest.fn(),
        },
        {},
      ],
      new Set(['array', 'boolean', 'null', 'number', 'object', 'string']),
    ],
    [
      'an allOf schema with a boolean true child',
      [
        {
          resolveJsonSchema: vitest.fn(),
          resolveOpenApiReference: vitest.fn(),
        },
        { allOf: [true, { type: 'string' }] },
      ],
      new Set(['string']),
    ],
    [
      'an allOf schema with a boolean false child',
      [
        {
          resolveJsonSchema: vitest.fn(),
          resolveOpenApiReference: vitest.fn(),
        },
        { allOf: [false, { type: 'string' }] },
      ],
      new Set(),
    ],
    [
      'a schema with integer type',
      [
        {
          resolveJsonSchema: vitest.fn(),
          resolveOpenApiReference: vitest.fn(),
        },
        { type: 'integer' },
      ],
      new Set(['integer']),
    ],
    [
      'an allOf schema with number and integer',
      [
        {
          resolveJsonSchema: vitest.fn(),
          resolveOpenApiReference: vitest.fn(),
        },
        { allOf: [{ type: 'number' }, { type: 'integer' }] },
      ],
      new Set(['integer']),
    ],
    [
      'an allOf schema with integer and constraint-only',
      [
        {
          resolveJsonSchema: vitest.fn(),
          resolveOpenApiReference: vitest.fn(),
        },
        { allOf: [{ type: 'integer' }, { minimum: 1 }] },
      ],
      new Set(['integer']),
    ],
    [
      'an anyOf schema with number and integer',
      [
        {
          resolveJsonSchema: vitest.fn(),
          resolveOpenApiReference: vitest.fn(),
        },
        { anyOf: [{ type: 'number' }, { type: 'integer' }] },
      ],
      new Set(['number']),
    ],
    [
      'a schema with type ["number", "integer"]',
      [
        {
          resolveJsonSchema: vitest.fn(),
          resolveOpenApiReference: vitest.fn(),
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
      'a schema with oneOf',
      [
        {
          resolveJsonSchema: vitest.fn(),
          resolveOpenApiReference: vitest.fn(),
        },
        { oneOf: [{ type: 'string' }, { type: 'number' }] },
      ],
    ],
    [
      'a schema with not',
      [
        {
          resolveJsonSchema: vitest.fn(),
          resolveOpenApiReference: vitest.fn(),
        },
        { not: { type: 'string' } },
      ],
    ],
    [
      'a $ref schema whose resolution chain cycles back to itself',
      (() => {
        const cyclicSchema: JsonValue = { $ref: '#/Self' };

        return [
          {
            resolveJsonSchema: vitest
              .fn<(schema: JsonValue) => JsonSchemaResolutionResult>()
              .mockReturnValueOnce({
                isRight: true,
                value: {
                  $dynamicRef: undefined,
                  $ref: {
                    $dynamicRef: undefined,
                    $ref: undefined,
                    dynamicScopeEntries: [],
                    value: cyclicSchema,
                  },
                  dynamicScopeEntries: [],
                },
              }),
            resolveOpenApiReference: vitest.fn(),
          },
          cyclicSchema,
        ] as Parameters<typeof inferOpenApiSchemaTypes>;
      })(),
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
