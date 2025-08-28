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
vitest.mock('../actions/updateSchemaMetadataName');
vitest.mock('../actions/updateSchemaMetadataSchema');

import { OpenApi3Dot1SchemaObject } from '@inversifyjs/open-api-types/v3Dot1';

import { schemaOpenApiMetadataReflectKey } from '../../reflectMetadata/data/schemaOpenApiMetadataReflectKey';
import { toSchemaInSchemaMetadataContext } from '../actions/toSchemaInSchemaMetadataContext';
import { updateSchemaMetadataName } from '../actions/updateSchemaMetadataName';
import { updateSchemaMetadataSchema } from '../actions/updateSchemaMetadataSchema';
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
      let updateSchemaMetadataNameResultMock: Mock<
        (metadata: SchemaMetadata) => SchemaMetadata
      >;
      let updateSchemaMetadataSchemaResultMock: Mock<
        (metadata: SchemaMetadata) => SchemaMetadata
      >;

      let result: unknown;

      beforeAll(() => {
        targetTypeFixture = function testClass() {};

        updateSchemaMetadataNameResultMock = vitest.fn();
        updateSchemaMetadataSchemaResultMock = vitest.fn();

        vitest
          .mocked(updateSchemaMetadataName)
          .mockReturnValueOnce(updateSchemaMetadataNameResultMock);
        vitest
          .mocked(updateSchemaMetadataSchema)
          .mockReturnValueOnce(updateSchemaMetadataSchemaResultMock);

        result = Schema()(targetTypeFixture);
      });

      afterAll(() => {
        vitest.clearAllMocks();
      });

      it('should call updateSchemaMetadataName()', () => {
        expect(updateSchemaMetadataName).toHaveBeenCalledTimes(1);
        expect(updateSchemaMetadataName).toHaveBeenCalledWith(
          undefined,
          targetTypeFixture,
        );
      });

      it('should call updateSchemaMetadata()', () => {
        expect(updateSchemaMetadataSchema).toHaveBeenCalledTimes(1);
        expect(updateSchemaMetadataSchema).toHaveBeenCalledWith(
          undefined,
          targetTypeFixture,
        );
      });

      it('should call updateOwnReflectMetadata()', () => {
        expect(updateOwnReflectMetadata).toHaveBeenCalledTimes(2);
        expect(updateOwnReflectMetadata).toHaveBeenNthCalledWith(
          1,
          targetTypeFixture,
          schemaOpenApiMetadataReflectKey,
          buildDefaultSchemaMetadata,
          updateSchemaMetadataNameResultMock,
        );
        expect(updateOwnReflectMetadata).toHaveBeenNthCalledWith(
          2,
          targetTypeFixture,
          schemaOpenApiMetadataReflectKey,
          buildDefaultSchemaMetadata,
          updateSchemaMetadataSchemaResultMock,
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
      let updateSchemaMetadataNameResultMock: Mock<
        (metadata: SchemaMetadata) => SchemaMetadata
      >;
      let updateSchemaMetadataSchemaResultMock: Mock<
        (metadata: SchemaMetadata) => SchemaMetadata
      >;

      let result: unknown;

      beforeAll(() => {
        targetTypeFixture = function testClass() {};

        updateSchemaMetadataNameResultMock = vitest.fn();
        updateSchemaMetadataSchemaResultMock = vitest.fn();

        vitest
          .mocked(updateSchemaMetadataName)
          .mockReturnValueOnce(updateSchemaMetadataNameResultMock);
        vitest
          .mocked(updateSchemaMetadataSchema)
          .mockReturnValueOnce(updateSchemaMetadataSchemaResultMock);

        result = Schema(schemaFixture)(targetTypeFixture);
      });

      afterAll(() => {
        vitest.clearAllMocks();
      });

      it('should call updateSchemaMetadataName()', () => {
        expect(updateSchemaMetadataName).toHaveBeenCalledTimes(1);
        expect(updateSchemaMetadataName).toHaveBeenCalledWith(
          undefined,
          targetTypeFixture,
        );
      });

      it('should call updateSchemaMetadata()', () => {
        expect(updateSchemaMetadataSchema).toHaveBeenCalledTimes(1);
        expect(updateSchemaMetadataSchema).toHaveBeenCalledWith(
          schemaFixture,
          targetTypeFixture,
        );
      });

      it('should call updateOwnReflectMetadata()', () => {
        expect(updateOwnReflectMetadata).toHaveBeenCalledTimes(2);
        expect(updateOwnReflectMetadata).toHaveBeenNthCalledWith(
          1,
          targetTypeFixture,
          schemaOpenApiMetadataReflectKey,
          buildDefaultSchemaMetadata,
          updateSchemaMetadataNameResultMock,
        );
        expect(updateOwnReflectMetadata).toHaveBeenNthCalledWith(
          2,
          targetTypeFixture,
          schemaOpenApiMetadataReflectKey,
          buildDefaultSchemaMetadata,
          updateSchemaMetadataSchemaResultMock,
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
      let updateSchemaMetadataNameResultMock: Mock<
        (metadata: SchemaMetadata) => SchemaMetadata
      >;
      let updateSchemaMetadataSchemaResultMock: Mock<
        (metadata: SchemaMetadata) => SchemaMetadata
      >;

      let result: unknown;

      beforeAll(() => {
        targetTypeFixture = function testClass() {};

        updateSchemaMetadataNameResultMock = vitest.fn();
        updateSchemaMetadataSchemaResultMock = vitest.fn();

        vitest
          .mocked(updateSchemaMetadataName)
          .mockReturnValueOnce(updateSchemaMetadataNameResultMock);
        vitest
          .mocked(updateSchemaMetadataSchema)
          .mockReturnValueOnce(updateSchemaMetadataSchemaResultMock);

        result = Schema(schemaFixture, optionsFixture)(targetTypeFixture);
      });

      afterAll(() => {
        vitest.clearAllMocks();
      });

      it('should call updateSchemaMetadataName()', () => {
        expect(updateSchemaMetadataName).toHaveBeenCalledTimes(1);
        expect(updateSchemaMetadataName).toHaveBeenCalledWith(
          optionsFixture,
          targetTypeFixture,
        );
      });

      it('should call updateSchemaMetadata()', () => {
        expect(updateSchemaMetadataSchema).toHaveBeenCalledTimes(1);
        expect(updateSchemaMetadataSchema).toHaveBeenCalledWith(
          schemaFixture,
          targetTypeFixture,
        );
      });

      it('should call updateOwnReflectMetadata()', () => {
        expect(updateOwnReflectMetadata).toHaveBeenCalledTimes(2);
        expect(updateOwnReflectMetadata).toHaveBeenNthCalledWith(
          1,
          targetTypeFixture,
          schemaOpenApiMetadataReflectKey,
          buildDefaultSchemaMetadata,
          updateSchemaMetadataNameResultMock,
        );
        expect(updateOwnReflectMetadata).toHaveBeenNthCalledWith(
          2,
          targetTypeFixture,
          schemaOpenApiMetadataReflectKey,
          buildDefaultSchemaMetadata,
          updateSchemaMetadataSchemaResultMock,
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

      vitest
        .mocked(toSchemaInSchemaMetadataContext)
        .mockReturnValueOnce(toSchemaFunctionMock);
    });

    describe('when called', () => {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
      let targetTypeFixture: Function;
      let updateSchemaMetadataNameResultMock: Mock<
        (metadata: SchemaMetadata) => SchemaMetadata
      >;
      let updateSchemaMetadataSchemaResultMock: Mock<
        (metadata: SchemaMetadata) => SchemaMetadata
      >;

      let result: unknown;

      beforeAll(() => {
        targetTypeFixture = function testClass() {};

        updateSchemaMetadataNameResultMock = vitest.fn();
        updateSchemaMetadataSchemaResultMock = vitest.fn();

        vitest
          .mocked(updateSchemaMetadataName)
          .mockReturnValueOnce(updateSchemaMetadataNameResultMock);
        vitest
          .mocked(updateSchemaMetadataSchema)
          .mockReturnValueOnce(updateSchemaMetadataSchemaResultMock);

        result = Schema(buildFunctionFixture)(targetTypeFixture);
      });

      afterAll(() => {
        vitest.clearAllMocks();
      });

      it('should call updateSchemaMetadataName()', () => {
        expect(updateSchemaMetadataName).toHaveBeenCalledTimes(1);
        expect(updateSchemaMetadataName).toHaveBeenCalledWith(
          undefined,
          targetTypeFixture,
        );
      });

      it('should call toSchema()', () => {
        expect(toSchemaInSchemaMetadataContext).toHaveBeenCalledTimes(1);
        expect(toSchemaInSchemaMetadataContext).toHaveBeenCalledWith(
          targetTypeFixture,
        );
      });

      it('should call build function with toSchema result', () => {
        expect(buildFunctionFixture).toHaveBeenCalledTimes(1);
        expect(buildFunctionFixture).toHaveBeenCalledWith(toSchemaFunctionMock);
      });

      it('should call updateSchemaMetadata()', () => {
        expect(updateSchemaMetadataSchema).toHaveBeenCalledTimes(1);
        expect(updateSchemaMetadataSchema).toHaveBeenCalledWith(
          builtSchemaFixture,
          targetTypeFixture,
        );
      });

      it('should call updateOwnReflectMetadata()', () => {
        expect(updateOwnReflectMetadata).toHaveBeenCalledTimes(2);
        expect(updateOwnReflectMetadata).toHaveBeenNthCalledWith(
          1,
          targetTypeFixture,
          schemaOpenApiMetadataReflectKey,
          buildDefaultSchemaMetadata,
          updateSchemaMetadataNameResultMock,
        );
        expect(updateOwnReflectMetadata).toHaveBeenNthCalledWith(
          2,
          targetTypeFixture,
          schemaOpenApiMetadataReflectKey,
          buildDefaultSchemaMetadata,
          updateSchemaMetadataSchemaResultMock,
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

      vitest
        .mocked(toSchemaInSchemaMetadataContext)
        .mockReturnValueOnce(toSchemaFunctionMock);
    });

    describe('when called', () => {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
      let targetTypeFixture: Function;
      let updateSchemaMetadataNameResultMock: Mock<
        (metadata: SchemaMetadata) => SchemaMetadata
      >;
      let updateSchemaMetadataSchemaResultMock: Mock<
        (metadata: SchemaMetadata) => SchemaMetadata
      >;

      let result: unknown;

      beforeAll(() => {
        targetTypeFixture = function testClass() {};

        updateSchemaMetadataNameResultMock = vitest.fn();
        updateSchemaMetadataSchemaResultMock = vitest.fn();

        vitest
          .mocked(updateSchemaMetadataName)
          .mockReturnValueOnce(updateSchemaMetadataNameResultMock);
        vitest
          .mocked(updateSchemaMetadataSchema)
          .mockReturnValueOnce(updateSchemaMetadataSchemaResultMock);

        result = Schema(
          buildFunctionFixture,
          optionsFixture,
        )(targetTypeFixture);
      });

      afterAll(() => {
        vitest.clearAllMocks();
      });

      it('should call updateSchemaMetadataName()', () => {
        expect(updateSchemaMetadataName).toHaveBeenCalledTimes(1);
        expect(updateSchemaMetadataName).toHaveBeenCalledWith(
          optionsFixture,
          targetTypeFixture,
        );
      });

      it('should call toSchema()', () => {
        expect(toSchemaInSchemaMetadataContext).toHaveBeenCalledTimes(1);
        expect(toSchemaInSchemaMetadataContext).toHaveBeenCalledWith(
          targetTypeFixture,
        );
      });

      it('should call build function with toSchema result', () => {
        expect(buildFunctionFixture).toHaveBeenCalledTimes(1);
        expect(buildFunctionFixture).toHaveBeenCalledWith(toSchemaFunctionMock);
      });

      it('should call updateSchemaMetadata()', () => {
        expect(updateSchemaMetadataSchema).toHaveBeenCalledTimes(1);
        expect(updateSchemaMetadataSchema).toHaveBeenCalledWith(
          builtSchemaFixture,
          targetTypeFixture,
        );
      });

      it('should call updateOwnReflectMetadata()', () => {
        expect(updateOwnReflectMetadata).toHaveBeenCalledTimes(2);
        expect(updateOwnReflectMetadata).toHaveBeenNthCalledWith(
          1,
          targetTypeFixture,
          schemaOpenApiMetadataReflectKey,
          buildDefaultSchemaMetadata,
          updateSchemaMetadataNameResultMock,
        );
        expect(updateOwnReflectMetadata).toHaveBeenNthCalledWith(
          2,
          targetTypeFixture,
          schemaOpenApiMetadataReflectKey,
          buildDefaultSchemaMetadata,
          updateSchemaMetadataSchemaResultMock,
        );
      });

      it('should return undefined', () => {
        expect(result).toBeUndefined();
      });
    });
  });
});
