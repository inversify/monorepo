import { beforeAll, describe, expect, it } from 'vitest';

import { SchemaReferencesMetadata } from '../models/SchemaReferencesMetadata';
import { updateSchemaMetadataReferences } from './updateSchemaMetadataReferences';

describe(updateSchemaMetadataReferences, () => {
  let nameFixture: string;
  // eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
  let typeFixture: Function;
  let metadataFixture: SchemaReferencesMetadata;

  beforeAll(() => {
    nameFixture = 'TestType';
    typeFixture = class TestType {};
    metadataFixture = {
      references: new Map(),
    };
  });

  describe('when called', () => {
    let result: unknown;

    beforeAll(() => {
      result = updateSchemaMetadataReferences(
        nameFixture,
        typeFixture,
      )(metadataFixture);
    });

    it('should update expected result', () => {
      const expected: SchemaReferencesMetadata = {
        references: new Map([[nameFixture, typeFixture]]),
      };

      expect(result).toStrictEqual(expected);
    });
  });
});
