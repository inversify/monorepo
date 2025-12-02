import {
  afterAll,
  beforeAll,
  describe,
  expect,
  it,
  Mock,
  vitest,
} from 'vitest';

import 'reflect-metadata/lite';

vitest.mock('./getReflectMetadata');

import { getReflectMetadata } from './getReflectMetadata';
import { updateReflectMetadata } from './updateReflectMetadata';

describe(updateReflectMetadata, () => {
  describe('having no property key', () => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
    let targetFixture: Function;
    let metadataKeyFixture: unknown;
    let buildDefaultValueMock: Mock<() => unknown>;
    let callbackMock: Mock<(value: unknown) => unknown>;

    beforeAll(() => {
      targetFixture = class {};
      metadataKeyFixture = 'sample-key';
      buildDefaultValueMock = vitest.fn();
      callbackMock = vitest.fn();
    });

    describe('when called, and getReflectMetadata returns undefined', () => {
      let defaultValueFixture: unknown;
      let reflectMetadata: unknown;

      beforeAll(() => {
        defaultValueFixture = 'default-value';
        buildDefaultValueMock.mockReturnValueOnce(defaultValueFixture);
        callbackMock.mockImplementationOnce((value: unknown) => value);

        vitest.mocked(getReflectMetadata).mockReturnValueOnce(undefined);

        updateReflectMetadata(
          targetFixture,
          metadataKeyFixture,
          buildDefaultValueMock,
          callbackMock,
        );

        reflectMetadata = Reflect.getOwnMetadata(
          metadataKeyFixture,
          targetFixture,
        );
      });

      afterAll(() => {
        vitest.clearAllMocks();
      });

      it('should call getReflectMetadata()', () => {
        expect(getReflectMetadata).toHaveBeenCalledExactlyOnceWith(
          targetFixture,
          metadataKeyFixture,
          undefined,
        );
      });

      it('should call buildDefaultValue', () => {
        expect(buildDefaultValueMock).toHaveBeenCalledExactlyOnceWith();
      });

      it('should call callback()', () => {
        expect(callbackMock).toHaveBeenCalledExactlyOnceWith(
          defaultValueFixture,
        );
      });

      it('should define metadata', () => {
        expect(reflectMetadata).toBe(defaultValueFixture);
      });
    });

    describe('when called, and getReflectMetadata returns metadata', () => {
      let metadataFixture: unknown;
      let reflectMetadata: unknown;

      beforeAll(() => {
        metadataFixture = 'metadata';

        vitest.mocked(getReflectMetadata).mockReturnValueOnce(metadataFixture);

        callbackMock.mockImplementationOnce((value: unknown) => value);

        updateReflectMetadata(
          targetFixture,
          metadataKeyFixture,
          buildDefaultValueMock,
          callbackMock,
        );

        reflectMetadata = Reflect.getOwnMetadata(
          metadataKeyFixture,
          targetFixture,
        );
      });

      afterAll(() => {
        vitest.clearAllMocks();

        Reflect.deleteMetadata(metadataKeyFixture, targetFixture);
      });

      it('should call getReflectMetadata()', () => {
        expect(getReflectMetadata).toHaveBeenCalledExactlyOnceWith(
          targetFixture,
          metadataKeyFixture,
          undefined,
        );
      });

      it('should not call buildDefaultValue()', () => {
        expect(buildDefaultValueMock).not.toHaveBeenCalled();
      });

      it('should call callback()', () => {
        expect(callbackMock).toHaveBeenCalledExactlyOnceWith(metadataFixture);
      });

      it('should define metadata', () => {
        expect(reflectMetadata).toBe(metadataFixture);
      });
    });
  });

  describe('having property key', () => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
    let targetFixture: Function;
    let metadataKeyFixture: unknown;
    let buildDefaultValueMock: Mock<() => unknown>;
    let callbackMock: Mock<(value: unknown) => unknown>;
    let propertyKeyFixture: string | symbol;

    beforeAll(() => {
      targetFixture = class {};
      metadataKeyFixture = 'sample-key';
      buildDefaultValueMock = vitest.fn();
      callbackMock = vitest.fn();
      propertyKeyFixture = Symbol();
    });

    describe('when called, and getReflectMetadata returns undefined', () => {
      let defaultValueFixture: unknown;
      let reflectMetadata: unknown;

      beforeAll(() => {
        defaultValueFixture = 'default-value';
        buildDefaultValueMock.mockReturnValueOnce(defaultValueFixture);
        callbackMock.mockImplementationOnce((value: unknown) => value);

        vitest.mocked(getReflectMetadata).mockReturnValueOnce(undefined);

        updateReflectMetadata(
          targetFixture,
          metadataKeyFixture,
          buildDefaultValueMock,
          callbackMock,
          propertyKeyFixture,
        );

        reflectMetadata = Reflect.getOwnMetadata(
          metadataKeyFixture,
          targetFixture,
          propertyKeyFixture,
        );
      });

      afterAll(() => {
        vitest.clearAllMocks();
      });

      it('should call getReflectMetadata()', () => {
        expect(getReflectMetadata).toHaveBeenCalledExactlyOnceWith(
          targetFixture,
          metadataKeyFixture,
          propertyKeyFixture,
        );
      });

      it('should call buildDefaultValue', () => {
        expect(buildDefaultValueMock).toHaveBeenCalledExactlyOnceWith();
      });

      it('should call callback()', () => {
        expect(callbackMock).toHaveBeenCalledExactlyOnceWith(
          defaultValueFixture,
        );
      });

      it('should define metadata', () => {
        expect(reflectMetadata).toBe(defaultValueFixture);
      });
    });

    describe('when called, and getReflectMetadata returns metadata', () => {
      let metadataFixture: unknown;
      let reflectMetadata: unknown;

      beforeAll(() => {
        metadataFixture = 'metadata';

        vitest.mocked(getReflectMetadata).mockReturnValueOnce(metadataFixture);

        callbackMock.mockImplementationOnce((value: unknown) => value);

        updateReflectMetadata(
          targetFixture,
          metadataKeyFixture,
          buildDefaultValueMock,
          callbackMock,
          propertyKeyFixture,
        );

        reflectMetadata = Reflect.getOwnMetadata(
          metadataKeyFixture,
          targetFixture,
          propertyKeyFixture,
        );
      });

      afterAll(() => {
        vitest.clearAllMocks();

        Reflect.deleteMetadata(
          metadataKeyFixture,
          targetFixture,
          propertyKeyFixture,
        );
      });

      it('should call getReflectMetadata()', () => {
        expect(getReflectMetadata).toHaveBeenCalledExactlyOnceWith(
          targetFixture,
          metadataKeyFixture,
          propertyKeyFixture,
        );
      });

      it('should not call buildDefaultValue()', () => {
        expect(buildDefaultValueMock).not.toHaveBeenCalled();
      });

      it('should call callback()', () => {
        expect(callbackMock).toHaveBeenCalledExactlyOnceWith(metadataFixture);
      });

      it('should define metadata', () => {
        expect(reflectMetadata).toBe(metadataFixture);
      });
    });
  });
});
