import { afterAll, beforeAll, describe, expect, it, vitest } from 'vitest';

vitest.mock('@inversifyjs/reflect-metadata-utils');

import {
  buildArrayMetadataWithArray,
  buildEmptyArrayMetadata,
  updateOwnReflectMetadata,
} from '@inversifyjs/reflect-metadata-utils';
import { ServiceIdentifier } from 'inversify';

import { classMethodMiddlewareMetadataReflectKey } from '../../reflectMetadata/data/classMethodMiddlewareMetadataReflectKey';
import { classMiddlewareMetadataReflectKey } from '../../reflectMetadata/data/classMiddlewareMetadataReflectKey';
import { Middleware } from '../models/Middleware';
import { ApplyMiddleware } from './ApplyMiddleware';

describe(ApplyMiddleware, () => {
  describe('having a ClassDecorator', () => {
    describe('when called', () => {
      let middlewareServiceIdentifierFixture: ServiceIdentifier<Middleware>;
      let callbackFixture: (arrayMetadata: unknown[]) => unknown[];
      let targetFixture: NewableFunction;

      beforeAll(() => {
        middlewareServiceIdentifierFixture = Symbol();
        callbackFixture = (arrayMetadata: unknown[]): unknown[] =>
          arrayMetadata;
        targetFixture = class TestController {};

        vitest
          .mocked(buildArrayMetadataWithArray)
          .mockReturnValueOnce(callbackFixture);

        ApplyMiddleware(middlewareServiceIdentifierFixture)(targetFixture);
      });

      afterAll(() => {
        vitest.clearAllMocks();
      });

      it('should call buildArrayMetadataWithArray()', () => {
        expect(buildArrayMetadataWithArray).toHaveBeenCalledExactlyOnceWith([
          middlewareServiceIdentifierFixture,
        ]);
      });

      it('should call updateOwnReflectMetadata()', () => {
        expect(updateOwnReflectMetadata).toHaveBeenCalledExactlyOnceWith(
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
      let middlewareServiceIdentifierFixture: ServiceIdentifier<Middleware>;

      beforeAll(() => {
        controllerFixture = class Test {};
        controllerMethodKeyFixture = 'testMethod';
        callbackFixture = (arrayMetadata: unknown[]): unknown[] =>
          arrayMetadata;
        middlewareServiceIdentifierFixture = Symbol();
        descriptorFixture = {
          value: 'value-descriptor-example',
        } as PropertyDescriptor;

        vitest
          .mocked(buildArrayMetadataWithArray)
          .mockReturnValueOnce(callbackFixture);

        ApplyMiddleware(middlewareServiceIdentifierFixture)(
          controllerFixture,
          controllerMethodKeyFixture,
          descriptorFixture,
        );
      });

      it('should call buildArrayMetadataWithArray()', () => {
        expect(buildArrayMetadataWithArray).toHaveBeenCalledExactlyOnceWith([
          middlewareServiceIdentifierFixture,
        ]);
      });

      it('should call updateOwnReflectMetadata()', () => {
        expect(updateOwnReflectMetadata).toHaveBeenCalledExactlyOnceWith(
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
