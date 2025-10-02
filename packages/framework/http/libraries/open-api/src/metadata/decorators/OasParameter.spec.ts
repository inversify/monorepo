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

vitest.mock('../actions/toSchemaInControllerMetadataContext');
vitest.mock('../actions/updateControllerOpenApiMetadataOperationArrayProperty');

import {
  OpenApi3Dot1ParameterObject,
  OpenApi3Dot1ReferenceObject,
} from '@inversifyjs/open-api-types/v3Dot1';

import { controllerOpenApiMetadataReflectKey } from '../../reflectMetadata/data/controllerOpenApiMetadataReflectKey';
import { toSchemaInControllerOpenApiMetadataContext } from '../actions/toSchemaInControllerMetadataContext';
import { updateControllerOpenApiMetadataOperationArrayProperty } from '../actions/updateControllerOpenApiMetadataOperationArrayProperty';
import { buildDefaultControllerOpenApiMetadata } from '../calculations/buildDefaultControllerOpenApiMetadata';
import { BuildOpenApiBlockFunction } from '../models/BuildOpenApiBlockFunction';
import { ControllerOpenApiMetadata } from '../models/ControllerOpenApiMetadata';
import { ToSchemaFunction } from '../models/ToSchemaFunction';
import { OasParameter } from './OasParameter';

