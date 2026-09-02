import { beforeAll, describe, expect, it } from 'vitest';

import {
  type TypeMetadata,
  TypeMetadataKind,
} from '@inversifyjs/json-schema-type-metadata';

import { buildRootUnionTypeMetadata } from './buildRootUnionTypeMetadata.js';

describe(buildRootUnionTypeMetadata, () => {
  describe('having no named TypeMetadata', () => {
    describe('when called', () => {
      let result: unknown;

      beforeAll(() => {
        result = buildRootUnionTypeMetadata([]);
      });

      it('should return noneType TypeMetadata', () => {
        expect(result).toStrictEqual({
          kind: TypeMetadataKind.noneType,
        });
      });
    });
  });

  describe('having named TypeMetadata', () => {
    let namedTypeMetadataFixture: TypeMetadata[];

    beforeAll(() => {
      namedTypeMetadataFixture = [
        {
          id: 'User',
          kind: TypeMetadataKind.stringType,
        },
        {
          id: 'Flag',
          kind: TypeMetadataKind.booleanType,
        },
      ];
    });

    describe('when called', () => {
      let result: unknown;

      beforeAll(() => {
        result = buildRootUnionTypeMetadata(namedTypeMetadataFixture);
      });

      it('should return an or TypeMetadata of the named types', () => {
        expect(result).toStrictEqual({
          children: namedTypeMetadataFixture,
          kind: TypeMetadataKind.or,
        });
      });
    });
  });
});
