import { afterAll, beforeAll, describe, expect, it, vitest } from 'vitest';

vitest.mock('@inversifyjs/reflect-metadata-utils');

import {
  buildArrayMetadataWithArray,
  buildEmptyArrayMetadata,
  updateOwnReflectMetadata,
} from '@inversifyjs/reflect-metadata-utils';
import { Newable } from 'inversify';

import { Interceptor } from '../interceptor/models/Interceptor';
import { classInterceptorMetadataReflectKey } from '../reflectMetadata/data/classInterceptorMetadataReflectKey';
import { classMethodInterceptorMetadataReflectKey } from '../reflectMetadata/data/classMethodInterceptorMetadataReflectKey';
import { UseInterceptor } from './UseInterceptor';

describe(UseInterceptor, () => {
  describe('having a ClassDecorator', () => {
    describe('when called', () => {
      let middlewareFixture: Newable<Interceptor>;
      let targetFixture: NewableFunction;
      let callbackFixture: (arrayMetadata: unknown[]) => unknown[];

      beforeAll(() => {
        middlewareFixture = {} as Newable<Interceptor>;
        targetFixture = class TestController {};
        callbackFixture = (arrayMetadata: unknown[]): unknown[] =>
          arrayMetadata;

        vitest
          .mocked(buildArrayMetadataWithArray)
          .mockReturnValueOnce(callbackFixture);

        UseInterceptor(middlewareFixture)(targetFixture);
      });

      afterAll(() => {
        vitest.clearAllMocks();
      });

      it('should call buildArrayMetadataWithArray', () => {
        expect(buildArrayMetadataWithArray).toHaveBeenCalledTimes(1);
        expect(buildArrayMetadataWithArray).toHaveBeenCalledWith([
          middlewareFixture,
        ]);
      });

      it('should call updateOwnReflectMetadata', () => {
        expect(updateOwnReflectMetadata).toHaveBeenCalledTimes(1);
        expect(updateOwnReflectMetadata).toHaveBeenCalledWith(
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
      let middlewareFixture: Newable<Interceptor>;
      let descriptorFixture: PropertyDescriptor;
      let callbackFixture: (arrayMetadata: unknown[]) => unknown[];

      beforeAll(() => {
        targetFixture = class TestController {};
        methodKeyFixture = 'testMethod';
        middlewareFixture = {} as Newable<Interceptor>;
        descriptorFixture = {
          value: 'value-descriptor-example',
        } as PropertyDescriptor;
        callbackFixture = (arrayMetadata: unknown[]): unknown[] =>
          arrayMetadata;

        vitest
          .mocked(buildArrayMetadataWithArray)
          .mockReturnValueOnce(callbackFixture);

        UseInterceptor(middlewareFixture)(
          targetFixture,
          methodKeyFixture,
          descriptorFixture,
        );
      });

      it('should call buildArrayMetadataWithArray', () => {
        expect(buildArrayMetadataWithArray).toHaveBeenCalledTimes(1);
        expect(buildArrayMetadataWithArray).toHaveBeenCalledWith([
          middlewareFixture,
        ]);
      });

      it('should call updateOwnReflectMetadata', () => {
        expect(updateOwnReflectMetadata).toHaveBeenCalledTimes(1);
        expect(updateOwnReflectMetadata).toHaveBeenCalledWith(
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
