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

import { escapeJsonPointerFragments } from '@inversifyjs/json-schema-pointer';
import { getOwnReflectMetadata } from '@inversifyjs/reflect-metadata-utils';

import { schemaOpenApiMetadataReflectKey } from '../../reflectMetadata/data/schemaOpenApiMetadataReflectKey';
import { SchemaMetadata } from '../models/SchemaMetadata';
import { toSchema } from './toSchema';

describe(toSchema, () => {
  let updateMetadataReferencesMock: Mock;
  let escapeJsonPointerFragmentsMock: Mock;
  let getOwnReflectMetadataMock: Mock;

  beforeAll(() => {
    updateMetadataReferencesMock = vitest.fn();
    escapeJsonPointerFragmentsMock = vitest.mocked(escapeJsonPointerFragments);
    getOwnReflectMetadataMock = vitest.mocked(getOwnReflectMetadata);
  });

  describe('when called', () => {
    let toSchemaFunction: ReturnType<typeof toSchema>;

    beforeAll(() => {
      toSchemaFunction = toSchema(updateMetadataReferencesMock);
    });

    describe('.toSchemaFunction', () => {
      describe('when called and getOwnReflectMetadata returns undefined', () => {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
        let typeFixture: Function;
        let escapedNameFixture: string;

        let result: unknown;

        beforeAll(() => {
          typeFixture = class TestType {};
          escapedNameFixture = 'TestType';

          getOwnReflectMetadataMock.mockReturnValueOnce(undefined);
          escapeJsonPointerFragmentsMock.mockReturnValueOnce(
            escapedNameFixture,
          );

          result = toSchemaFunction(typeFixture);
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

        it('should call updateMetadataReferences()', () => {
          expect(updateMetadataReferencesMock).toHaveBeenCalledTimes(1);
          expect(updateMetadataReferencesMock).toHaveBeenCalledWith(
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
        let escapedNameFixture: string;

        let result: unknown;

        beforeAll(() => {
          typeFixture = class TestType {};
          escapedNameFixture = 'TestType';
          metadataWithUndefinedName = {
            name: undefined,
            properties: new Map(),
            references: new Set(),
            schema: undefined,
          };

          getOwnReflectMetadataMock.mockReturnValueOnce(
            metadataWithUndefinedName,
          );
          escapeJsonPointerFragmentsMock.mockReturnValueOnce(
            escapedNameFixture,
          );

          result = toSchemaFunction(typeFixture);
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

        it('should call updateMetadataReferences()', () => {
          expect(updateMetadataReferencesMock).toHaveBeenCalledTimes(1);
          expect(updateMetadataReferencesMock).toHaveBeenCalledWith(
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
        let escapedNameFixture: string;

        let result: unknown;

        beforeAll(() => {
          typeFixture = class TestType {};
          nameFixture = 'CustomSchemaName';
          escapedNameFixture = 'CustomSchemaName';
          metadataWithName = {
            name: nameFixture,
            properties: new Map(),
            references: new Set(),
            schema: undefined,
          };

          getOwnReflectMetadataMock.mockReturnValueOnce(metadataWithName);
          escapeJsonPointerFragmentsMock.mockReturnValueOnce(
            escapedNameFixture,
          );

          result = toSchemaFunction(typeFixture);
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

        it('should call updateMetadataReferences()', () => {
          expect(updateMetadataReferencesMock).toHaveBeenCalledTimes(1);
          expect(updateMetadataReferencesMock).toHaveBeenCalledWith(
            typeFixture,
          );
        });

        it('should call escapeJsonPointerFragments()', () => {
          expect(escapeJsonPointerFragmentsMock).toHaveBeenCalledTimes(1);
          expect(escapeJsonPointerFragmentsMock).toHaveBeenCalledWith(
            nameFixture,
          );
        });

        it('should return an OpenApi3Dot1SchemaObject with $ref using escaped metadata.name', () => {
          expect(result).toStrictEqual({
            $ref: `#/components/schemas/${escapedNameFixture}`,
          });
        });
      });
    });
  });
});
