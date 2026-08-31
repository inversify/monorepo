import { beforeAll, describe, expect, it } from 'vitest';

import {
  type AndTypeMetadata,
  type OrTypeMetadata,
  type TypeMetadata,
  TypeMetadataKind,
} from '@inversifyjs/json-schema-type-metadata';

import { simplifyTypeMetadata } from './simplifyTypeMetadata.js';

describe(simplifyTypeMetadata, () => {
  describe.each<[string, TypeMetadata, TypeMetadata]>([
    [
      'an or TypeMetadata with an anyType child',
      {
        children: [
          {
            kind: TypeMetadataKind.anyType,
          },
          {
            kind: TypeMetadataKind.stringType,
          },
        ],
        kind: TypeMetadataKind.or,
      },
      {
        kind: TypeMetadataKind.anyType,
      },
    ],
    [
      'an or TypeMetadata with a noneType child and another child',
      {
        children: [
          {
            kind: TypeMetadataKind.noneType,
          },
          {
            kind: TypeMetadataKind.stringType,
          },
        ],
        kind: TypeMetadataKind.or,
      },
      {
        kind: TypeMetadataKind.stringType,
      },
    ],
    [
      'an or TypeMetadata with a single noneType child',
      {
        children: [
          {
            kind: TypeMetadataKind.noneType,
          },
        ],
        kind: TypeMetadataKind.or,
      },
      {
        kind: TypeMetadataKind.noneType,
      },
    ],
    [
      'an or TypeMetadata with a single non-identity child',
      {
        children: [
          {
            kind: TypeMetadataKind.stringType,
          },
        ],
        kind: TypeMetadataKind.or,
      },
      {
        kind: TypeMetadataKind.stringType,
      },
    ],
    [
      'an and TypeMetadata with a noneType child',
      {
        children: [
          {
            kind: TypeMetadataKind.noneType,
          },
          {
            kind: TypeMetadataKind.stringType,
          },
        ],
        kind: TypeMetadataKind.and,
      },
      {
        kind: TypeMetadataKind.noneType,
      },
    ],
    [
      'an and TypeMetadata with an anyType child and another child',
      {
        children: [
          {
            kind: TypeMetadataKind.anyType,
          },
          {
            kind: TypeMetadataKind.stringType,
          },
        ],
        kind: TypeMetadataKind.and,
      },
      {
        kind: TypeMetadataKind.stringType,
      },
    ],
    [
      'an and TypeMetadata with a single anyType child',
      {
        children: [
          {
            kind: TypeMetadataKind.anyType,
          },
        ],
        kind: TypeMetadataKind.and,
      },
      {
        kind: TypeMetadataKind.anyType,
      },
    ],
    [
      'an and TypeMetadata with a single non-identity child',
      {
        children: [
          {
            kind: TypeMetadataKind.stringType,
          },
        ],
        kind: TypeMetadataKind.and,
      },
      {
        kind: TypeMetadataKind.stringType,
      },
    ],
    [
      'an and TypeMetadata whose child or simplifies to anyType',
      {
        children: [
          {
            children: [
              {
                kind: TypeMetadataKind.anyType,
              },
            ],
            kind: TypeMetadataKind.or,
          },
          {
            kind: TypeMetadataKind.stringType,
          },
        ],
        kind: TypeMetadataKind.and,
      },
      {
        kind: TypeMetadataKind.stringType,
      },
    ],
    [
      'an or TypeMetadata whose child and simplifies to noneType',
      {
        children: [
          {
            children: [
              {
                kind: TypeMetadataKind.noneType,
              },
            ],
            kind: TypeMetadataKind.and,
          },
          {
            kind: TypeMetadataKind.stringType,
          },
        ],
        kind: TypeMetadataKind.or,
      },
      {
        kind: TypeMetadataKind.stringType,
      },
    ],
    [
      'an or TypeMetadata whose child and simplifies to anyType',
      {
        children: [
          {
            children: [
              {
                kind: TypeMetadataKind.anyType,
              },
            ],
            kind: TypeMetadataKind.and,
          },
          {
            kind: TypeMetadataKind.stringType,
          },
        ],
        kind: TypeMetadataKind.or,
      },
      {
        kind: TypeMetadataKind.anyType,
      },
    ],
    [
      'an and TypeMetadata whose child or simplifies to noneType',
      {
        children: [
          {
            children: [
              {
                kind: TypeMetadataKind.noneType,
              },
            ],
            kind: TypeMetadataKind.or,
          },
          {
            kind: TypeMetadataKind.stringType,
          },
        ],
        kind: TypeMetadataKind.and,
      },
      {
        kind: TypeMetadataKind.noneType,
      },
    ],
    [
      'an and TypeMetadata with an id whose single child also has an id',
      {
        children: [
          {
            id: 'User',
            kind: TypeMetadataKind.stringType,
          },
        ],
        id: 'Alias',
        kind: TypeMetadataKind.and,
      },
      {
        id: 'Alias',
        kind: TypeMetadataKind.stringType,
      },
    ],
    [
      'a property TypeMetadata whose child or includes anyType',
      {
        child: {
          children: [
            {
              kind: TypeMetadataKind.anyType,
            },
            {
              kind: TypeMetadataKind.stringType,
            },
          ],
          kind: TypeMetadataKind.or,
        },
        isOptional: true,
        kind: TypeMetadataKind.propertyType,
        property: 'foo',
      },
      {
        child: {
          kind: TypeMetadataKind.anyType,
        },
        isOptional: true,
        kind: TypeMetadataKind.propertyType,
        property: 'foo',
      },
    ],
  ])(
    'having %s',
    (
      _: string,
      typeMetadataFixture: TypeMetadata,
      expectedTypeMetadata: TypeMetadata,
    ) => {
      describe('when called', () => {
        let result: unknown;

        beforeAll(() => {
          result = simplifyTypeMetadata(typeMetadataFixture);
        });

        it('should return expected TypeMetadata', () => {
          expect(result).toStrictEqual(expectedTypeMetadata);
        });
      });
    },
  );

  describe('having a circular and TypeMetadata with an objectType child', () => {
    let typeMetadataFixture: AndTypeMetadata;

    beforeAll(() => {
      typeMetadataFixture = {
        children: [],
        kind: TypeMetadataKind.and,
      };

      typeMetadataFixture.children.push(typeMetadataFixture, {
        kind: TypeMetadataKind.objectType,
      });
    });

    describe('when called', () => {
      let result: unknown;

      beforeAll(() => {
        result = simplifyTypeMetadata(typeMetadataFixture);
      });

      it('should return the same and TypeMetadata', () => {
        expect(result).toStrictEqual(typeMetadataFixture);
      });
    });
  });

  describe('having a circular or TypeMetadata with an anyType child', () => {
    let typeMetadataFixture: OrTypeMetadata;

    beforeAll(() => {
      typeMetadataFixture = {
        children: [],
        kind: TypeMetadataKind.or,
      };

      typeMetadataFixture.children.push(typeMetadataFixture, {
        kind: TypeMetadataKind.anyType,
      });
    });

    describe('when called', () => {
      let result: unknown;

      beforeAll(() => {
        result = simplifyTypeMetadata(typeMetadataFixture);
      });

      it('should return anyType TypeMetadata', () => {
        const expected: TypeMetadata = {
          kind: TypeMetadataKind.anyType,
        };

        expect(result).toStrictEqual(expected);
      });
    });
  });

  describe('having a circular and TypeMetadata with a noneType child', () => {
    let typeMetadataFixture: AndTypeMetadata;

    beforeAll(() => {
      typeMetadataFixture = {
        children: [],
        kind: TypeMetadataKind.and,
      };

      typeMetadataFixture.children.push(typeMetadataFixture, {
        kind: TypeMetadataKind.noneType,
      });
    });

    describe('when called', () => {
      let result: unknown;

      beforeAll(() => {
        result = simplifyTypeMetadata(typeMetadataFixture);
      });

      it('should return noneType TypeMetadata', () => {
        const expected: TypeMetadata = {
          kind: TypeMetadataKind.noneType,
        };

        expect(result).toStrictEqual(expected);
      });
    });
  });
});
