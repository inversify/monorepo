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

vitest.mock(
  import('../../actions/v3Dot2/toSchemaInControllerMetadataContext.js'),
);
vitest.mock(
  import('../../actions/v3Dot2/updateControllerOpenApiMetadataOperationArrayProperty.js'),
);

import {
  type OpenApi3Dot2ParameterObject,
  type OpenApi3Dot2ReferenceObject,
} from '@inversifyjs/open-api-types/v3Dot2';

import { controllerOpenApiMetadataReflectKey } from '../../../reflectMetadata/data/v3Dot2/controllerOpenApiMetadataReflectKey.js';
import { toSchemaInControllerOpenApiMetadataContext } from '../../actions/v3Dot2/toSchemaInControllerMetadataContext.js';
import { updateControllerOpenApiMetadataOperationArrayProperty } from '../../actions/v3Dot2/updateControllerOpenApiMetadataOperationArrayProperty.js';
import { buildDefaultControllerOpenApiMetadata } from '../../calculations/v3Dot2/buildDefaultControllerOpenApiMetadata.js';
import { type BuildOpenApiBlockFunction } from '../../models/v3Dot2/BuildOpenApiBlockFunction.js';
import { type ControllerOpenApiMetadata } from '../../models/v3Dot2/ControllerOpenApiMetadata.js';
import { type ToSchemaFunction } from '../../models/v3Dot2/ToSchemaFunction.js';
import { OasParameter } from './OasParameter.js';

describe(OasParameter, () => {
  describe('having a parameter object parameter', () => {
    let parameterFixture: OpenApi3Dot2ParameterObject;

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
    let referenceFixture: OpenApi3Dot2ReferenceObject;

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
      OpenApi3Dot2ParameterObject | OpenApi3Dot2ReferenceObject
    >;
    let toSchemaFunctionMock: Mock<ToSchemaFunction>;
    let builtParameterFixture: OpenApi3Dot2ParameterObject;

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
