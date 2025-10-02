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
vitest.mock('../actions/updateControllerOpenApiMetadataOperationProperty');

import {
  OpenApi3Dot1ReferenceObject,
  OpenApi3Dot1RequestBodyObject,
} from '@inversifyjs/open-api-types/v3Dot1';

import { controllerOpenApiMetadataReflectKey } from '../../reflectMetadata/data/controllerOpenApiMetadataReflectKey';
import { toSchemaInControllerOpenApiMetadataContext } from '../actions/toSchemaInControllerMetadataContext';
import { updateControllerOpenApiMetadataOperationProperty } from '../actions/updateControllerOpenApiMetadataOperationProperty';
import { buildDefaultControllerOpenApiMetadata } from '../calculations/buildDefaultControllerOpenApiMetadata';
import { BuildOpenApiBlockFunction } from '../models/BuildOpenApiBlockFunction';
import { ControllerOpenApiMetadata } from '../models/ControllerOpenApiMetadata';
import { ToSchemaFunction } from '../models/ToSchemaFunction';
import { OasRequestBody } from './OasRequestBody';

describe(OasRequestBody, () => {
  describe('having a request body object parameter', () => {
    let requestBodyFixture: OpenApi3Dot1RequestBodyObject;

    beforeAll(() => {
      requestBodyFixture = {
        content: {
          'application/json': {
            schema: {
              properties: {
                email: { format: 'email', type: 'string' },
                name: { type: 'string' },
              },
              required: ['name', 'email'],
              type: 'object',
            },
          },
        },
        description: 'User data to create',
        required: true,
      };
    });

    describe('when called', () => {
      let targetFixture: object;
      let keyFixture: string;
      let updateControllerOpenApiMetadataOperationPropertyResultMock: Mock<
        (metadata: ControllerOpenApiMetadata) => ControllerOpenApiMetadata
      >;

      let result: unknown;

      beforeAll(() => {
        targetFixture = { constructor: class TestController {} };
        keyFixture = 'testMethod';

        updateControllerOpenApiMetadataOperationPropertyResultMock =
          vitest.fn();

        vitest
          .mocked(updateControllerOpenApiMetadataOperationProperty)
          .mockReturnValueOnce(
            updateControllerOpenApiMetadataOperationPropertyResultMock,
          );

        result = OasRequestBody(requestBodyFixture)(
          targetFixture,
          keyFixture,
          Symbol() as unknown as TypedPropertyDescriptor<unknown>,
        );
      });

      afterAll(() => {
        vitest.clearAllMocks();
      });

      it('should call updateControllerOpenApiMetadataOperationProperty()', () => {
        expect(
          updateControllerOpenApiMetadataOperationProperty,
        ).toHaveBeenCalledExactlyOnceWith(
          requestBodyFixture,
          targetFixture.constructor,
          keyFixture,
          'requestBody',
        );
      });

      it('should call updateOwnReflectMetadata()', () => {
        expect(updateOwnReflectMetadata).toHaveBeenCalledExactlyOnceWith(
          targetFixture.constructor,
          controllerOpenApiMetadataReflectKey,
          buildDefaultControllerOpenApiMetadata,
          updateControllerOpenApiMetadataOperationPropertyResultMock,
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
        $ref: '#/components/requestBodies/CreateUserRequest',
      };
    });

    describe('when called', () => {
      let targetFixture: object;
      let keyFixture: string;
      let updateControllerOpenApiMetadataOperationPropertyResultMock: Mock<
        (metadata: ControllerOpenApiMetadata) => ControllerOpenApiMetadata
      >;

      let result: unknown;

      beforeAll(() => {
        targetFixture = { constructor: class TestController {} };
        keyFixture = 'testMethod';

        updateControllerOpenApiMetadataOperationPropertyResultMock =
          vitest.fn();

        vitest
          .mocked(updateControllerOpenApiMetadataOperationProperty)
          .mockReturnValueOnce(
            updateControllerOpenApiMetadataOperationPropertyResultMock,
          );

        result = OasRequestBody(referenceFixture)(
          targetFixture,
          keyFixture,
          Symbol() as unknown as TypedPropertyDescriptor<unknown>,
        );
      });

      afterAll(() => {
        vitest.clearAllMocks();
      });

      it('should call updateControllerOpenApiMetadataOperationProperty()', () => {
        expect(
          updateControllerOpenApiMetadataOperationProperty,
        ).toHaveBeenCalledExactlyOnceWith(
          referenceFixture,
          targetFixture.constructor,
          keyFixture,
          'requestBody',
        );
      });

      it('should call updateOwnReflectMetadata()', () => {
        expect(updateOwnReflectMetadata).toHaveBeenCalledExactlyOnceWith(
          targetFixture.constructor,
          controllerOpenApiMetadataReflectKey,
          buildDefaultControllerOpenApiMetadata,
          updateControllerOpenApiMetadataOperationPropertyResultMock,
        );
      });

      it('should return undefined', () => {
        expect(result).toBeUndefined();
      });
    });
  });

  describe('having a build function parameter', () => {
    let buildFunctionFixture: BuildOpenApiBlockFunction<
      OpenApi3Dot1RequestBodyObject | OpenApi3Dot1ReferenceObject
    >;
    let toSchemaFunctionMock: Mock<ToSchemaFunction>;
    let builtRequestBodyFixture: OpenApi3Dot1RequestBodyObject;

    beforeAll(() => {
      builtRequestBodyFixture = {
        content: {
          'application/json': {
            schema: {
              properties: {
                description: { type: 'string' },
                id: { type: 'string' },
                status: { enum: ['active', 'inactive'], type: 'string' },
              },
              required: ['id', 'status'],
              type: 'object',
            },
          },
        },
        description: 'Update request body',
        required: false,
      };

      toSchemaFunctionMock = vitest.fn();

      buildFunctionFixture = vitest
        .fn()
        .mockReturnValueOnce(builtRequestBodyFixture);

      vitest
        .mocked(toSchemaInControllerOpenApiMetadataContext)
        .mockReturnValueOnce(toSchemaFunctionMock);
    });

    describe('when called', () => {
      let targetFixture: object;
      let keyFixture: string;
      let updateControllerOpenApiMetadataOperationPropertyResultMock: Mock<
        (metadata: ControllerOpenApiMetadata) => ControllerOpenApiMetadata
      >;

      let result: unknown;

      beforeAll(() => {
        targetFixture = { constructor: class TestController {} };
        keyFixture = 'updateMethod';

        updateControllerOpenApiMetadataOperationPropertyResultMock =
          vitest.fn();

        vitest
          .mocked(updateControllerOpenApiMetadataOperationProperty)
          .mockReturnValueOnce(
            updateControllerOpenApiMetadataOperationPropertyResultMock,
          );

        result = OasRequestBody(buildFunctionFixture)(
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

      it('should call updateControllerOpenApiMetadataOperationProperty()', () => {
        expect(
          updateControllerOpenApiMetadataOperationProperty,
        ).toHaveBeenCalledExactlyOnceWith(
          builtRequestBodyFixture,
          targetFixture.constructor,
          keyFixture,
          'requestBody',
        );
      });

      it('should call updateOwnReflectMetadata()', () => {
        expect(updateOwnReflectMetadata).toHaveBeenCalledExactlyOnceWith(
          targetFixture.constructor,
          controllerOpenApiMetadataReflectKey,
          buildDefaultControllerOpenApiMetadata,
          updateControllerOpenApiMetadataOperationPropertyResultMock,
        );
      });

      it('should return undefined', () => {
        expect(result).toBeUndefined();
      });
    });
  });
});
