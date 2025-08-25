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

vitest.mock('../actions/toSchema');
vitest.mock('../actions/updateSchemaMetadata');

import { OpenApi3Dot1SchemaObject } from '@inversifyjs/open-api-types/v3Dot1';

import { schemaOpenApiMetadataReflectKey } from '../../reflectMetadata/data/schemaOpenApiMetadataReflectKey';
import { toSchema } from '../actions/toSchema';
import { updateSchemaMetadata } from '../actions/updateSchemaMetadata';
import { buildDefaultSchemaMetadata } from '../calculations/buildDefaultSchemaMetadata';
import { BuildOpenApiBlockFunction } from '../models/BuildOpenApiBlockFunction';
import { SchemaDecoratorOptions } from '../models/SchemaDecoratorOptions';
import { SchemaMetadata } from '../models/SchemaMetadata';
import { ToSchemaFunction } from '../models/ToSchemaFunction';
import { Schema } from './Schema';

describe(Schema, () => {
  describe('having no schema parameter', () => {
    describe('when called', () => {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
      let targetTypeFixture: Function;
      let updateSchemaMetadataResultMock: Mock<
        (metadata: SchemaMetadata) => SchemaMetadata
      >;

      let result: unknown;

      beforeAll(() => {
        targetTypeFixture = function testClass() {};

        updateSchemaMetadataResultMock = vitest.fn();

        vitest
          .mocked(updateSchemaMetadata)
          .mockReturnValueOnce(updateSchemaMetadataResultMock);

        result = Schema()(targetTypeFixture);
      });

      afterAll(() => {
        vitest.clearAllMocks();
      });

      it('should call updateSchemaMetadata()', () => {
        expect(updateSchemaMetadata).toHaveBeenCalledTimes(1);
        expect(updateSchemaMetadata).toHaveBeenCalledWith(
          undefined,
          undefined,
          targetTypeFixture,
        );
      });

      it('should call updateOwnReflectMetadata()', () => {
        expect(updateOwnReflectMetadata).toHaveBeenCalledTimes(1);
        expect(updateOwnReflectMetadata).toHaveBeenCalledWith(
          targetTypeFixture,
          schemaOpenApiMetadataReflectKey,
          buildDefaultSchemaMetadata,
          updateSchemaMetadataResultMock,
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
        description: 'Test schema',
        properties: {
          id: { type: 'string' },
          name: { type: 'string' },
        },
        required: ['id', 'name'],
        type: 'object',
      };
    });

    describe('when called', () => {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
      let targetTypeFixture: Function;
      let updateSchemaMetadataResultMock: Mock<
        (metadata: SchemaMetadata) => SchemaMetadata
      >;

      let result: unknown;

      beforeAll(() => {
        targetTypeFixture = function testClass() {};

        updateSchemaMetadataResultMock = vitest.fn();

        vitest
          .mocked(updateSchemaMetadata)
          .mockReturnValueOnce(updateSchemaMetadataResultMock);

        result = Schema(schemaFixture)(targetTypeFixture);
      });

      afterAll(() => {
        vitest.clearAllMocks();
      });

      it('should call updateSchemaMetadata()', () => {
        expect(updateSchemaMetadata).toHaveBeenCalledTimes(1);
        expect(updateSchemaMetadata).toHaveBeenCalledWith(
          schemaFixture,
          undefined,
          targetTypeFixture,
        );
      });

      it('should call updateOwnReflectMetadata()', () => {
        expect(updateOwnReflectMetadata).toHaveBeenCalledTimes(1);
        expect(updateOwnReflectMetadata).toHaveBeenCalledWith(
          targetTypeFixture,
          schemaOpenApiMetadataReflectKey,
          buildDefaultSchemaMetadata,
          updateSchemaMetadataResultMock,
        );
      });

      it('should return undefined', () => {
        expect(result).toBeUndefined();
      });
    });
  });

  describe('having a schema object parameter and options', () => {
    let schemaFixture: OpenApi3Dot1SchemaObject;
    let optionsFixture: SchemaDecoratorOptions;

    beforeAll(() => {
      schemaFixture = {
        description: 'Test schema',
        properties: {
          id: { type: 'string' },
          name: { type: 'string' },
        },
        required: ['id', 'name'],
        type: 'object',
      };

      optionsFixture = {
        name: 'CustomSchemaName',
      };
    });

    describe('when called', () => {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
      let targetTypeFixture: Function;
      let updateSchemaMetadataResultMock: Mock<
        (metadata: SchemaMetadata) => SchemaMetadata
      >;

      let result: unknown;

      beforeAll(() => {
        targetTypeFixture = function testClass() {};

        updateSchemaMetadataResultMock = vitest.fn();

        vitest
          .mocked(updateSchemaMetadata)
          .mockReturnValueOnce(updateSchemaMetadataResultMock);

        result = Schema(schemaFixture, optionsFixture)(targetTypeFixture);
      });

      afterAll(() => {
        vitest.clearAllMocks();
      });

      it('should call updateSchemaMetadata()', () => {
        expect(updateSchemaMetadata).toHaveBeenCalledTimes(1);
        expect(updateSchemaMetadata).toHaveBeenCalledWith(
          schemaFixture,
          optionsFixture,
          targetTypeFixture,
        );
      });

      it('should call updateOwnReflectMetadata()', () => {
        expect(updateOwnReflectMetadata).toHaveBeenCalledTimes(1);
        expect(updateOwnReflectMetadata).toHaveBeenCalledWith(
          targetTypeFixture,
          schemaOpenApiMetadataReflectKey,
          buildDefaultSchemaMetadata,
          updateSchemaMetadataResultMock,
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
        description: 'Built schema',
        properties: {
          value: { type: 'number' },
        },
        required: ['value'],
        type: 'object',
      };

      toSchemaFunctionMock = vitest.fn();

      buildFunctionFixture = vitest
        .fn()
        .mockReturnValueOnce(builtSchemaFixture);

      vitest.mocked(toSchema).mockReturnValueOnce(toSchemaFunctionMock);
    });

    describe('when called', () => {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
      let targetTypeFixture: Function;
      let updateSchemaMetadataResultMock: Mock<
        (metadata: SchemaMetadata) => SchemaMetadata
      >;

      let result: unknown;

      beforeAll(() => {
        targetTypeFixture = function testClass() {};

        updateSchemaMetadataResultMock = vitest.fn();

        vitest
          .mocked(updateSchemaMetadata)
          .mockReturnValueOnce(updateSchemaMetadataResultMock);

        result = Schema(buildFunctionFixture)(targetTypeFixture);
      });

      afterAll(() => {
        vitest.clearAllMocks();
      });

      it('should call toSchema()', () => {
        expect(toSchema).toHaveBeenCalledTimes(1);
        expect(toSchema).toHaveBeenCalledWith(targetTypeFixture, undefined);
      });

      it('should call build function with toSchema result', () => {
        expect(buildFunctionFixture).toHaveBeenCalledTimes(1);
        expect(buildFunctionFixture).toHaveBeenCalledWith(toSchemaFunctionMock);
      });

      it('should call updateSchemaMetadata()', () => {
        expect(updateSchemaMetadata).toHaveBeenCalledTimes(1);
        expect(updateSchemaMetadata).toHaveBeenCalledWith(
          builtSchemaFixture,
          undefined,
          targetTypeFixture,
        );
      });

      it('should call updateOwnReflectMetadata()', () => {
        expect(updateOwnReflectMetadata).toHaveBeenCalledTimes(1);
        expect(updateOwnReflectMetadata).toHaveBeenCalledWith(
          targetTypeFixture,
          schemaOpenApiMetadataReflectKey,
          buildDefaultSchemaMetadata,
          updateSchemaMetadataResultMock,
        );
      });

      it('should return undefined', () => {
        expect(result).toBeUndefined();
      });
    });
  });

  describe('having a build function parameter and options', () => {
    let buildFunctionFixture: BuildOpenApiBlockFunction<OpenApi3Dot1SchemaObject>;
    let optionsFixture: SchemaDecoratorOptions;
    let toSchemaFunctionMock: Mock<ToSchemaFunction>;
    let builtSchemaFixture: OpenApi3Dot1SchemaObject;

    beforeAll(() => {
      builtSchemaFixture = {
        description: 'Built schema with options',
        properties: {
          data: { type: 'string' },
        },
        required: ['data'],
        type: 'object',
      };

      optionsFixture = {
        name: 'BuildFunctionSchemaName',
      };

      toSchemaFunctionMock = vitest.fn();

      buildFunctionFixture = vitest
        .fn()
        .mockReturnValueOnce(builtSchemaFixture);

      vitest.mocked(toSchema).mockReturnValueOnce(toSchemaFunctionMock);
    });

    describe('when called', () => {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
      let targetTypeFixture: Function;
      let updateSchemaMetadataResultMock: Mock<
        (metadata: SchemaMetadata) => SchemaMetadata
      >;

      let result: unknown;

      beforeAll(() => {
        targetTypeFixture = function testClass() {};

        updateSchemaMetadataResultMock = vitest.fn();

        vitest
          .mocked(updateSchemaMetadata)
          .mockReturnValueOnce(updateSchemaMetadataResultMock);

        result = Schema(
          buildFunctionFixture,
          optionsFixture,
        )(targetTypeFixture);
      });

      afterAll(() => {
        vitest.clearAllMocks();
      });

      it('should call toSchema()', () => {
        expect(toSchema).toHaveBeenCalledTimes(1);
        expect(toSchema).toHaveBeenCalledWith(
          targetTypeFixture,
          optionsFixture,
        );
      });

      it('should call build function with toSchema result', () => {
        expect(buildFunctionFixture).toHaveBeenCalledTimes(1);
        expect(buildFunctionFixture).toHaveBeenCalledWith(toSchemaFunctionMock);
      });

      it('should call updateSchemaMetadata()', () => {
        expect(updateSchemaMetadata).toHaveBeenCalledTimes(1);
        expect(updateSchemaMetadata).toHaveBeenCalledWith(
          builtSchemaFixture,
          optionsFixture,
          targetTypeFixture,
        );
      });

      it('should call updateOwnReflectMetadata()', () => {
        expect(updateOwnReflectMetadata).toHaveBeenCalledTimes(1);
        expect(updateOwnReflectMetadata).toHaveBeenCalledWith(
          targetTypeFixture,
          schemaOpenApiMetadataReflectKey,
          buildDefaultSchemaMetadata,
          updateSchemaMetadataResultMock,
        );
      });

      it('should return undefined', () => {
        expect(result).toBeUndefined();
      });
    });
  });
});
