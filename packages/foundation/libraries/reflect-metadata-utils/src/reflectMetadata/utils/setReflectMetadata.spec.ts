import { beforeAll, describe, expect, it } from 'vitest';

import 'reflect-metadata';

import { setReflectMetadata } from './setReflectMetadata';

describe(setReflectMetadata.name, () => {
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

    it('should set metadata', () => {
      expect(reflectMetadata).toBe(metadataFixture);
    });

    it('should return undefined', () => {
      expect(result).toBeUndefined();
    });
  });
});
