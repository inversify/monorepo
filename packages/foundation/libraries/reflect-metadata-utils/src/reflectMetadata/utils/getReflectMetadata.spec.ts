import { beforeAll, describe, expect, it } from 'vitest';

import 'reflect-metadata';

import { getReflectMetadata } from './getReflectMetadata';

describe(getReflectMetadata.name, () => {
  describe('when called, and no metadata is registered', () => {
    let result: unknown;

    beforeAll(() => {
      result = getReflectMetadata(class {}, 'sample-key');
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

      // eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
      const targetFixture: Function = class {};
      const metadataKeyFixture: unknown = 'sample-key';

      Reflect.defineMetadata(
        metadataKeyFixture,
        metadataFixture,
        targetFixture,
      );

      result = getReflectMetadata(targetFixture, metadataKeyFixture);
    });

    it('should return metadata', () => {
      expect(result).toBe(metadataFixture);
    });
  });
});
