import { afterAll, beforeAll, describe, expect, it, vitest } from 'vitest';

vitest.mock(import('./buildNonArrayHeaderParse.js'));
vitest.mock(import('./inferSchemaTypeOrThrow.js'));

import { type JsonSchemaType } from '@inversifyjs/json-schema-types/2020-12';

import { type OpenApiResolver } from '../services/OpenApiResolver.js';
import { buildHeaderParse } from './buildHeaderParse.js';
import { buildNonArrayHeaderParse } from './buildNonArrayHeaderParse.js';
import { inferSchemaTypeOrThrow } from './inferSchemaTypeOrThrow.js';

describe(buildHeaderParse, () => {
  afterAll(() => {
    vitest.restoreAllMocks();
  });

  describe('having a non-array schema type', () => {
    let openApiResolverFixture: OpenApiResolver;
    let parseMockFixture: (value: string | string[] | undefined) => unknown;

    beforeAll(() => {
      openApiResolverFixture = {
        deepResolveReference: vitest.fn(),
        resolveReference: vitest.fn(),
      };

      parseMockFixture = vitest.fn();
    });

    describe('when called', () => {
      let result: unknown;

      beforeAll(() => {
        vitest.mocked(inferSchemaTypeOrThrow).mockReturnValueOnce({
          isNullable: false,
          type: 'string' as JsonSchemaType,
        });

        vitest
          .mocked(buildNonArrayHeaderParse)
          .mockReturnValueOnce(parseMockFixture);

        result = buildHeaderParse(
          openApiResolverFixture,
          { type: 'string' },
          '#/test/schema',
        );
      });

      afterAll(() => {
        vitest.clearAllMocks();
      });

      it('should call inferSchemaTypeOrThrow', () => {
        expect(inferSchemaTypeOrThrow).toHaveBeenCalledExactlyOnceWith(
          openApiResolverFixture,
          { type: 'string' },
          '#/test/schema',
        );
      });

      it('should call buildNonArrayHeaderParse', () => {
        expect(buildNonArrayHeaderParse).toHaveBeenCalledExactlyOnceWith(
          false,
          '#/test/schema',
          'string',
        );
      });

      it('should return the expected parse function', () => {
        expect(result).toBe(parseMockFixture);
      });
    });
  });

  describe('having an array schema type', () => {
    let openApiResolverFixture: OpenApiResolver;
    let parseMockFixture: (value: string | string[] | undefined) => unknown;

    beforeAll(() => {
      openApiResolverFixture = {
        deepResolveReference: vitest
          .fn()
          .mockReturnValueOnce({ type: 'integer' }),
        resolveReference: vitest.fn(),
      };

      parseMockFixture = vitest.fn();
    });

    describe('when called', () => {
      let result: unknown;

      beforeAll(() => {
        vitest
          .mocked(inferSchemaTypeOrThrow)
          .mockReturnValueOnce({
            isNullable: false,
            type: 'array' as JsonSchemaType,
          })
          .mockReturnValueOnce({
            isNullable: true,
            type: 'integer' as JsonSchemaType,
          });

        vitest
          .mocked(buildNonArrayHeaderParse)
          .mockReturnValueOnce(parseMockFixture);

        result = buildHeaderParse(
          openApiResolverFixture,
          { items: { type: 'integer' }, type: 'array' },
          '#/test/schema',
        );
      });

      afterAll(() => {
        vitest.clearAllMocks();
      });

      it('should call inferSchemaTypeOrThrow twice', () => {
        expect(inferSchemaTypeOrThrow).toHaveBeenCalledTimes(2);
      });

      it('should call buildNonArrayHeaderParse with items type', () => {
        expect(buildNonArrayHeaderParse).toHaveBeenCalledExactlyOnceWith(
          true,
          '#/test/schema/items',
          'integer',
        );
      });

      it('should return the expected parse function', () => {
        expect(result).toBe(parseMockFixture);
      });
    });
  });
});
