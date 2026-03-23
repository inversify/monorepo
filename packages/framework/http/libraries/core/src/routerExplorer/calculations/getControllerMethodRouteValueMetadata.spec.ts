import { afterAll, beforeAll, describe, expect, it, vitest } from 'vitest';

vitest.mock(import('@inversifyjs/prototype-utils'));
vitest.mock(import('@inversifyjs/reflect-metadata-utils'));

import { getBaseType } from '@inversifyjs/prototype-utils';
import { getOwnReflectMetadata } from '@inversifyjs/reflect-metadata-utils';
import { type Newable } from 'inversify';

import { routeValueMetadataReflectKey } from '../../reflectMetadata/data/routeValueMetadataReflectKey.js';
import { getControllerMethodRouteValueMetadata } from './getControllerMethodRouteValueMetadata.js';

describe(getControllerMethodRouteValueMetadata, () => {
  describe('having no getBaseType return value', () => {
    let controllerFixture: NewableFunction;
    let controllerMethodKeyFixture: string | symbol;

    beforeAll(() => {
      controllerFixture = class Test {};
      controllerMethodKeyFixture = 'testMethod';
    });

    describe('when called, and getOwnReflectMetadata returns undefined', () => {
      let result: unknown;

      beforeAll(() => {
        vitest.mocked(getOwnReflectMetadata).mockReturnValueOnce(undefined);
        vitest.mocked(getBaseType).mockReturnValueOnce(undefined);

        result = getControllerMethodRouteValueMetadata(
          controllerFixture,
          controllerMethodKeyFixture,
        );
      });

      afterAll(() => {
        vitest.clearAllMocks();
      });

      it('should return undefined', () => {
        expect(result).toBeUndefined();
      });
    });

    describe('when called, and getOwnReflectMetadata returns map but method not found', () => {
      let result: unknown;
      let reflectMetadataFixture: Map<
        string | symbol,
        Map<string | symbol, unknown>
      >;

      beforeAll(() => {
        reflectMetadataFixture = new Map();

        vitest
          .mocked(getOwnReflectMetadata)
          .mockReturnValueOnce(reflectMetadataFixture);
        vitest.mocked(getBaseType).mockReturnValueOnce(undefined);

        result = getControllerMethodRouteValueMetadata(
          controllerFixture,
          controllerMethodKeyFixture,
        );
      });

      afterAll(() => {
        vitest.clearAllMocks();
      });

      it('should return undefined', () => {
        expect(result).toBeUndefined();
      });
    });

    describe('when called, and getOwnReflectMetadata returns map and method found', () => {
      let result: unknown;
      let reflectMetadataFixture: Map<
        string | symbol,
        Map<string | symbol, unknown>
      >;
      let methodMetadataFixture: Map<string | symbol, unknown>;

      beforeAll(() => {
        methodMetadataFixture = new Map([['exampleKey', 'exampleValue']]);
        reflectMetadataFixture = new Map([
          [controllerMethodKeyFixture, methodMetadataFixture],
        ]);

        vitest
          .mocked(getOwnReflectMetadata)
          .mockReturnValueOnce(reflectMetadataFixture);
        vitest.mocked(getBaseType).mockReturnValueOnce(undefined);

        result = getControllerMethodRouteValueMetadata(
          controllerFixture,
          controllerMethodKeyFixture,
        );
      });

      afterAll(() => {
        vitest.clearAllMocks();
      });

      it('should call getOwnReflectMetadata()', () => {
        expect(getOwnReflectMetadata).toHaveBeenCalledExactlyOnceWith(
          controllerFixture,
          routeValueMetadataReflectKey,
        );
      });

      it('should return the correct map', () => {
        const expectedMap: Map<string | symbol, unknown> = new Map([
          ['exampleKey', 'exampleValue'],
        ]);

        expect(result).toStrictEqual(expectedMap);
      });
    });
  });

  describe('having getBaseType return base class', () => {
    let baseControllerFixture: Newable<object>;
    let controllerFixture: Newable;
    let controllerMethodKeyFixture: string | symbol;

    beforeAll(() => {
      baseControllerFixture = class BaseController {};
      controllerFixture = class TestController extends baseControllerFixture {};
      controllerMethodKeyFixture = 'testMethod';
    });

    describe('when called, and getOwnReflectMetadata() returns metadata where child has no metadata but parent does', () => {
      let result: unknown;
      let baseReflectMetadataFixture: Map<
        string | symbol,
        Map<string | symbol, unknown>
      >;
      let baseMethodMetadataFixture: Map<string | symbol, unknown>;

      beforeAll(() => {
        baseMethodMetadataFixture = new Map([['parentKey', 'parentValue']]);
        baseReflectMetadataFixture = new Map([
          [controllerMethodKeyFixture, baseMethodMetadataFixture],
        ]);

        vitest
          .mocked(getOwnReflectMetadata)
          .mockReturnValueOnce(undefined) // Child
          .mockReturnValueOnce(baseReflectMetadataFixture); // Parent

        vitest
          .mocked(getBaseType)
          .mockReturnValueOnce(baseControllerFixture)
          .mockReturnValueOnce(undefined);

        result = getControllerMethodRouteValueMetadata(
          controllerFixture,
          controllerMethodKeyFixture,
        );
      });

      afterAll(() => {
        vitest.clearAllMocks();
      });

      it('should call getOwnReflectMetadata()', () => {
        expect(getOwnReflectMetadata).toHaveBeenCalledTimes(2);
        expect(getOwnReflectMetadata).toHaveBeenNthCalledWith(
          1,
          controllerFixture,
          routeValueMetadataReflectKey,
        );
        expect(getOwnReflectMetadata).toHaveBeenNthCalledWith(
          2,
          baseControllerFixture,
          routeValueMetadataReflectKey,
        );
      });

      it('should call getBaseType()', () => {
        expect(getBaseType).toHaveBeenCalledTimes(2);
      });

      it('should return expected result from parent', () => {
        const expectedMap: Map<string | symbol, unknown> = new Map([
          ['parentKey', 'parentValue'],
        ]);

        expect(result).toStrictEqual(expectedMap);
      });
    });

    describe('when called, and getOwnReflectMetadata() returns metadata with collisions', () => {
      let result: unknown;
      let baseReflectMetadataFixture: Map<
        string | symbol,
        Map<string | symbol, unknown>
      >;
      let childReflectMetadataFixture: Map<
        string | symbol,
        Map<string | symbol, unknown>
      >;

      beforeAll(() => {
        const baseMethodMetadataFixture: Map<string | symbol, unknown> =
          new Map<string | symbol, unknown>([
            ['baseOnlyKey', 'base-only-value'],
            ['collidingKey', 'base-value'],
          ]);
        baseReflectMetadataFixture = new Map([
          [controllerMethodKeyFixture, baseMethodMetadataFixture],
        ]);

        const childMethodMetadataFixture: Map<string | symbol, unknown> =
          new Map<string | symbol, unknown>([
            ['collidingKey', 'derived-value'],
            ['derivedOnlyKey', 'derived-only-value'],
          ]);
        childReflectMetadataFixture = new Map([
          [controllerMethodKeyFixture, childMethodMetadataFixture],
        ]);

        vitest
          .mocked(getOwnReflectMetadata)
          .mockReturnValueOnce(childReflectMetadataFixture) // Child
          .mockReturnValueOnce(baseReflectMetadataFixture); // Parent

        vitest
          .mocked(getBaseType)
          .mockReturnValueOnce(baseControllerFixture)
          .mockReturnValueOnce(undefined);

        result = getControllerMethodRouteValueMetadata(
          controllerFixture,
          controllerMethodKeyFixture,
        );
      });

      afterAll(() => {
        vitest.clearAllMocks();
      });

      it('should return merged map favoring child metadata properties', () => {
        const expectedMap: Map<string | symbol, unknown> = new Map<
          string | symbol,
          unknown
        >([
          ['collidingKey', 'derived-value'],
          ['derivedOnlyKey', 'derived-only-value'],
          ['baseOnlyKey', 'base-only-value'],
        ]);

        expect(result).toStrictEqual(expectedMap);
      });
    });
  });
});
