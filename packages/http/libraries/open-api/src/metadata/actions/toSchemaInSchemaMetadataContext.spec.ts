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
vitest.mock('../calculations/buildDefaultSchemaMetadata');
vitest.mock('./updateSchemaMetadataReferences');

import { escapeJsonPointerFragments } from '@inversifyjs/json-schema-pointer';
import {
  getOwnReflectMetadata,
  updateOwnReflectMetadata,
} from '@inversifyjs/reflect-metadata-utils';

import { schemaOpenApiMetadataReflectKey } from '../../reflectMetadata/data/schemaOpenApiMetadataReflectKey';
import { buildDefaultSchemaMetadata } from '../calculations/buildDefaultSchemaMetadata';
import { SchemaMetadata } from '../models/SchemaMetadata';
import { toSchemaInSchemaMetadataContext } from './toSchemaInSchemaMetadataContext';
import { updateSchemaMetadataReferences } from './updateSchemaMetadataReferences';

describe(toSchemaInSchemaMetadataContext, () => {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
  let targetFixture: Function;
  let escapeJsonPointerFragmentsMock: Mock;
  let getOwnReflectMetadataMock: Mock;
  let updateOwnReflectMetadataMock: Mock;
  let buildDefaultSchemaMetadataMock: Mock;
  let updateSchemaMetadataReferencesMock: Mock;

  beforeAll(() => {
    targetFixture = class TestTarget {};
    escapeJsonPointerFragmentsMock = vitest.mocked(escapeJsonPointerFragments);
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
    let escapedNameFixture: string;

    let result: unknown;

    beforeAll(() => {
      typeFixture = class TestType {};
      mockUpdateFunction = vitest.fn();
      escapedNameFixture = 'TestType';

      getOwnReflectMetadataMock.mockReturnValueOnce(undefined);
      updateSchemaMetadataReferencesMock.mockReturnValueOnce(
        mockUpdateFunction,
      );
      escapeJsonPointerFragmentsMock.mockReturnValueOnce(escapedNameFixture);

      result = toSchemaInSchemaMetadataContext(targetFixture)(typeFixture);
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

    it('should call escapeJsonPointerFragments()', () => {
      expect(escapeJsonPointerFragmentsMock).toHaveBeenCalledTimes(1);
      expect(escapeJsonPointerFragmentsMock).toHaveBeenCalledWith(
        typeFixture.name,
      );
    });

    it('should return an OpenApi3Dot1SchemaObject with $ref using escaped type.name', () => {
      expect(result).toStrictEqual({
        $ref: `#/components/schemas/${escapedNameFixture}`,
      });
    });
  });

  describe('when called and getOwnReflectMetadata returns metadata with undefined name', () => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
    let typeFixture: Function;
    let metadataWithUndefinedName: SchemaMetadata;
    let mockUpdateFunction: Mock;
    let escapedNameFixture: string;

    let result: unknown;

    beforeAll(() => {
      typeFixture = class TestType {};
      mockUpdateFunction = vitest.fn();
      escapedNameFixture = 'TestType';
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
      escapeJsonPointerFragmentsMock.mockReturnValueOnce(escapedNameFixture);

      result = toSchemaInSchemaMetadataContext(targetFixture)(typeFixture);
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

    it('should call escapeJsonPointerFragments()', () => {
      expect(escapeJsonPointerFragmentsMock).toHaveBeenCalledTimes(1);
      expect(escapeJsonPointerFragmentsMock).toHaveBeenCalledWith(
        typeFixture.name,
      );
    });

    it('should return an OpenApi3Dot1SchemaObject with $ref using escaped type.name', () => {
      expect(result).toStrictEqual({
        $ref: `#/components/schemas/${escapedNameFixture}`,
      });
    });
  });

  describe('when called and getOwnReflectMetadata returns metadata with name', () => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
    let typeFixture: Function;
    let metadataWithName: SchemaMetadata;
    let nameFixture: string;
    let mockUpdateFunction: Mock;
    let escapedNameFixture: string;

    let result: unknown;

    beforeAll(() => {
      typeFixture = class TestType {};
      nameFixture = 'CustomSchemaName';
      mockUpdateFunction = vitest.fn();
      escapedNameFixture = 'CustomSchemaName';
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
      escapeJsonPointerFragmentsMock.mockReturnValueOnce(escapedNameFixture);

      result = toSchemaInSchemaMetadataContext(targetFixture)(typeFixture);
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

    it('should call escapeJsonPointerFragments()', () => {
      expect(escapeJsonPointerFragmentsMock).toHaveBeenCalledTimes(1);
      expect(escapeJsonPointerFragmentsMock).toHaveBeenCalledWith(nameFixture);
    });

    it('should return an OpenApi3Dot1SchemaObject with $ref using escaped metadata.name', () => {
      expect(result).toStrictEqual({
        $ref: `#/components/schemas/${escapedNameFixture}`,
      });
    });
  });
});
