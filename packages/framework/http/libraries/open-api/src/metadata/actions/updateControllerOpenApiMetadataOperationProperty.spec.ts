import {
  afterAll,
  beforeAll,
  describe,
  expect,
  it,
  type Mock,
  vitest,
} from 'vitest';

import { updateControllerOpenApiMetadataOperationProperty } from './updateControllerOpenApiMetadataOperationProperty.js';

describe(updateControllerOpenApiMetadataOperationProperty, () => {
  let buildOrGetOperationObjectMock: Mock<
    (
      metadata: Record<string | symbol, unknown>,
      methodKey: string | symbol,
    ) => Record<string | symbol, unknown>
  >;

  let keyFixture: string;
  let metadataFixture: Record<string | symbol, unknown>;
  let methodKeyFixture: string | symbol;
  // eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
  let targetFixture: Function;
  let valueFixture: unknown;

  beforeAll(() => {
    buildOrGetOperationObjectMock = vitest.fn();

    keyFixture = 'requestBody';
    metadataFixture = {};
    methodKeyFixture = 'getUsers';
    targetFixture = class {};
    valueFixture = Symbol();
  });

  describe('when called, and buildOrGetOperationObject() returns an empty metadata object', () => {
    let operationObjectFixture: Record<string | symbol, unknown>;

    let result: unknown;

    beforeAll(() => {
      operationObjectFixture = {};

      buildOrGetOperationObjectMock.mockReturnValueOnce(operationObjectFixture);

      result = updateControllerOpenApiMetadataOperationProperty(
        buildOrGetOperationObjectMock,
      )(
        valueFixture,
        targetFixture,
        methodKeyFixture,
        keyFixture,
      )(metadataFixture);
    });

    afterAll(() => {
      vitest.clearAllMocks();
    });

    it('should set property value', () => {
      expect(operationObjectFixture[keyFixture]).toBe(valueFixture);
    });

    it('should return expected result', () => {
      expect(result).toBe(metadataFixture);
    });
  });

  describe('when called, and buildOrGetOperationObject() returns a metadata object with defined property value', () => {
    let operationObjectFixture: Record<string | symbol, unknown>;

    let result: unknown;

    beforeAll(() => {
      operationObjectFixture = {
        [keyFixture]: Symbol(),
      };

      buildOrGetOperationObjectMock.mockReturnValueOnce(operationObjectFixture);

      try {
        updateControllerOpenApiMetadataOperationProperty(
          buildOrGetOperationObjectMock,
        )(
          valueFixture,
          targetFixture,
          methodKeyFixture,
          keyFixture,
        )(metadataFixture);
      } catch (error: unknown) {
        result = error;
      }
    });

    afterAll(() => {
      vitest.clearAllMocks();
    });

    it('should throw an Error', () => {
      const expectedErrorProperties: Partial<Error> = {
        message: `Cannot define ${targetFixture.name}.${methodKeyFixture.toString()} ${keyFixture} more than once`,
      };

      expect(result).toBeInstanceOf(Error);
      expect(result).toMatchObject(expectedErrorProperties);
    });
  });
});
