import { afterAll, beforeAll, describe, expect, it, vitest } from 'vitest';

vitest.mock('@inversifyjs/prototype-utils');
vitest.mock('@inversifyjs/reflect-metadata-utils');

import { getBaseType } from '@inversifyjs/prototype-utils';
import { getOwnReflectMetadata } from '@inversifyjs/reflect-metadata-utils';
import { Newable } from 'inversify';

import { controllerMethodHeaderMetadataReflectKey } from '../../reflectMetadata/data/controllerMethodHeaderMetadataReflectKey';
import { getControllerMethodHeaderMetadataList } from './getControllerMethodHeaderMetadataList';

describe(getControllerMethodHeaderMetadataList, () => {
  describe('when called', () => {
    let controllerFixture: NewableFunction;
    let controllerMethodKeyFixture: string | symbol;
    let headerListFixture: [string, string][];
    let headerMetadataFixture: Map<string, string>;
    let result: unknown;

    beforeAll(() => {
      controllerFixture = class Test {};
      controllerMethodKeyFixture = 'testMethod';
      headerListFixture = [['key-example', 'value-example']];
      headerMetadataFixture = new Map<string, string>(headerListFixture);

      vitest
        .mocked(getOwnReflectMetadata)
        .mockReturnValue(headerMetadataFixture);

      vitest.mocked(getBaseType).mockReturnValueOnce(undefined);

      result = getControllerMethodHeaderMetadataList(
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

    it('should return [string, string][]', () => {
      expect(result).toStrictEqual(headerListFixture);
    });
  });

  describe('when called, and getBaseType() returns base class with no collisions', () => {
    let baseControllerFixture: Newable<object>;
    let controllerFixture: Newable;
    let controllerMethodKeyFixture: string | symbol;
    let baseHeaderMetadataFixture: Map<string, string>;
    let derivedHeaderMetadataFixture: Map<string, string>;
    let result: unknown;

    beforeAll(() => {
      baseControllerFixture = class BaseController {};
      controllerFixture = class TestController extends baseControllerFixture {};
      controllerMethodKeyFixture = 'testMethod';

      baseHeaderMetadataFixture = new Map<string, string>([
        ['X-Base-Header', 'base-value'],
      ]);
      derivedHeaderMetadataFixture = new Map<string, string>([
        ['X-Derived-Header', 'derived-value'],
      ]);

      vitest
        .mocked(getOwnReflectMetadata)
        .mockReturnValueOnce(derivedHeaderMetadataFixture)
        .mockReturnValueOnce(baseHeaderMetadataFixture);

      vitest
        .mocked(getBaseType)
        .mockReturnValueOnce(baseControllerFixture)
        .mockReturnValueOnce(undefined);

      result = getControllerMethodHeaderMetadataList(
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

    it('should return merged headers from both classes', () => {
      expect(result).toStrictEqual([
        ['X-Derived-Header', 'derived-value'],
        ['X-Base-Header', 'base-value'],
      ]);
    });
  });

  describe('when called, and getBaseType() returns base class with colliding header keys', () => {
    let baseControllerFixture: Newable<object>;
    let controllerFixture: Newable;
    let controllerMethodKeyFixture: string | symbol;
    let baseHeaderMetadataFixture: Map<string, string>;
    let derivedHeaderMetadataFixture: Map<string, string>;
    let result: unknown;

    beforeAll(() => {
      baseControllerFixture = class BaseController {};
      controllerFixture = class TestController extends baseControllerFixture {};
      controllerMethodKeyFixture = 'testMethod';

      baseHeaderMetadataFixture = new Map<string, string>([
        ['X-Custom-Header', 'base-value'],
        ['X-Base-Only', 'base-only-value'],
      ]);
      derivedHeaderMetadataFixture = new Map<string, string>([
        ['X-Custom-Header', 'derived-value'],
        ['X-Derived-Only', 'derived-only-value'],
      ]);

      vitest
        .mocked(getOwnReflectMetadata)
        .mockReturnValueOnce(derivedHeaderMetadataFixture)
        .mockReturnValueOnce(baseHeaderMetadataFixture);

      vitest
        .mocked(getBaseType)
        .mockReturnValueOnce(baseControllerFixture)
        .mockReturnValueOnce(undefined);

      result = getControllerMethodHeaderMetadataList(
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

    it('should return headers with child taking precedence over colliding keys', () => {
      expect(result).toStrictEqual([
        ['X-Custom-Header', 'derived-value'],
        ['X-Derived-Only', 'derived-only-value'],
        ['X-Base-Only', 'base-only-value'],
      ]);
    });
  });

  describe('when called, child has no metadata but parent does', () => {
    let baseControllerFixture: Newable<object>;
    let controllerFixture: Newable;
    let controllerMethodKeyFixture: string | symbol;
    let baseHeaderMetadataFixture: Map<string, string>;
    let result: unknown;

    beforeAll(() => {
      baseControllerFixture = class BaseController {};
      controllerFixture = class TestController extends baseControllerFixture {};
      controllerMethodKeyFixture = 'testMethod';

      baseHeaderMetadataFixture = new Map<string, string>([
        ['X-Parent-Header', 'parent-value'],
      ]);

      vitest
        .mocked(getOwnReflectMetadata)
        .mockReturnValueOnce(undefined)
        .mockReturnValueOnce(baseHeaderMetadataFixture);

      vitest
        .mocked(getBaseType)
        .mockReturnValueOnce(baseControllerFixture)
        .mockReturnValueOnce(undefined);

      result = getControllerMethodHeaderMetadataList(
        controllerFixture,
        controllerMethodKeyFixture,
      );
    });

    afterAll(() => {
      vitest.clearAllMocks();
    });

    it('should call getOwnReflectMetadata()', () => {
      expect(getOwnReflectMetadata).toHaveBeenCalledTimes(2);
    });

    it('should call getBaseType()', () => {
      expect(getBaseType).toHaveBeenCalledTimes(2);
    });

    it('should return headers from parent class', () => {
      expect(result).toStrictEqual([['X-Parent-Header', 'parent-value']]);
    });
  });
});
