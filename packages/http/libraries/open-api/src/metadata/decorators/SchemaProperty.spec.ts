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

import { updateOwnReflectMetadata } from '@inversifyjs/reflect-metadata-utils';

vitest.mock('../actions/toSchemaInSchemaMetadataContext');
vitest.mock('../actions/updateSchemaMetadataProperty');

import { OpenApi3Dot1SchemaObject } from '@inversifyjs/open-api-types/v3Dot1';

import { schemaOpenApiMetadataReflectKey } from '../../reflectMetadata/data/schemaOpenApiMetadataReflectKey';
import { toSchemaInSchemaMetadataContext } from '../actions/toSchemaInSchemaMetadataContext';
import { updateSchemaMetadataProperty } from '../actions/updateSchemaMetadataProperty';
import { buildDefaultSchemaMetadata } from '../calculations/buildDefaultSchemaMetadata';
import { BuildOpenApiBlockFunction } from '../models/BuildOpenApiBlockFunction';
import { SchemaMetadata } from '../models/SchemaMetadata';
import { ToSchemaFunction } from '../models/ToSchemaFunction';
import { SchemaProperty } from './SchemaProperty';

describe(SchemaProperty, () => {
  describe('having no schema parameter', () => {
    describe('when called', () => {
      let targetObjectFixture: object;
      let propertyKeyFixture: string;
      let updateSchemaMetadataPropertyResultMock: Mock<
        (metadata: SchemaMetadata) => SchemaMetadata
      >;

      let result: unknown;

      beforeAll(() => {
        targetObjectFixture = {};
        propertyKeyFixture = 'testProperty';

        updateSchemaMetadataPropertyResultMock = vitest.fn();

        vitest
          .mocked(updateSchemaMetadataProperty)
          .mockReturnValueOnce(updateSchemaMetadataPropertyResultMock);

        result = SchemaProperty()(targetObjectFixture, propertyKeyFixture);
      });

      afterAll(() => {
        vitest.clearAllMocks();
      });

      it('should call updateSchemaMetadataProperty()', () => {
        expect(updateSchemaMetadataProperty).toHaveBeenCalledTimes(1);
        expect(updateSchemaMetadataProperty).toHaveBeenCalledWith(
          propertyKeyFixture,
          undefined,
        );
      });

      it('should call updateOwnReflectMetadata()', () => {
        expect(updateOwnReflectMetadata).toHaveBeenCalledTimes(1);
        expect(updateOwnReflectMetadata).toHaveBeenCalledWith(
          targetObjectFixture.constructor,
          schemaOpenApiMetadataReflectKey,
          buildDefaultSchemaMetadata,
          updateSchemaMetadataPropertyResultMock,
        );
      });

      it('should return undefined', () => {
        expect(result).toBeUndefined();
      });
    });
  });

  describe('having a schema object parameter', () => {
    let schemaFixture: OpenApi3Dot1SchemaObject;

    beforeAll(() => {
      schemaFixture = {
        description: 'Test property schema',
        type: 'string',
      };
    });

    describe('when called', () => {
      let targetObjectFixture: object;
      let propertyKeyFixture: string;
      let updateSchemaMetadataPropertyResultMock: Mock<
        (metadata: SchemaMetadata) => SchemaMetadata
      >;

      let result: unknown;

      beforeAll(() => {
        targetObjectFixture = {};
        propertyKeyFixture = 'testProperty';

        updateSchemaMetadataPropertyResultMock = vitest.fn();

        vitest
          .mocked(updateSchemaMetadataProperty)
          .mockReturnValueOnce(updateSchemaMetadataPropertyResultMock);

        result = SchemaProperty(schemaFixture)(
          targetObjectFixture,
          propertyKeyFixture,
        );
      });

      afterAll(() => {
        vitest.clearAllMocks();
      });

      it('should call updateSchemaMetadataProperty()', () => {
        expect(updateSchemaMetadataProperty).toHaveBeenCalledTimes(1);
        expect(updateSchemaMetadataProperty).toHaveBeenCalledWith(
          propertyKeyFixture,
          schemaFixture,
        );
      });

      it('should call updateOwnReflectMetadata()', () => {
        expect(updateOwnReflectMetadata).toHaveBeenCalledTimes(1);
        expect(updateOwnReflectMetadata).toHaveBeenCalledWith(
          targetObjectFixture.constructor,
          schemaOpenApiMetadataReflectKey,
          buildDefaultSchemaMetadata,
          updateSchemaMetadataPropertyResultMock,
        );
      });

      it('should return undefined', () => {
        expect(result).toBeUndefined();
      });
    });
  });

  describe('having a build function parameter', () => {
    let buildFunctionFixture: BuildOpenApiBlockFunction<OpenApi3Dot1SchemaObject>;
    let toSchemaFunctionMock: Mock<ToSchemaFunction>;
    let builtSchemaFixture: OpenApi3Dot1SchemaObject;

    beforeAll(() => {
      builtSchemaFixture = {
        description: 'Built property schema',
        type: 'number',
      };

      toSchemaFunctionMock = vitest.fn();

      buildFunctionFixture = vitest
        .fn()
        .mockReturnValueOnce(builtSchemaFixture);

      vitest
        .mocked(toSchemaInSchemaMetadataContext)
        .mockReturnValueOnce(toSchemaFunctionMock);
    });

    describe('when called', () => {
      let targetObjectFixture: object;
      let propertyKeyFixture: string;
      let updateSchemaMetadataPropertyResultMock: Mock<
        (metadata: SchemaMetadata) => SchemaMetadata
      >;

      let result: unknown;

      beforeAll(() => {
        targetObjectFixture = {};
        propertyKeyFixture = 'testProperty';

        updateSchemaMetadataPropertyResultMock = vitest.fn();

        vitest
          .mocked(updateSchemaMetadataProperty)
          .mockReturnValueOnce(updateSchemaMetadataPropertyResultMock);

        result = SchemaProperty(buildFunctionFixture)(
          targetObjectFixture,
          propertyKeyFixture,
        );
      });

      afterAll(() => {
        vitest.clearAllMocks();
      });

      it('should call toSchema()', () => {
        expect(toSchemaInSchemaMetadataContext).toHaveBeenCalledTimes(1);
        expect(toSchemaInSchemaMetadataContext).toHaveBeenCalledWith(
          targetObjectFixture.constructor,
        );
      });

      it('should call build function with toSchema result', () => {
        expect(buildFunctionFixture).toHaveBeenCalledTimes(1);
        expect(buildFunctionFixture).toHaveBeenCalledWith(toSchemaFunctionMock);
      });

      it('should call updateSchemaMetadataProperty()', () => {
        expect(updateSchemaMetadataProperty).toHaveBeenCalledTimes(1);
        expect(updateSchemaMetadataProperty).toHaveBeenCalledWith(
          propertyKeyFixture,
          builtSchemaFixture,
        );
      });

      it('should call updateOwnReflectMetadata()', () => {
        expect(updateOwnReflectMetadata).toHaveBeenCalledTimes(1);
        expect(updateOwnReflectMetadata).toHaveBeenCalledWith(
          targetObjectFixture.constructor,
          schemaOpenApiMetadataReflectKey,
          buildDefaultSchemaMetadata,
          updateSchemaMetadataPropertyResultMock,
        );
      });

      it('should return undefined', () => {
        expect(result).toBeUndefined();
      });
    });
  });

  describe('having a symbol property key', () => {
    describe('when called', () => {
      let targetObjectFixture: object;
      let symbolPropertyKeyFixture: symbol;

      beforeAll(() => {
        targetObjectFixture = {
          constructor: {
            name: 'TestClass',
          },
        };
        symbolPropertyKeyFixture = Symbol('testSymbol');
      });

      it('should throw an error', () => {
        expect(() => {
          SchemaProperty()(targetObjectFixture, symbolPropertyKeyFixture);
        }).toThrow(
          'Cannot apply SchemaProperty decorator to "TestClass.Symbol(testSymbol)" symbol property',
        );
      });
    });
  });
});
