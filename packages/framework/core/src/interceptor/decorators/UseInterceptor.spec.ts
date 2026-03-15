import { afterAll, beforeAll, describe, expect, it, vitest } from 'vitest';

vitest.mock(import('@inversifyjs/reflect-metadata-utils'));

import {
  buildArrayMetadataWithArray,
  buildEmptyArrayMetadata,
  updateOwnReflectMetadata,
} from '@inversifyjs/reflect-metadata-utils';
import { type ServiceIdentifier } from 'inversify';

import { classInterceptorMetadataReflectKey } from '../../reflectMetadata/data/classInterceptorMetadataReflectKey.js';
import { classMethodInterceptorMetadataReflectKey } from '../../reflectMetadata/data/classMethodInterceptorMetadataReflectKey.js';
import { type Interceptor } from '../models/Interceptor.js';
import { UseInterceptor } from './UseInterceptor.js';

describe(UseInterceptor, () => {
  describe('having a ClassDecorator', () => {
    describe('when called', () => {
      let interceptorServiceIdentifier: ServiceIdentifier<Interceptor>;
      let targetFixture: NewableFunction;
      let callbackFixture: (arrayMetadata: unknown[]) => unknown[];

      beforeAll(() => {
        interceptorServiceIdentifier = Symbol();
        targetFixture = class TestController {};
        callbackFixture = (arrayMetadata: unknown[]): unknown[] =>
          arrayMetadata;

        vitest
          .mocked(buildArrayMetadataWithArray)
          .mockReturnValueOnce(callbackFixture);

        UseInterceptor(interceptorServiceIdentifier)(targetFixture);
      });

      afterAll(() => {
        vitest.clearAllMocks();
      });

      it('should call buildArrayMetadataWithArray()', () => {
        expect(buildArrayMetadataWithArray).toHaveBeenCalledExactlyOnceWith([
          interceptorServiceIdentifier,
        ]);
      });

      it('should call updateOwnReflectMetadata()', () => {
        expect(updateOwnReflectMetadata).toHaveBeenCalledExactlyOnceWith(
          targetFixture,
          classInterceptorMetadataReflectKey,
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
      let interceptorServiceIdentifier: ServiceIdentifier<Interceptor>;
      let descriptorFixture: PropertyDescriptor;
      let callbackFixture: (arrayMetadata: unknown[]) => unknown[];

      beforeAll(() => {
        targetFixture = class TestController {};
        methodKeyFixture = 'testMethod';
        interceptorServiceIdentifier = Symbol();
        descriptorFixture = {
          value: 'value-descriptor-example',
        } as PropertyDescriptor;
        callbackFixture = (arrayMetadata: unknown[]): unknown[] =>
          arrayMetadata;

        vitest
          .mocked(buildArrayMetadataWithArray)
          .mockReturnValueOnce(callbackFixture);

        UseInterceptor(interceptorServiceIdentifier)(
          targetFixture,
          methodKeyFixture,
          descriptorFixture,
        );
      });

      it('should call buildArrayMetadataWithArray()', () => {
        expect(buildArrayMetadataWithArray).toHaveBeenCalledExactlyOnceWith([
          interceptorServiceIdentifier,
        ]);
      });

      it('should call updateOwnReflectMetadata()', () => {
        expect(updateOwnReflectMetadata).toHaveBeenCalledExactlyOnceWith(
          targetFixture.constructor,
          classMethodInterceptorMetadataReflectKey,
          buildEmptyArrayMetadata,
          callbackFixture,
          methodKeyFixture,
        );
      });
    });
  });
});
