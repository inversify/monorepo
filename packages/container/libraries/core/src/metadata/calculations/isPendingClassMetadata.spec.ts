import { beforeAll, describe, expect, it } from 'vitest';

import 'reflect-metadata/lite';

import { pendingClassMetadataCountReflectKey } from '../../reflectMetadata/data/pendingClassMetadataCountReflectKey';
import { isPendingClassMetadata } from './isPendingClassMetadata';

describe(isPendingClassMetadata, () => {
  describe('having no metadata', () => {
    describe('when called', () => {
      let result: unknown;

      beforeAll(() => {
        result = isPendingClassMetadata(class {});
      });

      it('should return false', () => {
        expect(result).toBe(false);
      });
    });
  });

  describe('having non zero number as metadata', () => {
    describe('when called', () => {
      class Foo {}

      let result: unknown;

      beforeAll(() => {
        Reflect.defineMetadata(pendingClassMetadataCountReflectKey, 1, Foo);

        result = isPendingClassMetadata(Foo);
      });

      it('should return true', () => {
        expect(result).toBe(true);
      });
    });
  });

  describe('having zero number as metadata', () => {
    describe('when called', () => {
      class Foo {}

      let result: unknown;

      beforeAll(() => {
        Reflect.defineMetadata(pendingClassMetadataCountReflectKey, 0, Foo);

        result = isPendingClassMetadata(Foo);
      });

      it('should return false', () => {
        expect(result).toBe(false);
      });
    });
  });
});
