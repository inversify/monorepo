import {
  afterAll,
  beforeAll,
  describe,
  expect,
  it,
  Mock,
  vitest,
} from 'vitest';

vitest.mock('@inversifyjs/reflect-metadata-utils');

import {
  buildEmptySetMetadata,
  updateOwnReflectMetadata,
  updateSetMetadataWithList,
} from '@inversifyjs/reflect-metadata-utils';
import { Newable } from 'inversify';

import { classErrorFilterMetadataReflectKey } from '../../reflectMetadata/data/classErrorFilterMetadataReflectKey';
import { classMethodErrorFilterMetadataReflectKey } from '../../reflectMetadata/data/classMethodErrorFilterMetadataReflectKey';
import { ErrorFilter } from '../models/ErrorFilter';
import { UseErrorFilter } from './UseErrorFilter';

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

        result = UseErrorFilter(errorFilterFixture)(targetFixture);
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
          undefined,
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
    let descriptorFixture: PropertyDescriptor;

    beforeAll(() => {
      errorFilterFixture = Symbol() as unknown as Newable<ErrorFilter>;
      targetFixture = class TestController {};
      methodKeyFixture = 'testMethod';
      descriptorFixture = {
        value: 'value-descriptor-example',
      } as PropertyDescriptor;
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

        result = UseErrorFilter(errorFilterFixture)(
          // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
          targetFixture.prototype,
          methodKeyFixture,
          descriptorFixture,
        );
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

      it('should return undefined', () => {
        expect(result).toBeUndefined();
      });
    });
  });
});
