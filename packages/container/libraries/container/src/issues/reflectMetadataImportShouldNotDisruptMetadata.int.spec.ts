import { beforeAll, describe, expect, it } from 'vitest';

import '../index';

import {
  getOwnReflectMetadata,
  setReflectMetadata,
} from '@inversifyjs/reflect-metadata-utils';

describe('reflect metadata import should not disrupt metadata', () => {
  let metadataFixture: unknown;

  let result: unknown;

  beforeAll(async () => {
    metadataFixture = { data: 123 };

    class Foo {}

    setReflectMetadata(Foo, 'custom:meta', metadataFixture);

    await import('reflect-metadata');

    result = getOwnReflectMetadata(Foo, 'custom:meta');
  });

  it('should preserve reflect metadata after importing reflect-metadata', () => {
    expect(result).toBe(metadataFixture);
  });
});
