import { beforeAll, describe, expect, it } from 'vitest';

import {
  type ArrayTypeMetadata,
  TypeMetadataKind,
} from '@inversifyjs/json-schema-type-metadata';

import {
  getArrayTypeMetadataItem,
  getArrayTypeMetadataMaxItems,
  getArrayTypeMetadataMinItems,
} from './getArrayTypeMetadataBounds.js';

describe(getArrayTypeMetadataMinItems, () => {
  describe.each<[string, ArrayTypeMetadata, number]>([
    [
      'an arrayType TypeMetadata without minItems',
      {
        child: {
          kind: TypeMetadataKind.stringType,
        },
        kind: TypeMetadataKind.arrayType,
      },
      0,
    ],
    [
      'an arrayType TypeMetadata with minItems',
      {
        child: {
          kind: TypeMetadataKind.stringType,
        },
        kind: TypeMetadataKind.arrayType,
        minItems: 2,
      },
      2,
    ],
  ])(
    'having %s',
    (_: string, typeMetadataFixture: ArrayTypeMetadata, expected: number) => {
      describe('when called', () => {
        it('should return the expected minItems', () => {
          expect(getArrayTypeMetadataMinItems(typeMetadataFixture)).toBe(
            expected,
          );
        });
      });
    },
  );
});

describe(getArrayTypeMetadataMaxItems, () => {
  describe.each<[string, ArrayTypeMetadata, number]>([
    [
      'an open arrayType TypeMetadata without maxItems',
      {
        child: {
          kind: TypeMetadataKind.stringType,
        },
        kind: TypeMetadataKind.arrayType,
      },
      Number.POSITIVE_INFINITY,
    ],
    [
      'an arrayType TypeMetadata with maxItems',
      {
        child: {
          kind: TypeMetadataKind.stringType,
        },
        kind: TypeMetadataKind.arrayType,
        maxItems: 3,
      },
      3,
    ],
    [
      'a closed prefixItems arrayType TypeMetadata',
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
      2,
    ],
    [
      'a closed prefixItems arrayType TypeMetadata with a smaller maxItems',
      {
        child: {
          kind: TypeMetadataKind.noneType,
        },
        kind: TypeMetadataKind.arrayType,
        maxItems: 1,
        prefixItems: [
          {
            kind: TypeMetadataKind.stringType,
          },
          {
            kind: TypeMetadataKind.floatType,
          },
        ],
      },
      1,
    ],
    [
      'a noneType items arrayType TypeMetadata without prefixItems',
      {
        child: {
          kind: TypeMetadataKind.noneType,
        },
        kind: TypeMetadataKind.arrayType,
      },
      0,
    ],
  ])(
    'having %s',
    (_: string, typeMetadataFixture: ArrayTypeMetadata, expected: number) => {
      describe('when called', () => {
        it('should return the expected maxItems', () => {
          expect(getArrayTypeMetadataMaxItems(typeMetadataFixture)).toBe(
            expected,
          );
        });
      });
    },
  );
});

describe(getArrayTypeMetadataItem, () => {
  describe('having a prefixItems arrayType TypeMetadata', () => {
    let typeMetadataFixture: ArrayTypeMetadata;

    beforeAll(() => {
      typeMetadataFixture = {
        child: {
          kind: TypeMetadataKind.booleanType,
        },
        kind: TypeMetadataKind.arrayType,
        prefixItems: [
          {
            kind: TypeMetadataKind.stringType,
          },
        ],
      };
    });

    describe('when called with a prefix index', () => {
      it('should return the prefix item', () => {
        expect(getArrayTypeMetadataItem(typeMetadataFixture, 0)).toBe(
          typeMetadataFixture.prefixItems?.[0],
        );
      });
    });

    describe('when called with a rest index', () => {
      it('should return the rest child', () => {
        expect(getArrayTypeMetadataItem(typeMetadataFixture, 1)).toBe(
          typeMetadataFixture.child,
        );
      });
    });
  });
});
