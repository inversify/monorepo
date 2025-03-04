import { beforeAll, describe, expect, it } from 'vitest';

import { ClassElementMetadataKind } from '../metadata/models/ClassElementMetadataKind';
import { MaybeClassElementMetadataKind } from '../metadata/models/MaybeClassElementMetadataKind';

describe('MaybeClassElementMetadata kind is a runtime discriminator', () => {
  let metadataKindValues: unknown[];

  let differentValuesCount: number;

  beforeAll(() => {
    metadataKindValues = [
      ...Object.values(MaybeClassElementMetadataKind),
      ...Object.values(ClassElementMetadataKind),
    ];

    differentValuesCount = new Set(metadataKindValues).size;
  });

  it('there should ba as many different values as there are metadata kinds', () => {
    expect(differentValuesCount).toBe(metadataKindValues.length);
  });
});
