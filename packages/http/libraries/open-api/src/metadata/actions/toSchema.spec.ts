import {
  afterAll,
  beforeAll,
  describe,
  expect,
  it,
  Mock,
  vitest,
} from 'vitest';

vitest.mock('@inversifyjs/reflect-metadata-utils');
vitest.mock('../calculations/buildDefaultSchemaMetadata');
vitest.mock('./updateSchemaMetadataReferences');

import {
  getOwnReflectMetadata,
  updateOwnReflectMetadata,
} from '@inversifyjs/reflect-metadata-utils';

import { schemaOpenApiMetadataReflectKey } from '../../reflectMetadata/data/schemaOpenApiMetadataReflectKey';
import { buildDefaultSchemaMetadata } from '../calculations/buildDefaultSchemaMetadata';
import { SchemaMetadata } from '../models/SchemaMetadata';
import { toSchema } from './toSchema';
import { updateSchemaMetadataReferences } from './updateSchemaMetadataReferences';

describe(toSchema, () => {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
  let targetFixture: Function;
  let getOwnReflectMetadataMock: Mock;
  let updateOwnReflectMetadataMock: Mock;
  let buildDefaultSchemaMetadataMock: Mock;
  let updateSchemaMetadataReferencesMock: Mock;

  beforeAll(() => {
    targetFixture = class TestTarget {};
    getOwnReflectMetadataMock = vitest.mocked(getOwnReflectMetadata);
    updateOwnReflectMetadataMock = vitest.mocked(updateOwnReflectMetadata);
    buildDefaultSchemaMetadataMock = vitest.mocked(buildDefaultSchemaMetadata);
    updateSchemaMetadataReferencesMock = vitest.mocked(
      updateSchemaMetadataReferences,
    );
  });

  describe('when called and getOwnReflectMetadata returns undefined', () => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
    let typeFixture: Function;
    let mockUpdateFunction: Mock;

    let result: unknown;

    beforeAll(() => {
      typeFixture = class TestType {};
      mockUpdateFunction = vitest.fn();

      getOwnReflectMetadataMock.mockReturnValueOnce(undefined);
      updateSchemaMetadataReferencesMock.mockReturnValueOnce(
        mockUpdateFunction,
      );

      result = toSchema(targetFixture)(typeFixture);
    });

    afterAll(() => {
      vitest.clearAllMocks();
    });

    it('should call getOwnReflectMetadata()', () => {
      expect(getOwnReflectMetadataMock).toHaveBeenCalledTimes(1);
      expect(getOwnReflectMetadataMock).toHaveBeenCalledWith(
        typeFixture,
        schemaOpenApiMetadataReflectKey,
      );
    });

    it('should call updateOwnReflectMetadata()', () => {
      expect(updateOwnReflectMetadataMock).toHaveBeenCalledTimes(1);
      expect(updateOwnReflectMetadataMock).toHaveBeenCalledWith(
        targetFixture,
        schemaOpenApiMetadataReflectKey,
        buildDefaultSchemaMetadataMock,
        mockUpdateFunction,
      );
    });

    it('should call updateSchemaMetadataReferences()', () => {
      expect(updateSchemaMetadataReferencesMock).toHaveBeenCalledTimes(1);
      expect(updateSchemaMetadataReferencesMock).toHaveBeenCalledWith(
        typeFixture.name,
        typeFixture,
      );
    });

    it('should return an OpenApi3Dot1SchemaObject with $ref using type.name', () => {
      expect(result).toStrictEqual({
        $ref: `#/components/schemas/${typeFixture.name}`,
      });
    });
  });

  describe('when called and getOwnReflectMetadata returns metadata with undefined name', () => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
    let typeFixture: Function;
    let metadataWithUndefinedName: SchemaMetadata;
    let mockUpdateFunction: Mock;

    let result: unknown;

    beforeAll(() => {
      typeFixture = class TestType {};
      mockUpdateFunction = vitest.fn();
      metadataWithUndefinedName = {
        name: undefined,
        properties: new Map(),
        references: new Map(),
        schema: undefined,
      };

      getOwnReflectMetadataMock.mockReturnValueOnce(metadataWithUndefinedName);
      updateSchemaMetadataReferencesMock.mockReturnValueOnce(
        mockUpdateFunction,
      );

      result = toSchema(targetFixture)(typeFixture);
    });

    afterAll(() => {
      vitest.clearAllMocks();
    });

    it('should call getOwnReflectMetadata()', () => {
      expect(getOwnReflectMetadataMock).toHaveBeenCalledTimes(1);
      expect(getOwnReflectMetadataMock).toHaveBeenCalledWith(
        typeFixture,
        schemaOpenApiMetadataReflectKey,
      );
    });

    it('should call updateOwnReflectMetadata()', () => {
      expect(updateOwnReflectMetadataMock).toHaveBeenCalledTimes(1);
      expect(updateOwnReflectMetadataMock).toHaveBeenCalledWith(
        targetFixture,
        schemaOpenApiMetadataReflectKey,
        buildDefaultSchemaMetadataMock,
        mockUpdateFunction,
      );
    });

    it('should call updateSchemaMetadataReferences()', () => {
      expect(updateSchemaMetadataReferencesMock).toHaveBeenCalledTimes(1);
      expect(updateSchemaMetadataReferencesMock).toHaveBeenCalledWith(
        typeFixture.name,
        typeFixture,
      );
    });

    it('should return an OpenApi3Dot1SchemaObject with $ref using type.name', () => {
      expect(result).toStrictEqual({
        $ref: `#/components/schemas/${typeFixture.name}`,
      });
    });
  });

  describe('when called and getOwnReflectMetadata returns metadata with name', () => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
    let typeFixture: Function;
    let metadataWithName: SchemaMetadata;
    let nameFixture: string;
    let mockUpdateFunction: Mock;

    let result: unknown;

    beforeAll(() => {
      typeFixture = class TestType {};
      nameFixture = 'CustomSchemaName';
      mockUpdateFunction = vitest.fn();
      metadataWithName = {
        name: nameFixture,
        properties: new Map(),
        references: new Map(),
        schema: undefined,
      };

      getOwnReflectMetadataMock.mockReturnValueOnce(metadataWithName);
      updateSchemaMetadataReferencesMock.mockReturnValueOnce(
        mockUpdateFunction,
      );

      result = toSchema(targetFixture)(typeFixture);
    });

    afterAll(() => {
      vitest.clearAllMocks();
    });

    it('should call getOwnReflectMetadata()', () => {
      expect(getOwnReflectMetadataMock).toHaveBeenCalledTimes(1);
      expect(getOwnReflectMetadataMock).toHaveBeenCalledWith(
        typeFixture,
        schemaOpenApiMetadataReflectKey,
      );
    });

    it('should call updateOwnReflectMetadata()', () => {
      expect(updateOwnReflectMetadataMock).toHaveBeenCalledTimes(1);
      expect(updateOwnReflectMetadataMock).toHaveBeenCalledWith(
        targetFixture,
        schemaOpenApiMetadataReflectKey,
        buildDefaultSchemaMetadataMock,
        mockUpdateFunction,
      );
    });

    it('should call updateSchemaMetadataReferences()', () => {
      expect(updateSchemaMetadataReferencesMock).toHaveBeenCalledTimes(1);
      expect(updateSchemaMetadataReferencesMock).toHaveBeenCalledWith(
        nameFixture,
        typeFixture,
      );
    });

    it('should return an OpenApi3Dot1SchemaObject with $ref using metadata.name', () => {
      expect(result).toStrictEqual({
        $ref: `#/components/schemas/${nameFixture}`,
      });
    });
  });
});
