import { afterAll, beforeAll, describe, expect, it, vitest } from 'vitest';

vitest.mock(import('@inversifyjs/reflect-metadata-utils'));
vitest.mock(import('../actions/setRouteValueMetadata.js'));

import { decoratorFinalizersMetadataKey } from '@inversifyjs/framework-core';
import { updateOwnReflectMetadata } from '@inversifyjs/reflect-metadata-utils';

import { routeValueMetadataReflectKey } from '../../reflectMetadata/data/routeValueMetadataReflectKey.js';
import { setRouteValueMetadata } from '../actions/setRouteValueMetadata.js';
import { routeValueMetadata } from './routeValueMetadata.js';

describe(routeValueMetadata, () => {
  describe('when called', () => {
    let mockMetadata: Record<symbol, unknown>;
    let contextFixture: ClassMethodDecoratorContext;
    let metadataKeyFixture: string;
    let valueFixture: string;

    beforeAll(() => {
      metadataKeyFixture = 'key-example';
      valueFixture = 'value-example';
      mockMetadata = {};
      contextFixture = {
        name: 'testMethod',
        metadata: mockMetadata,
      } as unknown as ClassMethodDecoratorContext;

      routeValueMetadata(metadataKeyFixture, valueFixture)(
        () => {},
        contextFixture,
      );
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
      let setRouteValueMetadataResultFixture: (
        metadata: Map<string | symbol, Map<string | symbol, unknown>>,
      ) => Map<string | symbol, Map<string | symbol, unknown>>;

      beforeAll(() => {
        classFixture = class Test {};
        setRouteValueMetadataResultFixture = vitest.fn();

        vitest
          .mocked(setRouteValueMetadata)
          .mockReturnValueOnce(setRouteValueMetadataResultFixture);

        const finalizers = mockMetadata[decoratorFinalizersMetadataKey] as Array<(cls: object) => void>;
        for (const fn of finalizers) fn(classFixture);
      });

      it('should call setRouteValueMetadata', () => {
        expect(setRouteValueMetadata).toHaveBeenCalledExactlyOnceWith(
          'testMethod',
          metadataKeyFixture,
          valueFixture,
        );
      });

      it('should call updateOwnReflectMetadata', () => {
        expect(updateOwnReflectMetadata).toHaveBeenCalledExactlyOnceWith(
          classFixture,
          routeValueMetadataReflectKey,
          expect.any(Function),
          setRouteValueMetadataResultFixture,
        );
      });
    });
  });
});