describe(OasParameter, () => {
  describe('having a parameter object parameter', () => {
    let parameterFixture: OpenApi3Dot1ParameterObject;

    beforeAll(() => {
      parameterFixture = {
        description: 'Number of items to return',
        in: 'query',
        name: 'limit',
        required: false,
        schema: {
          maximum: 100,
          minimum: 1,
          type: 'integer',
        },
      };
    });

    describe('when called', () => {
      let targetFixture: object;
      let keyFixture: string;
      let updateControllerOpenApiMetadataOperationArrayPropertyResultMock: Mock<
        (metadata: ControllerOpenApiMetadata) => ControllerOpenApiMetadata
      >;

      let result: unknown;

      beforeAll(() => {
        targetFixture = { constructor: class TestController {} };
        keyFixture = 'testMethod';

        updateControllerOpenApiMetadataOperationArrayPropertyResultMock =
          vitest.fn();

        vitest
          .mocked(updateControllerOpenApiMetadataOperationArrayProperty)
          .mockReturnValueOnce(
            updateControllerOpenApiMetadataOperationArrayPropertyResultMock,
          );

        result = OasParameter(parameterFixture)(
          targetFixture,
          keyFixture,
          Symbol() as unknown as TypedPropertyDescriptor<unknown>,
        );
      });

      afterAll(() => {
        vitest.clearAllMocks();
      });

      it('should call updateControllerOpenApiMetadataOperationArrayProperty()', () => {
        expect(
          updateControllerOpenApiMetadataOperationArrayProperty,
        ).toHaveBeenCalledExactlyOnceWith(
          parameterFixture,
          keyFixture,
          'parameters',
        );
      });

      it('should call updateOwnReflectMetadata()', () => {
        expect(updateOwnReflectMetadata).toHaveBeenCalledExactlyOnceWith(
          targetFixture.constructor,
          controllerOpenApiMetadataReflectKey,
          buildDefaultControllerOpenApiMetadata,
          updateControllerOpenApiMetadataOperationArrayPropertyResultMock,
        );
      });

      it('should return undefined', () => {
        expect(result).toBeUndefined();
      });
    });
  });

  describe('having a reference object parameter', () => {
    let referenceFixture: OpenApi3Dot1ReferenceObject;

    beforeAll(() => {
      referenceFixture = {
        $ref: '#/components/parameters/LimitParam',
      };
    });

    describe('when called', () => {
      let targetFixture: object;
      let keyFixture: string;
      let updateControllerOpenApiMetadataOperationArrayPropertyResultMock: Mock<
        (metadata: ControllerOpenApiMetadata) => ControllerOpenApiMetadata
      >;

      let result: unknown;

      beforeAll(() => {
        targetFixture = { constructor: class TestController {} };
        keyFixture = 'testMethod';

        updateControllerOpenApiMetadataOperationArrayPropertyResultMock =
          vitest.fn();

        vitest
          .mocked(updateControllerOpenApiMetadataOperationArrayProperty)
          .mockReturnValueOnce(
            updateControllerOpenApiMetadataOperationArrayPropertyResultMock,
          );

        result = OasParameter(referenceFixture)(
          targetFixture,
          keyFixture,
          Symbol() as unknown as TypedPropertyDescriptor<unknown>,
        );
      });

      afterAll(() => {
        vitest.clearAllMocks();
      });

      it('should call updateControllerOpenApiMetadataOperationArrayProperty()', () => {
        expect(
          updateControllerOpenApiMetadataOperationArrayProperty,
        ).toHaveBeenCalledExactlyOnceWith(
          referenceFixture,
          keyFixture,
          'parameters',
        );
      });

      it('should call updateOwnReflectMetadata()', () => {
        expect(updateOwnReflectMetadata).toHaveBeenCalledExactlyOnceWith(
          targetFixture.constructor,
          controllerOpenApiMetadataReflectKey,
          buildDefaultControllerOpenApiMetadata,
          updateControllerOpenApiMetadataOperationArrayPropertyResultMock,
        );
      });

      it('should return undefined', () => {
        expect(result).toBeUndefined();
      });
    });
  });

  describe('having a build function parameter', () => {
    let buildFunctionFixture: BuildOpenApiBlockFunction<
      OpenApi3Dot1ParameterObject | OpenApi3Dot1ReferenceObject
    >;
    let toSchemaFunctionMock: Mock<ToSchemaFunction>;
    let builtParameterFixture: OpenApi3Dot1ParameterObject;

    beforeAll(() => {
      builtParameterFixture = {
        description: 'Resource identifier',
        in: 'path',
        name: 'id',
        required: true,
        schema: {
          format: 'uuid',
          type: 'string',
        },
      };

      toSchemaFunctionMock = vitest.fn();

      buildFunctionFixture = vitest
        .fn()
        .mockReturnValueOnce(builtParameterFixture);

      vitest
        .mocked(toSchemaInControllerOpenApiMetadataContext)
        .mockReturnValueOnce(toSchemaFunctionMock);
    });

    describe('when called', () => {
      let targetFixture: object;
      let keyFixture: string;
      let updateControllerOpenApiMetadataOperationArrayPropertyResultMock: Mock<
        (metadata: ControllerOpenApiMetadata) => ControllerOpenApiMetadata
      >;

      let result: unknown;

      beforeAll(() => {
        targetFixture = { constructor: class TestController {} };
        keyFixture = 'getMethod';

        updateControllerOpenApiMetadataOperationArrayPropertyResultMock =
          vitest.fn();

        vitest
          .mocked(updateControllerOpenApiMetadataOperationArrayProperty)
          .mockReturnValueOnce(
            updateControllerOpenApiMetadataOperationArrayPropertyResultMock,
          );

        result = OasParameter(buildFunctionFixture)(
          targetFixture,
          keyFixture,
          Symbol() as unknown as TypedPropertyDescriptor<unknown>,
        );
      });

      afterAll(() => {
        vitest.clearAllMocks();
      });

      it('should call toSchemaInControllerOpenApiMetadataContext()', () => {
        expect(
          toSchemaInControllerOpenApiMetadataContext,
        ).toHaveBeenCalledExactlyOnceWith(targetFixture.constructor);
      });

      it('should call build function with toSchema result', () => {
        expect(buildFunctionFixture).toHaveBeenCalledExactlyOnceWith(
          toSchemaFunctionMock,
        );
      });

      it('should call updateControllerOpenApiMetadataOperationArrayProperty()', () => {
        expect(
          updateControllerOpenApiMetadataOperationArrayProperty,
        ).toHaveBeenCalledExactlyOnceWith(
          builtParameterFixture,
          keyFixture,
          'parameters',
        );
      });

      it('should call updateOwnReflectMetadata()', () => {
        expect(updateOwnReflectMetadata).toHaveBeenCalledExactlyOnceWith(
          targetFixture.constructor,
          controllerOpenApiMetadataReflectKey,
          buildDefaultControllerOpenApiMetadata,
          updateControllerOpenApiMetadataOperationArrayPropertyResultMock,
        );
      });

      it('should return undefined', () => {
        expect(result).toBeUndefined();
      });
    });
  });
});
