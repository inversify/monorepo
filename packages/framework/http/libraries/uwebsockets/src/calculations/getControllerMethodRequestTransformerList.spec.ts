import { afterAll, beforeAll, describe, expect, it, vitest } from 'vitest';

vitest.mock(import('@inversifyjs/reflect-metadata-utils'));

import { getReflectMetadata } from '@inversifyjs/reflect-metadata-utils';

import { type RequestTransformer } from '../models/RequestTransformer.js';
import { requestTransformerMetadataReflectKey } from '../reflectMetadata/data/requestTransformerMetadataReflectKey.js';
import { getControllerMethodRequestTransformerList } from './getControllerMethodRequestTransformerList.js';

describe(getControllerMethodRequestTransformerList, () => {
  describe('having a controller constructor and a method key', () => {
    let controllerConstructorFixture: NewableFunction;
    let methodKeyFixture: string;

    beforeAll(() => {
      controllerConstructorFixture = class TestController {};
      methodKeyFixture = 'testMethod';
    });

    describe('when called, and getReflectMetadata() returns a request transformer list', () => {
      let requestTransformerListFixture: RequestTransformer[];
      let result: unknown;

      beforeAll(() => {
        requestTransformerListFixture = [vitest.fn()];

        vitest
          .mocked(getReflectMetadata)
          .mockReturnValueOnce(requestTransformerListFixture);

        result = getControllerMethodRequestTransformerList(
          controllerConstructorFixture,
          methodKeyFixture,
        );
      });

      afterAll(() => {
        vitest.clearAllMocks();
      });

      it('should call getReflectMetadata()', () => {
        expect(getReflectMetadata).toHaveBeenCalledExactlyOnceWith(
          controllerConstructorFixture,
          requestTransformerMetadataReflectKey,
          methodKeyFixture,
        );
      });

      it('should return the request transformer list', () => {
        expect(result).toBe(requestTransformerListFixture);
      });
    });

    describe('when called, and getReflectMetadata() returns undefined', () => {
      let result: unknown;

      beforeAll(() => {
        vitest.mocked(getReflectMetadata).mockReturnValueOnce(undefined);

        result = getControllerMethodRequestTransformerList(
          controllerConstructorFixture,
          methodKeyFixture,
        );
      });

      afterAll(() => {
        vitest.clearAllMocks();
      });

      it('should return undefined', () => {
        expect(result).toBeUndefined();
      });
    });

    describe('when called, and getReflectMetadata() returns an empty list', () => {
      let result: unknown;

      beforeAll(() => {
        vitest.mocked(getReflectMetadata).mockReturnValueOnce([]);

        result = getControllerMethodRequestTransformerList(
          controllerConstructorFixture,
          methodKeyFixture,
        );
      });

      afterAll(() => {
        vitest.clearAllMocks();
      });

      it('should return undefined', () => {
        expect(result).toBeUndefined();
      });
    });
  });
});
