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
vitest.mock('../actions/updateSchemaMetadataFromOptions');
vitest.mock('../actions/updateSchemaMetadataSchema');

import { OpenApi3Dot1SchemaObject } from '@inversifyjs/open-api-types/v3Dot1';

import { schemaOpenApiMetadataReflectKey } from '../../reflectMetadata/data/schemaOpenApiMetadataReflectKey';
import { toSchemaInSchemaMetadataContext } from '../actions/toSchemaInSchemaMetadataContext';
import { updateSchemaMetadataFromOptions } from '../actions/updateSchemaMetadataFromOptions';
import { updateSchemaMetadataSchema } from '../actions/updateSchemaMetadataSchema';
import { buildDefaultSchemaMetadata } from '../calculations/buildDefaultSchemaMetadata';
import { BuildOpenApiBlockFunction } from '../models/BuildOpenApiBlockFunction';
import { OasSchemaDecoratorOptions } from '../models/OasSchemaDecoratorOptions';
import { SchemaMetadata } from '../models/SchemaMetadata';
import { ToSchemaFunction } from '../models/ToSchemaFunction';
import { OasSchema } from './OasSchema';

describe(OasSchema, () => {
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
          .mocked(updateSchemaMetadataFromOptions)
          .mockReturnValueOnce(updateSchemaMetadataNameResultMock);
        vitest
          .mocked(updateSchemaMetadataSchema)
          .mockReturnValueOnce(updateSchemaMetadataSchemaResultMock);

        result = OasSchema()(targetTypeFixture);
      });

      afterAll(() => {
        vitest.clearAllMocks();
      });

      it('should call updateSchemaMetadataName()', () => {
        expect(updateSchemaMetadataFromOptions).toHaveBeenCalledExactlyOnceWith(
          undefined,
          targetTypeFixture,
        );
      });

      it('should call updateSchemaMetadata()', () => {
        expect(updateSchemaMetadataSchema).toHaveBeenCalledExactlyOnceWith(
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
          .mocked(updateSchemaMetadataFromOptions)
          .mockReturnValueOnce(updateSchemaMetadataNameResultMock);
        vitest
          .mocked(updateSchemaMetadataSchema)
          .mockReturnValueOnce(updateSchemaMetadataSchemaResultMock);

        result = OasSchema(schemaFixture)(targetTypeFixture);
      });

      afterAll(() => {
        vitest.clearAllMocks();
      });

      it('should call updateSchemaMetadataName()', () => {
        expect(updateSchemaMetadataFromOptions).toHaveBeenCalledExactlyOnceWith(
          undefined,
          targetTypeFixture,
        );
      });

      it('should call updateSchemaMetadata()', () => {
        expect(updateSchemaMetadataSchema).toHaveBeenCalledExactlyOnceWith(
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
    let optionsFixture: OasSchemaDecoratorOptions;

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
          .mocked(updateSchemaMetadataFromOptions)
          .mockReturnValueOnce(updateSchemaMetadataNameResultMock);
        vitest
          .mocked(updateSchemaMetadataSchema)
          .mockReturnValueOnce(updateSchemaMetadataSchemaResultMock);

        result = OasSchema(schemaFixture, optionsFixture)(targetTypeFixture);
      });

      afterAll(() => {
        vitest.clearAllMocks();
      });

      it('should call updateSchemaMetadataName()', () => {
        expect(updateSchemaMetadataFromOptions).toHaveBeenCalledExactlyOnceWith(
          optionsFixture,
          targetTypeFixture,
        );
      });

      it('should call updateSchemaMetadata()', () => {
        expect(updateSchemaMetadataSchema).toHaveBeenCalledExactlyOnceWith(
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
          .mocked(updateSchemaMetadataFromOptions)
          .mockReturnValueOnce(updateSchemaMetadataNameResultMock);
        vitest
          .mocked(updateSchemaMetadataSchema)
          .mockReturnValueOnce(updateSchemaMetadataSchemaResultMock);

        result = OasSchema(buildFunctionFixture)(targetTypeFixture);
      });

      afterAll(() => {
        vitest.clearAllMocks();
      });

      it('should call updateSchemaMetadataName()', () => {
        expect(updateSchemaMetadataFromOptions).toHaveBeenCalledExactlyOnceWith(
          undefined,
          targetTypeFixture,
        );
      });

      it('should call toSchema()', () => {
        expect(toSchemaInSchemaMetadataContext).toHaveBeenCalledExactlyOnceWith(
          targetTypeFixture,
        );
      });

      it('should call build function with toSchema result', () => {
        expect(buildFunctionFixture).toHaveBeenCalledExactlyOnceWith(
          toSchemaFunctionMock,
        );
      });

      it('should call updateSchemaMetadata()', () => {
        expect(updateSchemaMetadataSchema).toHaveBeenCalledExactlyOnceWith(
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
    let optionsFixture: OasSchemaDecoratorOptions;
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
          .mocked(updateSchemaMetadataFromOptions)
          .mockReturnValueOnce(updateSchemaMetadataNameResultMock);
        vitest
          .mocked(updateSchemaMetadataSchema)
          .mockReturnValueOnce(updateSchemaMetadataSchemaResultMock);

        result = OasSchema(
          buildFunctionFixture,
          optionsFixture,
        )(targetTypeFixture);
      });

      afterAll(() => {
        vitest.clearAllMocks();
      });

      it('should call updateSchemaMetadataName()', () => {
        expect(updateSchemaMetadataFromOptions).toHaveBeenCalledExactlyOnceWith(
          optionsFixture,
          targetTypeFixture,
        );
      });

      it('should call toSchema()', () => {
        expect(toSchemaInSchemaMetadataContext).toHaveBeenCalledExactlyOnceWith(
          targetTypeFixture,
        );
      });

      it('should call build function with toSchema result', () => {
        expect(buildFunctionFixture).toHaveBeenCalledExactlyOnceWith(
          toSchemaFunctionMock,
        );
      });

      it('should call updateSchemaMetadata()', () => {
        expect(updateSchemaMetadataSchema).toHaveBeenCalledExactlyOnceWith(
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
