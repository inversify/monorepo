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

vitest.mock('../actions/updateControllerOpenApiMetadataServer');

import { OpenApi3Dot1ServerObject } from '@inversifyjs/open-api-types/v3Dot1';

import { controllerOpenApiMetadataReflectKey } from '../../reflectMetadata/data/controllerOpenApiMetadataReflectKey';
import { updateControllerOpenApiMetadataServer } from '../actions/updateControllerOpenApiMetadataServer';
import { buildDefaultControllerOpenApiMetadata } from '../calculations/buildDefaultControllerOpenApiMetadata';
import { ControllerOpenApiMetadata } from '../models/ControllerOpenApiMetadata';
import { OasServer } from './OasServer';

describe(OasServer, () => {
  let serverFixture: OpenApi3Dot1ServerObject;

  beforeAll(() => {
    serverFixture = {
      description: 'Production server',
      url: 'https://api.example.com',
      variables: {
        version: {
          default: 'v1',
        },
      },
    };
  });

  describe('having a function target', () => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
    let targetTypeFixture: Function;

    beforeAll(() => {
      targetTypeFixture = function test() {};
    });

    describe('when called', () => {
      let updateControllerOpenApiMetadataServerResultMock: Mock<
        (metadata: ControllerOpenApiMetadata) => ControllerOpenApiMetadata
      >;

      let result: unknown;

      beforeAll(() => {
        updateControllerOpenApiMetadataServerResultMock = vitest.fn();

        vitest
          .mocked(updateControllerOpenApiMetadataServer)
          .mockReturnValueOnce(updateControllerOpenApiMetadataServerResultMock);

        result = OasServer(serverFixture)(targetTypeFixture);
      });

      afterAll(() => {
        vitest.clearAllMocks();
      });

      it('should call updateControllerOpenApiMetadataServer()', () => {
        expect(
          updateControllerOpenApiMetadataServer,
        ).toHaveBeenCalledExactlyOnceWith(serverFixture, undefined);
      });

      it('should call updateOwnReflectMetadata()', () => {
        expect(updateOwnReflectMetadata).toHaveBeenCalledExactlyOnceWith(
          targetTypeFixture,
          controllerOpenApiMetadataReflectKey,
          buildDefaultControllerOpenApiMetadata,
          updateControllerOpenApiMetadataServerResultMock,
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
      let updateControllerOpenApiMetadataServerResultMock: Mock<
        (metadata: ControllerOpenApiMetadata) => ControllerOpenApiMetadata
      >;

      let result: unknown;

      beforeAll(() => {
        updateControllerOpenApiMetadataServerResultMock = vitest.fn();

        vitest
          .mocked(updateControllerOpenApiMetadataServer)
          .mockReturnValueOnce(updateControllerOpenApiMetadataServerResultMock);

        result = OasServer(serverFixture)(
          targetTypeFixture.prototype as object,
          keyFixture,
          Symbol() as unknown as TypedPropertyDescriptor<unknown>,
        );
      });

      afterAll(() => {
        vitest.clearAllMocks();
      });

      it('should call updateControllerOpenApiMetadataServer()', () => {
        expect(
          updateControllerOpenApiMetadataServer,
        ).toHaveBeenCalledExactlyOnceWith(serverFixture, keyFixture);
      });

      it('should call updateOwnReflectMetadata()', () => {
        expect(updateOwnReflectMetadata).toHaveBeenCalledExactlyOnceWith(
          targetTypeFixture,
          controllerOpenApiMetadataReflectKey,
          buildDefaultControllerOpenApiMetadata,
          updateControllerOpenApiMetadataServerResultMock,
        );
      });

      it('should return undefined', () => {
        expect(result).toBeUndefined();
      });
    });
  });
});
