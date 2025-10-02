import { afterAll, beforeAll, describe, expect, it, vitest } from 'vitest';

vitest.mock('@inversifyjs/reflect-metadata-utils');

import { updateOwnReflectMetadata } from '@inversifyjs/reflect-metadata-utils';

vitest.mock('../actions/setIsInjectableFlag');
vitest.mock('../actions/updateClassMetadataWithTypescriptParameterTypes');

import {
  BindingScope,
  bindingScopeValues,
} from '../../binding/models/BindingScope';
import { classMetadataReflectKey } from '../../reflectMetadata/data/classMetadataReflectKey';
import { setIsInjectableFlag } from '../actions/setIsInjectableFlag';
import { updateClassMetadataWithTypescriptParameterTypes } from '../actions/updateClassMetadataWithTypescriptParameterTypes';
import { getDefaultClassMetadata } from '../calculations/getDefaultClassMetadata';
import { injectable } from './injectable';

describe(injectable, () => {
  describe('having undefined binding scope', () => {
    describe('when called', () => {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
      let targetFixture: Function;

      let result: unknown;

      beforeAll(() => {
        targetFixture = class {};

        result = injectable()(targetFixture);
      });

      afterAll(() => {
        vitest.clearAllMocks();
      });

      it('should call updateClassMetadataWithTypescriptParameterTypes()', () => {
        expect(
          updateClassMetadataWithTypescriptParameterTypes,
        ).toHaveBeenCalledExactlyOnceWith(targetFixture);
      });

      it('should call setIsInjectableFlag()', () => {
        expect(setIsInjectableFlag).toHaveBeenCalledExactlyOnceWith(
          targetFixture,
        );
      });

      it('should not call updateOwnReflectMetadata()', () => {
        expect(updateOwnReflectMetadata).not.toHaveBeenCalled();
      });

      it('should return undefined', () => {
        expect(result).toBeUndefined();
      });
    });
  });

  describe('having non undefined binding scope', () => {
    class Foo {}

    let bindingScopeFixture: BindingScope;

    beforeAll(() => {
      bindingScopeFixture = bindingScopeValues.Request;
    });

    describe('when called', () => {
      let result: unknown;

      beforeAll(() => {
        result = injectable(bindingScopeFixture)(Foo);
      });

      afterAll(() => {
        vitest.clearAllMocks();
      });

      it('should call setIsInjectableFlag()', () => {
        expect(setIsInjectableFlag).toHaveBeenCalledExactlyOnceWith(Foo);
      });

      it('should call updateClassMetadataWithTypescriptParameterTypes()', () => {
        expect(
          updateClassMetadataWithTypescriptParameterTypes,
        ).toHaveBeenCalledExactlyOnceWith(Foo);
      });

      it('should call updateOwnReflectMetadata()', () => {
        expect(updateOwnReflectMetadata).toHaveBeenCalledExactlyOnceWith(
          Foo,
          classMetadataReflectKey,
          getDefaultClassMetadata,
          expect.any(Function),
        );
      });

      it('should return undefined', () => {
        expect(result).toBeUndefined();
      });
    });
  });
});
