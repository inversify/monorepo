import { beforeAll, describe, expect, it } from 'vitest';

import { type JsonValue } from '@inversifyjs/json-schema-types';

import { getClosestAncestorId } from './getClosestAncestorId.js';

describe(getClosestAncestorId, () => {
  describe('having an empty JSON pointer', () => {
    let rootSchemaFixture: JsonValue;
    let jsonPointerFixture: string;
    let baseIdFixture: string;

    beforeAll(() => {
      rootSchemaFixture = {
        $id: 'https://example.com/schemas/Root.json',
        type: 'object',
      };
      jsonPointerFixture = '';
      baseIdFixture = 'https://example.com/openapi.json';
    });

    describe('when called', () => {
      let result: unknown;

      beforeAll(() => {
        result = getClosestAncestorId(
          rootSchemaFixture,
          jsonPointerFixture,
          baseIdFixture,
        );
      });

      it('should return undefined', () => {
        expect(result).toBeUndefined();
      });
    });
  });

  describe('having a nested schema with its own $id under a root schema with $id', () => {
    let rootSchemaFixture: JsonValue;
    let jsonPointerFixture: string;
    let baseIdFixture: string | undefined;
    let rootIdFixture: string;

    beforeAll(() => {
      rootIdFixture = 'https://example.com/schemas/Root.json';
      rootSchemaFixture = {
        $id: rootIdFixture,
        properties: {
          nested: {
            $id: 'https://example.com/schemas/Nested.json',
            type: 'string',
          },
        },
        type: 'object',
      };
      jsonPointerFixture = '/properties/nested';
      baseIdFixture = undefined;
    });

    describe('when called', () => {
      let result: unknown;

      beforeAll(() => {
        result = getClosestAncestorId(
          rootSchemaFixture,
          jsonPointerFixture,
          baseIdFixture,
        );
      });

      it('should return the parent schema $id, not the node $id', () => {
        expect(result).toBe(rootIdFixture);
      });
    });
  });

  describe('having a deeply nested schema under an intermediate $id', () => {
    let rootSchemaFixture: JsonValue;
    let jsonPointerFixture: string;
    let baseIdFixture: string | undefined;
    let intermediateIdFixture: string;

    beforeAll(() => {
      intermediateIdFixture = 'https://example.com/schemas/Intermediate.json';
      rootSchemaFixture = {
        $id: 'https://example.com/schemas/Root.json',
        properties: {
          intermediate: {
            $id: intermediateIdFixture,
            properties: {
              nested: {
                type: 'string',
              },
            },
            type: 'object',
          },
        },
        type: 'object',
      };
      jsonPointerFixture = '/properties/intermediate/properties/nested';
      baseIdFixture = undefined;
    });

    describe('when called', () => {
      let result: unknown;

      beforeAll(() => {
        result = getClosestAncestorId(
          rootSchemaFixture,
          jsonPointerFixture,
          baseIdFixture,
        );
      });

      it('should return the closest parent $id', () => {
        expect(result).toBe(intermediateIdFixture);
      });
    });
  });

  describe('having a nested schema with no ancestor $id and a base id', () => {
    let rootSchemaFixture: JsonValue;
    let jsonPointerFixture: string;
    let baseIdFixture: string;

    beforeAll(() => {
      rootSchemaFixture = {
        properties: {
          nested: {
            $id: 'Nested.json',
            type: 'string',
          },
        },
        type: 'object',
      };
      jsonPointerFixture = '/properties/nested';
      baseIdFixture = 'https://example.com/schemas/';
    });

    describe('when called', () => {
      let result: unknown;

      beforeAll(() => {
        result = getClosestAncestorId(
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

  describe('having a nested schema with a relative ancestor $id and a base id', () => {
    let rootSchemaFixture: JsonValue;
    let jsonPointerFixture: string;
    let baseIdFixture: string;

    beforeAll(() => {
      rootSchemaFixture = {
        $id: 'schemas/',
        properties: {
          nested: {
            $id: 'Nested.json',
            type: 'string',
          },
        },
        type: 'object',
      };
      jsonPointerFixture = '/properties/nested';
      baseIdFixture = 'https://example.com/';
    });

    describe('when called', () => {
      let result: unknown;

      beforeAll(() => {
        result = getClosestAncestorId(
          rootSchemaFixture,
          jsonPointerFixture,
          baseIdFixture,
        );
      });

      it('should return the ancestor $id resolved against the base id', () => {
        expect(result).toBe('https://example.com/schemas/');
      });
    });
  });
});
