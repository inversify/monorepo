import { afterAll, beforeAll, describe, expect, it, vitest } from 'vitest';

vitest.mock('@inversifyjs/reflect-metadata-utils');
vitest.mock('../calculations/buildArrayMetadataWithArray');

import { updateOwnReflectMetadata } from '@inversifyjs/reflect-metadata-utils';
import { Newable } from 'inversify';

import { controllerMethodMiddlewareMetadataReflectKey } from '../../reflectMetadata/data/controllerMethodMiddlewareMetadataReflectKey';
import { controllerMiddlewareMetadataReflectKey } from '../../reflectMetadata/data/controllerMiddlewareMetadataReflectKey';
import { buildArrayMetadataWithArray } from '../calculations/buildArrayMetadataWithArray';
import { buildDefaultArrayMetadata } from '../calculations/buildDefaultArrayMetadata';
import { Middleware } from '../middleware/model/Middleware';
import { applyMiddleware } from './ApplyMiddleware';

describe(applyMiddleware.name, () => {
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

        applyMiddleware(middlewareFixture)(targetFixture);
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
          controllerMiddlewareMetadataReflectKey,
          buildDefaultArrayMetadata,
          callbackFixture,
          undefined,
        );
      });
    });
  });

  describe('having a MethodDecorator', () => {
    describe('when called and getOwnReflectMetadata returns a Middleware list', () => {
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

        applyMiddleware(middlewareFixture)(
          controllerFixture,
          controllerMethodKeyFixture,
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
          controllerFixture.constructor,
          controllerMethodMiddlewareMetadataReflectKey,
          buildDefaultArrayMetadata,
          callbackFixture,
          controllerMethodKeyFixture,
        );
      });
    });
  });
});
