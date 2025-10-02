import { afterAll, beforeAll, describe, expect, it, vitest } from 'vitest';

vitest.mock('./buildOrGetOperationObject');

import { OpenApi3Dot1OperationObject } from '@inversifyjs/open-api-types/v3Dot1';

import { ControllerOpenApiMetadata } from '../models/ControllerOpenApiMetadata';
import { buildOrGetOperationObject } from './buildOrGetOperationObject';
import { updateControllerOpenApiMetadataSummary } from './updateControllerOpenApiMetadataSummary';

describe(updateControllerOpenApiMetadataSummary, () => {
  let summaryFixture: string;
  // eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
  let targetFixture: Function;

  beforeAll(() => {
    summaryFixture = 'Test Summary';
    targetFixture = function testController() {};
  });

  describe('having undefined key and metadata with undefined summary', () => {
    describe('when called', () => {
      let metadataFixture: ControllerOpenApiMetadata;

      let result: unknown;

      beforeAll(() => {
        metadataFixture = {
          methodToPathItemObjectMap: new Map(),
          references: new Set(),
          servers: undefined,
          summary: undefined,
        };

        result = updateControllerOpenApiMetadataSummary(
          summaryFixture,
          targetFixture,
          undefined,
        )(metadataFixture);
      });

      afterAll(() => {
        vitest.clearAllMocks();
      });

      it('should set metadata.summary', () => {
        expect(metadataFixture.summary).toBe(summaryFixture);
      });

      it('should return metadata', () => {
        expect(result).toBe(metadataFixture);
      });
    });
  });

  describe('having undefined key and metadata with summary', () => {
    describe('when called', () => {
      let metadataFixture: ControllerOpenApiMetadata;

      let result: unknown;

      beforeAll(() => {
        metadataFixture = {
          methodToPathItemObjectMap: new Map(),
          references: new Set(),
          servers: undefined,
          summary: 'Existing Summary',
        };

        try {
          updateControllerOpenApiMetadataSummary(
            summaryFixture,
            targetFixture,
            undefined,
          )(metadataFixture);
        } catch (error: unknown) {
          result = error;
        }
      });

      afterAll(() => {
        vitest.clearAllMocks();
      });

      it('should throw an Error', () => {
        expect(result).toBeInstanceOf(Error);
        expect(result).toStrictEqual(
          new Error(
            `Cannot define ${targetFixture.name} summary more than once`,
          ),
        );
      });
    });
  });

  describe('having a string key and metadata with operation object with undefined summary', () => {
    describe('when called', () => {
      let keyFixture: string;
      let metadataFixture: ControllerOpenApiMetadata;
      let operationObjectFixture: OpenApi3Dot1OperationObject;

      let result: unknown;

      beforeAll(() => {
        keyFixture = 'testMethod';
        metadataFixture = {
          methodToPathItemObjectMap: new Map(),
          references: new Set(),
          servers: undefined,
          summary: undefined,
        };

        operationObjectFixture = {};

        vitest
          .mocked(buildOrGetOperationObject)
          .mockReturnValueOnce(operationObjectFixture);

        result = updateControllerOpenApiMetadataSummary(
          summaryFixture,
          targetFixture,
          keyFixture,
        )(metadataFixture);
      });

      afterAll(() => {
        vitest.clearAllMocks();
      });

      it('should call buildOrGetOperationObject()', () => {
        expect(buildOrGetOperationObject).toHaveBeenCalledExactlyOnceWith(
          metadataFixture,
          keyFixture,
        );
      });

      it('should set operationObject.summary', () => {
        expect(operationObjectFixture.summary).toBe(summaryFixture);
      });

      it('should return metadata', () => {
        expect(result).toBe(metadataFixture);
      });
    });
  });

  describe('having a string key and metadata with operation object with summary', () => {
    let keyFixture: string;
    let metadataFixture: ControllerOpenApiMetadata;
    let operationObjectFixture: OpenApi3Dot1OperationObject;

    beforeAll(() => {
      keyFixture = 'testMethod';
      metadataFixture = {
        methodToPathItemObjectMap: new Map(),
        references: new Set(),
        servers: undefined,
        summary: undefined,
      };

      operationObjectFixture = {
        summary: 'Existing Operation Summary',
      };

      vitest
        .mocked(buildOrGetOperationObject)
        .mockReturnValueOnce(operationObjectFixture);
    });

    describe('when called', () => {
      let thrownError: unknown;

      beforeAll(() => {
        try {
          updateControllerOpenApiMetadataSummary(
            summaryFixture,
            targetFixture,
            keyFixture,
          )(metadataFixture);
        } catch (error: unknown) {
          thrownError = error;
        }
      });

      afterAll(() => {
        vitest.clearAllMocks();
      });

      it('should call buildOrGetOperationObject()', () => {
        expect(buildOrGetOperationObject).toHaveBeenCalledExactlyOnceWith(
          metadataFixture,
          keyFixture,
        );
      });

      it('should throw an Error', () => {
        expect(thrownError).toStrictEqual(
          new Error(
            `Cannot define ${targetFixture.name}.${keyFixture} summary more than once`,
          ),
        );
      });
    });
  });
});
