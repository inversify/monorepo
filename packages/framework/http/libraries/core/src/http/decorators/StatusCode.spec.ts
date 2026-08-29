import { afterAll, beforeAll, describe, expect, it, vitest } from 'vitest';

vitest.mock(import('@inversifyjs/reflect-metadata-utils'));

import { decoratorFinalizersMetadataKey } from '@inversifyjs/framework-core';
import { setReflectMetadata } from '@inversifyjs/reflect-metadata-utils';

import { controllerMethodStatusCodeMetadataReflectKey } from '../../reflectMetadata/data/controllerMethodStatusCodeMetadataReflectKey.js';
import { HttpStatusCode } from '../models/HttpStatusCode.js';
import { StatusCode } from './StatusCode.js';

describe(StatusCode, () => {
  describe('when called', () => {
    let mockMetadata: Record<symbol, unknown>;
    let contextFixture: ClassMethodDecoratorContext;

    beforeAll(() => {
      mockMetadata = {};
      contextFixture = {
        name: 'testMethod',
        metadata: mockMetadata,
      } as unknown as ClassMethodDecoratorContext;

      StatusCode(HttpStatusCode.OK)(() => {}, contextFixture);
    });

    afterAll(() => {
      vitest.clearAllMocks();
    });

    it('should store a finalizer in context.metadata', () => {
      const finalizers = mockMetadata[decoratorFinalizersMetadataKey] as unknown[];
      expect(finalizers).toHaveLength(1);
    });

    describe('when finalizer is called', () => {
      let classFixture: NewableFunction;

      beforeAll(() => {
        classFixture = class Test {};

        const finalizers = mockMetadata[decoratorFinalizersMetadataKey] as Array<(cls: object) => void>;
        for (const fn of finalizers) fn(classFixture);
      });

      it('should call setReflectMetadata', () => {
        expect(setReflectMetadata).toHaveBeenCalledExactlyOnceWith(
          classFixture,
          controllerMethodStatusCodeMetadataReflectKey,
          HttpStatusCode.OK,
          'testMethod',
        );
      });
    });
  });
});
