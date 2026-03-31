import {
  afterAll,
  beforeAll,
  describe,
  expect,
  it,
  type Mock,
  vitest,
} from 'vitest';

import { updateControllerOpenApiMetadataOperationArrayProperty } from './updateControllerOpenApiMetadataOperationArrayProperty.js';

describe(updateControllerOpenApiMetadataOperationArrayProperty, () => {
  let buildOrGetOperationObjectMock: Mock<
    (
      metadata: Record<string | symbol, unknown[] | undefined>,
      methodKey: string | symbol,
    ) => Record<string | symbol, unknown[]>
  >;

  let keyFixture: string;
  let metadataFixture: Record<string | symbol, unknown[] | undefined>;
  let methodKeyFixture: string | symbol;
  let valueFixture: unknown;

  beforeAll(() => {
    buildOrGetOperationObjectMock = vitest.fn();

    keyFixture = 'servers';
    metadataFixture = {};
    methodKeyFixture = 'getUsers';
    valueFixture = Symbol();
  });

  describe('when called, and buildOrGetOperationObject() returns an empty metadata object', () => {
    let operationObjectFixture: Record<string | symbol, unknown[]>;

    let result: unknown;

    beforeAll(() => {
      operationObjectFixture = {};

      buildOrGetOperationObjectMock.mockReturnValueOnce(operationObjectFixture);

      result = updateControllerOpenApiMetadataOperationArrayProperty(
        buildOrGetOperationObjectMock,
      )(
        valueFixture,
        methodKeyFixture,
        keyFixture,
      )(metadataFixture);
    });

    afterAll(() => {
      vitest.clearAllMocks();
    });

    it('should set property value', () => {
      expect(operationObjectFixture[keyFixture]).toStrictEqual([valueFixture]);
    });

    it('should return expected result', () => {
      expect(result).toBe(metadataFixture);
    });
  });

  describe('when called, and buildOrGetOperationObject() returns a metadata object with defined property value', () => {
    let operationObjectFixture: Record<string | symbol, unknown[]>;

    let result: unknown;

    beforeAll(() => {
      operationObjectFixture = {
        [keyFixture]: [Symbol()],
      };

      buildOrGetOperationObjectMock.mockReturnValueOnce(operationObjectFixture);

      result = updateControllerOpenApiMetadataOperationArrayProperty(
        buildOrGetOperationObjectMock,
      )(
        valueFixture,
        methodKeyFixture,
        keyFixture,
      )(metadataFixture);
    });

    afterAll(() => {
      vitest.clearAllMocks();
    });

    it('should add property value to existing array', () => {
      expect(operationObjectFixture[keyFixture]).toStrictEqual([
        ...(operationObjectFixture[keyFixture]?.slice(0, -1) ?? []),
        valueFixture,
      ]);
    });

    it('should return expected result', () => {
      expect(result).toBe(metadataFixture);
    });
  });
});
