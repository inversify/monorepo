import { afterAll, beforeAll, describe, expect, it } from 'vitest';

import 'reflect-metadata/lite';

import { setReflectMetadata } from './setReflectMetadata';

describe(setReflectMetadata, () => {
  describe('having no property key', () => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
    let targetFixture: Function;
    let metadataKeyFixture: unknown;
    let metadataFixture: unknown;

    beforeAll(() => {
      targetFixture = class {};
      metadataKeyFixture = 'sample-key';
      metadataFixture = 'metadata';
    });

    describe('when called', () => {
      let reflectMetadata: unknown;
      let result: unknown;

      beforeAll(() => {
        metadataFixture = 'metadata';
        result = setReflectMetadata(
          targetFixture,
          metadataKeyFixture,
          metadataFixture,
        );

        reflectMetadata = Reflect.getOwnMetadata(
          metadataKeyFixture,
          targetFixture,
        );
      });

      afterAll(() => {
        Reflect.deleteMetadata(metadataKeyFixture, targetFixture);
      });

      it('should set metadata', () => {
        expect(reflectMetadata).toBe(metadataFixture);
      });

      it('should return undefined', () => {
        expect(result).toBeUndefined();
      });
    });
  });

  describe('having property key', () => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
    let targetFixture: Function;
    let metadataKeyFixture: unknown;
    let metadataFixture: unknown;
    let propertyKeyFixture: string | symbol;

    beforeAll(() => {
      targetFixture = class {};
      metadataKeyFixture = 'sample-key';
      metadataFixture = 'metadata';
      propertyKeyFixture = Symbol();
    });

    describe('when called', () => {
      let reflectMetadata: unknown;
      let result: unknown;

      beforeAll(() => {
        metadataFixture = 'metadata';
        result = setReflectMetadata(
          targetFixture,
          metadataKeyFixture,
          metadataFixture,
          propertyKeyFixture,
        );

        reflectMetadata = Reflect.getOwnMetadata(
          metadataKeyFixture,
          targetFixture,
          propertyKeyFixture,
        );
      });

      afterAll(() => {
        Reflect.deleteMetadata(
          metadataKeyFixture,
          targetFixture,
          propertyKeyFixture,
        );
      });

      it('should set metadata', () => {
        expect(reflectMetadata).toBe(metadataFixture);
      });

      it('should return undefined', () => {
        expect(result).toBeUndefined();
      });
    });
  });
});
