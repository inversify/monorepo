import { afterAll, beforeAll, describe, expect, it, vitest } from 'vitest';

vitest.mock(import('@inversifyjs/reflect-metadata-utils'));
vitest.mock(import('../calculations/buildCaptureRequestValuesTransformer.js'));

import {
  buildArrayMetadataWithArray,
  buildEmptyArrayMetadata,
  getOwnReflectMetadata,
  setReflectMetadata,
  updateOwnReflectMetadata,
} from '@inversifyjs/reflect-metadata-utils';
import { type HttpRequest, type HttpResponse } from 'uWebSockets.js';

import { buildCaptureRequestValuesTransformer } from '../calculations/buildCaptureRequestValuesTransformer.js';
import { type CaptureRequestValuesOptions } from '../models/CaptureRequestValuesOptions.js';
import { type RequestTransformer } from '../models/RequestTransformer.js';
import { captureRequestValuesMetadataReflectKey } from '../reflectMetadata/data/captureRequestValuesMetadataReflectKey.js';
import { classMethodRequestTransformerMetadataReflectKey } from '../reflectMetadata/data/classMethodRequestTransformerMetadataReflectKey.js';
import { CaptureRequestValues } from './CaptureRequestValues.js';

describe(CaptureRequestValues, () => {
  describe('having capture options', () => {
    let methodKeyFixture: string;
    let optionsFixture: CaptureRequestValuesOptions;
    let targetFixture: object;

    beforeAll(() => {
      methodKeyFixture = 'testMethod';
      optionsFixture = {
        headers: true,
        method: true,
        params: ['userId'],
      };

      class TestController {
        public testMethod(): void {}
      }

      targetFixture = TestController.prototype;
    });

    describe('when called', () => {
      let requestTransformerFixture: RequestTransformer<
        HttpRequest,
        HttpResponse
      >;
      let callbackFixture: (arrayMetadata: unknown[]) => unknown[];

      beforeAll(() => {
        requestTransformerFixture = vitest.fn();
        callbackFixture = (arrayMetadata: unknown[]): unknown[] =>
          arrayMetadata;

        vitest.mocked(getOwnReflectMetadata).mockReturnValueOnce(undefined);
        vitest
          .mocked(buildCaptureRequestValuesTransformer)
          .mockReturnValueOnce(requestTransformerFixture);
        vitest
          .mocked(buildArrayMetadataWithArray)
          .mockReturnValueOnce(callbackFixture);

        CaptureRequestValues(optionsFixture)(
          targetFixture,
          methodKeyFixture,
          {},
        );
      });

      afterAll(() => {
        vitest.clearAllMocks();
      });

      it('should call buildCaptureRequestValuesTransformer()', () => {
        expect(
          buildCaptureRequestValuesTransformer,
        ).toHaveBeenCalledExactlyOnceWith(optionsFixture);
      });

      it('should store capture metadata', () => {
        expect(setReflectMetadata).toHaveBeenCalledExactlyOnceWith(
          targetFixture.constructor,
          captureRequestValuesMetadataReflectKey,
          optionsFixture,
          methodKeyFixture,
        );
      });

      it('should register the capture request transformer', () => {
        expect(updateOwnReflectMetadata).toHaveBeenCalledExactlyOnceWith(
          targetFixture.constructor,
          classMethodRequestTransformerMetadataReflectKey,
          buildEmptyArrayMetadata,
          callbackFixture,
          methodKeyFixture,
        );
      });
    });

    describe('when called twice on the same method', () => {
      let result: unknown;

      beforeAll(() => {
        vitest
          .mocked(getOwnReflectMetadata)
          .mockReturnValueOnce(optionsFixture);

        try {
          CaptureRequestValues(optionsFixture)(
            targetFixture,
            methodKeyFixture,
            {},
          );
        } catch (error: unknown) {
          result = error;
        }
      });

      afterAll(() => {
        vitest.clearAllMocks();
      });

      it('should throw an error', () => {
        expect(result).toBeInstanceOf(Error);
        expect((result as Error).message).toContain(
          '@CaptureRequestValues() cannot be applied more than once',
        );
      });

      it('should check existing capture metadata', () => {
        expect(getOwnReflectMetadata).toHaveBeenCalledExactlyOnceWith(
          targetFixture.constructor,
          captureRequestValuesMetadataReflectKey,
          methodKeyFixture,
        );
      });
    });
  });
});
