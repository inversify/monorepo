import { afterAll, beforeAll, describe, expect, it, vitest } from 'vitest';

import { OpenApi3Dot1SchemaObject } from '@inversifyjs/open-api-types/v3Dot1';

import { SchemaDecoratorOptions } from '../models/SchemaDecoratorOptions';
import { SchemaMetadata } from '../models/SchemaMetadata';
import { updateSchemaMetadata } from './updateSchemaMetadata';

describe(updateSchemaMetadata, () => {
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

  describe('having undefined options and metadata with undefined name', () => {
    describe('when called', () => {
      let metadataFixture: SchemaMetadata;
      let optionsFixture: SchemaDecoratorOptions | undefined;

      let result: unknown;

      beforeAll(() => {
        metadataFixture = {
          name: undefined,
          properties: new Map(),
          references: new Map(),
          schema: undefined,
        };

        optionsFixture = undefined;

        result = updateSchemaMetadata(
          schemaFixture,
          optionsFixture,
          targetFixture,
        )(metadataFixture);
      });

      afterAll(() => {
        vitest.clearAllMocks();
      });

      it('should set metadata.schema', () => {
        expect(metadataFixture.schema).toBe(schemaFixture);
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
      let optionsFixture: SchemaDecoratorOptions | undefined;
      let existingNameFixture: string;

      let result: unknown;

      beforeAll(() => {
        existingNameFixture = 'ExistingName';

        metadataFixture = {
          name: existingNameFixture,
          properties: new Map(),
          references: new Map(),
          schema: undefined,
        };

        optionsFixture = undefined;

        result = updateSchemaMetadata(
          schemaFixture,
          optionsFixture,
          targetFixture,
        )(metadataFixture);
      });

      afterAll(() => {
        vitest.clearAllMocks();
      });

      it('should set metadata.schema', () => {
        expect(metadataFixture.schema).toBe(schemaFixture);
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
      let optionsFixture: SchemaDecoratorOptions;
      let nameFixture: string;

      let result: unknown;

      beforeAll(() => {
        nameFixture = 'NewSchemaName';

        metadataFixture = {
          name: undefined,
          properties: new Map(),
          references: new Map(),
          schema: undefined,
        };

        optionsFixture = {
          name: nameFixture,
        };

        result = updateSchemaMetadata(
          schemaFixture,
          optionsFixture,
          targetFixture,
        )(metadataFixture);
      });

      afterAll(() => {
        vitest.clearAllMocks();
      });

      it('should set metadata.schema', () => {
        expect(metadataFixture.schema).toBe(schemaFixture);
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
      let optionsFixture: SchemaDecoratorOptions;
      let nameFixture: string;
      let existingNameFixture: string;

      beforeAll(() => {
        nameFixture = 'NewSchemaName';
        existingNameFixture = 'ExistingSchemaName';

        metadataFixture = {
          name: existingNameFixture,
          properties: new Map(),
          references: new Map(),
          schema: undefined,
        };

        optionsFixture = {
          name: nameFixture,
        };
      });

      it('should throw an Error', () => {
        expect(() =>
          updateSchemaMetadata(
            schemaFixture,
            optionsFixture,
            targetFixture,
          )(metadataFixture),
        ).toThrow('Cannot redefine "TestClass" schema name');
      });
    });
  });

  describe('having undefined schema', () => {
    describe('when called', () => {
      let metadataFixture: SchemaMetadata;
      let optionsFixture: SchemaDecoratorOptions | undefined;
      let undefinedSchemaFixture: OpenApi3Dot1SchemaObject | undefined;

      let result: unknown;

      beforeAll(() => {
        metadataFixture = {
          name: undefined,
          properties: new Map(),
          references: new Map(),
          schema: schemaFixture,
        };

        optionsFixture = undefined;
        undefinedSchemaFixture = undefined;

        result = updateSchemaMetadata(
          undefinedSchemaFixture,
          optionsFixture,
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

  describe('having options without name property and metadata with undefined name', () => {
    describe('when called', () => {
      let metadataFixture: SchemaMetadata;
      let optionsFixture: SchemaDecoratorOptions;

      let result: unknown;

      beforeAll(() => {
        metadataFixture = {
          name: undefined,
          properties: new Map(),
          references: new Map(),
          schema: undefined,
        };

        optionsFixture = {};

        result = updateSchemaMetadata(
          schemaFixture,
          optionsFixture,
          targetFixture,
        )(metadataFixture);
      });

      afterAll(() => {
        vitest.clearAllMocks();
      });

      it('should set metadata.schema', () => {
        expect(metadataFixture.schema).toBe(schemaFixture);
      });

      it('should not change metadata.name', () => {
        expect(metadataFixture.name).toBeUndefined();
      });

      it('should return metadata', () => {
        expect(result).toBe(metadataFixture);
      });
    });
  });
});
