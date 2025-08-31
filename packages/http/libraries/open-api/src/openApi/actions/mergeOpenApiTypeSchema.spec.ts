import {
  afterAll,
  beforeAll,
  describe,
  expect,
  it,
  MockedFunction,
  vitest,
} from 'vitest';

import { escapeJsonPointerFragments } from '@inversifyjs/json-schema-pointer';
import { JsonSchema } from '@inversifyjs/json-schema-types/2020-12';
import { OpenApi3Dot1SchemaObject } from '@inversifyjs/open-api-types/v3Dot1';
import { getOwnReflectMetadata } from '@inversifyjs/reflect-metadata-utils';

import { tryBuildSchemaFromWellKnownType } from '../../metadata/calculations/tryBuildSchemaFromWellKnownType';
import { SchemaMetadata } from '../../metadata/models/SchemaMetadata';
import { getSchemaMetadata } from '../calculations/getSchemaMetadata';
import { mergeOpenApiTypeSchema } from './mergeOpenApiTypeSchema';

vitest.mock('@inversifyjs/json-schema-pointer');
vitest.mock('@inversifyjs/reflect-metadata-utils');
vitest.mock('../../metadata/calculations/tryBuildSchemaFromWellKnownType');
vitest.mock('../calculations/getSchemaMetadata');

