import {
  afterAll,
  beforeAll,
  describe,
  expect,
  it,
  type Mock,
  vitest,
} from 'vitest';

import { updateControllerOpenApiMetadataOperationRecordProperty } from './updateControllerOpenApiMetadataOperationRecordProperty.js';

describe(updateControllerOpenApiMetadataOperationRecordProperty, () => {
  let buildOrGetOperationObjectMock: Mock<
    (
      metadata: Record<string | symbol, Record<string, unknown>>,
      methodKey: string | symbol,
    ) => Record<string | symbol, Record<string, unknown>>
  >;

  let keyFixture: string;
  let metadataFixture: Record<string | symbol, Record<string, unknown>>;
  let methodKeyFixture: string | symbol;
  // eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
  let targetFixture: Function;
  let propertyKeyFixture: string;
  let valueFixture: unknown;

  beforeAll(() => {
    buildOrGetOperationObjectMock = vitest.fn();

    keyFixture = 'sample-content-type';
    metadataFixture = {};
    methodKeyFixture = 'getUsers';
    propertyKeyFixture = 'responses';
    targetFixture = class {};
    valueFixture = Symbol();
  });

  describe('when called, and buildOrGetOperationObject() returns an empty metadata object', () => {
    let operationObjectFixture: Record<
      string | symbol,
      Record<string, unknown>
    >;

    let result: unknown;

    beforeAll(() => {
      operationObjectFixture = {};

      buildOrGetOperationObjectMock.mockReturnValueOnce(operationObjectFixture);

      result = updateControllerOpenApiMetadataOperationRecordProperty(
        buildOrGetOperationObjectMock,
      )(
        keyFixture,
        valueFixture,
        targetFixture,
        methodKeyFixture,
        propertyKeyFixture,
      )(metadataFixture);
    });

    afterAll(() => {
      vitest.clearAllMocks();
    });

    it('should set property value', () => {
      expect(operationObjectFixture[propertyKeyFixture]).toStrictEqual({
        [keyFixture]: valueFixture,
      });
    });

    it('should return expected result', () => {
      expect(result).toBe(metadataFixture);
    });
  });

  describe('when called, and buildOrGetOperationObject() returns a metadata object with defined property value', () => {
    let operationObjectFixture: Record<
      string | symbol,
      Record<string, unknown>
    >;

    let result: unknown;

    beforeAll(() => {
      operationObjectFixture = {
        [propertyKeyFixture]: {
          [keyFixture]: Symbol(),
        },
      };

      buildOrGetOperationObjectMock.mockReturnValueOnce(operationObjectFixture);

      try {
        updateControllerOpenApiMetadataOperationRecordProperty(
          buildOrGetOperationObjectMock,
        )(
          keyFixture,
          valueFixture,
          targetFixture,
          methodKeyFixture,
          propertyKeyFixture,
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
        message: `Cannot define ${targetFixture.name}.${methodKeyFixture.toString()} ${propertyKeyFixture} (${keyFixture}) more than once`,
      };

      expect(result).toBeInstanceOf(Error);
      expect(result).toMatchObject(expectedErrorProperties);
    });
  });
});
