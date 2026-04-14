import { describe, expect, it } from 'vitest';

import { type JsonSchemaType } from '@inversifyjs/json-schema-types/2020-12';

import {
  coerceHeaderValue,
  type CoercionCandidate,
} from './coerceHeaderValue.js';

describe(coerceHeaderValue, () => {
  describe('when called, and types contains only "string"', () => {
    it('should return the value as-is', () => {
      const result: CoercionCandidate[] = coerceHeaderValue(
        'hello',
        new Set<JsonSchemaType>(['string']),
      );

      expect(result).toStrictEqual([{ coercedValue: 'hello', type: 'string' }]);
    });
  });

  describe('when called, and types contains only "integer" with valid value', () => {
    it('should coerce to number', () => {
      const result: CoercionCandidate[] = coerceHeaderValue(
        '42',
        new Set<JsonSchemaType>(['integer']),
      );

      expect(result).toStrictEqual([{ coercedValue: 42, type: 'integer' }]);
    });
  });

  describe('when called, and types contains only "integer" with non-integer value', () => {
    it('should return empty candidates', () => {
      const result: CoercionCandidate[] = coerceHeaderValue(
        '42.5',
        new Set<JsonSchemaType>(['integer']),
      );

      expect(result).toStrictEqual([]);
    });
  });

  describe('when called, and types contains only "integer" with non-numeric value', () => {
    it('should return empty candidates', () => {
      const result: CoercionCandidate[] = coerceHeaderValue(
        'abc',
        new Set<JsonSchemaType>(['integer']),
      );

      expect(result).toStrictEqual([]);
    });
  });

  describe('when called, and types contains only "number" with valid value', () => {
    it('should coerce to number', () => {
      const result: CoercionCandidate[] = coerceHeaderValue(
        '3.14',
        new Set<JsonSchemaType>(['number']),
      );

      expect(result).toStrictEqual([{ coercedValue: 3.14, type: 'number' }]);
    });
  });

  describe('when called, and types contains only "number" with NaN value', () => {
    it('should return empty candidates', () => {
      const result: CoercionCandidate[] = coerceHeaderValue(
        'not-a-number',
        new Set<JsonSchemaType>(['number']),
      );

      expect(result).toStrictEqual([]);
    });
  });

  describe('when called, and types contains only "boolean" with "true"', () => {
    it('should coerce to true', () => {
      const result: CoercionCandidate[] = coerceHeaderValue(
        'true',
        new Set<JsonSchemaType>(['boolean']),
      );

      expect(result).toStrictEqual([{ coercedValue: true, type: 'boolean' }]);
    });
  });

  describe('when called, and types contains only "boolean" with "false"', () => {
    it('should coerce to false', () => {
      const result: CoercionCandidate[] = coerceHeaderValue(
        'false',
        new Set<JsonSchemaType>(['boolean']),
      );

      expect(result).toStrictEqual([{ coercedValue: false, type: 'boolean' }]);
    });
  });

  describe('when called, and types contains only "boolean" with invalid value', () => {
    it('should return empty candidates', () => {
      const result: CoercionCandidate[] = coerceHeaderValue(
        'yes',
        new Set<JsonSchemaType>(['boolean']),
      );

      expect(result).toStrictEqual([]);
    });
  });

  describe('when called, and types contains only "array" with string value', () => {
    it('should split by comma', () => {
      const result: CoercionCandidate[] = coerceHeaderValue(
        'a,b,c',
        new Set<JsonSchemaType>(['array']),
      );

      expect(result).toStrictEqual([
        { coercedValue: ['a', 'b', 'c'], type: 'array' },
      ]);
    });
  });

  describe('when called, and types contains only "array" with string[] value', () => {
    it('should use array directly', () => {
      const result: CoercionCandidate[] = coerceHeaderValue(
        ['value1', 'value2'],
        new Set<JsonSchemaType>(['array']),
      );

      expect(result).toStrictEqual([
        { coercedValue: ['value1', 'value2'], type: 'array' },
      ]);
    });
  });

  describe('when called, and types contains only "null" with empty string', () => {
    it('should coerce to null', () => {
      const result: CoercionCandidate[] = coerceHeaderValue(
        '',
        new Set<JsonSchemaType>(['null']),
      );

      expect(result).toStrictEqual([{ coercedValue: null, type: 'null' }]);
    });
  });

  describe('when called, and types contains only "null" with non-empty string', () => {
    it('should return empty candidates', () => {
      const result: CoercionCandidate[] = coerceHeaderValue(
        'something',
        new Set<JsonSchemaType>(['null']),
      );

      expect(result).toStrictEqual([]);
    });
  });

  describe('when called, and types contains "string" and "integer"', () => {
    it('should return string candidate first', () => {
      const result: CoercionCandidate[] = coerceHeaderValue(
        '42',
        new Set<JsonSchemaType>(['string', 'integer']),
      );

      expect(result).toStrictEqual([
        { coercedValue: '42', type: 'string' },
        { coercedValue: 42, type: 'integer' },
      ]);
    });
  });

  describe('when called, and types contains "number" and "integer" with integer value', () => {
    it('should return both candidates', () => {
      const result: CoercionCandidate[] = coerceHeaderValue(
        '42',
        new Set<JsonSchemaType>(['number', 'integer']),
      );

      expect(result).toStrictEqual([
        { coercedValue: 42, type: 'number' },
        { coercedValue: 42, type: 'integer' },
      ]);
    });
  });

  describe('when called, and input is string[] for non-array type', () => {
    it('should use first element', () => {
      const result: CoercionCandidate[] = coerceHeaderValue(
        ['42'],
        new Set<JsonSchemaType>(['integer']),
      );

      expect(result).toStrictEqual([{ coercedValue: 42, type: 'integer' }]);
    });
  });

  describe('when called, and rawValue is undefined', () => {
    it('should return empty candidates', () => {
      const result: CoercionCandidate[] = coerceHeaderValue(
        undefined,
        new Set<JsonSchemaType>(['string']),
      );

      expect(result).toStrictEqual([]);
    });
  });

  describe('when called, and types contains "object"', () => {
    it('should return empty candidates for object type', () => {
      const result: CoercionCandidate[] = coerceHeaderValue(
        'value',
        new Set<JsonSchemaType>(['object']),
      );

      expect(result).toStrictEqual([]);
    });
  });

  describe('when called, and types contains "array" with undefined value', () => {
    it('should return empty candidates', () => {
      const result: CoercionCandidate[] = coerceHeaderValue(
        undefined,
        new Set<JsonSchemaType>(['array']),
      );

      expect(result).toStrictEqual([]);
    });
  });
});
