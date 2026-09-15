import { describe, expect, it } from 'vitest';

import {
  type ArrayTypeMetadata,
  TypeMetadataKind,
} from '@inversifyjs/json-schema-type-metadata';

import { doesArrayTypeMetadataPrintAsUnion } from './getArrayTypeMetadataBounds.js';

describe(doesArrayTypeMetadataPrintAsUnion, () => {
  describe.each<[string, ArrayTypeMetadata, boolean]>([
    [
      'a homogeneous arrayType TypeMetadata',
      {
        child: {
          kind: TypeMetadataKind.stringType,
        },
        kind: TypeMetadataKind.arrayType,
      },
      false,
    ],
    [
      'a closed prefixItems arrayType TypeMetadata without minItems',
      {
        child: {
          kind: TypeMetadataKind.noneType,
        },
        kind: TypeMetadataKind.arrayType,
        prefixItems: [
          {
            kind: TypeMetadataKind.stringType,
          },
          {
            kind: TypeMetadataKind.floatType,
          },
        ],
      },
      true,
    ],
    [
      'a closed prefixItems arrayType TypeMetadata with minItems equal to the prefix length',
      {
        child: {
          kind: TypeMetadataKind.noneType,
        },
        kind: TypeMetadataKind.arrayType,
        minItems: 2,
        prefixItems: [
          {
            kind: TypeMetadataKind.stringType,
          },
          {
            kind: TypeMetadataKind.floatType,
          },
        ],
      },
      false,
    ],
    [
      'an open prefixItems arrayType TypeMetadata without minItems',
      {
        child: {
          kind: TypeMetadataKind.anyType,
        },
        kind: TypeMetadataKind.arrayType,
        prefixItems: [
          {
            kind: TypeMetadataKind.stringType,
          },
          {
            kind: TypeMetadataKind.floatType,
          },
        ],
      },
      true,
    ],
    [
      'an open prefixItems arrayType TypeMetadata with minItems equal to the prefix length',
      {
        child: {
          kind: TypeMetadataKind.anyType,
        },
        kind: TypeMetadataKind.arrayType,
        minItems: 2,
        prefixItems: [
          {
            kind: TypeMetadataKind.stringType,
          },
          {
            kind: TypeMetadataKind.floatType,
          },
        ],
      },
      false,
    ],
    [
      'a maxItems arrayType TypeMetadata',
      {
        child: {
          kind: TypeMetadataKind.stringType,
        },
        kind: TypeMetadataKind.arrayType,
        maxItems: 2,
      },
      true,
    ],
    [
      'a minItems arrayType TypeMetadata',
      {
        child: {
          kind: TypeMetadataKind.stringType,
        },
        kind: TypeMetadataKind.arrayType,
        minItems: 2,
      },
      false,
    ],
  ])(
    'having %s',
    (_: string, typeMetadataFixture: ArrayTypeMetadata, expected: boolean) => {
      describe('when called', () => {
        it('should return whether the array prints as a union', () => {
          expect(doesArrayTypeMetadataPrintAsUnion(typeMetadataFixture)).toBe(
            expected,
          );
        });
      });
    },
  );
});
