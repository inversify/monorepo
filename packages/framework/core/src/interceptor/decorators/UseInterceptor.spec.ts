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
import { decoratorFinalizersMetadataKey } from '../../reflectMetadata/data/decoratorFinalizersMetadataKey.js';
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

        UseInterceptor(interceptorServiceIdentifier)(targetFixture, { kind: 'class' } as DecoratorContext);
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
        );
      });
    });
  });

  describe('having a MethodDecorator', () => {
    describe('when called', () => {
      let targetFixture: NewableFunction;
      let methodKeyFixture: string | symbol;
      let interceptorServiceIdentifier: ServiceIdentifier<Interceptor>;
      let callbackFixture: (arrayMetadata: unknown[]) => unknown[];

      beforeAll(() => {
        targetFixture = class TestController {};
        methodKeyFixture = 'testMethod';
        interceptorServiceIdentifier = Symbol();
        callbackFixture = (arrayMetadata: unknown[]): unknown[] =>
          arrayMetadata;

        vitest
          .mocked(buildArrayMetadataWithArray)
          .mockReturnValueOnce(callbackFixture);

        const mockMetadata: Record<symbol, unknown> = {};

        UseInterceptor(interceptorServiceIdentifier)(vitest.fn(), {
          kind: 'method',
          name: methodKeyFixture,
          metadata: mockMetadata,
        } as unknown as DecoratorContext);

        const finalizers = mockMetadata[decoratorFinalizersMetadataKey] as Array<(cls: object) => void>;
        for (const fn of finalizers) fn(targetFixture);
      });

      it('should call buildArrayMetadataWithArray()', () => {
        expect(buildArrayMetadataWithArray).toHaveBeenCalledExactlyOnceWith([
          interceptorServiceIdentifier,
        ]);
      });

      it('should call updateOwnReflectMetadata()', () => {
        expect(updateOwnReflectMetadata).toHaveBeenCalledExactlyOnceWith(
          targetFixture,
          classMethodInterceptorMetadataReflectKey,
          buildEmptyArrayMetadata,
          callbackFixture,
          methodKeyFixture,
        );
      });
    });
  });
});
