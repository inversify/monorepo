import { afterAll, beforeAll, describe, expect, it, vitest } from 'vitest';

vitest.mock('@inversifyjs/reflect-metadata-utils');

import { getOwnReflectMetadata } from '@inversifyjs/reflect-metadata-utils';

vitest.mock('../../metadata/calculations/buildDefaultSchemaMetadata');

import { buildDefaultSchemaMetadata } from '../../metadata/calculations/buildDefaultSchemaMetadata';
import { SchemaMetadata } from '../../metadata/models/SchemaMetadata';
import { schemaOpenApiMetadataReflectKey } from '../../reflectMetadata/data/schemaOpenApiMetadataReflectKey';
import { getSchemaMetadata } from './getSchemaMetadata';

describe(getSchemaMetadata, () => {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
  let typeFixture: Function;

  beforeAll(() => {
    typeFixture = class {};
  });

  describe('when called, and getOwnReflectMetadata() returns undefined', () => {
    let schemaMetadataFixture: SchemaMetadata;

    let result: unknown;

    beforeAll(() => {
      schemaMetadataFixture = {
        customAttributes: undefined,
        name: 'TestSchema',
        properties: new Map(),
        references: new Set(),
        schema: undefined,
      };

      vitest
        .mocked(buildDefaultSchemaMetadata)
        .mockReturnValueOnce(schemaMetadataFixture);

      result = getSchemaMetadata(typeFixture);
    });

    afterAll(() => {
      vitest.clearAllMocks();
    });

    it('should call getOwnReflectMetadata()', () => {
      expect(getOwnReflectMetadata).toHaveBeenCalledExactlyOnceWith(
        typeFixture,
        schemaOpenApiMetadataReflectKey,
      );
    });

    it('should call buildDefaultSchemaMetadata()', () => {
      expect(buildDefaultSchemaMetadata).toHaveBeenCalledExactlyOnceWith();
    });

    it('should return SchemaMetadata', () => {
      expect(result).toBe(schemaMetadataFixture);
    });
  });

  describe('when called, and getOwnReflectMetadata() returns SchemaMetadata', () => {
    let schemaMetadataFixture: SchemaMetadata;

    let result: unknown;

    beforeAll(() => {
      schemaMetadataFixture = {
        customAttributes: undefined,
        name: 'TestSchema',
        properties: new Map(),
        references: new Set(),
        schema: undefined,
      };

      vitest
        .mocked(getOwnReflectMetadata)
        .mockReturnValueOnce(schemaMetadataFixture);

      result = getSchemaMetadata(typeFixture);
    });

    afterAll(() => {
      vitest.clearAllMocks();
    });

    it('should call getOwnReflectMetadata()', () => {
      expect(getOwnReflectMetadata).toHaveBeenCalledExactlyOnceWith(
        typeFixture,
        schemaOpenApiMetadataReflectKey,
      );
    });

    it('should not call buildDefaultSchemaMetadata()', () => {
      expect(buildDefaultSchemaMetadata).not.toHaveBeenCalled();
    });

    it('should return SchemaMetadata', () => {
      expect(result).toBe(schemaMetadataFixture);
    });
  });
});
