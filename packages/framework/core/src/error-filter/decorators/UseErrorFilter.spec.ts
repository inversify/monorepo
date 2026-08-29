import {
  afterAll,
  beforeAll,
  describe,
  expect,
  it,
  type Mock,
  vitest,
} from 'vitest';

vitest.mock(import('@inversifyjs/reflect-metadata-utils'));

import {
  buildEmptySetMetadata,
  updateOwnReflectMetadata,
  updateSetMetadataWithList,
} from '@inversifyjs/reflect-metadata-utils';
import { type Newable } from 'inversify';

import { classErrorFilterMetadataReflectKey } from '../../reflectMetadata/data/classErrorFilterMetadataReflectKey.js';
import { classMethodErrorFilterMetadataReflectKey } from '../../reflectMetadata/data/classMethodErrorFilterMetadataReflectKey.js';
import { decoratorFinalizersMetadataKey } from '../../reflectMetadata/data/decoratorFinalizersMetadataKey.js';
import { type ErrorFilter } from '../models/ErrorFilter.js';
import { UseErrorFilter } from './UseErrorFilter.js';

describe(UseErrorFilter, () => {
  describe('having a target', () => {
    let errorFilterFixture: Newable<ErrorFilter>;
    let targetFixture: NewableFunction;

    beforeAll(() => {
      errorFilterFixture = Symbol() as unknown as Newable<ErrorFilter>;
      targetFixture = class TestController {};
    });

    describe('when called', () => {
      let updateSetMetadataWithListResultFixture: Mock<
        (metadataSet: Set<unknown>) => Set<unknown>
      >;

      let result: unknown;

      beforeAll(() => {
        updateSetMetadataWithListResultFixture = vitest.fn();

        vitest
          .mocked(updateSetMetadataWithList)
          .mockReturnValueOnce(updateSetMetadataWithListResultFixture);

        result = UseErrorFilter(errorFilterFixture)(targetFixture, { kind: 'class' } as DecoratorContext);
      });

      afterAll(() => {
        vitest.clearAllMocks();
      });

      it('should call updateSetMetadataWithList()', () => {
        expect(updateSetMetadataWithList).toHaveBeenCalledExactlyOnceWith([
          errorFilterFixture,
        ]);
      });

      it('should call updateOwnReflectMetadata()', () => {
        expect(updateOwnReflectMetadata).toHaveBeenCalledExactlyOnceWith(
          targetFixture,
          classErrorFilterMetadataReflectKey,
          buildEmptySetMetadata,
          updateSetMetadataWithListResultFixture,
        );
      });

      it('should return undefined', () => {
        expect(result).toBeUndefined();
      });
    });
  });

  describe('having a target and a key', () => {
    let errorFilterFixture: Newable<ErrorFilter>;
    let targetFixture: NewableFunction;
    let methodKeyFixture: string | symbol;

    beforeAll(() => {
      errorFilterFixture = Symbol() as unknown as Newable<ErrorFilter>;
      targetFixture = class TestController {};
      methodKeyFixture = 'testMethod';
    });

    describe('when called', () => {
      let updateSetMetadataWithListResultFixture: Mock<
        (metadataSet: Set<unknown>) => Set<unknown>
      >;

      beforeAll(() => {
        updateSetMetadataWithListResultFixture = vitest.fn();

        vitest
          .mocked(updateSetMetadataWithList)
          .mockReturnValueOnce(updateSetMetadataWithListResultFixture);

        const mockMetadata: Record<symbol, unknown> = {};

        UseErrorFilter(errorFilterFixture)(vitest.fn(), {
          kind: 'method',
          name: methodKeyFixture,
          metadata: mockMetadata,
        } as unknown as DecoratorContext);

        const finalizers = mockMetadata[decoratorFinalizersMetadataKey] as Array<(cls: object) => void>;
        for (const fn of finalizers) fn(targetFixture);
      });

      it('should call updateSetMetadataWithList()', () => {
        expect(updateSetMetadataWithList).toHaveBeenCalledExactlyOnceWith([
          errorFilterFixture,
        ]);
      });

      it('should call updateOwnReflectMetadata()', () => {
        expect(updateOwnReflectMetadata).toHaveBeenCalledExactlyOnceWith(
          targetFixture,
          classMethodErrorFilterMetadataReflectKey,
          buildEmptySetMetadata,
          updateSetMetadataWithListResultFixture,
          methodKeyFixture,
        );
      });
    });
  });
});
