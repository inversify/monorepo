import { afterAll, beforeAll, describe, expect, it, vitest } from 'vitest';

vitest.mock(import('@inversifyjs/reflect-metadata-utils'));
vitest.mock(import('./buildNormalizedPath.js'));

import {
  buildArrayMetadataWithElement,
  buildEmptyArrayMetadata,
  updateOwnReflectMetadata,
} from '@inversifyjs/reflect-metadata-utils';

import { decoratorFinalizersMetadataKey } from '@inversifyjs/framework-core';
import { controllerMethodMetadataReflectKey } from '../../reflectMetadata/data/controllerMethodMetadataReflectKey.js';
import { RequestMethodType } from '../models/RequestMethodType.js';
import { buildNormalizedPath } from './buildNormalizedPath.js';
import { requestMethod } from './requestMethod.js';

describe(requestMethod, () => {
  describe('having a path undefined', () => {
    describe('when called', () => {
      let callbackFixture: (arrayMetadata: unknown[]) => unknown[];
      let keyFixture: string | symbol;
      let normalizedPathFixture: string;
      let mockMetadata: Record<symbol, unknown>;
      let contextFixture: ClassMethodDecoratorContext;

      beforeAll(() => {
        keyFixture = 'key-example';
        callbackFixture = (arrayMetadata: unknown[]): unknown[] =>
          arrayMetadata;
        normalizedPathFixture = '/';
        mockMetadata = {};
        contextFixture = {
          name: keyFixture,
          metadata: mockMetadata,
        } as unknown as ClassMethodDecoratorContext;

        vitest
          .mocked(buildNormalizedPath)
          .mockReturnValueOnce(normalizedPathFixture);

        vitest
          .mocked(buildArrayMetadataWithElement)
          .mockReturnValueOnce(callbackFixture);

        requestMethod(RequestMethodType.Get)(() => {}, contextFixture);
      });

      afterAll(() => {
        vitest.clearAllMocks();
      });

      it('should call buildNormalizedPath()', () => {
        expect(buildNormalizedPath).toHaveBeenCalledExactlyOnceWith('/');
      });

      it('should store a finalizer in context.metadata', () => {
        const finalizers = mockMetadata[decoratorFinalizersMetadataKey] as unknown[];
        expect(finalizers).toHaveLength(1);
      });

      describe('when finalizer is called', () => {
        let classFixture: Function;

        beforeAll(() => {
          classFixture = class {};
          const finalizers = mockMetadata[decoratorFinalizersMetadataKey] as Array<(cls: object) => void>;
          for (const fn of finalizers) fn(classFixture);
        });

        it('should call buildArrayMetadataWithElement', () => {
          expect(buildArrayMetadataWithElement).toHaveBeenCalledExactlyOnceWith({
            methodKey: keyFixture,
            path: normalizedPathFixture,
            requestMethodType: RequestMethodType.Get,
          });
        });

        it('should call updateOwnReflectMetadata()', () => {
          expect(updateOwnReflectMetadata).toHaveBeenCalledExactlyOnceWith(
            classFixture,
            controllerMethodMetadataReflectKey,
            buildEmptyArrayMetadata,
            callbackFixture,
          );
        });
      });
    });
  });

  describe('having a path defined', () => {
    describe('when called', () => {
      let callbackFixture: (arrayMetadata: unknown[]) => unknown[];
      let pathFixture: string;
      let keyFixture: string | symbol;
      let normalizedPathFixture: string;
      let mockMetadata: Record<symbol, unknown>;
      let contextFixture: ClassMethodDecoratorContext;

      beforeAll(() => {
        keyFixture = 'key-example';
        callbackFixture = (arrayMetadata: unknown[]): unknown[] =>
          arrayMetadata;
        pathFixture = '/example';
        normalizedPathFixture = '/example';
        mockMetadata = {};
        contextFixture = {
          name: keyFixture,
          metadata: mockMetadata,
        } as unknown as ClassMethodDecoratorContext;

        vitest
          .mocked(buildNormalizedPath)
          .mockReturnValueOnce(normalizedPathFixture);

        vitest
          .mocked(buildArrayMetadataWithElement)
          .mockReturnValueOnce(callbackFixture);

        requestMethod(RequestMethodType.Get, pathFixture)(
          () => {},
          contextFixture,
        );
      });

      afterAll(() => {
        vitest.clearAllMocks();
      });

      it('should call buildNormalizedPath()', () => {
        expect(buildNormalizedPath).toHaveBeenCalledExactlyOnceWith(
          pathFixture,
        );
      });

      it('should store a finalizer in context.metadata', () => {
        const finalizers = mockMetadata[decoratorFinalizersMetadataKey] as unknown[];
        expect(finalizers).toHaveLength(1);
      });

      describe('when finalizer is called', () => {
        let classFixture: Function;

        beforeAll(() => {
          classFixture = class {};
          const finalizers = mockMetadata[decoratorFinalizersMetadataKey] as Array<(cls: object) => void>;
          for (const fn of finalizers) fn(classFixture);
        });

        it('should call buildArrayMetadataWithElement', () => {
          expect(buildArrayMetadataWithElement).toHaveBeenCalledExactlyOnceWith({
            methodKey: keyFixture,
            path: normalizedPathFixture,
            requestMethodType: RequestMethodType.Get,
          });
        });

        it('should call updateOwnReflectMetadata()', () => {
          expect(updateOwnReflectMetadata).toHaveBeenCalledExactlyOnceWith(
            classFixture,
            controllerMethodMetadataReflectKey,
            buildEmptyArrayMetadata,
            callbackFixture,
          );
        });
      });
    });
  });
});
