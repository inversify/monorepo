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

vitest.mock('../actions/updateControllerOpenApiMetadataSummary');

import { controllerOpenApiMetadataReflectKey } from '../../reflectMetadata/data/controllerOpenApiMetadataReflectKey';
import { updateControllerOpenApiMetadataSummary } from '../actions/updateControllerOpenApiMetadataSummary';
import { buildDefaultControllerOpenApiMetadata } from '../calculations/buildDefaultControllerOpenApiMetadata';
import { ControllerOpenApiMetadata } from '../models/ControllerOpenApiMetadata';
import { OasSummary } from './OasSummary';

describe(OasSummary, () => {
  let summaryFixture: string;

  beforeAll(() => {
    summaryFixture = 'Test Summary';
  });

  describe('having a function target', () => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
    let targetTypeFixture: Function;

    beforeAll(() => {
      targetTypeFixture = function test() {};
    });

    describe('when called', () => {
      let updateControllerOpenApiMetadataSummaryResultMock: Mock<
        (metadata: ControllerOpenApiMetadata) => ControllerOpenApiMetadata
      >;

      let result: unknown;

      beforeAll(() => {
        updateControllerOpenApiMetadataSummaryResultMock = vitest.fn();

        vitest
          .mocked(updateControllerOpenApiMetadataSummary)
          .mockReturnValueOnce(
            updateControllerOpenApiMetadataSummaryResultMock,
          );

        result = OasSummary(summaryFixture)(targetTypeFixture);
      });

      afterAll(() => {
        vitest.clearAllMocks();
      });

      it('should call updateControllerOpenApiMetadataSummary()', () => {
        expect(
          updateControllerOpenApiMetadataSummary,
        ).toHaveBeenCalledExactlyOnceWith(
          summaryFixture,
          targetTypeFixture,
          undefined,
        );
      });

      it('should call updateOwnReflectMetadata()', () => {
        expect(updateOwnReflectMetadata).toHaveBeenCalledExactlyOnceWith(
          targetTypeFixture,
          controllerOpenApiMetadataReflectKey,
          buildDefaultControllerOpenApiMetadata,
          updateControllerOpenApiMetadataSummaryResultMock,
        );
      });

      it('should return undefined', () => {
        expect(result).toBeUndefined();
      });
    });
  });

  describe('having a prototype target, key and type descriptor', () => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
    let targetTypeFixture: Function;
    let keyFixture: string | symbol;

    beforeAll(() => {
      targetTypeFixture = function test() {};
      keyFixture = 'testKey';
    });

    describe('when called', () => {
      let updateControllerOpenApiMetadataSummaryResultMock: Mock<
        (metadata: ControllerOpenApiMetadata) => ControllerOpenApiMetadata
      >;

      let result: unknown;

      beforeAll(() => {
        updateControllerOpenApiMetadataSummaryResultMock = vitest.fn();

        vitest
          .mocked(updateControllerOpenApiMetadataSummary)
          .mockReturnValueOnce(
            updateControllerOpenApiMetadataSummaryResultMock,
          );

        result = OasSummary(summaryFixture)(
          targetTypeFixture.prototype as object,
          keyFixture,
          Symbol() as unknown as TypedPropertyDescriptor<unknown>,
        );
      });

      afterAll(() => {
        vitest.clearAllMocks();
      });

      it('should call updateControllerOpenApiMetadataSummary()', () => {
        expect(
          updateControllerOpenApiMetadataSummary,
        ).toHaveBeenCalledExactlyOnceWith(
          summaryFixture,
          targetTypeFixture,
          keyFixture,
        );
      });

      it('should call updateOwnReflectMetadata()', () => {
        expect(updateOwnReflectMetadata).toHaveBeenCalledExactlyOnceWith(
          targetTypeFixture,
          controllerOpenApiMetadataReflectKey,
          buildDefaultControllerOpenApiMetadata,
          updateControllerOpenApiMetadataSummaryResultMock,
        );
      });

      it('should return undefined', () => {
        expect(result).toBeUndefined();
      });
    });
  });
});
