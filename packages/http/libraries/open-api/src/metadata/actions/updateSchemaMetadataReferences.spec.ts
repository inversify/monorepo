import { beforeAll, describe, expect, it } from 'vitest';

import { SchemaMetadata } from '../models/SchemaMetadata';
import { updateSchemaMetadataReferences } from './updateSchemaMetadataReferences';

describe(updateSchemaMetadataReferences, () => {
  let nameFixture: string;
  // eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
  let typeFixture: Function;
  let metadataFixture: SchemaMetadata;

  beforeAll(() => {
    nameFixture = 'TestType';
    typeFixture = class TestType {};
    metadataFixture = {
      name: nameFixture,
      properties: new Map(),
      references: new Map(),
      schema: undefined,
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
      const expected: SchemaMetadata = {
        ...metadataFixture,
        references: new Map([[nameFixture, typeFixture]]),
      };

      expect(result).toStrictEqual(expected);
    });
  });
});
