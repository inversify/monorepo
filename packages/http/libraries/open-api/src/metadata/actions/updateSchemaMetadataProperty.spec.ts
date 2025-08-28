import { afterAll, beforeAll, describe, expect, it, vitest } from 'vitest';

import { OpenApi3Dot1SchemaObject } from '@inversifyjs/open-api-types/v3Dot1';

import { SchemaMetadata } from '../models/SchemaMetadata';
import { updateSchemaMetadataProperty } from './updateSchemaMetadataProperty';

describe(updateSchemaMetadataProperty, () => {
  describe('having propertyKey and undefined schema', () => {
    describe('when called', () => {
      let metadataFixture: SchemaMetadata;
      let propertyKeyFixture: string;
      let schemaFixture: OpenApi3Dot1SchemaObject | undefined;

      let result: unknown;

      beforeAll(() => {
        propertyKeyFixture = 'testProperty';
        schemaFixture = undefined;

        metadataFixture = {
          name: undefined,
          properties: new Map(),
          references: new Set(),
          schema: undefined,
        };

        result = updateSchemaMetadataProperty(
          propertyKeyFixture,
          schemaFixture,
        )(metadataFixture);
      });

      afterAll(() => {
        vitest.clearAllMocks();
      });

      it('should set property in metadata.properties', () => {
        expect(metadataFixture.properties.has(propertyKeyFixture)).toBe(true);
        expect(
          metadataFixture.properties.get(propertyKeyFixture),
        ).toStrictEqual({
          schema: schemaFixture,
        });
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
      let schemaFixture: OpenApi3Dot1SchemaObject;

      let result: unknown;

      beforeAll(() => {
        propertyKeyFixture = 'testProperty';
        schemaFixture = {
          description: 'Test property',
          type: 'string',
        };

        metadataFixture = {
          name: undefined,
          properties: new Map(),
          references: new Set(),
          schema: undefined,
        };

        result = updateSchemaMetadataProperty(
          propertyKeyFixture,
          schemaFixture,
        )(metadataFixture);
      });

      afterAll(() => {
        vitest.clearAllMocks();
      });

      it('should set property in metadata.properties', () => {
        expect(metadataFixture.properties.has(propertyKeyFixture)).toBe(true);
        expect(
          metadataFixture.properties.get(propertyKeyFixture),
        ).toStrictEqual({
          schema: schemaFixture,
        });
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
      let schemaFixture: OpenApi3Dot1SchemaObject;
      let existingPropertyKeyFixture: string;
      let existingSchemaFixture: OpenApi3Dot1SchemaObject;

      let result: unknown;

      beforeAll(() => {
        propertyKeyFixture = 'newProperty';
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
          name: undefined,
          properties: new Map([
            [existingPropertyKeyFixture, { schema: existingSchemaFixture }],
          ]),
          references: new Set(),
          schema: undefined,
        };

        result = updateSchemaMetadataProperty(
          propertyKeyFixture,
          schemaFixture,
        )(metadataFixture);
      });

      afterAll(() => {
        vitest.clearAllMocks();
      });

      it('should set new property in metadata.properties', () => {
        expect(metadataFixture.properties.has(propertyKeyFixture)).toBe(true);
        expect(
          metadataFixture.properties.get(propertyKeyFixture),
        ).toStrictEqual({
          schema: schemaFixture,
        });
      });

      it('should preserve existing properties', () => {
        expect(metadataFixture.properties.has(existingPropertyKeyFixture)).toBe(
          true,
        );
        expect(
          metadataFixture.properties.get(existingPropertyKeyFixture),
        ).toStrictEqual({
          schema: existingSchemaFixture,
        });
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
      let schemaFixture: OpenApi3Dot1SchemaObject;
      let existingSchemaFixture: OpenApi3Dot1SchemaObject;

      let result: unknown;

      beforeAll(() => {
        propertyKeyFixture = 'testProperty';
        schemaFixture = {
          description: 'Updated property',
          type: 'number',
        };

        existingSchemaFixture = {
          description: 'Original property',
          type: 'string',
        };

        metadataFixture = {
          name: undefined,
          properties: new Map([
            [propertyKeyFixture, { schema: existingSchemaFixture }],
          ]),
          references: new Set(),
          schema: undefined,
        };

        result = updateSchemaMetadataProperty(
          propertyKeyFixture,
          schemaFixture,
        )(metadataFixture);
      });

      afterAll(() => {
        vitest.clearAllMocks();
      });

      it('should update property in metadata.properties', () => {
        expect(metadataFixture.properties.has(propertyKeyFixture)).toBe(true);
        expect(
          metadataFixture.properties.get(propertyKeyFixture),
        ).toStrictEqual({
          schema: schemaFixture,
        });
      });

      it('should return metadata', () => {
        expect(result).toBe(metadataFixture);
      });
    });
  });
});
