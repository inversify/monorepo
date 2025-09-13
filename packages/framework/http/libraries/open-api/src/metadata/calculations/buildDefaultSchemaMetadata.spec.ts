import { beforeAll, describe, expect, it } from 'vitest';

import { SchemaMetadata } from '../models/SchemaMetadata';
import { buildDefaultSchemaMetadata } from './buildDefaultSchemaMetadata';

describe(buildDefaultSchemaMetadata, () => {
  describe('when called', () => {
    let result: unknown;

    beforeAll(() => {
      result = buildDefaultSchemaMetadata();
    });

    it('should return the expected result', () => {
      const expected: SchemaMetadata = {
        customAttributes: undefined,
        name: undefined,
        properties: new Map(),
        references: new Set(),
        schema: undefined,
      };

      expect(result).toStrictEqual(expected);
    });
  });
});
