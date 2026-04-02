import { beforeAll, describe, expect, it } from 'vitest';

import {
  type OpenApi3Dot2OperationObject,
  type OpenApi3Dot2PathItemObject,
} from '@inversifyjs/open-api-types/v3Dot2';

import { type ControllerOpenApiMetadata } from '../../models/v3Dot2/ControllerOpenApiMetadata.js';
import { buildOrGetOpenApiOperationObject } from './buildOrGetOpenApiOperationObject.js';

describe(buildOrGetOpenApiOperationObject, () => {
  describe('having ControllerOpenApiMetadata with empty pathToPathItemObjectMap', () => {
    let pathFixture: string;

    beforeAll(() => {
      pathFixture = '/path';
    });

    describe('when called', () => {
      let controllerOpenApiMetadataFixture: ControllerOpenApiMetadata;

      let result: unknown;

      beforeAll(() => {
        controllerOpenApiMetadataFixture = {
          methodToPathItemObjectMap: new Map(),
          references: new Set(),
          servers: undefined,
          summary: undefined,
        };

        result = buildOrGetOpenApiOperationObject(
          controllerOpenApiMetadataFixture,
          pathFixture,
        );
      });

      it('should return an OpenApi3Dot2OperationObject', () => {
        const expected: OpenApi3Dot2OperationObject = {};

        expect(result).toStrictEqual(expected);
      });
    });
  });

  describe('having ControllerOpenApiMetadata with pathToPathItemObjectMap with path entry', () => {
    let pathFixture: string;

    beforeAll(() => {
      pathFixture = '/path';
    });

    describe('when called', () => {
      let controllerOpenApiMetadataFixture: ControllerOpenApiMetadata;
      let pathItemObjectFixture: OpenApi3Dot2PathItemObject;

      let result: unknown;

      beforeAll(() => {
        pathItemObjectFixture =
          Symbol() as unknown as OpenApi3Dot2PathItemObject;

        controllerOpenApiMetadataFixture = {
          methodToPathItemObjectMap: new Map([
            [pathFixture, pathItemObjectFixture],
          ]),
          references: new Set(),
          servers: undefined,
          summary: undefined,
        };

        result = buildOrGetOpenApiOperationObject(
          controllerOpenApiMetadataFixture,
          pathFixture,
        );
      });

      it('should return an OpenApi3Dot2OperationObject', () => {
        expect(result).toBe(pathItemObjectFixture);
      });
    });
  });
});
