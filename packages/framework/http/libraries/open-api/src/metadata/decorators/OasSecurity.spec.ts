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
  import('../actions/updateControllerOpenApiMetadataOperationArrayProperty.js'),
);

import { type OpenApi3Dot1SecurityRequirementObject } from '@inversifyjs/open-api-types/v3Dot1';

import { controllerOpenApiMetadataReflectKey } from '../../reflectMetadata/data/controllerOpenApiMetadataReflectKey.js';
import { updateControllerOpenApiMetadataOperationArrayProperty } from '../actions/updateControllerOpenApiMetadataOperationArrayProperty.js';
import { buildDefaultControllerOpenApiMetadata } from '../calculations/buildDefaultControllerOpenApiMetadata.js';
import { type ControllerOpenApiMetadata } from '../models/ControllerOpenApiMetadata.js';
import { OasSecurity } from './OasSecurity.js';

describe(OasSecurity, () => {
  describe('having a prototype target, key and type descriptor', () => {
    let contentFixture: OpenApi3Dot1SecurityRequirementObject;
    // eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
    let targetTypeFixture: Function;
    let keyFixture: string | symbol;

    beforeAll(() => {
      contentFixture = {
        test: ['Test security'],
      };
      targetTypeFixture = function test() {};
      keyFixture = 'testKey';
    });

    describe('when called', () => {
      let updateControllerOpenApiMetadataOperationArrayPropertyResultMock: Mock<
        (metadata: ControllerOpenApiMetadata) => ControllerOpenApiMetadata
      >;

      let result: unknown;

      beforeAll(() => {
        updateControllerOpenApiMetadataOperationArrayPropertyResultMock =
          vitest.fn();

        vitest
          .mocked(updateControllerOpenApiMetadataOperationArrayProperty)
          .mockReturnValueOnce(
            updateControllerOpenApiMetadataOperationArrayPropertyResultMock,
          );

        result = OasSecurity(contentFixture)(
          targetTypeFixture.prototype as object,
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
          contentFixture,
          keyFixture,
          'security',
        );
      });

      it('should call updateOwnReflectMetadata()', () => {
        expect(updateOwnReflectMetadata).toHaveBeenCalledExactlyOnceWith(
          targetTypeFixture,
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
