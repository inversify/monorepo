import { afterAll, beforeAll, describe, expect, it, vitest } from 'vitest';

vitest.mock(import('./inferOpenApiSchemaTypes.js'));

import { type JsonSchemaType } from '@inversifyjs/json-schema-types/2020-12';
import { InversifyValidationError } from '@inversifyjs/validation-common';

import { type OpenApiResolver } from '../services/OpenApiResolver.js';
import { inferOpenApiSchemaTypes } from './inferOpenApiSchemaTypes.js';
import { inferSchemaTypeOrThrow } from './inferSchemaTypeOrThrow.js';

describe(inferSchemaTypeOrThrow, () => {
  let openApiResolverFixture: OpenApiResolver;

  beforeAll(() => {
    openApiResolverFixture = {
      deepResolveReference: vitest.fn(),
      resolveReference: vitest.fn(),
    };
  });

  afterAll(() => {
    vitest.restoreAllMocks();
  });

  describe('having an undefined schema', () => {
    describe('when called', () => {
      let result: unknown;

      beforeAll(() => {
        try {
          inferSchemaTypeOrThrow(
            openApiResolverFixture,
            undefined,
            '#/test/schema',
          );
        } catch (error: unknown) {
          result = error;
        }
      });

      afterAll(() => {
        vitest.clearAllMocks();
      });

      it('should throw an InversifyValidationError', () => {
        expect(result).toBeInstanceOf(InversifyValidationError);
      });
    });
  });

  describe('having a schema that resolves to exactly one type', () => {
    describe('when called', () => {
      let result: unknown;

      beforeAll(() => {
        vitest
          .mocked(inferOpenApiSchemaTypes)
          .mockReturnValueOnce(new Set<JsonSchemaType>(['string']));

        result = inferSchemaTypeOrThrow(
          openApiResolverFixture,
          { type: 'string' },
          '#/test/schema',
        );
      });

      afterAll(() => {
        vitest.clearAllMocks();
      });

      it('should return the expected result', () => {
        expect(result).toStrictEqual({
          isNullable: false,
          type: 'string',
        });
      });
    });
  });

  describe('having a schema that resolves to a type and null', () => {
    describe('when called', () => {
      let result: unknown;

      beforeAll(() => {
        vitest
          .mocked(inferOpenApiSchemaTypes)
          .mockReturnValueOnce(new Set<JsonSchemaType>(['string', 'null']));

        result = inferSchemaTypeOrThrow(
          openApiResolverFixture,
          { type: ['string', 'null'] },
          '#/test/schema',
        );
      });

      afterAll(() => {
        vitest.clearAllMocks();
      });

      it('should return the expected result', () => {
        expect(result).toStrictEqual({
          isNullable: true,
          type: 'string',
        });
      });
    });
  });

  describe('having a schema that resolves to zero types', () => {
    describe('when called', () => {
      let result: unknown;

      beforeAll(() => {
        vitest
          .mocked(inferOpenApiSchemaTypes)
          .mockReturnValueOnce(new Set<JsonSchemaType>());

        try {
          inferSchemaTypeOrThrow(
            openApiResolverFixture,
            { allOf: [{ type: 'string' }, { type: 'number' }] },
            '#/test/schema',
          );
        } catch (error: unknown) {
          result = error;
        }
      });

      afterAll(() => {
        vitest.clearAllMocks();
      });

      it('should throw an InversifyValidationError', () => {
        expect(result).toBeInstanceOf(InversifyValidationError);
      });
    });
  });

  describe('having a schema that resolves to multiple non-null types', () => {
    describe('when called', () => {
      let result: unknown;

      beforeAll(() => {
        vitest
          .mocked(inferOpenApiSchemaTypes)
          .mockReturnValueOnce(new Set<JsonSchemaType>(['string', 'number']));

        try {
          inferSchemaTypeOrThrow(
            openApiResolverFixture,
            { type: ['string', 'number'] },
            '#/test/schema',
          );
        } catch (error: unknown) {
          result = error;
        }
      });

      afterAll(() => {
        vitest.clearAllMocks();
      });

      it('should throw an InversifyValidationError', () => {
        expect(result).toBeInstanceOf(InversifyValidationError);
      });
    });
  });
});
