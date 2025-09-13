import { beforeAll, describe, expect, it } from 'vitest';

import { ControllerOpenApiMetadata } from '../models/ControllerOpenApiMetadata';
import { updateControllerOpenApiMetadataOperationProperty } from './updateControllerOpenApiMetadataOperationProperty';

describe(updateControllerOpenApiMetadataOperationProperty, () => {
  describe('having metadata with defined property value', () => {
    let keyFixture: 'summary';
    // eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
    let targetFixture: Function;
    let methodKeyFixture: string | symbol;
    let valueFixture: string;

    let metadataFixture: ControllerOpenApiMetadata;

    beforeAll(() => {
      keyFixture = 'summary';
      targetFixture = class UsersController {};
      methodKeyFixture = 'getUsers';
      valueFixture = 'Get all users';

      metadataFixture = {
        methodToPathItemObjectMap: new Map([
          [
            methodKeyFixture,
            {
              [keyFixture]: valueFixture,
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
          updateControllerOpenApiMetadataOperationProperty(
            valueFixture,
            targetFixture,
            methodKeyFixture,
            keyFixture,
          )(metadataFixture);
        } catch (error: unknown) {
          result = error;
        }
      });

      it('should throw an error', () => {
        const expectedErrorProperties: Partial<Error> = {
          message: `Cannot define ${targetFixture.name}.${methodKeyFixture.toString()} ${keyFixture} more than once`,
        };

        expect(result).toBeInstanceOf(Error);
        expect(result).toMatchObject(expectedErrorProperties);
      });
    });
  });

  describe('having metadata with undefined property value', () => {
    let keyFixture: 'summary';
    // eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
    let targetFixture: Function;
    let methodKeyFixture: string | symbol;
    let valueFixture: string;

    let metadataFixture: ControllerOpenApiMetadata;

    beforeAll(() => {
      keyFixture = 'summary';
      targetFixture = class UsersController {};
      methodKeyFixture = 'getUsers';
      valueFixture = 'Get all users';

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
        result = updateControllerOpenApiMetadataOperationProperty(
          valueFixture,
          targetFixture,
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
                [keyFixture]: valueFixture,
              },
            ],
          ]),
        };

        expect(result).toStrictEqual(expected);
      });
    });
  });
});
