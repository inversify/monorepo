import { afterAll, beforeAll, describe, expect, it, vitest } from 'vitest';

vitest.mock(import('./buildNonArrayParamParse.js'));
vitest.mock(import('./inferSchemaTypeOrThrow.js'));

import { type OpenApiResolver } from '../services/OpenApiResolver.js';
import { buildNonArrayParamParse } from './buildNonArrayParamParse.js';
import { buildParamParse } from './buildParamParse.js';
import { inferSchemaTypeOrThrow } from './inferSchemaTypeOrThrow.js';

describe(buildParamParse, () => {
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
          type: 'string',
        });

        vitest
          .mocked(buildNonArrayParamParse)
          .mockReturnValueOnce(parseMockFixture);

        result = buildParamParse(
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

      it('should call buildNonArrayParamParse', () => {
        expect(buildNonArrayParamParse).toHaveBeenCalledExactlyOnceWith(
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
            type: 'array',
          })
          .mockReturnValueOnce({
            isNullable: true,
            type: 'integer',
          });

        vitest
          .mocked(buildNonArrayParamParse)
          .mockReturnValueOnce(parseMockFixture);

        result = buildParamParse(
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

      it('should call buildNonArrayParamParse with items type', () => {
        expect(buildNonArrayParamParse).toHaveBeenCalledExactlyOnceWith(
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
