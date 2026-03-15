import { afterAll, beforeAll, describe, expect, it, vitest } from 'vitest';

vitest.mock(import('@inversifyjs/reflect-metadata-utils'));

import { getOwnReflectMetadata } from '@inversifyjs/reflect-metadata-utils';
import { type ServiceIdentifier } from 'inversify';

import { classMethodMiddlewareMetadataReflectKey } from '../../reflectMetadata/data/classMethodMiddlewareMetadataReflectKey.js';
import { type Middleware } from '../models/Middleware.js';
import { getClassMethodMiddlewareList } from './getClassMethodMiddlewareList.js';

describe(getClassMethodMiddlewareList, () => {
  describe('when called, and getOwnReflectMetadata() returns undefined', () => {
    let classFixture: NewableFunction;
    let classMethodKeyFixture: string | symbol;
    let result: unknown;

    beforeAll(() => {
      classFixture = class Test {};
      classMethodKeyFixture = 'testMethod';

      result = getClassMethodMiddlewareList(
        classFixture,
        classMethodKeyFixture,
      );
    });

    afterAll(() => {
      vitest.clearAllMocks();
    });

    it('should call getOwnReflectMetadata()', () => {
      expect(getOwnReflectMetadata).toHaveBeenCalledExactlyOnceWith(
        classFixture,
        classMethodMiddlewareMetadataReflectKey,
        classMethodKeyFixture,
      );
    });

    it('should return an empty array', () => {
      expect(result).toStrictEqual([]);
    });
  });

  describe('when called, and getOwnReflectMetadata() returns an array', () => {
    let classFixture: NewableFunction;
    let classMethodKeyFixture: string | symbol;
    let middlewareServiceIdentifierListFixture: ServiceIdentifier<Middleware>[];
    let result: unknown;

    beforeAll(() => {
      classFixture = class Test {};
      classMethodKeyFixture = 'testMethod';
      middlewareServiceIdentifierListFixture = [Symbol()];

      vitest
        .mocked(getOwnReflectMetadata)
        .mockReturnValueOnce(middlewareServiceIdentifierListFixture);

      result = getClassMethodMiddlewareList(
        classFixture,
        classMethodKeyFixture,
      );
    });

    afterAll(() => {
      vitest.clearAllMocks();
    });

    it('should call getOwnReflectMetadata()', () => {
      expect(getOwnReflectMetadata).toHaveBeenCalledExactlyOnceWith(
        classFixture,
        classMethodMiddlewareMetadataReflectKey,
        classMethodKeyFixture,
      );
    });

    it('should return an array', () => {
      expect(result).toBe(middlewareServiceIdentifierListFixture);
    });
  });
});
