import { afterAll, beforeAll, describe, expect, it, vitest } from 'vitest';

vitest.mock(import('@inversifyjs/reflect-metadata-utils'));

import { getOwnReflectMetadata } from '@inversifyjs/reflect-metadata-utils';
import { type HttpRequest, type HttpResponse } from 'uWebSockets.js';

import { type RequestTransformer } from '../models/RequestTransformer.js';
import { classMethodRequestTransformerMetadataReflectKey } from '../reflectMetadata/data/classMethodRequestTransformerMetadataReflectKey.js';
import { getClassMethodRequestTransformerList } from './getClassMethodRequestTransformerList.js';

describe(getClassMethodRequestTransformerList, () => {
  describe('having a class constructor and a method key', () => {
    let classConstructorFixture: NewableFunction;
    let methodKeyFixture: string;

    beforeAll(() => {
      classConstructorFixture = class TestController {};
      methodKeyFixture = 'testMethod';
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

        result = getClassMethodRequestTransformerList(
          classConstructorFixture,
          methodKeyFixture,
        );
      });

      afterAll(() => {
        vitest.clearAllMocks();
      });

      it('should call getOwnReflectMetadata()', () => {
        expect(getOwnReflectMetadata).toHaveBeenCalledExactlyOnceWith(
          classConstructorFixture,
          classMethodRequestTransformerMetadataReflectKey,
          methodKeyFixture,
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

        result = getClassMethodRequestTransformerList(
          classConstructorFixture,
          methodKeyFixture,
        );
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
