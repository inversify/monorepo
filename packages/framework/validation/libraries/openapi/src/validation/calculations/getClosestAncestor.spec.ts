import { beforeAll, describe, expect, it } from 'vitest';

import { type JsonValue } from '@inversifyjs/json-schema-types';
import {
  InversifyValidationError,
  InversifyValidationErrorKind,
} from '@inversifyjs/validation-common';

import { getClosestAncestorId } from './getClosestAncestor.js';

describe(getClosestAncestorId, () => {
  describe('having a root schema with no $id and an empty JSON pointer', () => {
    let rootSchemaFixture: JsonValue;
    let jsonPointerFixture: string;

    beforeAll(() => {
      rootSchemaFixture = {
        type: 'object',
      };
      jsonPointerFixture = '';
    });

    describe('when called', () => {
      let result: unknown;

      beforeAll(() => {
        result = getClosestAncestorId(rootSchemaFixture, jsonPointerFixture);
      });

      it('should return undefined', () => {
        expect(result).toBeUndefined();
      });
    });
  });

  describe('having a root schema with $id and an empty JSON pointer', () => {
    let rootSchemaFixture: JsonValue;
    let jsonPointerFixture: string;
    let idFixture: string;

    beforeAll(() => {
      idFixture = 'https://example.com/schemas/Root.json';
      rootSchemaFixture = {
        $id: idFixture,
        type: 'object',
      };
      jsonPointerFixture = '';
    });

    describe('when called', () => {
      let result: unknown;

      beforeAll(() => {
        result = getClosestAncestorId(rootSchemaFixture, jsonPointerFixture);
      });

      it('should return the root schema $id', () => {
        expect(result).toBe(idFixture);
      });
    });
  });

  describe('having a nested schema with no $id under a root schema with $id', () => {
    let rootSchemaFixture: JsonValue;
    let jsonPointerFixture: string;
    let idFixture: string;

    beforeAll(() => {
      idFixture = 'https://example.com/schemas/Root.json';
      rootSchemaFixture = {
        $id: idFixture,
        properties: {
          nested: {
            type: 'string',
          },
        },
        type: 'object',
      };
      jsonPointerFixture = '/properties/nested';
    });

    describe('when called', () => {
      let result: unknown;

      beforeAll(() => {
        result = getClosestAncestorId(rootSchemaFixture, jsonPointerFixture);
      });

      it('should return the closest ancestor $id', () => {
        expect(result).toBe(idFixture);
      });
    });
  });

  describe('having a nested schema with its own $id', () => {
    let rootSchemaFixture: JsonValue;
    let jsonPointerFixture: string;
    let nestedIdFixture: string;

    beforeAll(() => {
      nestedIdFixture = 'https://example.com/schemas/Nested.json';
      rootSchemaFixture = {
        $id: 'https://example.com/schemas/Root.json',
        properties: {
          nested: {
            $id: nestedIdFixture,
            type: 'string',
          },
        },
        type: 'object',
      };
      jsonPointerFixture = '/properties/nested';
    });

    describe('when called', () => {
      let result: unknown;

      beforeAll(() => {
        result = getClosestAncestorId(rootSchemaFixture, jsonPointerFixture);
      });

      it('should return the nested schema $id', () => {
        expect(result).toBe(nestedIdFixture);
      });
    });
  });

  describe('having a JSON pointer that does not resolve', () => {
    let rootSchemaFixture: JsonValue;
    let jsonPointerFixture: string;

    beforeAll(() => {
      rootSchemaFixture = {
        type: 'object',
      };
      jsonPointerFixture = '/properties/missing';
    });

    describe('when called', () => {
      let result: unknown;

      beforeAll(() => {
        try {
          getClosestAncestorId(rootSchemaFixture, jsonPointerFixture);
        } catch (error: unknown) {
          result = error;
        }
      });

      it('should throw an InversifyValidationError', () => {
        expect(result).toBeInstanceOf(InversifyValidationError);
        expect(result).toMatchObject({
          kind: InversifyValidationErrorKind.unknown,
          message: expect.stringContaining(jsonPointerFixture),
        });
      });
    });
  });
});
