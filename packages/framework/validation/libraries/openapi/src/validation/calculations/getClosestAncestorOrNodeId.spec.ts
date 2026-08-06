import { beforeAll, describe, expect, it } from 'vitest';

import { type JsonValue } from '@inversifyjs/json-schema-types';
import {
  InversifyValidationError,
  InversifyValidationErrorKind,
} from '@inversifyjs/validation-common';

import { getClosestAncestorOrNodeId } from './getClosestAncestorOrNodeId.js';

describe(getClosestAncestorOrNodeId, () => {
  describe('having a root schema with no $id, an empty JSON pointer, and no base id', () => {
    let rootSchemaFixture: JsonValue;
    let jsonPointerFixture: string;
    let baseIdFixture: string | undefined;

    beforeAll(() => {
      rootSchemaFixture = {
        type: 'object',
      };
      jsonPointerFixture = '';
      baseIdFixture = undefined;
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

      it('should return undefined', () => {
        expect(result).toBeUndefined();
      });
    });
  });

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
    let baseIdFixture: string | undefined;
    let idFixture: string;

    beforeAll(() => {
      idFixture = 'https://example.com/schemas/Root.json';
      rootSchemaFixture = {
        $id: idFixture,
        type: 'object',
      };
      jsonPointerFixture = '';
      baseIdFixture = undefined;
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

  describe('having a root schema with a relative $id, an empty JSON pointer, and a base id', () => {
    let rootSchemaFixture: JsonValue;
    let jsonPointerFixture: string;
    let baseIdFixture: string;

    beforeAll(() => {
      rootSchemaFixture = {
        $id: 'Root.json',
        type: 'object',
      };
      jsonPointerFixture = '';
      baseIdFixture = 'https://example.com/schemas/';
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

      it('should return the relative $id resolved against the base id', () => {
        expect(result).toBe('https://example.com/schemas/Root.json');
      });
    });
  });

  describe('having a nested schema with no $id under a root schema with $id', () => {
    let rootSchemaFixture: JsonValue;
    let jsonPointerFixture: string;
    let baseIdFixture: string | undefined;
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
      baseIdFixture = undefined;
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

      it('should return the closest ancestor $id', () => {
        expect(result).toBe(idFixture);
      });
    });
  });

  describe('having a nested schema with no $id, no ancestor $id, and a base id', () => {
    let rootSchemaFixture: JsonValue;
    let jsonPointerFixture: string;
    let baseIdFixture: string;

    beforeAll(() => {
      rootSchemaFixture = {
        properties: {
          nested: {
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

      it('should return the base id', () => {
        expect(result).toBe(baseIdFixture);
      });
    });
  });

  describe('having a nested schema with its own absolute $id', () => {
    let rootSchemaFixture: JsonValue;
    let jsonPointerFixture: string;
    let baseIdFixture: string | undefined;
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
      baseIdFixture = undefined;
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

  describe('having a nested schema with a relative $id under an absolute $id', () => {
    let rootSchemaFixture: JsonValue;
    let jsonPointerFixture: string;
    let baseIdFixture: string | undefined;

    beforeAll(() => {
      rootSchemaFixture = {
        $id: 'https://example.com/schemas/',
        properties: {
          nested: {
            $id: 'Nested.json',
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
        result = getClosestAncestorOrNodeId(
          rootSchemaFixture,
          jsonPointerFixture,
          baseIdFixture,
        );
      });

      it('should return the relative $id resolved against the ancestor $id', () => {
        expect(result).toBe('https://example.com/schemas/Nested.json');
      });
    });
  });

  describe('having a nested schema with a relative $id, no absolute ancestor $id, and no base id', () => {
    let rootSchemaFixture: JsonValue;
    let jsonPointerFixture: string;
    let baseIdFixture: string | undefined;

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
      baseIdFixture = undefined;
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

      it('should return undefined', () => {
        expect(result).toBeUndefined();
      });
    });
  });

  describe('having a nested schema with a relative $id, no absolute ancestor $id, and a base id', () => {
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
        result = getClosestAncestorOrNodeId(
          rootSchemaFixture,
          jsonPointerFixture,
          baseIdFixture,
        );
      });

      it('should return the relative $id resolved against the base id', () => {
        expect(result).toBe('https://example.com/schemas/Nested.json');
      });
    });
  });

  describe('having a JSON pointer that does not resolve', () => {
    let rootSchemaFixture: JsonValue;
    let jsonPointerFixture: string;
    let baseIdFixture: string | undefined;

    beforeAll(() => {
      rootSchemaFixture = {
        type: 'object',
      };
      jsonPointerFixture = '/properties/missing';
      baseIdFixture = undefined;
    });

    describe('when called', () => {
      let result: unknown;

      beforeAll(() => {
        try {
          getClosestAncestorOrNodeId(
            rootSchemaFixture,
            jsonPointerFixture,
            baseIdFixture,
          );
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
