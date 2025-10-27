import { afterAll, beforeAll, describe, expect, it, vitest } from 'vitest';

vitest.mock('@inversifyjs/prototype-utils');
vitest.mock('@inversifyjs/reflect-metadata-utils');

import { getBaseType } from '@inversifyjs/prototype-utils';
import { getOwnReflectMetadata } from '@inversifyjs/reflect-metadata-utils';
import { Newable } from 'inversify';

import { HttpStatusCode } from '../../http/models/HttpStatusCode';
import { controllerMethodStatusCodeMetadataReflectKey } from '../../reflectMetadata/data/controllerMethodStatusCodeMetadataReflectKey';
import { getControllerMethodStatusCodeMetadata } from './getControllerMethodStatusCodeMetadata';

describe(getControllerMethodStatusCodeMetadata, () => {
  describe('when called, and getOwnReflectMetadata() returns undefined', () => {
    let controllerFixture: NewableFunction;
    let controllerMethodKeyFixture: string | symbol;
    let statusCodeMetadataFixture: undefined;
    let result: unknown;

    beforeAll(() => {
      controllerFixture = class Test {};
      controllerMethodKeyFixture = 'testMethod';
      statusCodeMetadataFixture = undefined;

      vitest
        .mocked(getOwnReflectMetadata)
        .mockReturnValueOnce(statusCodeMetadataFixture);

      vitest.mocked(getBaseType).mockReturnValueOnce(undefined);

      result = getControllerMethodStatusCodeMetadata(
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
        controllerMethodStatusCodeMetadataReflectKey,
        controllerMethodKeyFixture,
      );
    });

    it('should call getBaseType()', () => {
      expect(getBaseType).toHaveBeenCalledExactlyOnceWith(controllerFixture);
    });

    it('should return undefined', () => {
      expect(result).toBe(statusCodeMetadataFixture);
    });
  });

  describe('when called, and getOwnReflectMetadata() returns a status code', () => {
    let controllerFixture: NewableFunction;
    let controllerMethodKeyFixture: string | symbol;
    let statusCodeMetadataFixture: HttpStatusCode;
    let result: unknown;

    beforeAll(() => {
      controllerFixture = class Test {};
      controllerMethodKeyFixture = 'testMethod';
      statusCodeMetadataFixture = HttpStatusCode.CREATED;

      vitest
        .mocked(getOwnReflectMetadata)
        .mockReturnValueOnce(statusCodeMetadataFixture);

      result = getControllerMethodStatusCodeMetadata(
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
        controllerMethodStatusCodeMetadataReflectKey,
        controllerMethodKeyFixture,
      );
    });

    it('should not call getBaseType()', () => {
      expect(getBaseType).not.toHaveBeenCalled();
    });

    it('should return the status code', () => {
      expect(result).toBe(statusCodeMetadataFixture);
    });
  });

  describe('when called, child has no status code but parent does', () => {
    let baseControllerFixture: Newable<object>;
    let controllerFixture: Newable;
    let controllerMethodKeyFixture: string | symbol;
    let baseStatusCodeFixture: HttpStatusCode;
    let result: unknown;

    beforeAll(() => {
      baseControllerFixture = class BaseController {};
      controllerFixture = class TestController extends baseControllerFixture {};
      controllerMethodKeyFixture = 'testMethod';

      baseStatusCodeFixture = HttpStatusCode.NO_CONTENT;

      vitest
        .mocked(getOwnReflectMetadata)
        .mockReturnValueOnce(undefined)
        .mockReturnValueOnce(baseStatusCodeFixture);

      vitest.mocked(getBaseType).mockReturnValueOnce(baseControllerFixture);

      result = getControllerMethodStatusCodeMetadata(
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
        controllerMethodStatusCodeMetadataReflectKey,
        controllerMethodKeyFixture,
      );
      expect(getOwnReflectMetadata).toHaveBeenNthCalledWith(
        2,
        baseControllerFixture,
        controllerMethodStatusCodeMetadataReflectKey,
        controllerMethodKeyFixture,
      );
    });

    it('should call getBaseType()', () => {
      expect(getBaseType).toHaveBeenCalledExactlyOnceWith(controllerFixture);
    });

    it('should return parent status code', () => {
      expect(result).toStrictEqual(baseStatusCodeFixture);
    });
  });
});
