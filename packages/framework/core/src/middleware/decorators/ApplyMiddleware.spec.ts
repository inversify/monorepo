import { afterAll, beforeAll, describe, expect, it, vitest } from 'vitest';

vitest.mock('@inversifyjs/reflect-metadata-utils');

import {
  buildArrayMetadataWithArray,
  buildEmptyArrayMetadata,
  updateOwnReflectMetadata,
} from '@inversifyjs/reflect-metadata-utils';
import { Newable } from 'inversify';

import { classMethodMiddlewareMetadataReflectKey } from '../../reflectMetadata/data/classMethodMiddlewareMetadataReflectKey';
import { classMiddlewareMetadataReflectKey } from '../../reflectMetadata/data/classMiddlewareMetadataReflectKey';
import { Middleware } from '../models/Middleware';
import { ApplyMiddleware } from './ApplyMiddleware';

describe(ApplyMiddleware, () => {
  describe('having a ClassDecorator', () => {
    describe('when called', () => {
      let middlewareFixture: Newable<Middleware>;
      let callbackFixture: (arrayMetadata: unknown[]) => unknown[];
      let targetFixture: NewableFunction;

      beforeAll(() => {
        middlewareFixture = {} as Newable<Middleware>;
        callbackFixture = (arrayMetadata: unknown[]): unknown[] =>
          arrayMetadata;
        targetFixture = class TestController {};

        vitest
          .mocked(buildArrayMetadataWithArray)
          .mockReturnValueOnce(callbackFixture);

        ApplyMiddleware(middlewareFixture)(targetFixture);
      });

      afterAll(() => {
        vitest.clearAllMocks();
      });

      it('should call buildArrayMetadataWithArray()', () => {
        expect(buildArrayMetadataWithArray).toHaveBeenCalledTimes(1);
        expect(buildArrayMetadataWithArray).toHaveBeenCalledWith([
          middlewareFixture,
        ]);
      });

      it('should call updateOwnReflectMetadata()', () => {
        expect(updateOwnReflectMetadata).toHaveBeenCalledTimes(1);
        expect(updateOwnReflectMetadata).toHaveBeenCalledWith(
          targetFixture,
          classMiddlewareMetadataReflectKey,
          buildEmptyArrayMetadata,
          callbackFixture,
          undefined,
        );
      });
    });
  });

  describe('having a MethodDecorator', () => {
    describe('when called, and getOwnReflectMetadata() returns a Middleware list', () => {
      let controllerFixture: NewableFunction;
      let controllerMethodKeyFixture: string | symbol;
      let callbackFixture: (arrayMetadata: unknown[]) => unknown[];
      let descriptorFixture: PropertyDescriptor;
      let middlewareFixture: Newable<Middleware>;

      beforeAll(() => {
        controllerFixture = class Test {};
        controllerMethodKeyFixture = 'testMethod';
        callbackFixture = (arrayMetadata: unknown[]): unknown[] =>
          arrayMetadata;
        middlewareFixture = {} as Newable<Middleware>;
        descriptorFixture = {
          value: 'value-descriptor-example',
        } as PropertyDescriptor;

        vitest
          .mocked(buildArrayMetadataWithArray)
          .mockReturnValueOnce(callbackFixture);

        ApplyMiddleware(middlewareFixture)(
          controllerFixture,
          controllerMethodKeyFixture,
          descriptorFixture,
        );
      });

      it('should call buildArrayMetadataWithArray()', () => {
        expect(buildArrayMetadataWithArray).toHaveBeenCalledTimes(1);
        expect(buildArrayMetadataWithArray).toHaveBeenCalledWith([
          middlewareFixture,
        ]);
      });

      it('should call updateOwnReflectMetadata()', () => {
        expect(updateOwnReflectMetadata).toHaveBeenCalledTimes(1);
        expect(updateOwnReflectMetadata).toHaveBeenCalledWith(
          controllerFixture.constructor,
          classMethodMiddlewareMetadataReflectKey,
          buildEmptyArrayMetadata,
          callbackFixture,
          controllerMethodKeyFixture,
        );
      });
    });
  });
});
