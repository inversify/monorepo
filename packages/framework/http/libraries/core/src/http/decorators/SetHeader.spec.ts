import { afterAll, beforeAll, describe, expect, it, vitest } from 'vitest';

vitest.mock(import('@inversifyjs/reflect-metadata-utils'));
vitest.mock(import('../calculations/buildSetHeaderMetadata.js'));

import { decoratorFinalizersMetadataKey } from '@inversifyjs/framework-core';
import { updateOwnReflectMetadata } from '@inversifyjs/reflect-metadata-utils';

import { controllerMethodHeaderMetadataReflectKey } from '../../reflectMetadata/data/controllerMethodHeaderMetadataReflectKey.js';
import { buildSetHeaderMetadata } from '../calculations/buildSetHeaderMetadata.js';
import { SetHeader } from './SetHeader.js';

describe(SetHeader, () => {
  describe('when called', () => {
    let mockMetadata: Record<symbol, unknown>;
    let contextFixture: ClassMethodDecoratorContext;
    let keyFixture: string;
    let valueFixture: string;

    beforeAll(() => {
      keyFixture = 'key-example';
      valueFixture = 'value-example';
      mockMetadata = {};
      contextFixture = {
        name: 'testMethod',
        metadata: mockMetadata,
      } as unknown as ClassMethodDecoratorContext;

      SetHeader(keyFixture, valueFixture)(() => {}, contextFixture);
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
      let callbackFixture: (
        mapMetadata: Record<string, string>,
      ) => Record<string, string>;

      beforeAll(() => {
        classFixture = class Test {};
        callbackFixture = (
          mapMetadata: Record<string, string>,
        ): Record<string, string> => mapMetadata;

        vitest
          .mocked(buildSetHeaderMetadata)
          .mockReturnValueOnce(callbackFixture);

        const finalizers = mockMetadata[decoratorFinalizersMetadataKey] as Array<(cls: object) => void>;
        for (const fn of finalizers) fn(classFixture);
      });

      it('should call buildSetHeaderMetadata', () => {
        expect(buildSetHeaderMetadata).toHaveBeenCalledExactlyOnceWith(
          keyFixture,
          valueFixture,
        );
      });

      it('should call updateOwnReflectMetadata', () => {
        expect(updateOwnReflectMetadata).toHaveBeenCalledExactlyOnceWith(
          classFixture,
          controllerMethodHeaderMetadataReflectKey,
          expect.any(Function),
          callbackFixture,
          'testMethod',
        );
      });
    });
  });
});
