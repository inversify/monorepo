import { afterAll, beforeAll, describe, expect, it, vitest } from 'vitest';

vitest.mock(import('@inversifyjs/reflect-metadata-utils'));

import {
  buildArrayMetadataWithArray,
  buildEmptyArrayMetadata,
  updateOwnReflectMetadata,
} from '@inversifyjs/reflect-metadata-utils';
import { type ServiceIdentifier } from 'inversify';

import { classMethodMiddlewareMetadataReflectKey } from '../../reflectMetadata/data/classMethodMiddlewareMetadataReflectKey.js';
import { classMiddlewareMetadataReflectKey } from '../../reflectMetadata/data/classMiddlewareMetadataReflectKey.js';
import { decoratorFinalizersMetadataKey } from '../../reflectMetadata/data/decoratorFinalizersMetadataKey.js';
import { type Middleware } from '../models/Middleware.js';
import { ApplyMiddleware } from './ApplyMiddleware.js';

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

        ApplyMiddleware(middlewareServiceIdentifierFixture)(targetFixture, { kind: 'class' } as DecoratorContext);
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
        );
      });
    });
  });

  describe('having a MethodDecorator', () => {
    describe('when called, and getOwnReflectMetadata() returns a Middleware list', () => {
      let controllerFixture: NewableFunction;
      let controllerMethodKeyFixture: string | symbol;
      let callbackFixture: (arrayMetadata: unknown[]) => unknown[];
      let middlewareServiceIdentifierFixture: ServiceIdentifier<Middleware>;

      beforeAll(() => {
        controllerFixture = class Test {};
        controllerMethodKeyFixture = 'testMethod';
        callbackFixture = (arrayMetadata: unknown[]): unknown[] =>
          arrayMetadata;
        middlewareServiceIdentifierFixture = Symbol();

        vitest
          .mocked(buildArrayMetadataWithArray)
          .mockReturnValueOnce(callbackFixture);

        const mockMetadata: Record<symbol, unknown> = {};

        ApplyMiddleware(middlewareServiceIdentifierFixture)(vitest.fn(), {
          kind: 'method',
          name: controllerMethodKeyFixture,
          metadata: mockMetadata,
        } as unknown as DecoratorContext);

        const finalizers = mockMetadata[decoratorFinalizersMetadataKey] as Array<(cls: object) => void>;
        for (const fn of finalizers) fn(controllerFixture);
      });

      it('should call buildArrayMetadataWithArray()', () => {
        expect(buildArrayMetadataWithArray).toHaveBeenCalledExactlyOnceWith([
          middlewareServiceIdentifierFixture,
        ]);
      });

      it('should call updateOwnReflectMetadata()', () => {
        expect(updateOwnReflectMetadata).toHaveBeenCalledExactlyOnceWith(
          controllerFixture,
          classMethodMiddlewareMetadataReflectKey,
          buildEmptyArrayMetadata,
          callbackFixture,
          controllerMethodKeyFixture,
        );
      });
    });
  });
});
