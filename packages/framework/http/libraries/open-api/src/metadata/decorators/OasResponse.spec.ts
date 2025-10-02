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
vitest.mock(
  '../actions/updateControllerOpenApiMetadataOperationRecordProperty',
);

import { HttpStatusCode } from '@inversifyjs/http-core';
import { OpenApi3Dot1ResponseObject } from '@inversifyjs/open-api-types/v3Dot1';

import { controllerOpenApiMetadataReflectKey } from '../../reflectMetadata/data/controllerOpenApiMetadataReflectKey';
import { toSchemaInControllerOpenApiMetadataContext } from '../actions/toSchemaInControllerMetadataContext';
import { updateControllerOpenApiMetadataOperationRecordProperty } from '../actions/updateControllerOpenApiMetadataOperationRecordProperty';
import { buildDefaultControllerOpenApiMetadata } from '../calculations/buildDefaultControllerOpenApiMetadata';
import { BuildOpenApiBlockFunction } from '../models/BuildOpenApiBlockFunction';
import { ControllerOpenApiMetadata } from '../models/ControllerOpenApiMetadata';
import { ToSchemaFunction } from '../models/ToSchemaFunction';
import { OasResponse } from './OasResponse';

describe(OasResponse, () => {
  describe('having a response object parameter', () => {
    let codeFixture: HttpStatusCode;
    let responseFixture: OpenApi3Dot1ResponseObject;

    beforeAll(() => {
      codeFixture = HttpStatusCode.OK;
      responseFixture = {
        content: {
          'application/json': {
            schema: {
              properties: {
                id: { type: 'string' },
                name: { type: 'string' },
              },
              required: ['id', 'name'],
              type: 'object',
            },
          },
        },
        description: 'Successful response',
      };
    });

    describe('when called', () => {
      let targetFixture: object;
      let keyFixture: string;
      let updateControllerOpenApiMetadataOperationRecordPropertyResultMock: Mock<
        (metadata: ControllerOpenApiMetadata) => ControllerOpenApiMetadata
      >;

      let result: unknown;

      beforeAll(() => {
        targetFixture = { constructor: class TestController {} };
        keyFixture = 'testMethod';

        updateControllerOpenApiMetadataOperationRecordPropertyResultMock =
          vitest.fn();

        vitest
          .mocked(updateControllerOpenApiMetadataOperationRecordProperty)
          .mockReturnValueOnce(
            updateControllerOpenApiMetadataOperationRecordPropertyResultMock,
          );

        result = OasResponse(codeFixture, responseFixture)(
          targetFixture,
          keyFixture,
          Symbol() as unknown as TypedPropertyDescriptor<unknown>,
        );
      });

      afterAll(() => {
        vitest.clearAllMocks();
      });

      it('should call updateControllerOpenApiMetadataOperationRecordProperty()', () => {
        expect(
          updateControllerOpenApiMetadataOperationRecordProperty,
        ).toHaveBeenCalledExactlyOnceWith(
          codeFixture.toString(),
          responseFixture,
          targetFixture.constructor,
          keyFixture,
          'responses',
        );
      });

      it('should call updateOwnReflectMetadata()', () => {
        expect(updateOwnReflectMetadata).toHaveBeenCalledExactlyOnceWith(
          targetFixture.constructor,
          controllerOpenApiMetadataReflectKey,
          buildDefaultControllerOpenApiMetadata,
          updateControllerOpenApiMetadataOperationRecordPropertyResultMock,
        );
      });

      it('should return undefined', () => {
        expect(result).toBeUndefined();
      });
    });
  });

  describe('having a build function parameter', () => {
    let codeFixture: HttpStatusCode;
    let buildFunctionFixture: BuildOpenApiBlockFunction<OpenApi3Dot1ResponseObject>;
    let toSchemaFunctionMock: Mock<ToSchemaFunction>;
    let builtResponseFixture: OpenApi3Dot1ResponseObject;

    beforeAll(() => {
      codeFixture = HttpStatusCode.CREATED;
      builtResponseFixture = {
        content: {
          'application/json': {
            schema: {
              properties: {
                createdAt: { format: 'date-time', type: 'string' },
                id: { type: 'string' },
              },
              required: ['id', 'createdAt'],
              type: 'object',
            },
          },
        },
        description: 'Created response',
      };

      toSchemaFunctionMock = vitest.fn();

      buildFunctionFixture = vitest
        .fn()
        .mockReturnValueOnce(builtResponseFixture);

      vitest
        .mocked(toSchemaInControllerOpenApiMetadataContext)
        .mockReturnValueOnce(toSchemaFunctionMock);
    });

    describe('when called', () => {
      let targetFixture: object;
      let keyFixture: string;
      let updateControllerOpenApiMetadataOperationRecordPropertyResultMock: Mock<
        (metadata: ControllerOpenApiMetadata) => ControllerOpenApiMetadata
      >;

      let result: unknown;

      beforeAll(() => {
        targetFixture = { constructor: class TestController {} };
        keyFixture = 'createMethod';

        updateControllerOpenApiMetadataOperationRecordPropertyResultMock =
          vitest.fn();

        vitest
          .mocked(updateControllerOpenApiMetadataOperationRecordProperty)
          .mockReturnValueOnce(
            updateControllerOpenApiMetadataOperationRecordPropertyResultMock,
          );

        result = OasResponse(codeFixture, buildFunctionFixture)(
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

      it('should call updateControllerOpenApiMetadataOperationRecordProperty()', () => {
        expect(
          updateControllerOpenApiMetadataOperationRecordProperty,
        ).toHaveBeenCalledExactlyOnceWith(
          codeFixture.toString(),
          builtResponseFixture,
          targetFixture.constructor,
          keyFixture,
          'responses',
        );
      });

      it('should call updateOwnReflectMetadata()', () => {
        expect(updateOwnReflectMetadata).toHaveBeenCalledExactlyOnceWith(
          targetFixture.constructor,
          controllerOpenApiMetadataReflectKey,
          buildDefaultControllerOpenApiMetadata,
          updateControllerOpenApiMetadataOperationRecordPropertyResultMock,
        );
      });

      it('should return undefined', () => {
        expect(result).toBeUndefined();
      });
    });
  });
});
