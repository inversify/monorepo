import { afterAll, beforeAll, describe, expect, it, vitest } from 'vitest';

vitest.mock(import('@inversifyjs/reflect-metadata-utils'));

import { getOwnReflectMetadata } from '@inversifyjs/reflect-metadata-utils';

vitest.mock(import('./buildDefaultSchemaMetadata.js'));

import { schemaOpenApiMetadataReflectKey } from '../../../reflectMetadata/data/v3Dot2/schemaOpenApiMetadataReflectKey.js';
import { type OpenApiSchemaMetadata } from '../../models/v3Dot2/OpenApiSchemaMetadata.js';
import { buildDefaultSchemaMetadata } from './buildDefaultSchemaMetadata.js';
import { getSchemaMetadata } from './getSchemaMetadata.js';

class OpenApiSchemaMetadataFixtures {
  public static get any(): OpenApiSchemaMetadata {
    return {
      customAttributes: undefined,
      name: 'TestSchema',
      properties: new Map(),
      references: new Set(),
      schema: undefined,
    };
  }
}

describe(getSchemaMetadata, () => {
  describe('.getSchemaMetadata', () => {
    describe('having a type', () => {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
      let typeFixture: Function;

      beforeAll(() => {
        typeFixture = class {};
      });

      describe('when called, and getOwnReflectMetadata() returns undefined', () => {
        let schemaMetadataFixture: OpenApiSchemaMetadata;

        let result: unknown;

        beforeAll(() => {
          schemaMetadataFixture = OpenApiSchemaMetadataFixtures.any;

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
        let schemaMetadataFixture: OpenApiSchemaMetadata;

        let result: unknown;

        beforeAll(() => {
          schemaMetadataFixture = OpenApiSchemaMetadataFixtures.any;

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
  });
});
