import { afterAll, beforeAll, describe, expect, it, vitest } from 'vitest';

vitest.mock(import('@inversifyjs/reflect-metadata-utils'));

import {
  buildArrayMetadataWithArray,
  buildEmptyArrayMetadata,
  updateOwnReflectMetadata,
} from '@inversifyjs/reflect-metadata-utils';
import { type HttpRequest, type HttpResponse } from 'uWebSockets.js';

import { type RequestTransformer } from '../models/RequestTransformer.js';
import { classMethodRequestTransformerMetadataReflectKey } from '../reflectMetadata/data/classMethodRequestTransformerMetadataReflectKey.js';
import { classRequestTransformerMetadataReflectKey } from '../reflectMetadata/data/classRequestTransformerMetadataReflectKey.js';
import { UseRequestTransformers } from './UseRequestTransformers.js';

describe(UseRequestTransformers, () => {
  describe('having a ClassDecorator', () => {
    describe('when called', () => {
      let requestTransformerFixture: RequestTransformer<
        HttpRequest,
        HttpResponse
      >;
      let targetFixture: NewableFunction;
      let callbackFixture: (arrayMetadata: unknown[]) => unknown[];

      beforeAll(() => {
        requestTransformerFixture = vitest.fn();
        targetFixture = class TestController {};
        callbackFixture = (arrayMetadata: unknown[]): unknown[] =>
          arrayMetadata;

        vitest
          .mocked(buildArrayMetadataWithArray)
          .mockReturnValueOnce(callbackFixture);

        UseRequestTransformers(requestTransformerFixture)(targetFixture);
      });

      afterAll(() => {
        vitest.clearAllMocks();
      });

      it('should call buildArrayMetadataWithArray()', () => {
        expect(buildArrayMetadataWithArray).toHaveBeenCalledExactlyOnceWith([
          requestTransformerFixture,
        ]);
      });

      it('should call updateOwnReflectMetadata()', () => {
        expect(updateOwnReflectMetadata).toHaveBeenCalledExactlyOnceWith(
          targetFixture,
          classRequestTransformerMetadataReflectKey,
          buildEmptyArrayMetadata,
          callbackFixture,
          undefined,
        );
      });
    });
  });

  describe('having a MethodDecorator', () => {
    describe('when called', () => {
      let targetFixture: NewableFunction;
      let methodKeyFixture: string | symbol;
      let requestTransformerFixture: RequestTransformer<
        HttpRequest,
        HttpResponse
      >;
      let descriptorFixture: PropertyDescriptor;
      let callbackFixture: (arrayMetadata: unknown[]) => unknown[];

      beforeAll(() => {
        targetFixture = class TestController {};
        methodKeyFixture = 'testMethod';
        requestTransformerFixture = vitest.fn();
        descriptorFixture = {
          value: 'value-descriptor-example',
        };
        callbackFixture = (arrayMetadata: unknown[]): unknown[] =>
          arrayMetadata;

        vitest
          .mocked(buildArrayMetadataWithArray)
          .mockReturnValueOnce(callbackFixture);

        UseRequestTransformers(requestTransformerFixture)(
          targetFixture.prototype as object,
          methodKeyFixture,
          descriptorFixture,
        );
      });

      afterAll(() => {
        vitest.clearAllMocks();
      });

      it('should call buildArrayMetadataWithArray()', () => {
        expect(buildArrayMetadataWithArray).toHaveBeenCalledExactlyOnceWith([
          requestTransformerFixture,
        ]);
      });

      it('should call updateOwnReflectMetadata()', () => {
        expect(updateOwnReflectMetadata).toHaveBeenCalledExactlyOnceWith(
          targetFixture,
          classMethodRequestTransformerMetadataReflectKey,
          buildEmptyArrayMetadata,
          callbackFixture,
          methodKeyFixture,
        );
      });
    });
  });
});
