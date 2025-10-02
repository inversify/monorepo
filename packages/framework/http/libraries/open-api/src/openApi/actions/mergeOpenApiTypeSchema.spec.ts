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
            customAttributes: undefined,
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
          expect(getSchemaMetadataMock).toHaveBeenCalledExactlyOnceWith(
            typeFixture,
          );
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
            customAttributes: undefined,
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
          expect(getSchemaMetadataMock).toHaveBeenCalledExactlyOnceWith(
            typeFixture,
          );
        });

        it('should modify schemasObject', () => {
          const expectedTypes: Record<string, OpenApi3Dot1SchemaObject> = {
            NewType: {
              properties: {},
              type: 'object',
            },
            Type: {
              properties: {},
              type: 'object',
            },
          };

          expect(schemasObjectFixture).toStrictEqual(expectedTypes);
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
            customAttributes: undefined,
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
          expect(getSchemaMetadataMock).toHaveBeenCalledExactlyOnceWith(
            typeFixture,
          );
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

      describe('when called, and getSchemaMetadata() returns SchemaMetadata with no schema nor properties and customAttributes', () => {
        let schemasObjectFixture: Record<string, OpenApi3Dot1SchemaObject>;
        let customAttributesFixture: OpenApi3Dot1SchemaObject;
        let schemaMetadataFixture: SchemaMetadata;

        beforeAll(() => {
          schemasObjectFixture = {};

          customAttributesFixture = {
            description: 'A custom type with attributes',
            example: 'custom-example',
          };

          schemaMetadataFixture = {
            customAttributes: customAttributesFixture,
            name: 'TypeWithCustomAttributes',
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
          expect(getSchemaMetadataMock).toHaveBeenCalledExactlyOnceWith(
            typeFixture,
          );
        });

        it('should add schema to schemasObject with merged customAttributes', () => {
          const expectedTypes: Record<string, OpenApi3Dot1SchemaObject> = {
            TypeWithCustomAttributes: {
              description: 'A custom type with attributes',
              example: 'custom-example',
              properties: {},
              type: 'object',
            },
          };

          expect(schemasObjectFixture).toStrictEqual(expectedTypes);
        });

        it('should not call getOwnReflectMetadata()', () => {
          expect(getOwnReflectMetadataMock).not.toHaveBeenCalled();
        });

        it('should not call tryBuildSchemaFromWellKnownType()', () => {
          expect(tryBuildSchemaFromWellKnownTypeMock).not.toHaveBeenCalled();
        });
      });

      describe('when called, and getSchemaMetadata() returns SchemaMetadata with schema and no properties', () => {
        let schemasObjectFixture: Record<string, OpenApi3Dot1SchemaObject>;
        let schemaFixture: JsonSchema;
        let schemaMetadataFixture: SchemaMetadata;

        beforeAll(() => {
          schemasObjectFixture = {};

          schemaFixture = {
            pattern: '^[A-Z][a-z]*$',
            type: 'string',
          };

          schemaMetadataFixture = {
            customAttributes: undefined,
            name: 'TypeWithSchemaOnly',
            properties: new Map(),
            references: new Set(),
            schema: schemaFixture,
          };

          getSchemaMetadataMock.mockReturnValueOnce(schemaMetadataFixture);

          mergeOpenApiTypeSchema(schemasObjectFixture, typeFixture);
        });

        afterAll(() => {
          vitest.clearAllMocks();
        });

        it('should call getSchemaMetadata()', () => {
          expect(getSchemaMetadataMock).toHaveBeenCalledExactlyOnceWith(
            typeFixture,
          );
        });

        it('should add schema to schemasObject using the schema directly', () => {
          const expectedTypes: Record<string, OpenApi3Dot1SchemaObject> = {
            TypeWithSchemaOnly: schemaFixture,
          };

          expect(schemasObjectFixture).toStrictEqual(expectedTypes);
        });

        it('should not call getOwnReflectMetadata()', () => {
          expect(getOwnReflectMetadataMock).not.toHaveBeenCalled();
        });

        it('should not call tryBuildSchemaFromWellKnownType()', () => {
          expect(tryBuildSchemaFromWellKnownTypeMock).not.toHaveBeenCalled();
        });
      });

      describe('when called, and getSchemaMetadata() returns SchemaMetadata with schema and properties', () => {
        let schemasObjectFixture: Record<string, OpenApi3Dot1SchemaObject>;
        let schemaFixture: JsonSchema;
        let propertySchemaFixture: JsonSchema;
        let schemaMetadataFixture: SchemaMetadata;

        beforeAll(() => {
          schemasObjectFixture = {};

          schemaFixture = {
            required: ['id'],
            type: 'object',
          };

          propertySchemaFixture = {
            minLength: 1,
            type: 'string',
          };

          schemaMetadataFixture = {
            customAttributes: undefined,
            name: 'TypeWithSchemaAndProperties',
            properties: new Map([
              [
                'name',
                {
                  required: false,
                  schema: propertySchemaFixture,
                },
              ],
            ]),
            references: new Set(),
            schema: schemaFixture,
          };

          getSchemaMetadataMock.mockReturnValueOnce(schemaMetadataFixture);

          mergeOpenApiTypeSchema(schemasObjectFixture, typeFixture);
        });

        afterAll(() => {
          vitest.clearAllMocks();
        });

        it('should call getSchemaMetadata()', () => {
          expect(getSchemaMetadataMock).toHaveBeenCalledExactlyOnceWith(
            typeFixture,
          );
        });

        it('should add schema to schemasObject with allOf structure', () => {
          const expectedTypes: Record<string, OpenApi3Dot1SchemaObject> = {
            TypeWithSchemaAndProperties: {
              allOf: [schemaFixture],
              properties: {
                name: propertySchemaFixture,
              },
              type: 'object',
            },
          };

          expect(schemasObjectFixture).toStrictEqual(expectedTypes);
        });

        it('should not call getOwnReflectMetadata()', () => {
          expect(getOwnReflectMetadataMock).not.toHaveBeenCalled();
        });

        it('should not call tryBuildSchemaFromWellKnownType()', () => {
          expect(tryBuildSchemaFromWellKnownTypeMock).not.toHaveBeenCalled();
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
            customAttributes: undefined,
            name: 'TypeWithDefinedSchemas',
            properties: new Map([
              [
                'stringProperty',
                {
                  required: false,
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
          expect(getSchemaMetadataMock).toHaveBeenCalledExactlyOnceWith(
            typeFixture,
          );
        });

        it('should add schema to schemasObject with defined property schemas', () => {
          const expectedTypes: Record<string, OpenApi3Dot1SchemaObject> = {
            TypeWithDefinedSchemas: {
              properties: {
                stringProperty: propertySchemaFixture,
              },
              type: 'object',
            },
          };

          expect(schemasObjectFixture).toStrictEqual(expectedTypes);
        });

        it('should not call getOwnReflectMetadata()', () => {
          expect(getOwnReflectMetadataMock).not.toHaveBeenCalled();
        });

        it('should not call tryBuildSchemaFromWellKnownType()', () => {
          expect(tryBuildSchemaFromWellKnownTypeMock).not.toHaveBeenCalled();
        });
      });

      describe('when called, and getSchemaMetadata() returns SchemaMetadata with no schema and required property', () => {
        let schemasObjectFixture: Record<string, OpenApi3Dot1SchemaObject>;
        let propertySchemaFixture: JsonSchema;
        let schemaMetadataFixture: SchemaMetadata;

        beforeAll(() => {
          schemasObjectFixture = {};

          propertySchemaFixture = {
            type: 'string',
          };

          schemaMetadataFixture = {
            customAttributes: undefined,
            name: 'TypeWithRequiredProperty',
            properties: new Map([
              [
                'requiredProperty',
                {
                  required: true,
                  schema: propertySchemaFixture,
                },
              ],
              [
                'optionalProperty',
                {
                  required: false,
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
          expect(getSchemaMetadataMock).toHaveBeenCalledExactlyOnceWith(
            typeFixture,
          );
        });

        it('should add schema to schemasObject with required properties array', () => {
          const expectedTypes: Record<string, OpenApi3Dot1SchemaObject> = {
            TypeWithRequiredProperty: {
              properties: {
                optionalProperty: propertySchemaFixture,
                requiredProperty: propertySchemaFixture,
              },
              required: ['requiredProperty'],
              type: 'object',
            },
          };

          expect(schemasObjectFixture).toStrictEqual(expectedTypes);
        });

        it('should not call getOwnReflectMetadata()', () => {
          expect(getOwnReflectMetadataMock).not.toHaveBeenCalled();
        });

        it('should not call tryBuildSchemaFromWellKnownType()', () => {
          expect(tryBuildSchemaFromWellKnownTypeMock).not.toHaveBeenCalled();
        });
      });

      describe('when called, and getSchemaMetadata() returns SchemaMetadata with properties with undefined schemas and getOwnReflectMetadata() returns undefined', () => {
        let schemasObjectFixture: Record<string, OpenApi3Dot1SchemaObject>;
        let schemaMetadataFixture: SchemaMetadata;

        let result: unknown;

        beforeAll(() => {
          schemasObjectFixture = {};

          schemaMetadataFixture = {
            customAttributes: undefined,
            name: 'TypeWithUndefinedDesignType',
            properties: new Map([
              [
                'unknownProperty',
                {
                  required: false,
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
          expect(getSchemaMetadataMock).toHaveBeenCalledExactlyOnceWith(
            typeFixture,
          );
        });

        it('should call getOwnReflectMetadata()', () => {
          expect(getOwnReflectMetadataMock).toHaveBeenCalledExactlyOnceWith(
            typeFixture.prototype,
            'design:type',
            'unknownProperty',
          );
        });

        it('should throw an Error', () => {
          expect(result).toBeInstanceOf(Error);
          expect((result as Error).message).toBe(
            '[@inversifyjs/http-open-api] Unable to determine type for property "Type.unknownProperty". Are you enabling "emitDecoratorMetadata" and "experimentalDecorators" TypeScript compiler options?',
          );
        });

        it('should not call tryBuildSchemaFromWellKnownType()', () => {
          expect(tryBuildSchemaFromWellKnownTypeMock).not.toHaveBeenCalled();
        });
      });

      describe('when called, and getSchemaMetadataMock() returns SchemaMetadata with property with no schema and tryBuildSchemaFromWellKnownType() returns a schema', () => {
        let schemasObjectFixture: Record<string, OpenApi3Dot1SchemaObject>;
        // eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
        let propertyTypeFixture: Function;
        let schemaMetadataFixture: SchemaMetadata;
        let wellKnownSchemaFixture: JsonSchema;

        beforeAll(() => {
          schemasObjectFixture = {};
          propertyTypeFixture = String;
          schemaMetadataFixture = {
            customAttributes: undefined,
            name: 'TypeWithWellKnownProperties',
            properties: new Map([
              [
                'stringProperty',
                {
                  required: false,
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
          expect(getSchemaMetadataMock).toHaveBeenCalledExactlyOnceWith(
            typeFixture,
          );
        });

        it('should call getOwnReflectMetadata()', () => {
          expect(getOwnReflectMetadataMock).toHaveBeenCalledExactlyOnceWith(
            typeFixture.prototype,
            'design:type',
            'stringProperty',
          );
        });

        it('should call tryBuildSchemaFromWellKnownType()', () => {
          expect(
            tryBuildSchemaFromWellKnownTypeMock,
          ).toHaveBeenCalledExactlyOnceWith(propertyTypeFixture);
        });

        it('should add schema to schemasObject with well-known type schema', () => {
          const expectedTypes: Record<string, OpenApi3Dot1SchemaObject> = {
            TypeWithWellKnownProperties: {
              properties: {
                stringProperty: wellKnownSchemaFixture,
              },
              type: 'object',
            },
          };

          expect(schemasObjectFixture).toStrictEqual(expectedTypes);
        });

        it('should not call escapeJsonPointerFragments()', () => {
          expect(escapeJsonPointerFragmentsMock).not.toHaveBeenCalled();
        });
      });

      describe('when called, and getSchemaMetadata() returns SchemaMetadata with properties with no schema and tryBuildSchemaFromWellKnownType returns undefined', () => {
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
            customAttributes: undefined,
            name: 'TypeWithCustomProperties',
            properties: new Map([
              [
                'customProperty',
                {
                  required: false,
                  schema: undefined,
                },
              ],
            ]),
            references: new Set(),
            schema: undefined,
          };

          propertySchemaMetadataFixture = {
            customAttributes: undefined,
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
          expect(getOwnReflectMetadataMock).toHaveBeenCalledExactlyOnceWith(
            typeFixture.prototype,
            'design:type',
            'customProperty',
          );
        });

        it('should call tryBuildSchemaFromWellKnownType()', () => {
          expect(
            tryBuildSchemaFromWellKnownTypeMock,
          ).toHaveBeenCalledExactlyOnceWith(propertyTypeFixture);
        });

        it('should call escapeJsonPointerFragments()', () => {
          expect(
            escapeJsonPointerFragmentsMock,
          ).toHaveBeenCalledExactlyOnceWith('CustomPropertyType');
        });

        it('should add schema to schemasObject with property reference', () => {
          const expectedTypes: Record<string, OpenApi3Dot1SchemaObject> = {
            CustomPropertyType: {
              properties: {},
              type: 'object',
            },
            TypeWithCustomProperties: {
              properties: {
                customProperty: {
                  $ref: '#/components/schemas/CustomPropertyType',
                },
              },
              type: 'object',
            },
          };

          expect(schemasObjectFixture).toStrictEqual(expectedTypes);
        });
      });

      describe('when called, and getSchemaMetadata() returns SchemaMetadata with properties with no schema and later SchemaMetadata with no name and tryBuildSchemaFromWellKnownType returns undefined', () => {
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
            customAttributes: undefined,
            name: 'TypeWithUnnamedProperties',
            properties: new Map([
              [
                'customProperty',
                {
                  required: false,
                  schema: undefined,
                },
              ],
            ]),
            references: new Set(),
            schema: undefined,
          };

          propertySchemaMetadataFixture = {
            customAttributes: undefined,
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
          expect(getOwnReflectMetadataMock).toHaveBeenCalledExactlyOnceWith(
            typeFixture.prototype,
            'design:type',
            'customProperty',
          );
        });

        it('should call tryBuildSchemaFromWellKnownType()', () => {
          expect(
            tryBuildSchemaFromWellKnownTypeMock,
          ).toHaveBeenCalledExactlyOnceWith(propertyTypeFixture);
        });

        it('should call escapeJsonPointerFragments() with propertyType.name', () => {
          expect(
            escapeJsonPointerFragmentsMock,
          ).toHaveBeenCalledExactlyOnceWith('CustomPropertyType');
        });

        it('should add schema to schemasObject with property reference using propertyType.name', () => {
          const expectedTypes: Record<string, OpenApi3Dot1SchemaObject> = {
            CustomPropertyType: {
              properties: {},
              type: 'object',
            },
            TypeWithUnnamedProperties: {
              properties: {
                customProperty: {
                  $ref: '#/components/schemas/CustomPropertyType',
                },
              },
              type: 'object',
            },
          };

          expect(schemasObjectFixture).toStrictEqual(expectedTypes);
        });
      });
    });
  });
});
