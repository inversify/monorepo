import { afterAll, beforeAll, describe, expect, it } from 'vitest';

import 'reflect-metadata/lite';

import { getOwnReflectMetadata } from './getOwnReflectMetadata';

describe(getOwnReflectMetadata, () => {
  describe('having no property key', () => {
    let metadataKeyFixture: unknown;
    // eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
    let targetFixture: Function;

    beforeAll(() => {
      metadataKeyFixture = 'sample-key';
      targetFixture = class {};
    });

    describe('when called, and no metadata is registered', () => {
      let result: unknown;

      beforeAll(() => {
        result = getOwnReflectMetadata(targetFixture, metadataKeyFixture);
      });

      it('should return undefined', () => {
        expect(result).toBeUndefined();
      });
    });

    describe('when called, and metadata is registered', () => {
      let result: unknown;

      let metadataFixture: unknown;

      beforeAll(() => {
        metadataFixture = 'sample-metadata';

        Reflect.defineMetadata(
          metadataKeyFixture,
          metadataFixture,
          targetFixture,
        );

        result = getOwnReflectMetadata(targetFixture, metadataKeyFixture);
      });

      afterAll(() => {
        Reflect.deleteMetadata(metadataKeyFixture, targetFixture);
      });

      it('should return metadata', () => {
        expect(result).toBe(metadataFixture);
      });
    });
  });

  describe('having property key', () => {
    let metadataKeyFixture: unknown;
    // eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
    let targetFixture: Function;
    let propertyKeyFixture: string | symbol;

    beforeAll(() => {
      metadataKeyFixture = 'sample-key';
      targetFixture = class {};
      propertyKeyFixture = Symbol();
    });

    describe('when called, and no metadata is registered', () => {
      let result: unknown;

      beforeAll(() => {
        result = getOwnReflectMetadata(
          targetFixture,
          metadataKeyFixture,
          propertyKeyFixture,
        );
      });

      it('should return undefined', () => {
        expect(result).toBeUndefined();
      });
    });

    describe('when called, and metadata is registered', () => {
      let result: unknown;

      let metadataFixture: unknown;

      beforeAll(() => {
        metadataFixture = 'sample-metadata';

        Reflect.defineMetadata(
          metadataKeyFixture,
          metadataFixture,
          targetFixture,
          propertyKeyFixture,
        );

        result = getOwnReflectMetadata(
          targetFixture,
          metadataKeyFixture,
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

      it('should return metadata', () => {
        expect(result).toBe(metadataFixture);
      });
    });
  });
});
