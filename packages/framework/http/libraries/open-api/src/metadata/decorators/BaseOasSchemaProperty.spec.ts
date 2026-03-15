import {
  afterAll,
  beforeAll,
  describe,
  expect,
  it,
  type Mock,
  vitest,
} from 'vitest';

vitest.mock(import('@inversifyjs/reflect-metadata-utils'));

import { updateOwnReflectMetadata } from '@inversifyjs/reflect-metadata-utils';

vitest.mock(import('../actions/toSchemaInSchemaMetadataContext.js'));
vitest.mock(import('../actions/updateSchemaMetadataProperty.js'));

import { type OpenApi3Dot1SchemaObject } from '@inversifyjs/open-api-types/v3Dot1';

import { schemaOpenApiMetadataReflectKey } from '../../reflectMetadata/data/schemaOpenApiMetadataReflectKey.js';
import { toSchemaInSchemaMetadataContext } from '../actions/toSchemaInSchemaMetadataContext.js';
import { updateSchemaMetadataProperty } from '../actions/updateSchemaMetadataProperty.js';
import { buildDefaultSchemaMetadata } from '../calculations/buildDefaultSchemaMetadata.js';
import { type BuildOpenApiBlockFunction } from '../models/BuildOpenApiBlockFunction.js';
import { type SchemaMetadata } from '../models/SchemaMetadata.js';
import { type ToSchemaFunction } from '../models/ToSchemaFunction.js';
import { BaseOasSchemaProperty } from './BaseOasSchemaProperty.js';

describe(BaseOasSchemaProperty, () => {
  describe('having no schema parameter', () => {
    let requiredFixture: boolean;

    beforeAll(() => {
      requiredFixture = true;
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

        result = BaseOasSchemaProperty(requiredFixture)()(
          targetObjectFixture,
          propertyKeyFixture,
        );
      });

      afterAll(() => {
        vitest.clearAllMocks();
      });

      it('should call updateSchemaMetadataProperty()', () => {
        expect(updateSchemaMetadataProperty).toHaveBeenCalledExactlyOnceWith(
          propertyKeyFixture,
          requiredFixture,
          undefined,
        );
      });

      it('should call updateOwnReflectMetadata()', () => {
        expect(updateOwnReflectMetadata).toHaveBeenCalledExactlyOnceWith(
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
    let requiredFixture: boolean;
    let schemaFixture: OpenApi3Dot1SchemaObject;

    beforeAll(() => {
      requiredFixture = true;
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

        result = BaseOasSchemaProperty(requiredFixture)(schemaFixture)(
          targetObjectFixture,
          propertyKeyFixture,
        );
      });

      afterAll(() => {
        vitest.clearAllMocks();
      });

      it('should call updateSchemaMetadataProperty()', () => {
        expect(updateSchemaMetadataProperty).toHaveBeenCalledExactlyOnceWith(
          propertyKeyFixture,
          requiredFixture,
          schemaFixture,
        );
      });

      it('should call updateOwnReflectMetadata()', () => {
        expect(updateOwnReflectMetadata).toHaveBeenCalledExactlyOnceWith(
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
    let requiredFixture: boolean;
    let buildFunctionFixture: BuildOpenApiBlockFunction<OpenApi3Dot1SchemaObject>;
    let toSchemaFunctionMock: Mock<ToSchemaFunction>;
    let builtSchemaFixture: OpenApi3Dot1SchemaObject;

    beforeAll(() => {
      requiredFixture = true;
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

        result = BaseOasSchemaProperty(requiredFixture)(buildFunctionFixture)(
          targetObjectFixture,
          propertyKeyFixture,
        );
      });

      afterAll(() => {
        vitest.clearAllMocks();
      });

      it('should call toSchema()', () => {
        expect(toSchemaInSchemaMetadataContext).toHaveBeenCalledExactlyOnceWith(
          targetObjectFixture.constructor,
        );
      });

      it('should call build function with toSchema result', () => {
        expect(buildFunctionFixture).toHaveBeenCalledExactlyOnceWith(
          toSchemaFunctionMock,
        );
      });

      it('should call updateSchemaMetadataProperty()', () => {
        expect(updateSchemaMetadataProperty).toHaveBeenCalledExactlyOnceWith(
          propertyKeyFixture,
          requiredFixture,
          builtSchemaFixture,
        );
      });

      it('should call updateOwnReflectMetadata()', () => {
        expect(updateOwnReflectMetadata).toHaveBeenCalledExactlyOnceWith(
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
    let requiredFixture: boolean;

    beforeAll(() => {
      requiredFixture = true;
    });

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
          BaseOasSchemaProperty(requiredFixture)()(
            targetObjectFixture,
            symbolPropertyKeyFixture,
          );
        }).toThrow(
          'Cannot apply SchemaProperty decorator to "TestClass.Symbol(testSymbol)" symbol property',
        );
      });
    });
  });
});
