import { beforeAll, describe, expect, it } from 'vitest';

import { type SchemaReferencesMetadata } from '../models/SchemaReferencesMetadata.js';
import { updateSchemaMetadataReferences } from './updateSchemaMetadataReferences.js';

describe(updateSchemaMetadataReferences, () => {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
  let typeFixture: Function;
  let metadataFixture: SchemaReferencesMetadata;

  beforeAll(() => {
    typeFixture = class TestType {};
    metadataFixture = {
      references: new Set(),
    };
  });

  describe('when called', () => {
    let result: unknown;

    beforeAll(() => {
      result = updateSchemaMetadataReferences(typeFixture)(metadataFixture);
    });

    it('should update expected result', () => {
      const expected: SchemaReferencesMetadata = {
        references: new Set([typeFixture]),
      };

      expect(result).toStrictEqual(expected);
    });
  });
});
