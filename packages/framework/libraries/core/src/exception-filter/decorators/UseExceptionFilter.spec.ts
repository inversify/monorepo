import { afterAll, beforeAll, describe, expect, it, vitest } from 'vitest';

vitest.mock('@inversifyjs/reflect-metadata-utils');

import {
  buildArrayMetadataWithArray,
  buildEmptyArrayMetadata,
  updateOwnReflectMetadata,
} from '@inversifyjs/reflect-metadata-utils';
import { Newable } from 'inversify';

import { classExceptionFilterMetadataReflectKey } from '../../reflectMetadata/data/classExceptionFilterMetadataReflectKey';
import { classMethodExceptionFilterMetadataReflectKey } from '../../reflectMetadata/data/classMethodExceptionFilterMetadataReflectKey';
import { ExceptionFilter } from '../models/ExceptionFilter';
import { UseExceptionFilter } from './UseExceptionFilter';

describe(UseExceptionFilter, () => {
  describe('having a ClassDecorator', () => {
    describe('when called', () => {
      let middlewareFixture: Newable<ExceptionFilter>;
      let targetFixture: NewableFunction;
      let callbackFixture: (arrayMetadata: unknown[]) => unknown[];

      beforeAll(() => {
        middlewareFixture = {} as Newable<ExceptionFilter>;
        targetFixture = class TestController {};
        callbackFixture = (arrayMetadata: unknown[]): unknown[] =>
          arrayMetadata;

        vitest
          .mocked(buildArrayMetadataWithArray)
          .mockReturnValueOnce(callbackFixture);

        UseExceptionFilter(middlewareFixture)(targetFixture);
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
          classExceptionFilterMetadataReflectKey,
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
      let middlewareFixture: Newable<ExceptionFilter>;
      let descriptorFixture: PropertyDescriptor;
      let callbackFixture: (arrayMetadata: unknown[]) => unknown[];

      beforeAll(() => {
        targetFixture = class TestController {};
        methodKeyFixture = 'testMethod';
        middlewareFixture = {} as Newable<ExceptionFilter>;
        descriptorFixture = {
          value: 'value-descriptor-example',
        } as PropertyDescriptor;
        callbackFixture = (arrayMetadata: unknown[]): unknown[] =>
          arrayMetadata;

        vitest
          .mocked(buildArrayMetadataWithArray)
          .mockReturnValueOnce(callbackFixture);

        UseExceptionFilter(middlewareFixture)(
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
          classMethodExceptionFilterMetadataReflectKey,
          buildEmptyArrayMetadata,
          callbackFixture,
          methodKeyFixture,
        );
      });
    });
  });
});
