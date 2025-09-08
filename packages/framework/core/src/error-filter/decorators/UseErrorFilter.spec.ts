import { afterAll, beforeAll, describe, expect, it, vitest } from 'vitest';

vitest.mock('@inversifyjs/reflect-metadata-utils');

import {
  buildArrayMetadataWithArray,
  buildEmptyArrayMetadata,
  updateOwnReflectMetadata,
} from '@inversifyjs/reflect-metadata-utils';
import { Newable } from 'inversify';

import { classErrorFilterMetadataReflectKey } from '../../reflectMetadata/data/classErrorFilterMetadataReflectKey';
import { classMethodErrorFilterMetadataReflectKey } from '../../reflectMetadata/data/classMethodErrorFilterMetadataReflectKey';
import { ErrorFilter } from '../models/ErrorFilter';
import { UseErrorFilter } from './UseErrorFilter';

describe(UseErrorFilter, () => {
  describe('having a ClassDecorator', () => {
    describe('when called', () => {
      let middlewareFixture: Newable<ErrorFilter>;
      let targetFixture: NewableFunction;
      let callbackFixture: (arrayMetadata: unknown[]) => unknown[];

      beforeAll(() => {
        middlewareFixture = {} as Newable<ErrorFilter>;
        targetFixture = class TestController {};
        callbackFixture = (arrayMetadata: unknown[]): unknown[] =>
          arrayMetadata;

        vitest
          .mocked(buildArrayMetadataWithArray)
          .mockReturnValueOnce(callbackFixture);

        UseErrorFilter(middlewareFixture)(targetFixture);
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
          classErrorFilterMetadataReflectKey,
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
      let middlewareFixture: Newable<ErrorFilter>;
      let descriptorFixture: PropertyDescriptor;
      let callbackFixture: (arrayMetadata: unknown[]) => unknown[];

      beforeAll(() => {
        targetFixture = class TestController {};
        methodKeyFixture = 'testMethod';
        middlewareFixture = {} as Newable<ErrorFilter>;
        descriptorFixture = {
          value: 'value-descriptor-example',
        } as PropertyDescriptor;
        callbackFixture = (arrayMetadata: unknown[]): unknown[] =>
          arrayMetadata;

        vitest
          .mocked(buildArrayMetadataWithArray)
          .mockReturnValueOnce(callbackFixture);

        UseErrorFilter(middlewareFixture)(
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
          classMethodErrorFilterMetadataReflectKey,
          buildEmptyArrayMetadata,
          callbackFixture,
          methodKeyFixture,
        );
      });
    });
  });
});
