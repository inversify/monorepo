import { afterAll, beforeAll, describe, expect, it, vitest } from 'vitest';

vitest.mock('@inversifyjs/prototype-utils');
vitest.mock('@inversifyjs/reflect-metadata-utils');

import { getBaseType } from '@inversifyjs/prototype-utils';
import { getOwnReflectMetadata } from '@inversifyjs/reflect-metadata-utils';
import { Newable } from 'inversify';

import { controllerMethodHeaderMetadataReflectKey } from '../../reflectMetadata/data/controllerMethodHeaderMetadataReflectKey';
import { getControllerMethodHeaderMetadata } from './getControllerMethodHeaderMetadata';

describe(getControllerMethodHeaderMetadata, () => {
  describe('when called, and getBaseType() returns undefined', () => {
    let controllerFixture: NewableFunction;
    let controllerMethodKeyFixture: string | symbol;
    let headerMetadataFixture: Record<string, string>;
    let result: unknown;

    beforeAll(() => {
      controllerFixture = class Test {};
      controllerMethodKeyFixture = 'testMethod';
      headerMetadataFixture = {
        'key-example': 'value-example',
      };

      vitest
        .mocked(getOwnReflectMetadata)
        .mockReturnValue(headerMetadataFixture);

      vitest.mocked(getBaseType).mockReturnValueOnce(undefined);

      result = getControllerMethodHeaderMetadata(
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
        controllerMethodHeaderMetadataReflectKey,
        controllerMethodKeyFixture,
      );
    });

    it('should return expected result', () => {
      expect(result).toStrictEqual(headerMetadataFixture);
    });
  });

  describe('when called, and getBaseType() returns base class with no collisions', () => {
    let baseControllerFixture: Newable<object>;
    let controllerFixture: Newable;
    let controllerMethodKeyFixture: string | symbol;
    let baseHeaderMetadataFixture: Record<string, string>;
    let derivedHeaderMetadataFixture: Record<string, string>;
    let result: unknown;

    beforeAll(() => {
      baseControllerFixture = class BaseController {};
      controllerFixture = class TestController extends baseControllerFixture {};
      controllerMethodKeyFixture = 'testMethod';

      baseHeaderMetadataFixture = {
        'X-Base-Header': 'base-value',
      };
      derivedHeaderMetadataFixture = {
        'X-Derived-Header': 'derived-value',
      };

      vitest
        .mocked(getOwnReflectMetadata)
        .mockReturnValueOnce(derivedHeaderMetadataFixture)
        .mockReturnValueOnce(baseHeaderMetadataFixture);

      vitest
        .mocked(getBaseType)
        .mockReturnValueOnce(baseControllerFixture)
        .mockReturnValueOnce(undefined);

      result = getControllerMethodHeaderMetadata(
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
        controllerMethodHeaderMetadataReflectKey,
        controllerMethodKeyFixture,
      );
      expect(getOwnReflectMetadata).toHaveBeenNthCalledWith(
        2,
        baseControllerFixture,
        controllerMethodHeaderMetadataReflectKey,
        controllerMethodKeyFixture,
      );
    });

    it('should call getBaseType()', () => {
      expect(getBaseType).toHaveBeenCalledTimes(2);
      expect(getBaseType).toHaveBeenNthCalledWith(1, controllerFixture);
      expect(getBaseType).toHaveBeenNthCalledWith(2, baseControllerFixture);
    });

    it('should return expected result', () => {
      const expected: Record<string, string> = {
        'X-Base-Header': 'base-value',
        'X-Derived-Header': 'derived-value',
      };

      expect(result).toStrictEqual(expected);
    });
  });

  describe('when called, and getBaseType() returns base class with colliding header keys', () => {
    let baseControllerFixture: Newable<object>;
    let controllerFixture: Newable;
    let controllerMethodKeyFixture: string | symbol;
    let baseHeaderMetadataFixture: Record<string, string>;
    let derivedHeaderMetadataFixture: Record<string, string>;
    let result: unknown;

    beforeAll(() => {
      baseControllerFixture = class BaseController {};
      controllerFixture = class TestController extends baseControllerFixture {};
      controllerMethodKeyFixture = 'testMethod';

      baseHeaderMetadataFixture = {
        'X-Base-Only': 'base-only-value',
        'X-Custom-Header': 'base-value',
      };

      derivedHeaderMetadataFixture = {
        'X-Custom-Header': 'derived-value',
        'X-Derived-Only': 'derived-only-value',
      };

      vitest
        .mocked(getOwnReflectMetadata)
        .mockReturnValueOnce(derivedHeaderMetadataFixture)
        .mockReturnValueOnce(baseHeaderMetadataFixture);

      vitest
        .mocked(getBaseType)
        .mockReturnValueOnce(baseControllerFixture)
        .mockReturnValueOnce(undefined);

      result = getControllerMethodHeaderMetadata(
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
        controllerMethodHeaderMetadataReflectKey,
        controllerMethodKeyFixture,
      );
      expect(getOwnReflectMetadata).toHaveBeenNthCalledWith(
        2,
        baseControllerFixture,
        controllerMethodHeaderMetadataReflectKey,
        controllerMethodKeyFixture,
      );
    });

    it('should call getBaseType()', () => {
      expect(getBaseType).toHaveBeenCalledTimes(2);
      expect(getBaseType).toHaveBeenNthCalledWith(1, controllerFixture);
      expect(getBaseType).toHaveBeenNthCalledWith(2, baseControllerFixture);
    });

    it('should return expected result', () => {
      const expected: Record<string, string> = {
        'X-Base-Only': 'base-only-value',
        'X-Custom-Header': 'derived-value',
        'X-Derived-Only': 'derived-only-value',
      };

      expect(result).toStrictEqual(expected);
    });
  });

  describe('when called, child has no metadata but parent does', () => {
    let baseControllerFixture: Newable<object>;
    let controllerFixture: Newable;
    let controllerMethodKeyFixture: string | symbol;
    let baseHeaderMetadataFixture: Record<string, string>;

    let result: unknown;

    beforeAll(() => {
      baseControllerFixture = class BaseController {};
      controllerFixture = class TestController extends baseControllerFixture {};
      controllerMethodKeyFixture = 'testMethod';

      baseHeaderMetadataFixture = {
        'X-Parent-Header': 'parent-value',
      };

      vitest
        .mocked(getOwnReflectMetadata)
        .mockReturnValueOnce(undefined)
        .mockReturnValueOnce(baseHeaderMetadataFixture);

      vitest
        .mocked(getBaseType)
        .mockReturnValueOnce(baseControllerFixture)
        .mockReturnValueOnce(undefined);

      result = getControllerMethodHeaderMetadata(
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
        controllerMethodHeaderMetadataReflectKey,
        controllerMethodKeyFixture,
      );
    });

    it('should call getBaseType()', () => {
      expect(getBaseType).toHaveBeenCalledTimes(2);
    });

    it('should return expected result', () => {
      const expected: Record<string, string> = {
        'X-Parent-Header': 'parent-value',
      };

      expect(result).toStrictEqual(expected);
    });
  });
});
