import { afterAll, beforeAll, describe, expect, it, vitest } from 'vitest';

import { SchemaDecoratorOptions } from '../models/SchemaDecoratorOptions';
import { SchemaMetadata } from '../models/SchemaMetadata';
import { updateSchemaMetadataName } from './updateSchemaMetadataName';

describe(updateSchemaMetadataName, () => {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
  let targetFixture: Function;

  beforeAll(() => {
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

        result = updateSchemaMetadataName(
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

        result = updateSchemaMetadataName(
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

        result = updateSchemaMetadataName(
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
          updateSchemaMetadataName(
            optionsFixture,
            targetFixture,
          )(metadataFixture),
        ).toThrow('Cannot redefine "TestClass" schema name');
      });
    });
  });
});
