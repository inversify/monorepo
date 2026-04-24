import { afterAll, beforeAll, describe, expect, it, vitest } from 'vitest';

vitest.mock(import('./inferOpenApiSchemaTypes.js'));

import { type JsonSchemaType } from '@inversifyjs/json-schema-types/2020-12';
import {
  InversifyValidationError,
  InversifyValidationErrorKind,
} from '@inversifyjs/validation-common';

import { type OpenApiResolver } from '../services/OpenApiResolver.js';
import { inferOpenApiSchemaTypes } from './inferOpenApiSchemaTypes.js';
import { inferSchemaTypeOrPrimitivaSchemaTypeOrThrow } from './inferSchemaTypeOrPrimitivaSchemaTypeOrThrow.js';

describe(inferSchemaTypeOrPrimitivaSchemaTypeOrThrow, () => {
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
          inferSchemaTypeOrPrimitivaSchemaTypeOrThrow(
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
        const expectedErrorProperties: Partial<InversifyValidationError> = {
          kind: InversifyValidationErrorKind.invalidConfiguration,
          message: expect.stringContaining('#/test/schema'),
        };

        expect(result).toBeInstanceOf(InversifyValidationError);
        expect(result).toMatchObject(expectedErrorProperties);
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

        result = inferSchemaTypeOrPrimitivaSchemaTypeOrThrow(
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
          .mockReturnValueOnce(new Set<JsonSchemaType>(['integer', 'null']));

        result = inferSchemaTypeOrPrimitivaSchemaTypeOrThrow(
          openApiResolverFixture,
          { type: ['integer', 'null'] },
          '#/test/schema',
        );
      });

      afterAll(() => {
        vitest.clearAllMocks();
      });

      it('should return the expected result with isNullable true', () => {
        expect(result).toStrictEqual({
          isNullable: true,
          type: 'integer',
        });
      });
    });
  });

  describe('having a schema that resolves to multiple types including a single primitive', () => {
    describe('when called', () => {
      let result: unknown;

      beforeAll(() => {
        vitest
          .mocked(inferOpenApiSchemaTypes)
          .mockReturnValueOnce(
            new Set<JsonSchemaType>(['string', 'array', 'null']),
          );

        result = inferSchemaTypeOrPrimitivaSchemaTypeOrThrow(
          openApiResolverFixture,
          { anyOf: [{ type: 'string' }, { type: 'array' }, { type: 'null' }] },
          '#/test/schema',
        );
      });

      afterAll(() => {
        vitest.clearAllMocks();
      });

      it('should return the primitive type with isNullable true', () => {
        expect(result).toStrictEqual({
          isNullable: true,
          type: 'string',
        });
      });
    });
  });

  describe('having a schema that resolves to multiple non-primitive types without a single primitive', () => {
    describe('when called', () => {
      let result: unknown;

      beforeAll(() => {
        vitest
          .mocked(inferOpenApiSchemaTypes)
          .mockReturnValueOnce(new Set<JsonSchemaType>(['array', 'object']));

        try {
          inferSchemaTypeOrPrimitivaSchemaTypeOrThrow(
            openApiResolverFixture,
            { anyOf: [{ type: 'array' }, { type: 'object' }] },
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
        const expectedErrorProperties: Partial<InversifyValidationError> = {
          kind: InversifyValidationErrorKind.invalidConfiguration,
          message: expect.stringContaining('#/test/schema'),
        };

        expect(result).toBeInstanceOf(InversifyValidationError);
        expect(result).toMatchObject(expectedErrorProperties);
      });
    });
  });

  describe('having a schema that resolves to multiple primitive types', () => {
    describe('when called', () => {
      let result: unknown;

      beforeAll(() => {
        vitest
          .mocked(inferOpenApiSchemaTypes)
          .mockReturnValueOnce(
            new Set<JsonSchemaType>(['string', 'integer', 'null']),
          );

        try {
          inferSchemaTypeOrPrimitivaSchemaTypeOrThrow(
            openApiResolverFixture,
            {
              anyOf: [
                { type: 'string' },
                { type: 'integer' },
                { type: 'null' },
              ],
            },
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
        const expectedErrorProperties: Partial<InversifyValidationError> = {
          kind: InversifyValidationErrorKind.invalidConfiguration,
          message: expect.stringContaining('#/test/schema'),
        };

        expect(result).toBeInstanceOf(InversifyValidationError);
        expect(result).toMatchObject(expectedErrorProperties);
      });
    });
  });
});
