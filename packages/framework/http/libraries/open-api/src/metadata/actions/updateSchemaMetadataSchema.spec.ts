import { afterAll, beforeAll, describe, expect, it, vitest } from 'vitest';

import { OpenApi3Dot1SchemaObject } from '@inversifyjs/open-api-types/v3Dot1';

import { SchemaMetadata } from '../models/SchemaMetadata';
import { updateSchemaMetadataSchema } from './updateSchemaMetadataSchema';

describe(updateSchemaMetadataSchema, () => {
  let schemaFixture: OpenApi3Dot1SchemaObject;
  // eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
  let targetFixture: Function;

  beforeAll(() => {
    schemaFixture = {
      properties: {
        id: { type: 'string' },
      },
      type: 'object',
    };

    targetFixture = function testClass() {};
    Object.defineProperty(targetFixture, 'name', { value: 'TestClass' });
  });

  describe('having metadata with undefined schema', () => {
    describe('when called', () => {
      let metadataFixture: SchemaMetadata;

      let result: unknown;

      beforeAll(() => {
        metadataFixture = {
          customAttributes: undefined,
          name: undefined,
          properties: new Map(),
          references: new Set(),
          schema: undefined,
        };

        result = updateSchemaMetadataSchema(
          schemaFixture,
          targetFixture,
        )(metadataFixture);
      });

      afterAll(() => {
        vitest.clearAllMocks();
      });

      it('should set metadata.schema', () => {
        expect(metadataFixture.schema).toBe(schemaFixture);
      });

      it('should return metadata', () => {
        expect(result).toBe(metadataFixture);
      });
    });
  });

  describe('having metadata with existing schema', () => {
    describe('when called', () => {
      let metadataFixture: SchemaMetadata;
      let existingSchemaFixture: OpenApi3Dot1SchemaObject;

      beforeAll(() => {
        existingSchemaFixture = {
          type: 'string',
        };

        metadataFixture = {
          customAttributes: undefined,
          name: undefined,
          properties: new Map(),
          references: new Set(),
          schema: existingSchemaFixture,
        };
      });

      it('should throw an Error', () => {
        expect(() =>
          updateSchemaMetadataSchema(
            schemaFixture,
            targetFixture,
          )(metadataFixture),
        ).toThrow('Cannot redefine "TestClass" schema');
      });
    });
  });

  describe('having undefined schema', () => {
    describe('when called', () => {
      let metadataFixture: SchemaMetadata;
      let undefinedSchemaFixture: OpenApi3Dot1SchemaObject | undefined;

      let result: unknown;

      beforeAll(() => {
        metadataFixture = {
          customAttributes: undefined,
          name: undefined,
          properties: new Map(),
          references: new Set(),
          schema: undefined,
        };

        undefinedSchemaFixture = undefined;

        result = updateSchemaMetadataSchema(
          undefinedSchemaFixture,
          targetFixture,
        )(metadataFixture);
      });

      afterAll(() => {
        vitest.clearAllMocks();
      });

      it('should set metadata.schema to undefined', () => {
        expect(metadataFixture.schema).toBeUndefined();
      });

      it('should return metadata', () => {
        expect(result).toBe(metadataFixture);
      });
    });
  });
});
