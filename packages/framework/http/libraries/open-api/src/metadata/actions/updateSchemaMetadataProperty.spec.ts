import { afterAll, beforeAll, describe, expect, it, vitest } from 'vitest';

import { OpenApi3Dot1SchemaObject } from '@inversifyjs/open-api-types/v3Dot1';

import { SchemaMetadata } from '../models/SchemaMetadata';
import { SchemaPropertyMetadata } from '../models/SchemaPropertyMetadata';
import { updateSchemaMetadataProperty } from './updateSchemaMetadataProperty';

describe(updateSchemaMetadataProperty, () => {
  describe('having propertyKey and undefined schema', () => {
    describe('when called', () => {
      let metadataFixture: SchemaMetadata;
      let propertyKeyFixture: string;
      let requiredFixture: boolean;
      let schemaFixture: OpenApi3Dot1SchemaObject | undefined;

      let result: unknown;

      beforeAll(() => {
        propertyKeyFixture = 'testProperty';
        requiredFixture = true;
        schemaFixture = undefined;

        metadataFixture = {
          customAttributes: undefined,
          name: undefined,
          properties: new Map(),
          references: new Set(),
          schema: undefined,
        };

        result = updateSchemaMetadataProperty(
          propertyKeyFixture,
          requiredFixture,
          schemaFixture,
        )(metadataFixture);
      });

      afterAll(() => {
        vitest.clearAllMocks();
      });

      it('should set property in metadata.properties', () => {
        const expected: SchemaPropertyMetadata = {
          required: requiredFixture,
          schema: schemaFixture,
        };

        expect(metadataFixture.properties.has(propertyKeyFixture)).toBe(true);
        expect(
          metadataFixture.properties.get(propertyKeyFixture),
        ).toStrictEqual(expected);
      });

      it('should return metadata', () => {
        expect(result).toBe(metadataFixture);
      });
    });
  });

  describe('having propertyKey and schema object', () => {
    describe('when called', () => {
      let metadataFixture: SchemaMetadata;
      let propertyKeyFixture: string;
      let requiredFixture: boolean;
      let schemaFixture: OpenApi3Dot1SchemaObject;

      let result: unknown;

      beforeAll(() => {
        propertyKeyFixture = 'testProperty';
        requiredFixture = true;
        schemaFixture = {
          description: 'Test property',
          type: 'string',
        };

        metadataFixture = {
          customAttributes: undefined,
          name: undefined,
          properties: new Map(),
          references: new Set(),
          schema: undefined,
        };

        result = updateSchemaMetadataProperty(
          propertyKeyFixture,
          requiredFixture,
          schemaFixture,
        )(metadataFixture);
      });

      afterAll(() => {
        vitest.clearAllMocks();
      });

      it('should set property in metadata.properties', () => {
        const expected: SchemaPropertyMetadata = {
          required: requiredFixture,
          schema: schemaFixture,
        };

        expect(metadataFixture.properties.has(propertyKeyFixture)).toBe(true);
        expect(
          metadataFixture.properties.get(propertyKeyFixture),
        ).toStrictEqual(expected);
      });

      it('should return metadata', () => {
        expect(result).toBe(metadataFixture);
      });
    });
  });

  describe('having propertyKey and metadata with existing properties', () => {
    describe('when called', () => {
      let metadataFixture: SchemaMetadata;
      let propertyKeyFixture: string;
      let requiredFixture: boolean;
      let schemaFixture: OpenApi3Dot1SchemaObject;
      let existingPropertyKeyFixture: string;
      let existingSchemaFixture: OpenApi3Dot1SchemaObject;

      let result: unknown;

      beforeAll(() => {
        propertyKeyFixture = 'newProperty';
        requiredFixture = true;
        schemaFixture = {
          description: 'New property',
          type: 'number',
        };

        existingPropertyKeyFixture = 'existingProperty';
        existingSchemaFixture = {
          description: 'Existing property',
          type: 'string',
        };

        metadataFixture = {
          customAttributes: undefined,
          name: undefined,
          properties: new Map([
            [
              existingPropertyKeyFixture,
              { required: requiredFixture, schema: existingSchemaFixture },
            ],
          ]),
          references: new Set(),
          schema: undefined,
        };

        result = updateSchemaMetadataProperty(
          propertyKeyFixture,
          requiredFixture,
          schemaFixture,
        )(metadataFixture);
      });

      afterAll(() => {
        vitest.clearAllMocks();
      });

      it('should set new property in metadata.properties', () => {
        const expected: SchemaPropertyMetadata = {
          required: requiredFixture,
          schema: schemaFixture,
        };

        expect(metadataFixture.properties.has(propertyKeyFixture)).toBe(true);
        expect(
          metadataFixture.properties.get(propertyKeyFixture),
        ).toStrictEqual(expected);
      });

      it('should preserve existing properties', () => {
        const expected: SchemaPropertyMetadata = {
          required: requiredFixture,
          schema: existingSchemaFixture,
        };

        expect(metadataFixture.properties.has(existingPropertyKeyFixture)).toBe(
          true,
        );
        expect(
          metadataFixture.properties.get(existingPropertyKeyFixture),
        ).toStrictEqual(expected);
      });

      it('should return metadata', () => {
        expect(result).toBe(metadataFixture);
      });
    });
  });

  describe('having propertyKey and metadata with same property key already set', () => {
    describe('when called', () => {
      let metadataFixture: SchemaMetadata;
      let propertyKeyFixture: string;
      let requiredFixture: boolean;
      let schemaFixture: OpenApi3Dot1SchemaObject;
      let existingSchemaFixture: OpenApi3Dot1SchemaObject;

      let result: unknown;

      beforeAll(() => {
        propertyKeyFixture = 'testProperty';
        requiredFixture = false;
        schemaFixture = {
          description: 'Updated property',
          type: 'number',
        };

        existingSchemaFixture = {
          description: 'Original property',
          type: 'string',
        };

        metadataFixture = {
          customAttributes: undefined,
          name: undefined,
          properties: new Map([
            [
              propertyKeyFixture,
              { required: requiredFixture, schema: existingSchemaFixture },
            ],
          ]),
          references: new Set(),
          schema: undefined,
        };

        result = updateSchemaMetadataProperty(
          propertyKeyFixture,
          requiredFixture,
          schemaFixture,
        )(metadataFixture);
      });

      afterAll(() => {
        vitest.clearAllMocks();
      });

      it('should update property in metadata.properties', () => {
        const expected: SchemaPropertyMetadata = {
          required: requiredFixture,
          schema: schemaFixture,
        };

        expect(metadataFixture.properties.has(propertyKeyFixture)).toBe(true);
        expect(
          metadataFixture.properties.get(propertyKeyFixture),
        ).toStrictEqual(expected);
      });

      it('should return metadata', () => {
        expect(result).toBe(metadataFixture);
      });
    });
  });
});
