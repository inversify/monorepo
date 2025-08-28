import { beforeAll, describe, expect, it } from 'vitest';

import { OpenApi3Dot1ResponseObject } from '@inversifyjs/open-api-types/v3Dot1';

import { ControllerOpenApiMetadata } from '../models/ControllerOpenApiMetadata';
import { updateControllerOpenApiMetadataOperationRecordProperty } from './updateControllerOpenApiMetadataOperationRecordProperty';

describe(updateControllerOpenApiMetadataOperationRecordProperty, () => {
  describe('having metadata with defined key property value', () => {
    let keyFixture: string;
    // eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
    let targetFixture: Function;
    let propertyKeyFixture: 'responses';
    let methodKeyFixture: string | symbol;
    let valueFixture: OpenApi3Dot1ResponseObject;

    let metadataFixture: ControllerOpenApiMetadata;

    beforeAll(() => {
      keyFixture = '200';
      targetFixture = class UsersController {};
      propertyKeyFixture = 'responses';
      methodKeyFixture = 'getUsers';
      valueFixture = {
        content: {
          'application/json': {
            schema: {
              items: {
                properties: {
                  id: { type: 'string' },
                  name: { type: 'string' },
                },
                required: ['id', 'name'],
                type: 'object',
              },
              type: 'array',
            },
          },
        },
        description: 'A list of users.',
      };

      metadataFixture = {
        methodToPathItemObjectMap: new Map([
          [
            methodKeyFixture,
            {
              [propertyKeyFixture]: {
                [keyFixture]: valueFixture,
              },
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
        try {
          updateControllerOpenApiMetadataOperationRecordProperty(
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

      it('should throw an error', () => {
        const expectedErrorProperties: Partial<Error> = {
          message: `Cannot define ${targetFixture.name}.${methodKeyFixture.toString()} ${propertyKeyFixture} (${keyFixture}) more than once`,
        };

        expect(result).toBeInstanceOf(Error);
        expect(result).toMatchObject(expectedErrorProperties);
      });
    });
  });

  describe('having metadata with defined property value', () => {
    let keyFixture: string;
    // eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
    let targetFixture: Function;
    let propertyKeyFixture: 'responses';
    let methodKeyFixture: string | symbol;
    let valueFixture: OpenApi3Dot1ResponseObject;

    let metadataFixture: ControllerOpenApiMetadata;

    beforeAll(() => {
      keyFixture = '200';
      targetFixture = class UsersController {};
      propertyKeyFixture = 'responses';
      methodKeyFixture = 'getUsers';
      valueFixture = {
        content: {
          'application/json': {
            schema: {
              items: {
                properties: {
                  id: { type: 'string' },
                  name: { type: 'string' },
                },
                required: ['id', 'name'],
                type: 'object',
              },
              type: 'array',
            },
          },
        },
        description: 'A list of users.',
      };

      metadataFixture = {
        methodToPathItemObjectMap: new Map([
          [
            methodKeyFixture,
            {
              [propertyKeyFixture]: {},
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
        result = updateControllerOpenApiMetadataOperationRecordProperty(
          keyFixture,
          valueFixture,
          targetFixture,
          methodKeyFixture,
          propertyKeyFixture,
        )(metadataFixture);
      });

      it('should return expected result', () => {
        const expected: ControllerOpenApiMetadata = {
          ...metadataFixture,
          methodToPathItemObjectMap: new Map([
            [
              methodKeyFixture,
              {
                [propertyKeyFixture]: {
                  [keyFixture]: valueFixture,
                },
              },
            ],
          ]),
        };

        expect(result).toStrictEqual(expected);
      });
    });
  });

  describe('having metadata with undefined property value', () => {
    let keyFixture: string;
    // eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
    let targetFixture: Function;
    let propertyKeyFixture: 'responses';
    let methodKeyFixture: string | symbol;
    let valueFixture: OpenApi3Dot1ResponseObject;

    let metadataFixture: ControllerOpenApiMetadata;

    beforeAll(() => {
      keyFixture = '200';
      targetFixture = class UsersController {};
      propertyKeyFixture = 'responses';
      methodKeyFixture = 'getUsers';
      valueFixture = {
        content: {
          'application/json': {
            schema: {
              items: {
                properties: {
                  id: { type: 'string' },
                  name: { type: 'string' },
                },
                required: ['id', 'name'],
                type: 'object',
              },
              type: 'array',
            },
          },
        },
        description: 'A list of users.',
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
        result = updateControllerOpenApiMetadataOperationRecordProperty(
          keyFixture,
          valueFixture,
          targetFixture,
          methodKeyFixture,
          propertyKeyFixture,
        )(metadataFixture);
      });

      it('should return expected result', () => {
        const expected: ControllerOpenApiMetadata = {
          ...metadataFixture,
          methodToPathItemObjectMap: new Map([
            [
              methodKeyFixture,
              {
                [propertyKeyFixture]: {
                  [keyFixture]: valueFixture,
                },
              },
            ],
          ]),
        };

        expect(result).toStrictEqual(expected);
      });
    });
  });
});