describe(mergeOpenApiTypeSchema, () => {
  let escapeJsonPointerFragmentsMock: MockedFunction<
    typeof escapeJsonPointerFragments
  >;
  let getOwnReflectMetadataMock: MockedFunction<typeof getOwnReflectMetadata>;
  let getSchemaMetadataMock: MockedFunction<typeof getSchemaMetadata>;
  let tryBuildSchemaFromWellKnownTypeMock: MockedFunction<
    typeof tryBuildSchemaFromWellKnownType
  >;

  beforeAll(() => {
    escapeJsonPointerFragmentsMock = vitest.mocked(escapeJsonPointerFragments);
    getOwnReflectMetadataMock = vitest.mocked(getOwnReflectMetadata);
    getSchemaMetadataMock = vitest.mocked(getSchemaMetadata);
    tryBuildSchemaFromWellKnownTypeMock = vitest.mocked(
      tryBuildSchemaFromWellKnownType,
    );
  });

  describe('.mergeOpenApiTypeSchema', () => {
    describe('having a type', () => {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
      let typeFixture: Function;

      beforeAll(() => {
        typeFixture = class Type {};
      });

      describe('when called, and getSchemaMetadata() returns SchemaMetadata with no schema nor properties and existing name in schemas object', () => {
        let schemasObjectFixture: Record<string, OpenApi3Dot1SchemaObject>;
        let schemaMetadataFixture: SchemaMetadata;

        beforeAll(() => {
          schemasObjectFixture = {
            Type: {
              properties: {},
              type: 'object',
            },
          };

          schemaMetadataFixture = {
            name: 'Type',
            properties: new Map(),
            references: new Set(),
            schema: undefined,
          };

          getSchemaMetadataMock.mockReturnValueOnce(schemaMetadataFixture);

          mergeOpenApiTypeSchema(schemasObjectFixture, typeFixture);
        });

        afterAll(() => {
          vitest.clearAllMocks();
        });

        it('should call getSchemaMetadata()', () => {
          expect(getSchemaMetadataMock).toHaveBeenCalledTimes(1);
          expect(getSchemaMetadataMock).toHaveBeenCalledWith(typeFixture);
        });

        it('should not modify schemasObject', () => {
          expect(schemasObjectFixture).toStrictEqual({
            Type: {
              properties: {},
              type: 'object',
            },
          });
        });
      });

      describe('when called, and getSchemaMetadata() returns SchemaMetadata with no schema nor properties', () => {
        let schemasObjectFixture: Record<string, OpenApi3Dot1SchemaObject>;
        let schemaMetadataFixture: SchemaMetadata;

        beforeAll(() => {
          schemasObjectFixture = {
            Type: {
              properties: {},
              type: 'object',
            },
          };

          schemaMetadataFixture = {
            name: 'NewType',
            properties: new Map(),
            references: new Set(),
            schema: undefined,
          };

          getSchemaMetadataMock.mockReturnValueOnce(schemaMetadataFixture);

          mergeOpenApiTypeSchema(schemasObjectFixture, typeFixture);
        });

        afterAll(() => {
          vitest.clearAllMocks();
        });

        it('should call getSchemaMetadata()', () => {
          expect(getSchemaMetadataMock).toHaveBeenCalledTimes(1);
          expect(getSchemaMetadataMock).toHaveBeenCalledWith(typeFixture);
        });

        it('should modify schemasObject', () => {
          expect(schemasObjectFixture).toStrictEqual({
            NewType: {
              additionalProperties: false,
              properties: {},
              type: 'object',
            },
            Type: {
              properties: {},
              type: 'object',
            },
          });
        });
      });

      describe('when called, and getSchemaMetadata() returns SchemaMetadata with no name nor schema nor properties', () => {
        let schemasObjectFixture: Record<string, OpenApi3Dot1SchemaObject>;
        let schemaMetadataFixture: SchemaMetadata;

        beforeAll(() => {
          schemasObjectFixture = {
            Type: {
              properties: {},
              type: 'object',
            },
          };

          schemaMetadataFixture = {
            name: undefined,
            properties: new Map(),
            references: new Set(),
            schema: undefined,
          };

          getSchemaMetadataMock.mockReturnValueOnce(schemaMetadataFixture);

          mergeOpenApiTypeSchema(schemasObjectFixture, typeFixture);
        });

        afterAll(() => {
          vitest.clearAllMocks();
        });

        it('should call getSchemaMetadata()', () => {
          expect(getSchemaMetadataMock).toHaveBeenCalledTimes(1);
          expect(getSchemaMetadataMock).toHaveBeenCalledWith(typeFixture);
        });

        it('should not modify schemasObject', () => {
          expect(schemasObjectFixture).toStrictEqual({
            Type: {
              properties: {},
              type: 'object',
            },
          });
        });
      });

      describe('when called, and getSchemaMetadata() returns SchemaMetadata with defined name and properties', () => {
        let schemasObjectFixture: Record<string, OpenApi3Dot1SchemaObject>;
        let propertySchemaFixture: JsonSchema;
        let schemaMetadataFixture: SchemaMetadata;

        beforeAll(() => {
          schemasObjectFixture = {};

          propertySchemaFixture = {
            maxLength: 100,
            type: 'string',
          };

          schemaMetadataFixture = {
            name: 'TypeWithDefinedSchemas',
            properties: new Map([
              [
                'stringProperty',
                {
                  schema: propertySchemaFixture,
                },
              ],
            ]),
            references: new Set(),
            schema: undefined,
          };

          getSchemaMetadataMock.mockReturnValueOnce(schemaMetadataFixture);

          mergeOpenApiTypeSchema(schemasObjectFixture, typeFixture);
        });

        afterAll(() => {
          vitest.clearAllMocks();
        });

        it('should call getSchemaMetadata()', () => {
          expect(getSchemaMetadataMock).toHaveBeenCalledTimes(1);
          expect(getSchemaMetadataMock).toHaveBeenCalledWith(typeFixture);
        });

        it('should add schema to schemasObject with defined property schemas', () => {
          expect(schemasObjectFixture).toStrictEqual({
            TypeWithDefinedSchemas: {
              additionalProperties: false,
              properties: {
                stringProperty: propertySchemaFixture,
              },
              type: 'object',
            },
          });
        });

        it('should not call getOwnReflectMetadata()', () => {
          expect(getOwnReflectMetadataMock).not.toHaveBeenCalled();
        });

        it('should not call tryBuildSchemaFromWellKnownType()', () => {
          expect(tryBuildSchemaFromWellKnownTypeMock).not.toHaveBeenCalled();
        });
      });

      describe('when called and getSchemaMetadata() returns SchemaMetadata with properties with undefined schemas and getOwnReflectMetadata() returns undefined', () => {
        let schemasObjectFixture: Record<string, OpenApi3Dot1SchemaObject>;
        let schemaMetadataFixture: SchemaMetadata;

        let result: unknown;

        beforeAll(() => {
          schemasObjectFixture = {};

          schemaMetadataFixture = {
            name: 'TypeWithUndefinedDesignType',
            properties: new Map([
              [
                'unknownProperty',
                {
                  schema: undefined,
                },
              ],
            ]),
            references: new Set(),
            schema: undefined,
          };

          getSchemaMetadataMock.mockReturnValueOnce(schemaMetadataFixture);
          getOwnReflectMetadataMock.mockReturnValueOnce(undefined);

          try {
            mergeOpenApiTypeSchema(schemasObjectFixture, typeFixture);
          } catch (error) {
            result = error;
          }
        });

        afterAll(() => {
          vitest.clearAllMocks();
        });

        it('should call getSchemaMetadata()', () => {
          expect(getSchemaMetadataMock).toHaveBeenCalledTimes(1);
          expect(getSchemaMetadataMock).toHaveBeenCalledWith(typeFixture);
        });

        it('should call getOwnReflectMetadata()', () => {
          expect(getOwnReflectMetadataMock).toHaveBeenCalledTimes(1);
          expect(getOwnReflectMetadataMock).toHaveBeenCalledWith(
            typeFixture,
            'design:type',
            'unknownProperty',
          );
        });

        it('should throw an Error', () => {
          expect(result).toBeInstanceOf(Error);
          expect((result as Error).message).toBe(
            'Unable to determine type for property "Type.unknownProperty"',
          );
        });

        it('should not call tryBuildSchemaFromWellKnownType()', () => {
          expect(tryBuildSchemaFromWellKnownTypeMock).not.toHaveBeenCalled();
        });
      });

      describe('when called and getSchemaMetadataMock() returns SchemaMetadata with property with no schema and tryBuildSchemaFromWellKnownType() returns a schema', () => {
        let schemasObjectFixture: Record<string, OpenApi3Dot1SchemaObject>;
        // eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
        let propertyTypeFixture: Function;
        let schemaMetadataFixture: SchemaMetadata;
        let wellKnownSchemaFixture: JsonSchema;

        beforeAll(() => {
          schemasObjectFixture = {};
          propertyTypeFixture = String;
          schemaMetadataFixture = {
            name: 'TypeWithWellKnownProperties',
            properties: new Map([
              [
                'stringProperty',
                {
                  schema: undefined,
                },
              ],
            ]),
            references: new Set(),
            schema: undefined,
          };
          wellKnownSchemaFixture = {
            type: 'string',
          };

          getSchemaMetadataMock.mockReturnValueOnce(schemaMetadataFixture);
          getOwnReflectMetadataMock.mockReturnValueOnce(propertyTypeFixture);
          tryBuildSchemaFromWellKnownTypeMock.mockReturnValueOnce(
            wellKnownSchemaFixture,
          );

          mergeOpenApiTypeSchema(schemasObjectFixture, typeFixture);
        });

        afterAll(() => {
          vitest.clearAllMocks();
        });

        it('should call getSchemaMetadata()', () => {
          expect(getSchemaMetadataMock).toHaveBeenCalledTimes(1);
          expect(getSchemaMetadataMock).toHaveBeenCalledWith(typeFixture);
        });

        it('should call getOwnReflectMetadata()', () => {
          expect(getOwnReflectMetadataMock).toHaveBeenCalledTimes(1);
          expect(getOwnReflectMetadataMock).toHaveBeenCalledWith(
            typeFixture,
            'design:type',
            'stringProperty',
          );
        });

        it('should call tryBuildSchemaFromWellKnownType()', () => {
          expect(tryBuildSchemaFromWellKnownTypeMock).toHaveBeenCalledTimes(1);
          expect(tryBuildSchemaFromWellKnownTypeMock).toHaveBeenCalledWith(
            propertyTypeFixture,
          );
        });

        it('should add schema to schemasObject with well-known type schema', () => {
          expect(schemasObjectFixture).toStrictEqual({
            TypeWithWellKnownProperties: {
              additionalProperties: false,
              properties: {
                stringProperty: wellKnownSchemaFixture,
              },
              type: 'object',
            },
          });
        });

        it('should not call escapeJsonPointerFragments()', () => {
          expect(escapeJsonPointerFragmentsMock).not.toHaveBeenCalled();
        });
      });

      describe('when called and getSchemaMetadata() returns SchemaMetadata with properties with no schema and tryBuildSchemaFromWellKnownType returns undefined', () => {
        let schemasObjectFixture: Record<string, OpenApi3Dot1SchemaObject>;
        // eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
        let propertyTypeFixture: Function;
        let schemaMetadataFixture: SchemaMetadata;
        let propertySchemaMetadataFixture: SchemaMetadata;
        let escapedPropertySchemaNameFixture: string;

        beforeAll(() => {
          schemasObjectFixture = {};
          propertyTypeFixture = class CustomPropertyType {};
          escapedPropertySchemaNameFixture = 'CustomPropertyType';

          schemaMetadataFixture = {
            name: 'TypeWithCustomProperties',
            properties: new Map([
              [
                'customProperty',
                {
                  schema: undefined,
                },
              ],
            ]),
            references: new Set(),
            schema: undefined,
          };

          propertySchemaMetadataFixture = {
            name: 'CustomPropertyType',
            properties: new Map(),
            references: new Set(),
            schema: undefined,
          };

          getSchemaMetadataMock
            .mockReturnValueOnce(schemaMetadataFixture)
            .mockReturnValueOnce(propertySchemaMetadataFixture)
            .mockReturnValueOnce(propertySchemaMetadataFixture);
          getOwnReflectMetadataMock.mockReturnValueOnce(propertyTypeFixture);
          tryBuildSchemaFromWellKnownTypeMock.mockReturnValueOnce(undefined);
          escapeJsonPointerFragmentsMock.mockReturnValueOnce(
            escapedPropertySchemaNameFixture,
          );

          mergeOpenApiTypeSchema(schemasObjectFixture, typeFixture);
        });

        afterAll(() => {
          vitest.clearAllMocks();
        });

        it('should call getSchemaMetadata() three times', () => {
          expect(getSchemaMetadataMock).toHaveBeenCalledTimes(3);
          expect(getSchemaMetadataMock).toHaveBeenNthCalledWith(1, typeFixture);
          expect(getSchemaMetadataMock).toHaveBeenNthCalledWith(
            2,
            propertyTypeFixture,
          );
          expect(getSchemaMetadataMock).toHaveBeenNthCalledWith(
            3,
            propertyTypeFixture,
          );
        });

        it('should call getOwnReflectMetadata()', () => {
          expect(getOwnReflectMetadataMock).toHaveBeenCalledTimes(1);
          expect(getOwnReflectMetadataMock).toHaveBeenCalledWith(
            typeFixture,
            'design:type',
            'customProperty',
          );
        });

        it('should call tryBuildSchemaFromWellKnownType()', () => {
          expect(tryBuildSchemaFromWellKnownTypeMock).toHaveBeenCalledTimes(1);
          expect(tryBuildSchemaFromWellKnownTypeMock).toHaveBeenCalledWith(
            propertyTypeFixture,
          );
        });

        it('should call escapeJsonPointerFragments()', () => {
          expect(escapeJsonPointerFragmentsMock).toHaveBeenCalledTimes(1);
          expect(escapeJsonPointerFragmentsMock).toHaveBeenCalledWith(
            'CustomPropertyType',
          );
        });

        it('should add schema to schemasObject with property reference', () => {
          expect(schemasObjectFixture).toStrictEqual({
            CustomPropertyType: {
              additionalProperties: false,
              properties: {},
              type: 'object',
            },
            TypeWithCustomProperties: {
              additionalProperties: false,
              properties: {
                customProperty: {
                  $ref: '#/components/schemas/CustomPropertyType',
                },
              },
              type: 'object',
            },
          });
        });
      });

      describe('when called and getSchemaMetadata() returns SchemaMetadata with properties with no schema and later SchemaMetadata with no name and tryBuildSchemaFromWellKnownType returns undefined', () => {
        let schemasObjectFixture: Record<string, OpenApi3Dot1SchemaObject>;
        // eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
        let propertyTypeFixture: Function;
        let schemaMetadataFixture: SchemaMetadata;
        let propertySchemaMetadataFixture: SchemaMetadata;
        let escapedPropertySchemaNameFixture: string;

        beforeAll(() => {
          schemasObjectFixture = {};
          propertyTypeFixture = class CustomPropertyType {};
          escapedPropertySchemaNameFixture = 'CustomPropertyType';

          schemaMetadataFixture = {
            name: 'TypeWithUnnamedProperties',
            properties: new Map([
              [
                'customProperty',
                {
                  schema: undefined,
                },
              ],
            ]),
            references: new Set(),
            schema: undefined,
          };

          propertySchemaMetadataFixture = {
            name: undefined,
            properties: new Map(),
            references: new Set(),
            schema: undefined,
          };

          getSchemaMetadataMock
            .mockReturnValueOnce(schemaMetadataFixture)
            .mockReturnValueOnce(propertySchemaMetadataFixture)
            .mockReturnValueOnce(propertySchemaMetadataFixture);
          getOwnReflectMetadataMock.mockReturnValueOnce(propertyTypeFixture);
          tryBuildSchemaFromWellKnownTypeMock.mockReturnValueOnce(undefined);
          escapeJsonPointerFragmentsMock.mockReturnValueOnce(
            escapedPropertySchemaNameFixture,
          );

          mergeOpenApiTypeSchema(schemasObjectFixture, typeFixture);
        });

        afterAll(() => {
          vitest.clearAllMocks();
        });

        it('should call getSchemaMetadata() three times', () => {
          expect(getSchemaMetadataMock).toHaveBeenCalledTimes(3);
          expect(getSchemaMetadataMock).toHaveBeenNthCalledWith(1, typeFixture);
          expect(getSchemaMetadataMock).toHaveBeenNthCalledWith(
            2,
            propertyTypeFixture,
          );
          expect(getSchemaMetadataMock).toHaveBeenNthCalledWith(
            3,
            propertyTypeFixture,
          );
        });

        it('should call getOwnReflectMetadata()', () => {
          expect(getOwnReflectMetadataMock).toHaveBeenCalledTimes(1);
          expect(getOwnReflectMetadataMock).toHaveBeenCalledWith(
            typeFixture,
            'design:type',
            'customProperty',
          );
        });

        it('should call tryBuildSchemaFromWellKnownType()', () => {
          expect(tryBuildSchemaFromWellKnownTypeMock).toHaveBeenCalledTimes(1);
          expect(tryBuildSchemaFromWellKnownTypeMock).toHaveBeenCalledWith(
            propertyTypeFixture,
          );
        });

        it('should call escapeJsonPointerFragments() with propertyType.name', () => {
          expect(escapeJsonPointerFragmentsMock).toHaveBeenCalledTimes(1);
          expect(escapeJsonPointerFragmentsMock).toHaveBeenCalledWith(
            'CustomPropertyType',
          );
        });

        it('should add schema to schemasObject with property reference using propertyType.name', () => {
          expect(schemasObjectFixture).toStrictEqual({
            CustomPropertyType: {
              additionalProperties: false,
              properties: {},
              type: 'object',
            },
            TypeWithUnnamedProperties: {
              additionalProperties: false,
              properties: {
                customProperty: {
                  $ref: '#/components/schemas/CustomPropertyType',
                },
              },
              type: 'object',
            },
          });
        });
      });
    });
  });
});
