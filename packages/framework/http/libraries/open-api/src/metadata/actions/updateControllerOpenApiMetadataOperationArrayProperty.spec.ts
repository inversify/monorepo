import { beforeAll, describe, expect, it } from 'vitest';

import { OpenApi3Dot1ServerObject } from '@inversifyjs/open-api-types/v3Dot1';

import { ControllerOpenApiMetadata } from '../models/ControllerOpenApiMetadata';
import { updateControllerOpenApiMetadataOperationArrayProperty } from './updateControllerOpenApiMetadataOperationArrayProperty';

describe(updateControllerOpenApiMetadataOperationArrayProperty, () => {
  describe('having metadata with defined property value', () => {
    let keyFixture: 'servers';
    let methodKeyFixture: string | symbol;
    let valueFixture: OpenApi3Dot1ServerObject;

    let metadataFixture: ControllerOpenApiMetadata;

    beforeAll(() => {
      keyFixture = 'servers';
      methodKeyFixture = 'getUsers';
      valueFixture = {
        description: 'Production server',
        url: 'https://api.example.com/users',
      };

      metadataFixture = {
        methodToPathItemObjectMap: new Map([
          [
            methodKeyFixture,
            {
              [keyFixture]: [valueFixture],
            },
          ],
        ]),
        references: new Set(),
        servers: undefined,
        summary: undefined,
      };
    });

    describe('when called', () => {
      let result: unknown;

      beforeAll(() => {
        result = updateControllerOpenApiMetadataOperationArrayProperty(
          valueFixture,
          methodKeyFixture,
          keyFixture,
        )(metadataFixture);
      });

      it('should return expected result', () => {
        const expected: ControllerOpenApiMetadata = {
          ...metadataFixture,
          methodToPathItemObjectMap: new Map([
            [
              methodKeyFixture,
              {
                [keyFixture]: [valueFixture, valueFixture],
              },
            ],
          ]),
        };

        expect(result).toStrictEqual(expected);
      });
    });
  });

  describe('having metadata with undefined property value', () => {
    let keyFixture: 'servers';
    let methodKeyFixture: string | symbol;
    let valueFixture: OpenApi3Dot1ServerObject;

    let metadataFixture: ControllerOpenApiMetadata;

    beforeAll(() => {
      keyFixture = 'servers';
      methodKeyFixture = 'getUsers';
      valueFixture = {
        description: 'Production server',
        url: 'https://api.example.com/users',
      };

      metadataFixture = {
        methodToPathItemObjectMap: new Map(),
        references: new Set(),
        servers: undefined,
        summary: undefined,
      };
    });

    describe('when called', () => {
      let result: unknown;

      beforeAll(() => {
        result = updateControllerOpenApiMetadataOperationArrayProperty(
          valueFixture,
          methodKeyFixture,
          keyFixture,
        )(metadataFixture);
      });

      it('should return expected result', () => {
        const expected: ControllerOpenApiMetadata = {
          ...metadataFixture,
          methodToPathItemObjectMap: new Map([
            [
              methodKeyFixture,
              {
                [keyFixture]: [valueFixture],
              },
            ],
          ]),
        };

        expect(result).toStrictEqual(expected);
      });
    });
  });
});
