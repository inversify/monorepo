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
    [
      'a nested and TypeMetadata',
      {
        children: [
          {
            children: [
              {
                child: {
                  kind: TypeMetadataKind.stringType,
                },
                isOptional: true,
                kind: TypeMetadataKind.propertyType,
                property: 'foo',
              },
              {
                child: {
                  kind: TypeMetadataKind.stringType,
                },
                isOptional: true,
                kind: TypeMetadataKind.propertyType,
                property: 'bar',
              },
            ],
            kind: TypeMetadataKind.and,
          },
          {
            child: {
              kind: TypeMetadataKind.stringType,
            },
            isOptional: true,
            kind: TypeMetadataKind.propertyType,
            property: 'baz',
          },
        ],
        kind: TypeMetadataKind.and,
      },
      {
        children: [
          {
            child: {
              kind: TypeMetadataKind.stringType,
            },
            isOptional: true,
            kind: TypeMetadataKind.propertyType,
            property: 'foo',
          },
          {
            child: {
              kind: TypeMetadataKind.stringType,
            },
            isOptional: true,
            kind: TypeMetadataKind.propertyType,
            property: 'bar',
          },
          {
            child: {
              kind: TypeMetadataKind.stringType,
            },
            isOptional: true,
            kind: TypeMetadataKind.propertyType,
            property: 'baz',
          },
        ],
        kind: TypeMetadataKind.and,
      },
    ],
    [
      'an and TypeMetadata with three foo propertyType children and two bar propertyType children',
      {
        children: [
          {
            child: {
              kind: TypeMetadataKind.stringType,
            },
            isOptional: true,
            kind: TypeMetadataKind.propertyType,
            property: 'foo',
          },
          {
            child: {
              kind: TypeMetadataKind.stringType,
            },
            isOptional: true,
            kind: TypeMetadataKind.propertyType,
            property: 'foo',
          },
          {
            child: {
              kind: TypeMetadataKind.booleanType,
            },
            isOptional: true,
            kind: TypeMetadataKind.propertyType,
            property: 'foo',
          },
          {
            child: {
              kind: TypeMetadataKind.stringType,
            },
            isOptional: true,
            kind: TypeMetadataKind.propertyType,
            property: 'bar',
          },
          {
            child: {
              kind: TypeMetadataKind.stringType,
            },
            isOptional: true,
            kind: TypeMetadataKind.propertyType,
            property: 'bar',
          },
        ],
        kind: TypeMetadataKind.and,
      },
      {
        children: [
          {
            child: {
              kind: TypeMetadataKind.noneType,
            },
            isOptional: true,
            kind: TypeMetadataKind.propertyType,
            property: 'foo',
          },
          {
            child: {
              kind: TypeMetadataKind.stringType,
            },
            isOptional: true,
            kind: TypeMetadataKind.propertyType,
            property: 'bar',
          },
        ],
        kind: TypeMetadataKind.and,
      },
    ],
    [
      'an and TypeMetadata with required stringType and numberType id propertyType children',
      {
        children: [
          {
            child: {
              kind: TypeMetadataKind.stringType,
            },
            isOptional: false,
            kind: TypeMetadataKind.propertyType,
            property: 'id',
          },
          {
            child: {
              kind: TypeMetadataKind.floatType,
            },
            isOptional: false,
            kind: TypeMetadataKind.propertyType,
            property: 'id',
          },
        ],
        kind: TypeMetadataKind.and,
      },
      {
        kind: TypeMetadataKind.noneType,
      },
    ],
    [
      'an and TypeMetadata with optional and required stringType foo propertyType children',
      {
        children: [
          {
            child: {
              kind: TypeMetadataKind.stringType,
            },
            isOptional: true,
            kind: TypeMetadataKind.propertyType,
            property: 'foo',
          },
          {
            child: {
              kind: TypeMetadataKind.stringType,
            },
            isOptional: false,
            kind: TypeMetadataKind.propertyType,
            property: 'foo',
          },
        ],
        kind: TypeMetadataKind.and,
      },
      {
        child: {
          kind: TypeMetadataKind.stringType,
        },
        isOptional: false,
        kind: TypeMetadataKind.propertyType,
        property: 'foo',
      },
    ],
    [
      'an and TypeMetadata with optional stringType and numberType id propertyType children',
      {
        children: [
          {
            child: {
              kind: TypeMetadataKind.stringType,
            },
            isOptional: true,
            kind: TypeMetadataKind.propertyType,
            property: 'id',
          },
          {
            child: {
              kind: TypeMetadataKind.floatType,
            },
            isOptional: true,
            kind: TypeMetadataKind.propertyType,
            property: 'id',
          },
        ],
        kind: TypeMetadataKind.and,
      },
      {
        child: {
          kind: TypeMetadataKind.noneType,
        },
        isOptional: true,
        kind: TypeMetadataKind.propertyType,
        property: 'id',
      },
    ],
    [
      'an and TypeMetadata with a required noneType id propertyType child',
      {
        children: [
          {
            child: {
              kind: TypeMetadataKind.noneType,
            },
            isOptional: false,
            kind: TypeMetadataKind.propertyType,
            property: 'id',
          },
          {
            child: {
              kind: TypeMetadataKind.stringType,
            },
            isOptional: true,
            kind: TypeMetadataKind.propertyType,
            property: 'name',
          },
        ],
        kind: TypeMetadataKind.and,
      },
      {
        kind: TypeMetadataKind.noneType,
      },
    ],
    [
      'a nested and TypeMetadata with overlapping foo propertyType children',
      {
        children: [
          {
            children: [
              {
                child: {
                  kind: TypeMetadataKind.stringType,
                },
                isOptional: true,
                kind: TypeMetadataKind.propertyType,
                property: 'foo',
              },
              {
                child: {
                  kind: TypeMetadataKind.stringType,
                },
                isOptional: true,
                kind: TypeMetadataKind.propertyType,
                property: 'bar',
              },
            ],
            kind: TypeMetadataKind.and,
          },
          {
            child: {
              kind: TypeMetadataKind.floatType,
            },
            isOptional: true,
            kind: TypeMetadataKind.propertyType,
            property: 'foo',
          },
        ],
        kind: TypeMetadataKind.and,
      },
      {
        children: [
          {
            child: {
              kind: TypeMetadataKind.noneType,
            },
            isOptional: true,
            kind: TypeMetadataKind.propertyType,
            property: 'foo',
          },
          {
            child: {
              kind: TypeMetadataKind.stringType,
            },
            isOptional: true,
            kind: TypeMetadataKind.propertyType,
            property: 'bar',
          },
        ],
        kind: TypeMetadataKind.and,
      },
    ],
    [
      'a nested and TypeMetadata whose inner and has an id',
      {
        children: [
          {
            children: [
              {
                child: {
                  kind: TypeMetadataKind.stringType,
                },
                isOptional: true,
                kind: TypeMetadataKind.propertyType,
                property: 'foo',
              },
              {
                child: {
                  kind: TypeMetadataKind.stringType,
                },
                isOptional: true,
                kind: TypeMetadataKind.propertyType,
                property: 'bar',
              },
            ],
            id: 'Foo',
            kind: TypeMetadataKind.and,
          },
          {
            child: {
              kind: TypeMetadataKind.stringType,
            },
            isOptional: true,
            kind: TypeMetadataKind.propertyType,
            property: 'baz',
          },
        ],
        kind: TypeMetadataKind.and,
      },
      {
        children: [
          {
            children: [
              {
                child: {
                  kind: TypeMetadataKind.stringType,
                },
                isOptional: true,
                kind: TypeMetadataKind.propertyType,
                property: 'foo',
              },
              {
                child: {
                  kind: TypeMetadataKind.stringType,
                },
                isOptional: true,
                kind: TypeMetadataKind.propertyType,
                property: 'bar',
              },
            ],
            id: 'Foo',
            kind: TypeMetadataKind.and,
          },
          {
            child: {
              kind: TypeMetadataKind.stringType,
            },
            isOptional: true,
            kind: TypeMetadataKind.propertyType,
            property: 'baz',
          },
        ],
        kind: TypeMetadataKind.and,
      },
    ],
    [
      'a nested or TypeMetadata',
      {
        children: [
          {
            children: [
              {
                kind: TypeMetadataKind.stringType,
              },
              {
                kind: TypeMetadataKind.floatType,
              },
            ],
            kind: TypeMetadataKind.or,
          },
          {
            kind: TypeMetadataKind.booleanType,
          },
        ],
        kind: TypeMetadataKind.or,
      },
      {
        children: [
          {
            kind: TypeMetadataKind.stringType,
          },
          {
            kind: TypeMetadataKind.floatType,
          },
          {
            kind: TypeMetadataKind.booleanType,
          },
        ],
        kind: TypeMetadataKind.or,
      },
    ],
    [
      'a nested or TypeMetadata whose inner or has an id',
      {
        children: [
          {
            children: [
              {
                kind: TypeMetadataKind.stringType,
              },
              {
                kind: TypeMetadataKind.floatType,
              },
            ],
            id: 'Foo',
            kind: TypeMetadataKind.or,
          },
          {
            kind: TypeMetadataKind.booleanType,
          },
        ],
        kind: TypeMetadataKind.or,
      },
      {
        children: [
          {
            children: [
              {
                kind: TypeMetadataKind.stringType,
              },
              {
                kind: TypeMetadataKind.floatType,
              },
            ],
            id: 'Foo',
            kind: TypeMetadataKind.or,
          },
          {
            kind: TypeMetadataKind.booleanType,
          },
        ],
        kind: TypeMetadataKind.or,
      },
    ],
    [
      'an and TypeMetadata with stringType and floatType children',
      {
        children: [
          {
            kind: TypeMetadataKind.stringType,
          },
          {
            kind: TypeMetadataKind.floatType,
          },
        ],
        kind: TypeMetadataKind.and,
      },
      {
        kind: TypeMetadataKind.noneType,
      },
    ],
    [
      'an and TypeMetadata with integerType and floatType children',
      {
        children: [
          {
            kind: TypeMetadataKind.integerType,
          },
          {
            kind: TypeMetadataKind.floatType,
          },
        ],
        kind: TypeMetadataKind.and,
      },
      {
        kind: TypeMetadataKind.integerType,
      },
    ],
    [
      'an and TypeMetadata with floatType and integerType children',
      {
        children: [
          {
            kind: TypeMetadataKind.floatType,
          },
          {
            kind: TypeMetadataKind.integerType,
          },
        ],
        kind: TypeMetadataKind.and,
      },
      {
        kind: TypeMetadataKind.integerType,
      },
    ],
    [
      'an and TypeMetadata with two stringType children',
      {
        children: [
          {
            kind: TypeMetadataKind.stringType,
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
      'an and TypeMetadata with two objectType children',
      {
        children: [
          {
            kind: TypeMetadataKind.objectType,
          },
          {
            kind: TypeMetadataKind.objectType,
          },
        ],
        kind: TypeMetadataKind.and,
      },
      {
        kind: TypeMetadataKind.objectType,
      },
    ],
    [
      'an and TypeMetadata with two null literalType children',
      {
        children: [
          {
            kind: TypeMetadataKind.literalType,
            literal: null,
          },
          {
            kind: TypeMetadataKind.literalType,
            literal: null,
          },
        ],
        kind: TypeMetadataKind.and,
      },
      {
        kind: TypeMetadataKind.literalType,
        literal: null,
      },
    ],
    [
      'an and TypeMetadata with stringType and null literalType children',
      {
        children: [
          {
            kind: TypeMetadataKind.stringType,
          },
          {
            kind: TypeMetadataKind.literalType,
            literal: null,
          },
        ],
        kind: TypeMetadataKind.and,
      },
      {
        kind: TypeMetadataKind.noneType,
      },
    ],
    [
      'an and TypeMetadata with stringType and a non-null literalType child',
      {
        children: [
          {
            kind: TypeMetadataKind.stringType,
          },
          {
            kind: TypeMetadataKind.literalType,
            literal: 'foo',
          },
        ],
        kind: TypeMetadataKind.and,
      },
      {
        children: [
          {
            kind: TypeMetadataKind.stringType,
          },
          {
            kind: TypeMetadataKind.literalType,
            literal: 'foo',
          },
        ],
        kind: TypeMetadataKind.and,
      },
    ],
    [
      'an and TypeMetadata with arrayType and objectType children',
      {
        children: [
          {
            child: {
              kind: TypeMetadataKind.anyType,
            },
            kind: TypeMetadataKind.arrayType,
          },
          {
            kind: TypeMetadataKind.objectType,
          },
        ],
        kind: TypeMetadataKind.and,
      },
      {
        kind: TypeMetadataKind.noneType,
      },
    ],
    [
      'an and TypeMetadata with two arrayType children',
      {
        children: [
          {
            child: {
              kind: TypeMetadataKind.anyType,
            },
            kind: TypeMetadataKind.arrayType,
          },
          {
            child: {
              kind: TypeMetadataKind.stringType,
            },
            kind: TypeMetadataKind.arrayType,
          },
        ],
        kind: TypeMetadataKind.and,
      },
      {
        child: {
          kind: TypeMetadataKind.stringType,
        },
        kind: TypeMetadataKind.arrayType,
      },
    ],
    [
      'an and TypeMetadata with arrayType children whose item types are disjoint',
      {
        children: [
          {
            child: {
              kind: TypeMetadataKind.stringType,
            },
            kind: TypeMetadataKind.arrayType,
          },
          {
            child: {
              kind: TypeMetadataKind.floatType,
            },
            kind: TypeMetadataKind.arrayType,
          },
        ],
        kind: TypeMetadataKind.and,
      },
      {
        child: {
          kind: TypeMetadataKind.noneType,
        },
        kind: TypeMetadataKind.arrayType,
      },
    ],
    [
      'an and TypeMetadata with an arrayType child and an items-like or child',
      {
        children: [
          {
            child: {
              kind: TypeMetadataKind.anyType,
            },
            kind: TypeMetadataKind.arrayType,
          },
          {
            children: [
              {
                child: {
                  kind: TypeMetadataKind.stringType,
                },
                kind: TypeMetadataKind.arrayType,
              },
              {
                kind: TypeMetadataKind.booleanType,
              },
              {
                kind: TypeMetadataKind.floatType,
              },
              {
                kind: TypeMetadataKind.literalType,
                literal: null,
              },
              {
                kind: TypeMetadataKind.objectType,
              },
              {
                kind: TypeMetadataKind.stringType,
              },
            ],
            kind: TypeMetadataKind.or,
          },
        ],
        kind: TypeMetadataKind.and,
      },
      {
        child: {
          kind: TypeMetadataKind.stringType,
        },
        kind: TypeMetadataKind.arrayType,
      },
    ],
    [
      'an and TypeMetadata with an objectType child and an items-like or child',
      {
        children: [
          {
            kind: TypeMetadataKind.objectType,
          },
          {
            children: [
              {
                child: {
                  kind: TypeMetadataKind.stringType,
                },
                kind: TypeMetadataKind.arrayType,
              },
              {
                kind: TypeMetadataKind.booleanType,
              },
              {
                kind: TypeMetadataKind.floatType,
              },
              {
                kind: TypeMetadataKind.literalType,
                literal: null,
              },
              {
                kind: TypeMetadataKind.objectType,
              },
              {
                kind: TypeMetadataKind.stringType,
              },
            ],
            kind: TypeMetadataKind.or,
          },
        ],
        kind: TypeMetadataKind.and,
      },
      {
        kind: TypeMetadataKind.objectType,
      },
    ],
    [
      'an and TypeMetadata with a nested and arrayType child and an items-like or child',
      {
        children: [
          {
            children: [
              {
                child: {
                  kind: TypeMetadataKind.anyType,
                },
                kind: TypeMetadataKind.arrayType,
              },
            ],
            kind: TypeMetadataKind.and,
          },
          {
            children: [
              {
                child: {
                  kind: TypeMetadataKind.stringType,
                },
                kind: TypeMetadataKind.arrayType,
              },
              {
                kind: TypeMetadataKind.stringType,
              },
            ],
            kind: TypeMetadataKind.or,
          },
        ],
        kind: TypeMetadataKind.and,
      },
      {
        child: {
          kind: TypeMetadataKind.stringType,
        },
        kind: TypeMetadataKind.arrayType,
      },
    ],
    [
      'an and TypeMetadata with stringType, an or child, and a propertyType child',
      {
        children: [
          {
            kind: TypeMetadataKind.stringType,
          },
          {
            children: [
              {
                kind: TypeMetadataKind.stringType,
              },
              {
                kind: TypeMetadataKind.floatType,
              },
            ],
            kind: TypeMetadataKind.or,
          },
          {
            child: {
              kind: TypeMetadataKind.stringType,
            },
            isOptional: true,
            kind: TypeMetadataKind.propertyType,
            property: 'foo',
          },
        ],
        kind: TypeMetadataKind.and,
      },
      {
        children: [
          {
            kind: TypeMetadataKind.stringType,
          },
          {
            child: {
              kind: TypeMetadataKind.stringType,
            },
            isOptional: true,
            kind: TypeMetadataKind.propertyType,
            property: 'foo',
          },
        ],
        kind: TypeMetadataKind.and,
      },
    ],
    [
      'an and TypeMetadata with two or children and no json schema instance type',
      {
        children: [
          {
            children: [
              {
                kind: TypeMetadataKind.stringType,
              },
              {
                kind: TypeMetadataKind.floatType,
              },
            ],
            kind: TypeMetadataKind.or,
          },
          {
            children: [
              {
                kind: TypeMetadataKind.booleanType,
              },
              {
                kind: TypeMetadataKind.integerType,
              },
            ],
            kind: TypeMetadataKind.or,
          },
        ],
        kind: TypeMetadataKind.and,
      },
      {
        kind: TypeMetadataKind.integerType,
      },
    ],
    [
      'an and TypeMetadata with two disjoint or children',
      {
        children: [
          {
            children: [
              {
                kind: TypeMetadataKind.stringType,
              },
              {
                kind: TypeMetadataKind.booleanType,
              },
            ],
            kind: TypeMetadataKind.or,
          },
          {
            children: [
              {
                kind: TypeMetadataKind.literalType,
                literal: null,
              },
              {
                kind: TypeMetadataKind.objectType,
              },
            ],
            kind: TypeMetadataKind.or,
          },
        ],
        kind: TypeMetadataKind.and,
      },
      {
        kind: TypeMetadataKind.noneType,
      },
    ],
    [
      'an and TypeMetadata with an items-like or child and a type-like or child',
      {
        children: [
          {
            children: [
              {
                child: {
                  kind: TypeMetadataKind.stringType,
                },
                kind: TypeMetadataKind.arrayType,
              },
              {
                kind: TypeMetadataKind.booleanType,
              },
              {
                kind: TypeMetadataKind.floatType,
              },
              {
                kind: TypeMetadataKind.literalType,
                literal: null,
              },
              {
                kind: TypeMetadataKind.objectType,
              },
              {
                kind: TypeMetadataKind.stringType,
              },
            ],
            kind: TypeMetadataKind.or,
          },
          {
            children: [
              {
                child: {
                  kind: TypeMetadataKind.anyType,
                },
                kind: TypeMetadataKind.arrayType,
              },
              {
                kind: TypeMetadataKind.literalType,
                literal: null,
              },
            ],
            kind: TypeMetadataKind.or,
          },
        ],
        kind: TypeMetadataKind.and,
      },
      {
        children: [
          {
            child: {
              kind: TypeMetadataKind.stringType,
            },
            kind: TypeMetadataKind.arrayType,
          },
          {
            kind: TypeMetadataKind.literalType,
            literal: null,
          },
        ],
        kind: TypeMetadataKind.or,
      },
    ],
    [
      'an and TypeMetadata with a nested and arrayType or branch',
      {
        children: [
          {
            children: [
              {
                child: {
                  kind: TypeMetadataKind.stringType,
                },
                kind: TypeMetadataKind.arrayType,
              },
              {
                kind: TypeMetadataKind.booleanType,
              },
              {
                kind: TypeMetadataKind.literalType,
                literal: null,
              },
            ],
            kind: TypeMetadataKind.or,
          },
          {
            children: [
              {
                children: [
                  {
                    child: {
                      kind: TypeMetadataKind.anyType,
                    },
                    kind: TypeMetadataKind.arrayType,
                  },
                  {
                    child: {
                      kind: TypeMetadataKind.stringType,
                    },
                    kind: TypeMetadataKind.arrayType,
                  },
                ],
                kind: TypeMetadataKind.and,
              },
              {
                kind: TypeMetadataKind.literalType,
                literal: null,
              },
            ],
            kind: TypeMetadataKind.or,
          },
        ],
        kind: TypeMetadataKind.and,
      },
      {
        children: [
          {
            child: {
              kind: TypeMetadataKind.stringType,
            },
            kind: TypeMetadataKind.arrayType,
          },
          {
            kind: TypeMetadataKind.literalType,
            literal: null,
          },
        ],
        kind: TypeMetadataKind.or,
      },
    ],
    [
      'an and TypeMetadata with two items-like or children',
      {
        children: [
          {
            children: [
              {
                child: {
                  kind: TypeMetadataKind.stringType,
                },
                kind: TypeMetadataKind.arrayType,
              },
              {
                kind: TypeMetadataKind.booleanType,
              },
              {
                kind: TypeMetadataKind.floatType,
              },
              {
                kind: TypeMetadataKind.literalType,
                literal: null,
              },
              {
                kind: TypeMetadataKind.objectType,
              },
              {
                kind: TypeMetadataKind.stringType,
              },
            ],
            kind: TypeMetadataKind.or,
          },
          {
            children: [
              {
                child: {
                  kind: TypeMetadataKind.floatType,
                },
                kind: TypeMetadataKind.arrayType,
              },
              {
                kind: TypeMetadataKind.booleanType,
              },
              {
                kind: TypeMetadataKind.floatType,
              },
              {
                kind: TypeMetadataKind.literalType,
                literal: null,
              },
              {
                kind: TypeMetadataKind.objectType,
              },
              {
                kind: TypeMetadataKind.stringType,
              },
            ],
            kind: TypeMetadataKind.or,
          },
        ],
        kind: TypeMetadataKind.and,
      },
      {
        children: [
          {
            child: {
              kind: TypeMetadataKind.noneType,
            },
            kind: TypeMetadataKind.arrayType,
          },
          {
            kind: TypeMetadataKind.booleanType,
          },
          {
            kind: TypeMetadataKind.floatType,
          },
          {
            kind: TypeMetadataKind.literalType,
            literal: null,
          },
          {
            kind: TypeMetadataKind.objectType,
          },
          {
            kind: TypeMetadataKind.stringType,
          },
        ],
        kind: TypeMetadataKind.or,
      },
    ],
    [
      'an and TypeMetadata with two or children and a propertyType child',
      {
        children: [
          {
            children: [
              {
                kind: TypeMetadataKind.stringType,
              },
              {
                kind: TypeMetadataKind.floatType,
              },
            ],
            kind: TypeMetadataKind.or,
          },
          {
            children: [
              {
                kind: TypeMetadataKind.stringType,
              },
              {
                kind: TypeMetadataKind.literalType,
                literal: null,
              },
            ],
            kind: TypeMetadataKind.or,
          },
          {
            child: {
              kind: TypeMetadataKind.stringType,
            },
            isOptional: true,
            kind: TypeMetadataKind.propertyType,
            property: 'foo',
          },
        ],
        kind: TypeMetadataKind.and,
      },
      {
        children: [
          {
            kind: TypeMetadataKind.stringType,
          },
          {
            child: {
              kind: TypeMetadataKind.stringType,
            },
            isOptional: true,
            kind: TypeMetadataKind.propertyType,
            property: 'foo',
          },
        ],
        kind: TypeMetadataKind.and,
      },
    ],
    [
      'an and TypeMetadata with two propertyType or children',
      {
        children: [
          {
            children: [
              {
                child: {
                  kind: TypeMetadataKind.stringType,
                },
                isOptional: true,
                kind: TypeMetadataKind.propertyType,
                property: 'foo',
              },
              {
                child: {
                  kind: TypeMetadataKind.floatType,
                },
                isOptional: true,
                kind: TypeMetadataKind.propertyType,
                property: 'bar',
              },
            ],
            kind: TypeMetadataKind.or,
          },
          {
            children: [
              {
                child: {
                  kind: TypeMetadataKind.booleanType,
                },
                isOptional: true,
                kind: TypeMetadataKind.propertyType,
                property: 'baz',
              },
              {
                child: {
                  kind: TypeMetadataKind.stringType,
                },
                isOptional: true,
                kind: TypeMetadataKind.propertyType,
                property: 'qux',
              },
            ],
            kind: TypeMetadataKind.or,
          },
        ],
        kind: TypeMetadataKind.and,
      },
      {
        children: [
          {
            children: [
              {
                child: {
                  kind: TypeMetadataKind.stringType,
                },
                isOptional: true,
                kind: TypeMetadataKind.propertyType,
                property: 'foo',
              },
              {
                child: {
                  kind: TypeMetadataKind.floatType,
                },
                isOptional: true,
                kind: TypeMetadataKind.propertyType,
                property: 'bar',
              },
            ],
            kind: TypeMetadataKind.or,
          },
          {
            children: [
              {
                child: {
                  kind: TypeMetadataKind.booleanType,
                },
                isOptional: true,
                kind: TypeMetadataKind.propertyType,
                property: 'baz',
              },
              {
                child: {
                  kind: TypeMetadataKind.stringType,
                },
                isOptional: true,
                kind: TypeMetadataKind.propertyType,
                property: 'qux',
              },
            ],
            kind: TypeMetadataKind.or,
          },
        ],
        kind: TypeMetadataKind.and,
      },
    ],
    [
      'an and TypeMetadata with an instance-shaped or child and a propertyType or child',
      {
        children: [
          {
            children: [
              {
                kind: TypeMetadataKind.stringType,
              },
              {
                kind: TypeMetadataKind.floatType,
              },
            ],
            kind: TypeMetadataKind.or,
          },
          {
            children: [
              {
                child: {
                  kind: TypeMetadataKind.stringType,
                },
                isOptional: true,
                kind: TypeMetadataKind.propertyType,
                property: 'foo',
              },
              {
                child: {
                  kind: TypeMetadataKind.floatType,
                },
                isOptional: true,
                kind: TypeMetadataKind.propertyType,
                property: 'bar',
              },
            ],
            kind: TypeMetadataKind.or,
          },
        ],
        kind: TypeMetadataKind.and,
      },
      {
        children: [
          {
            children: [
              {
                kind: TypeMetadataKind.stringType,
              },
              {
                kind: TypeMetadataKind.floatType,
              },
            ],
            kind: TypeMetadataKind.or,
          },
          {
            children: [
              {
                child: {
                  kind: TypeMetadataKind.stringType,
                },
                isOptional: true,
                kind: TypeMetadataKind.propertyType,
                property: 'foo',
              },
              {
                child: {
                  kind: TypeMetadataKind.floatType,
                },
                isOptional: true,
                kind: TypeMetadataKind.propertyType,
                property: 'bar',
              },
            ],
            kind: TypeMetadataKind.or,
          },
        ],
        kind: TypeMetadataKind.and,
      },
    ],
    [
      'an and TypeMetadata with a foldable or child and a named or child',
      {
        children: [
          {
            children: [
              {
                kind: TypeMetadataKind.stringType,
              },
              {
                kind: TypeMetadataKind.floatType,
              },
            ],
            kind: TypeMetadataKind.or,
          },
          {
            children: [
              {
                kind: TypeMetadataKind.stringType,
              },
              {
                kind: TypeMetadataKind.literalType,
                literal: null,
              },
            ],
            id: 'Foo',
            kind: TypeMetadataKind.or,
          },
        ],
        kind: TypeMetadataKind.and,
      },
      {
        children: [
          {
            children: [
              {
                kind: TypeMetadataKind.stringType,
              },
              {
                kind: TypeMetadataKind.floatType,
              },
            ],
            kind: TypeMetadataKind.or,
          },
          {
            children: [
              {
                kind: TypeMetadataKind.stringType,
              },
              {
                kind: TypeMetadataKind.literalType,
                literal: null,
              },
            ],
            id: 'Foo',
            kind: TypeMetadataKind.or,
          },
        ],
        kind: TypeMetadataKind.and,
      },
    ],
    [
      'an and TypeMetadata with integerType and an or of stringType and floatType',
      {
        children: [
          {
            kind: TypeMetadataKind.integerType,
          },
          {
            children: [
              {
                kind: TypeMetadataKind.stringType,
              },
              {
                kind: TypeMetadataKind.floatType,
              },
            ],
            kind: TypeMetadataKind.or,
          },
        ],
        kind: TypeMetadataKind.and,
      },
      {
        kind: TypeMetadataKind.integerType,
      },
    ],
    [
      'an and TypeMetadata with stringType, a propertyType child, and a noneType child',
      {
        children: [
          {
            kind: TypeMetadataKind.stringType,
          },
          {
            child: {
              kind: TypeMetadataKind.stringType,
            },
            isOptional: true,
            kind: TypeMetadataKind.propertyType,
            property: 'foo',
          },
          {
            kind: TypeMetadataKind.noneType,
          },
        ],
        kind: TypeMetadataKind.and,
      },
      {
        kind: TypeMetadataKind.noneType,
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

  describe('having a circular or TypeMetadata with a booleanType child', () => {
    let typeMetadataFixture: OrTypeMetadata;

    beforeAll(() => {
      typeMetadataFixture = {
        children: [],
        kind: TypeMetadataKind.or,
      };

      typeMetadataFixture.children.push(typeMetadataFixture, {
        kind: TypeMetadataKind.booleanType,
      });
    });

    describe('when called', () => {
      let result: unknown;

      beforeAll(() => {
        result = simplifyTypeMetadata(typeMetadataFixture);
      });

      it('should return booleanType TypeMetadata', () => {
        const expected: TypeMetadata = {
          kind: TypeMetadataKind.booleanType,
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

  describe('having circular nested and TypeMetadata nodes that point at each other', () => {
    let childAndTypeMetadataFixture: AndTypeMetadata;
    let typeMetadataFixture: AndTypeMetadata;

    beforeAll(() => {
      childAndTypeMetadataFixture = {
        children: [
          {
            child: {
              kind: TypeMetadataKind.stringType,
            },
            isOptional: true,
            kind: TypeMetadataKind.propertyType,
            property: 'bar',
          },
        ],
        kind: TypeMetadataKind.and,
      };
      typeMetadataFixture = {
        children: [
          {
            child: {
              kind: TypeMetadataKind.stringType,
            },
            isOptional: true,
            kind: TypeMetadataKind.propertyType,
            property: 'foo',
          },
          childAndTypeMetadataFixture,
          {
            kind: TypeMetadataKind.objectType,
          },
        ],
        kind: TypeMetadataKind.and,
      };

      childAndTypeMetadataFixture.children.push(typeMetadataFixture, {
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

  describe('having an and TypeMetadata of a stringType and a self-referencing or TypeMetadata', () => {
    let orTypeMetadataFixture: OrTypeMetadata;
    let typeMetadataFixture: AndTypeMetadata;

    beforeAll(() => {
      orTypeMetadataFixture = {
        children: [],
        kind: TypeMetadataKind.or,
      };
      orTypeMetadataFixture.children.push(
        {
          kind: TypeMetadataKind.booleanType,
        },
        orTypeMetadataFixture,
      );
      typeMetadataFixture = {
        children: [
          {
            kind: TypeMetadataKind.stringType,
          },
          orTypeMetadataFixture,
        ],
        kind: TypeMetadataKind.and,
      };
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
