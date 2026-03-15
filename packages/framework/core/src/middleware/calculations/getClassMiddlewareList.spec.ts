import { afterAll, beforeAll, describe, expect, it, vitest } from 'vitest';

vitest.mock(import('@inversifyjs/reflect-metadata-utils'));

import { getOwnReflectMetadata } from '@inversifyjs/reflect-metadata-utils';
import { type ServiceIdentifier } from 'inversify';

import { classMiddlewareMetadataReflectKey } from '../../reflectMetadata/data/classMiddlewareMetadataReflectKey.js';
import { type Middleware } from '../models/Middleware.js';
import { getClassMiddlewareList } from './getClassMiddlewareList.js';

describe(getClassMiddlewareList, () => {
  describe('when called, and getOwnReflectMetadata() returns undefined', () => {
    let targetFixture: NewableFunction;
    let result: unknown;

    beforeAll(() => {
      targetFixture = class Test {};

      result = getClassMiddlewareList(targetFixture);
    });

    afterAll(() => {
      vitest.clearAllMocks();
    });

    it('should call getOwnReflectMetadata()', () => {
      expect(getOwnReflectMetadata).toHaveBeenCalledExactlyOnceWith(
        targetFixture,
        classMiddlewareMetadataReflectKey,
      );
    });

    it('should return an empty array', () => {
      expect(result).toStrictEqual([]);
    });
  });

  describe('when called, and getOwnReflectMetadata() returns an array', () => {
    let targetFixture: NewableFunction;
    let middlewareServiceIdentifierListFixture: ServiceIdentifier<Middleware>[];
    let result: unknown;

    beforeAll(() => {
      targetFixture = class Test {};
      middlewareServiceIdentifierListFixture = [];

      vitest
        .mocked(getOwnReflectMetadata)
        .mockReturnValueOnce(middlewareServiceIdentifierListFixture);

      result = getClassMiddlewareList(targetFixture);
    });

    afterAll(() => {
      vitest.clearAllMocks();
    });

    it('should call getOwnReflectMetadata()', () => {
      expect(getOwnReflectMetadata).toHaveBeenCalledExactlyOnceWith(
        targetFixture,
        classMiddlewareMetadataReflectKey,
      );
    });

    it('should return an array', () => {
      expect(result).toBe(middlewareServiceIdentifierListFixture);
    });
  });
});
