import { afterAll, beforeAll, describe, expect, it, vitest } from 'vitest';

import { OasSchemaDecoratorOptions } from '../models/OasSchemaDecoratorOptions';
import { SchemaMetadata } from '../models/SchemaMetadata';
import { updateSchemaMetadataFromOptions } from './updateSchemaMetadataFromOptions';

describe(updateSchemaMetadataFromOptions, () => {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
  let targetFixture: Function;

  beforeAll(() => {
    targetFixture = function testClass() {};
    Object.defineProperty(targetFixture, 'name', { value: 'TestClass' });
  });

  describe('having undefined options and metadata with undefined name', () => {
    describe('when called', () => {
      let metadataFixture: SchemaMetadata;
      let optionsFixture: OasSchemaDecoratorOptions | undefined;

      let result: unknown;

      beforeAll(() => {
        metadataFixture = {
          customAttributes: undefined,
          name: undefined,
          properties: new Map(),
          references: new Set(),
          schema: undefined,
        };

        optionsFixture = undefined;

        result = updateSchemaMetadataFromOptions(
          optionsFixture,
          targetFixture,
        )(metadataFixture);
      });

      afterAll(() => {
        vitest.clearAllMocks();
      });

      it('should not change metadata.name', () => {
        expect(metadataFixture.name).toBeUndefined();
      });

      it('should return metadata', () => {
        expect(result).toBe(metadataFixture);
      });
    });
  });

  describe('having undefined options and metadata with existing name', () => {
    describe('when called', () => {
      let metadataFixture: SchemaMetadata;
      let optionsFixture: OasSchemaDecoratorOptions | undefined;
      let existingNameFixture: string;

      let result: unknown;

      beforeAll(() => {
        existingNameFixture = 'ExistingName';

        metadataFixture = {
          customAttributes: undefined,
          name: existingNameFixture,
          properties: new Map(),
          references: new Set(),
          schema: undefined,
        };

        optionsFixture = undefined;

        result = updateSchemaMetadataFromOptions(
          optionsFixture,
          targetFixture,
        )(metadataFixture);
      });

      afterAll(() => {
        vitest.clearAllMocks();
      });

      it('should not change metadata.name', () => {
        expect(metadataFixture.name).toBe(existingNameFixture);
      });

      it('should return metadata', () => {
        expect(result).toBe(metadataFixture);
      });
    });
  });

  describe('having options with name and metadata with undefined name', () => {
    describe('when called', () => {
      let metadataFixture: SchemaMetadata;
      let optionsFixture: OasSchemaDecoratorOptions;
      let nameFixture: string;

      let result: unknown;

      beforeAll(() => {
        nameFixture = 'NewSchemaName';

        metadataFixture = {
          customAttributes: undefined,
          name: undefined,
          properties: new Map(),
          references: new Set(),
          schema: undefined,
        };

        optionsFixture = {
          name: nameFixture,
        };

        result = updateSchemaMetadataFromOptions(
          optionsFixture,
          targetFixture,
        )(metadataFixture);
      });

      afterAll(() => {
        vitest.clearAllMocks();
      });

      it('should set metadata.name', () => {
        expect(metadataFixture.name).toBe(nameFixture);
      });

      it('should return metadata', () => {
        expect(result).toBe(metadataFixture);
      });
    });
  });

  describe('having options with name and metadata with existing name', () => {
    describe('when called', () => {
      let metadataFixture: SchemaMetadata;
      let optionsFixture: OasSchemaDecoratorOptions;
      let nameFixture: string;
      let existingNameFixture: string;

      beforeAll(() => {
        nameFixture = 'NewSchemaName';
        existingNameFixture = 'ExistingSchemaName';

        metadataFixture = {
          customAttributes: undefined,
          name: existingNameFixture,
          properties: new Map(),
          references: new Set(),
          schema: undefined,
        };

        optionsFixture = {
          name: nameFixture,
        };
      });

      it('should throw an Error', () => {
        expect(() =>
          updateSchemaMetadataFromOptions(
            optionsFixture,
            targetFixture,
          )(metadataFixture),
        ).toThrow('Cannot redefine "TestClass" schema name');
      });
    });
  });

  describe('having options with customAttributes and metadata with undefined customAttributes', () => {
    describe('when called', () => {
      let metadataFixture: SchemaMetadata;
      let optionsFixture: OasSchemaDecoratorOptions;
      let customAttributesFixture: OasSchemaDecoratorOptions['customAttributes'];

      let result: unknown;

      beforeAll(() => {
        customAttributesFixture = {
          description: 'Test description',
          example: 'test example',
        };

        metadataFixture = {
          customAttributes: undefined,
          name: undefined,
          properties: new Map(),
          references: new Set(),
          schema: undefined,
        };

        optionsFixture = {
          customAttributes: customAttributesFixture,
        };

        result = updateSchemaMetadataFromOptions(
          optionsFixture,
          targetFixture,
        )(metadataFixture);
      });

      afterAll(() => {
        vitest.clearAllMocks();
      });

      it('should set metadata.customAttributes', () => {
        expect(metadataFixture.customAttributes).toStrictEqual(
          customAttributesFixture,
        );
      });

      it('should return metadata', () => {
        expect(result).toBe(metadataFixture);
      });
    });
  });

  describe('having options with customAttributes and metadata with existing customAttributes', () => {
    describe('when called', () => {
      let metadataFixture: SchemaMetadata;
      let optionsFixture: OasSchemaDecoratorOptions;
      let customAttributesFixture: OasSchemaDecoratorOptions['customAttributes'];
      let existingCustomAttributesFixture: OasSchemaDecoratorOptions['customAttributes'];

      let result: unknown;

      beforeAll(() => {
        existingCustomAttributesFixture = {
          title: 'Existing title',
          version: '1.0.0',
        };

        customAttributesFixture = {
          description: 'Test description',
          example: 'test example',
        };

        metadataFixture = {
          customAttributes: existingCustomAttributesFixture,
          name: undefined,
          properties: new Map(),
          references: new Set(),
          schema: undefined,
        };

        optionsFixture = {
          customAttributes: customAttributesFixture,
        };

        result = updateSchemaMetadataFromOptions(
          optionsFixture,
          targetFixture,
        )(metadataFixture);
      });

      afterAll(() => {
        vitest.clearAllMocks();
      });

      it('should merge customAttributes into existing metadata.customAttributes', () => {
        expect(metadataFixture.customAttributes).toStrictEqual({
          description: 'Test description',
          example: 'test example',
          title: 'Existing title',
          version: '1.0.0',
        });
      });

      it('should return metadata', () => {
        expect(result).toBe(metadataFixture);
      });
    });
  });

  describe('having options with customAttributes and metadata with existing customAttributes that have overlapping keys', () => {
    describe('when called', () => {
      let metadataFixture: SchemaMetadata;
      let optionsFixture: OasSchemaDecoratorOptions;
      let customAttributesFixture: OasSchemaDecoratorOptions['customAttributes'];
      let existingCustomAttributesFixture: OasSchemaDecoratorOptions['customAttributes'];

      let result: unknown;

      beforeAll(() => {
        existingCustomAttributesFixture = {
          description: 'Existing description',
          title: 'Existing title',
        };

        customAttributesFixture = {
          description: 'New description',
          example: 'test example',
        };

        metadataFixture = {
          customAttributes: existingCustomAttributesFixture,
          name: undefined,
          properties: new Map(),
          references: new Set(),
          schema: undefined,
        };

        optionsFixture = {
          customAttributes: customAttributesFixture,
        };

        result = updateSchemaMetadataFromOptions(
          optionsFixture,
          targetFixture,
        )(metadataFixture);
      });

      afterAll(() => {
        vitest.clearAllMocks();
      });

      it('should override existing customAttributes with new values', () => {
        expect(metadataFixture.customAttributes).toStrictEqual({
          description: 'New description',
          example: 'test example',
          title: 'Existing title',
        });
      });

      it('should return metadata', () => {
        expect(result).toBe(metadataFixture);
      });
    });
  });

  describe('having options with both name and customAttributes', () => {
    describe('when called', () => {
      let metadataFixture: SchemaMetadata;
      let optionsFixture: OasSchemaDecoratorOptions;
      let nameFixture: string;
      let customAttributesFixture: OasSchemaDecoratorOptions['customAttributes'];

      let result: unknown;

      beforeAll(() => {
        nameFixture = 'TestSchemaName';
        customAttributesFixture = {
          description: 'Test description',
          example: 'test example',
        };

        metadataFixture = {
          customAttributes: undefined,
          name: undefined,
          properties: new Map(),
          references: new Set(),
          schema: undefined,
        };

        optionsFixture = {
          customAttributes: customAttributesFixture,
          name: nameFixture,
        };

        result = updateSchemaMetadataFromOptions(
          optionsFixture,
          targetFixture,
        )(metadataFixture);
      });

      afterAll(() => {
        vitest.clearAllMocks();
      });

      it('should set metadata.name', () => {
        expect(metadataFixture.name).toBe(nameFixture);
      });

      it('should set metadata.customAttributes', () => {
        expect(metadataFixture.customAttributes).toStrictEqual(
          customAttributesFixture,
        );
      });

      it('should return metadata', () => {
        expect(result).toBe(metadataFixture);
      });
    });
  });
});
