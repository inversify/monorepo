import {
  afterAll,
  beforeAll,
  describe,
  expect,
  it,
  Mock,
  vitest,
} from 'vitest';

vitest.mock('@inversifyjs/json-schema-pointer');
vitest.mock('@inversifyjs/reflect-metadata-utils');
vitest.mock('../calculations/tryBuildSchemaFromWellKnownType');

import { escapeJsonPointerFragments } from '@inversifyjs/json-schema-pointer';
import { getOwnReflectMetadata } from '@inversifyjs/reflect-metadata-utils';

import { schemaOpenApiMetadataReflectKey } from '../../reflectMetadata/data/schemaOpenApiMetadataReflectKey';
import { tryBuildSchemaFromWellKnownType } from '../calculations/tryBuildSchemaFromWellKnownType';
import { SchemaMetadata } from '../models/SchemaMetadata';
import { toSchema } from './toSchema';

describe(toSchema, () => {
  let updateMetadataReferencesMock: Mock;
  let escapeJsonPointerFragmentsMock: Mock;
  let getOwnReflectMetadataMock: Mock;
  let tryBuildSchemaFromWellKnownTypeMock: Mock;

  beforeAll(() => {
    updateMetadataReferencesMock = vitest.fn();
    escapeJsonPointerFragmentsMock = vitest.mocked(escapeJsonPointerFragments);
    getOwnReflectMetadataMock = vitest.mocked(getOwnReflectMetadata);
    tryBuildSchemaFromWellKnownTypeMock = vitest.mocked(
      tryBuildSchemaFromWellKnownType,
    );
  });

  describe('when called, and getOwnReflectMetadata() returns undefined', () => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
    let typeFixture: Function;
    let escapedNameFixture: string;

    let result: unknown;

    beforeAll(() => {
      typeFixture = class TestType {};
      escapedNameFixture = 'TestType';

      getOwnReflectMetadataMock.mockReturnValueOnce(undefined);
      tryBuildSchemaFromWellKnownTypeMock.mockReturnValueOnce(undefined);
      escapeJsonPointerFragmentsMock.mockReturnValueOnce(escapedNameFixture);

      result = toSchema(updateMetadataReferencesMock)(typeFixture);
    });

    afterAll(() => {
      vitest.clearAllMocks();
    });

    it('should call tryBuildSchemaFromWellKnownType()', () => {
      expect(
        tryBuildSchemaFromWellKnownTypeMock,
      ).toHaveBeenCalledExactlyOnceWith(typeFixture);
    });

    it('should call getOwnReflectMetadata()', () => {
      expect(getOwnReflectMetadataMock).toHaveBeenCalledExactlyOnceWith(
        typeFixture,
        schemaOpenApiMetadataReflectKey,
      );
    });

    it('should call updateMetadataReferences()', () => {
      expect(updateMetadataReferencesMock).toHaveBeenCalledExactlyOnceWith(
        typeFixture,
      );
    });

    it('should call escapeJsonPointerFragments()', () => {
      expect(escapeJsonPointerFragmentsMock).toHaveBeenCalledExactlyOnceWith(
        typeFixture.name,
      );
    });

    it('should return an OpenApi3Dot1SchemaObject with $ref using escaped type.name', () => {
      expect(result).toStrictEqual({
        $ref: `#/components/schemas/${escapedNameFixture}`,
      });
    });
  });

  describe('when called, and getOwnReflectMetadata() returns metadata with undefined name', () => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
    let typeFixture: Function;
    let metadataWithUndefinedName: SchemaMetadata;
    let escapedNameFixture: string;

    let result: unknown;

    beforeAll(() => {
      typeFixture = class TestType {};
      escapedNameFixture = 'TestType';
      metadataWithUndefinedName = {
        customAttributes: undefined,
        name: undefined,
        properties: new Map(),
        references: new Set(),
        schema: undefined,
      };

      getOwnReflectMetadataMock.mockReturnValueOnce(metadataWithUndefinedName);
      tryBuildSchemaFromWellKnownTypeMock.mockReturnValueOnce(undefined);
      escapeJsonPointerFragmentsMock.mockReturnValueOnce(escapedNameFixture);

      result = toSchema(updateMetadataReferencesMock)(typeFixture);
    });

    afterAll(() => {
      vitest.clearAllMocks();
    });

    it('should call tryBuildSchemaFromWellKnownType()', () => {
      expect(
        tryBuildSchemaFromWellKnownTypeMock,
      ).toHaveBeenCalledExactlyOnceWith(typeFixture);
    });

    it('should call getOwnReflectMetadata()', () => {
      expect(getOwnReflectMetadataMock).toHaveBeenCalledExactlyOnceWith(
        typeFixture,
        schemaOpenApiMetadataReflectKey,
      );
    });

    it('should call updateMetadataReferences()', () => {
      expect(updateMetadataReferencesMock).toHaveBeenCalledExactlyOnceWith(
        typeFixture,
      );
    });

    it('should call escapeJsonPointerFragments()', () => {
      expect(escapeJsonPointerFragmentsMock).toHaveBeenCalledExactlyOnceWith(
        typeFixture.name,
      );
    });

    it('should return an OpenApi3Dot1SchemaObject with $ref using escaped type.name', () => {
      expect(result).toStrictEqual({
        $ref: `#/components/schemas/${escapedNameFixture}`,
      });
    });
  });

  describe('when called, and getOwnReflectMetadata() returns metadata with name', () => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
    let typeFixture: Function;
    let metadataWithName: SchemaMetadata;
    let nameFixture: string;
    let escapedNameFixture: string;

    let result: unknown;

    beforeAll(() => {
      typeFixture = class TestType {};
      nameFixture = 'CustomSchemaName';
      escapedNameFixture = 'CustomSchemaName';
      metadataWithName = {
        customAttributes: undefined,
        name: nameFixture,
        properties: new Map(),
        references: new Set(),
        schema: undefined,
      };

      getOwnReflectMetadataMock.mockReturnValueOnce(metadataWithName);
      tryBuildSchemaFromWellKnownTypeMock.mockReturnValueOnce(undefined);
      escapeJsonPointerFragmentsMock.mockReturnValueOnce(escapedNameFixture);

      result = toSchema(updateMetadataReferencesMock)(typeFixture);
    });

    afterAll(() => {
      vitest.clearAllMocks();
    });

    it('should call tryBuildSchemaFromWellKnownType()', () => {
      expect(
        tryBuildSchemaFromWellKnownTypeMock,
      ).toHaveBeenCalledExactlyOnceWith(typeFixture);
    });

    it('should call getOwnReflectMetadata()', () => {
      expect(getOwnReflectMetadataMock).toHaveBeenCalledExactlyOnceWith(
        typeFixture,
        schemaOpenApiMetadataReflectKey,
      );
    });

    it('should call updateMetadataReferences()', () => {
      expect(updateMetadataReferencesMock).toHaveBeenCalledExactlyOnceWith(
        typeFixture,
      );
    });

    it('should call escapeJsonPointerFragments()', () => {
      expect(escapeJsonPointerFragmentsMock).toHaveBeenCalledExactlyOnceWith(
        nameFixture,
      );
    });

    it('should return an OpenApi3Dot1SchemaObject with $ref using escaped metadata.name', () => {
      expect(result).toStrictEqual({
        $ref: `#/components/schemas/${escapedNameFixture}`,
      });
    });
  });

  describe('when called, and tryBuildSchemaFromWellKnownType returns a schema', () => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
    let typeFixture: Function;
    let schemaFixture: unknown;

    let result: unknown;

    beforeAll(() => {
      typeFixture = class TestType {};
      schemaFixture = { type: 'string' };

      getOwnReflectMetadataMock.mockReturnValueOnce(undefined);
      tryBuildSchemaFromWellKnownTypeMock.mockReturnValueOnce(schemaFixture);

      result = toSchema(updateMetadataReferencesMock)(typeFixture);
    });

    afterAll(() => {
      vitest.clearAllMocks();
    });

    it('should call tryBuildSchemaFromWellKnownType()', () => {
      expect(
        tryBuildSchemaFromWellKnownTypeMock,
      ).toHaveBeenCalledExactlyOnceWith(typeFixture);
    });

    it('should call getOwnReflectMetadata()', () => {
      expect(getOwnReflectMetadataMock).toHaveBeenCalledExactlyOnceWith(
        typeFixture,
        schemaOpenApiMetadataReflectKey,
      );
    });

    it('should not call updateMetadataReferences()', () => {
      expect(updateMetadataReferencesMock).not.toHaveBeenCalled();
    });

    it('should not call escapeJsonPointerFragments()', () => {
      expect(escapeJsonPointerFragmentsMock).not.toHaveBeenCalled();
    });

    it('should return the schema from tryBuildSchemaFromWellKnownType', () => {
      expect(result).toBe(schemaFixture);
    });
  });
});
