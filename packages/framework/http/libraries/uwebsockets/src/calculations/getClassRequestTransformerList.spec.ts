import { afterAll, beforeAll, describe, expect, it, vitest } from 'vitest';

vitest.mock(import('@inversifyjs/reflect-metadata-utils'));

import { getOwnReflectMetadata } from '@inversifyjs/reflect-metadata-utils';
import { type HttpRequest, type HttpResponse } from 'uWebSockets.js';

import { type RequestTransformer } from '../models/RequestTransformer.js';
import { classRequestTransformerMetadataReflectKey } from '../reflectMetadata/data/classRequestTransformerMetadataReflectKey.js';
import { getClassRequestTransformerList } from './getClassRequestTransformerList.js';

describe(getClassRequestTransformerList, () => {
  describe('having a class constructor', () => {
    let classConstructorFixture: NewableFunction;

    beforeAll(() => {
      classConstructorFixture = class TestController {};
    });

    describe('when called, and getOwnReflectMetadata() returns a request transformer list', () => {
      let requestTransformerListFixture: RequestTransformer<
        HttpRequest,
        HttpResponse
      >[];
      let result: unknown;

      beforeAll(() => {
        requestTransformerListFixture = [vitest.fn()];

        vitest
          .mocked(getOwnReflectMetadata)
          .mockReturnValueOnce(requestTransformerListFixture);

        result = getClassRequestTransformerList(classConstructorFixture);
      });

      afterAll(() => {
        vitest.clearAllMocks();
      });

      it('should call getOwnReflectMetadata()', () => {
        expect(getOwnReflectMetadata).toHaveBeenCalledExactlyOnceWith(
          classConstructorFixture,
          classRequestTransformerMetadataReflectKey,
        );
      });

      it('should return the request transformer list', () => {
        expect(result).toBe(requestTransformerListFixture);
      });
    });

    describe('when called, and getOwnReflectMetadata() returns undefined', () => {
      let result: unknown;

      beforeAll(() => {
        vitest.mocked(getOwnReflectMetadata).mockReturnValueOnce(undefined);

        result = getClassRequestTransformerList(classConstructorFixture);
      });

      afterAll(() => {
        vitest.clearAllMocks();
      });

      it('should return an empty list', () => {
        expect(result).toStrictEqual([]);
      });
    });
  });
});
