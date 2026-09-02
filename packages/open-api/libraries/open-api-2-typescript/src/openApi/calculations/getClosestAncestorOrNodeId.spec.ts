import { beforeAll, describe, expect, it } from 'vitest';

import { type JsonValue } from '@inversifyjs/json-schema-types';

import { getClosestAncestorOrNodeId } from './getClosestAncestorOrNodeId.js';

describe(getClosestAncestorOrNodeId, () => {
  describe('having a root schema with no $id, an empty JSON pointer, and a base id', () => {
    let rootSchemaFixture: JsonValue;
    let jsonPointerFixture: string;
    let baseIdFixture: string;

    beforeAll(() => {
      rootSchemaFixture = {
        type: 'object',
      };
      jsonPointerFixture = '';
      baseIdFixture = 'https://example.com/openapi.json';
    });

    describe('when called', () => {
      let result: unknown;

      beforeAll(() => {
        result = getClosestAncestorOrNodeId(
          rootSchemaFixture,
          jsonPointerFixture,
          baseIdFixture,
        );
      });

      it('should return the base id', () => {
        expect(result).toBe(baseIdFixture);
      });
    });
  });

  describe('having a root schema with $id and an empty JSON pointer', () => {
    let rootSchemaFixture: JsonValue;
    let jsonPointerFixture: string;
    let baseIdFixture: string;
    let idFixture: string;

    beforeAll(() => {
      idFixture = 'https://example.com/schemas/Root.json';
      rootSchemaFixture = {
        $id: idFixture,
        type: 'object',
      };
      jsonPointerFixture = '';
      baseIdFixture = 'https://example.com/openapi.json';
    });

    describe('when called', () => {
      let result: unknown;

      beforeAll(() => {
        result = getClosestAncestorOrNodeId(
          rootSchemaFixture,
          jsonPointerFixture,
          baseIdFixture,
        );
      });

      it('should return the root schema $id', () => {
        expect(result).toBe(idFixture);
      });
    });
  });

  describe('having a nested schema with $id', () => {
    let rootSchemaFixture: JsonValue;
    let jsonPointerFixture: string;
    let baseIdFixture: string;
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
      baseIdFixture = 'https://example.com/openapi.json';
    });

    describe('when called', () => {
      let result: unknown;

      beforeAll(() => {
        result = getClosestAncestorOrNodeId(
          rootSchemaFixture,
          jsonPointerFixture,
          baseIdFixture,
        );
      });

      it('should return the nested schema $id', () => {
        expect(result).toBe(nestedIdFixture);
      });
    });
  });

  describe('having an unknown JSON pointer', () => {
    let rootSchemaFixture: JsonValue;
    let jsonPointerFixture: string;
    let baseIdFixture: string;

    beforeAll(() => {
      rootSchemaFixture = {
        type: 'object',
      };
      jsonPointerFixture = '/missing';
      baseIdFixture = 'https://example.com/openapi.json';
    });

    describe('when called', () => {
      let result: unknown;

      beforeAll(() => {
        result = getClosestAncestorOrNodeId(
          rootSchemaFixture,
          jsonPointerFixture,
          baseIdFixture,
        );
      });

      it('should return the base id', () => {
        expect(result).toBe(baseIdFixture);
      });
    });
  });
});
