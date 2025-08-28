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

vitest.mock('../actions/updateControllerOpenApiMetadataOperationProperty');

import { controllerOpenApiMetadataReflectKey } from '../../reflectMetadata/data/controllerOpenApiMetadataReflectKey';
import { updateControllerOpenApiMetadataOperationProperty } from '../actions/updateControllerOpenApiMetadataOperationProperty';
import { buildDefaultControllerOpenApiMetadata } from '../calculations/buildDefaultControllerOpenApiMetadata';
import { ControllerOpenApiMetadata } from '../models/ControllerOpenApiMetadata';
import { OperationId } from './OperationId';

describe(OperationId, () => {
  describe('having a prototype target, key and type descriptor', () => {
    let contentFixture: string;
    // eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
    let targetTypeFixture: Function;
    let keyFixture: string | symbol;

    beforeAll(() => {
      contentFixture = 'Test operationId';
      targetTypeFixture = function test() {};
      keyFixture = 'testKey';
    });

    describe('when called', () => {
      let updateControllerOpenApiMetadataOperationPropertyResultMock: Mock<
        (metadata: ControllerOpenApiMetadata) => ControllerOpenApiMetadata
      >;

      let result: unknown;

      beforeAll(() => {
        updateControllerOpenApiMetadataOperationPropertyResultMock =
          vitest.fn();

        vitest
          .mocked(updateControllerOpenApiMetadataOperationProperty)
          .mockReturnValueOnce(
            updateControllerOpenApiMetadataOperationPropertyResultMock,
          );

        result = OperationId(contentFixture)(
          targetTypeFixture.prototype as object,
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
        ).toHaveBeenCalledTimes(1);
        expect(
          updateControllerOpenApiMetadataOperationProperty,
        ).toHaveBeenCalledWith(
          contentFixture,
          targetTypeFixture,
          keyFixture,
          'operationId',
        );
      });

      it('should call updateOwnReflectMetadata()', () => {
        expect(updateOwnReflectMetadata).toHaveBeenCalledTimes(1);
        expect(updateOwnReflectMetadata).toHaveBeenCalledWith(
          targetTypeFixture,
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
