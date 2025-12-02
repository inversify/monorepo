import { afterAll, beforeAll, describe, expect, it } from 'vitest';

import 'reflect-metadata/lite';

import { getReflectMetadata } from './getReflectMetadata';

describe(getReflectMetadata, () => {
  describe('having no property key', () => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
    let targetFixture: Function;
    let metadataKeyFixture: unknown;

    beforeAll(() => {
      targetFixture = class {};
      metadataKeyFixture = 'sample-key';
    });

    describe('when called, and no metadata is registered', () => {
      let result: unknown;

      beforeAll(() => {
        result = getReflectMetadata(targetFixture, metadataKeyFixture);
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

        result = getReflectMetadata(targetFixture, metadataKeyFixture);
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
    // eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
    let targetFixture: Function;
    let metadataKeyFixture: unknown;
    let propertyKeyFixture: string | symbol;

    beforeAll(() => {
      targetFixture = class {};
      metadataKeyFixture = 'sample-key';
      propertyKeyFixture = Symbol();
    });

    describe('when called, and no metadata is registered', () => {
      let result: unknown;

      beforeAll(() => {
        result = getReflectMetadata(
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

        result = getReflectMetadata(
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
