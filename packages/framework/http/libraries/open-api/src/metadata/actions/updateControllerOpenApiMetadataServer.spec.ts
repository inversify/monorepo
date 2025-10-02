import { afterAll, beforeAll, describe, expect, it, vitest } from 'vitest';

vitest.mock('./buildOrGetOperationObject');

import {
  OpenApi3Dot1OperationObject,
  OpenApi3Dot1ServerObject,
} from '@inversifyjs/open-api-types/v3Dot1';

import { ControllerOpenApiMetadata } from '../models/ControllerOpenApiMetadata';
import { buildOrGetOperationObject } from './buildOrGetOperationObject';
import { updateControllerOpenApiMetadataServer } from './updateControllerOpenApiMetadataServer';

describe(updateControllerOpenApiMetadataServer, () => {
  let serverFixture: OpenApi3Dot1ServerObject;

  beforeAll(() => {
    serverFixture = {
      description: 'Test Server',
      url: 'https://api.example.com',
    };
  });

  describe('having undefined key and metadata with undefined servers', () => {
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

        result = updateControllerOpenApiMetadataServer(
          serverFixture,
          undefined,
        )(metadataFixture);
      });

      afterAll(() => {
        vitest.clearAllMocks();
      });

      it('should set metadata.servers', () => {
        expect(metadataFixture.servers).toStrictEqual([serverFixture]);
      });

      it('should return metadata', () => {
        expect(result).toBe(metadataFixture);
      });
    });
  });

  describe('having undefined key and metadata with servers', () => {
    describe('when called', () => {
      let existingServerFixture: OpenApi3Dot1ServerObject;
      let metadataFixture: ControllerOpenApiMetadata;

      let result: unknown;

      beforeAll(() => {
        existingServerFixture = {
          description: 'Existing Server',
          url: 'https://existing.example.com',
        };

        metadataFixture = {
          methodToPathItemObjectMap: new Map(),
          references: new Set(),
          servers: [existingServerFixture],
          summary: undefined,
        };

        result = updateControllerOpenApiMetadataServer(
          serverFixture,
          undefined,
        )(metadataFixture);
      });

      afterAll(() => {
        vitest.clearAllMocks();
      });

      it('should add server to metadata.servers', () => {
        expect(metadataFixture.servers).toStrictEqual([
          existingServerFixture,
          serverFixture,
        ]);
      });

      it('should return metadata', () => {
        expect(result).toBe(metadataFixture);
      });
    });
  });

  describe('having a string key and metadata with operation object with undefined servers', () => {
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

        result = updateControllerOpenApiMetadataServer(
          serverFixture,
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

      it('should set operationObject.servers', () => {
        expect(operationObjectFixture.servers).toStrictEqual([serverFixture]);
      });

      it('should return metadata', () => {
        expect(result).toBe(metadataFixture);
      });
    });
  });

  describe('having a string key and metadata with operation object with servers', () => {
    let keyFixture: string;
    let metadataFixture: ControllerOpenApiMetadata;
    let operationObjectFixture: OpenApi3Dot1OperationObject;
    let existingServerFixture: OpenApi3Dot1ServerObject;

    beforeAll(() => {
      keyFixture = 'testMethod';
      metadataFixture = {
        methodToPathItemObjectMap: new Map(),
        references: new Set(),
        servers: undefined,
        summary: undefined,
      };

      existingServerFixture = {
        description: 'Existing Operation Server',
        url: 'https://existing-operation.example.com',
      };

      operationObjectFixture = {
        servers: [existingServerFixture],
      };

      vitest
        .mocked(buildOrGetOperationObject)
        .mockReturnValueOnce(operationObjectFixture);
    });

    describe('when called', () => {
      let result: unknown;

      beforeAll(() => {
        result = updateControllerOpenApiMetadataServer(
          serverFixture,
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

      it('should add server to operationObject.servers', () => {
        expect(operationObjectFixture.servers).toStrictEqual([
          existingServerFixture,
          serverFixture,
        ]);
      });

      it('should return metadata', () => {
        expect(result).toBe(metadataFixture);
      });
    });
  });
});
