import { beforeAll, describe, expect, it } from 'vitest';

import {
  type AndTypeMetadata,
  type OrTypeMetadata,
  type TypeMetadata,
  TypeMetadataKind,
} from '@inversifyjs/json-schema-type-metadata';
import { type JsonValue } from '@inversifyjs/json-schema-types';

import { doesJsonValueInhabitTypeMetadata } from './doesJsonValueInhabitTypeMetadata.js';
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
      'an and TypeMetadata of instance-shaped or children that share a null literalType branch',
      {
        children: [
          {
            children: [
              {
                kind: TypeMetadataKind.literalType,
                literal: null,
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
                kind: TypeMetadataKind.literalType,
                literal: null,
              },
              {
                kind: TypeMetadataKind.booleanType,
              },
            ],
            kind: TypeMetadataKind.or,
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
      'an and TypeMetadata of a null literalType or and a stringType or',
      {
        children: [
          {
            children: [
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
                kind: TypeMetadataKind.stringType,
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
        kind: TypeMetadataKind.literalType,
        literal: 'foo',
      },
    ],
    [
      'an and TypeMetadata with stringType and a number literalType child',
      {
        children: [
          {
            kind: TypeMetadataKind.stringType,
          },
          {
            kind: TypeMetadataKind.literalType,
            literal: 1,
          },
        ],
        kind: TypeMetadataKind.and,
      },
      {
        kind: TypeMetadataKind.noneType,
      },
    ],
    [
      'an and TypeMetadata with objectType and an object literalType child',
      {
        children: [
          {
            kind: TypeMetadataKind.objectType,
          },
          {
            kind: TypeMetadataKind.literalType,
            literal: { foo: 'bar' },
          },
        ],
        kind: TypeMetadataKind.and,
      },
      {
        kind: TypeMetadataKind.literalType,
        literal: { foo: 'bar' },
      },
    ],
    [
      'an and TypeMetadata with objectType and an array literalType child',
      {
        children: [
          {
            kind: TypeMetadataKind.objectType,
          },
          {
            kind: TypeMetadataKind.literalType,
            literal: [1, 2],
          },
        ],
        kind: TypeMetadataKind.and,
      },
      {
        kind: TypeMetadataKind.noneType,
      },
    ],
    [
      'an and TypeMetadata with two equal object literalType children',
      {
        children: [
          {
            kind: TypeMetadataKind.literalType,
            literal: { foo: { items: [1] } },
          },
          {
            kind: TypeMetadataKind.literalType,
            literal: { foo: { items: [1] } },
          },
        ],
        kind: TypeMetadataKind.and,
      },
      {
        kind: TypeMetadataKind.literalType,
        literal: { foo: { items: [1] } },
      },
    ],
    [
      'an and TypeMetadata with two different object literalType children',
      {
        children: [
          {
            kind: TypeMetadataKind.literalType,
            literal: { foo: 1 },
          },
          {
            kind: TypeMetadataKind.literalType,
            literal: { foo: 2 },
          },
        ],
        kind: TypeMetadataKind.and,
      },
      {
        kind: TypeMetadataKind.noneType,
      },
    ],
    [
      'an and TypeMetadata with an object literalType child and a matching propertyType child',
      {
        children: [
          {
            kind: TypeMetadataKind.objectType,
          },
          {
            kind: TypeMetadataKind.literalType,
            literal: { name: 'alpha', tags: ['x'] },
          },
          {
            child: { kind: TypeMetadataKind.stringType },
            isOptional: false,
            kind: TypeMetadataKind.propertyType,
            property: 'name',
          },
          {
            child: {
              child: { kind: TypeMetadataKind.stringType },
              kind: TypeMetadataKind.arrayType,
            },
            isOptional: false,
            kind: TypeMetadataKind.propertyType,
            property: 'tags',
          },
        ],
        kind: TypeMetadataKind.and,
      },
      {
        kind: TypeMetadataKind.literalType,
        literal: { name: 'alpha', tags: ['x'] },
      },
    ],
    [
      'an and TypeMetadata with an object literalType child and a mismatching propertyType child',
      {
        children: [
          {
            kind: TypeMetadataKind.objectType,
          },
          {
            kind: TypeMetadataKind.literalType,
            literal: { name: 1 },
          },
          {
            child: { kind: TypeMetadataKind.stringType },
            isOptional: false,
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
      'an and TypeMetadata with an object literalType child, declared properties, and a never stringIndexSignatureType',
      {
        children: [
          {
            kind: TypeMetadataKind.objectType,
          },
          {
            kind: TypeMetadataKind.literalType,
            literal: { name: 'alpha' },
          },
          {
            child: { kind: TypeMetadataKind.stringType },
            isOptional: false,
            kind: TypeMetadataKind.propertyType,
            property: 'name',
          },
          {
            child: { kind: TypeMetadataKind.noneType },
            kind: TypeMetadataKind.stringIndexSignatureType,
          },
        ],
        kind: TypeMetadataKind.and,
      },
      {
        kind: TypeMetadataKind.literalType,
        literal: { name: 'alpha' },
      },
    ],
    [
      'an and TypeMetadata with an object literalType child that has an additional property and a never stringIndexSignatureType',
      {
        children: [
          {
            kind: TypeMetadataKind.objectType,
          },
          {
            kind: TypeMetadataKind.literalType,
            literal: { extra: true, name: 'alpha' },
          },
          {
            child: { kind: TypeMetadataKind.stringType },
            isOptional: false,
            kind: TypeMetadataKind.propertyType,
            property: 'name',
          },
          {
            child: { kind: TypeMetadataKind.noneType },
            kind: TypeMetadataKind.stringIndexSignatureType,
          },
        ],
        kind: TypeMetadataKind.and,
      },
      {
        kind: TypeMetadataKind.noneType,
      },
    ],
    [
      'an and TypeMetadata with an array literalType child and a matching arrayType child',
      {
        children: [
          {
            child: { kind: TypeMetadataKind.integerType },
            kind: TypeMetadataKind.arrayType,
          },
          {
            kind: TypeMetadataKind.literalType,
            literal: [1, 2],
          },
        ],
        kind: TypeMetadataKind.and,
      },
      {
        kind: TypeMetadataKind.literalType,
        literal: [1, 2],
      },
    ],
    [
      'an and TypeMetadata with an array literalType child and a mismatching arrayType child',
      {
        children: [
          {
            child: { kind: TypeMetadataKind.integerType },
            kind: TypeMetadataKind.arrayType,
          },
          {
            kind: TypeMetadataKind.literalType,
            literal: [1, 'a'],
          },
        ],
        kind: TypeMetadataKind.and,
      },
      {
        kind: TypeMetadataKind.noneType,
      },
    ],
    [
      'an and TypeMetadata with stringType and an or of string literalType children',
      {
        children: [
          {
            kind: TypeMetadataKind.stringType,
          },
          {
            children: [
              {
                kind: TypeMetadataKind.literalType,
                literal: 'a',
              },
              {
                kind: TypeMetadataKind.literalType,
                literal: 'b',
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
            kind: TypeMetadataKind.literalType,
            literal: 'a',
          },
          {
            kind: TypeMetadataKind.literalType,
            literal: 'b',
          },
        ],
        kind: TypeMetadataKind.or,
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
      'an and TypeMetadata with two arrayType children with matching prefixItems',
      {
        children: [
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
          {
            child: {
              kind: TypeMetadataKind.anyType,
            },
            kind: TypeMetadataKind.arrayType,
            prefixItems: [
              {
                kind: TypeMetadataKind.stringType,
              },
            ],
          },
        ],
        kind: TypeMetadataKind.and,
      },
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
    ],
    [
      'an and TypeMetadata with prefixItems and a homogeneous arrayType child',
      {
        children: [
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
          kind: TypeMetadataKind.noneType,
        },
        kind: TypeMetadataKind.arrayType,
        prefixItems: [
          {
            kind: TypeMetadataKind.stringType,
          },
        ],
      },
    ],
    [
      'an and TypeMetadata with prefixItems and a closed rest arrayType child',
      {
        children: [
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
          {
            child: {
              kind: TypeMetadataKind.noneType,
            },
            kind: TypeMetadataKind.arrayType,
            prefixItems: [
              {
                kind: TypeMetadataKind.anyType,
              },
              {
                kind: TypeMetadataKind.anyType,
              },
            ],
          },
        ],
        kind: TypeMetadataKind.and,
      },
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
    ],
    [
      'an arrayType TypeMetadata with a noneType prefixItem',
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
            kind: TypeMetadataKind.noneType,
          },
        ],
      },
      {
        child: {
          kind: TypeMetadataKind.noneType,
        },
        kind: TypeMetadataKind.arrayType,
        prefixItems: [
          {
            kind: TypeMetadataKind.stringType,
          },
        ],
      },
    ],
    [
      'an arrayType TypeMetadata with a required noneType prefixItem',
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
            kind: TypeMetadataKind.noneType,
          },
        ],
      },
      {
        kind: TypeMetadataKind.noneType,
      },
    ],
    [
      'an arrayType TypeMetadata with a noneType first prefixItem',
      {
        child: {
          kind: TypeMetadataKind.anyType,
        },
        kind: TypeMetadataKind.arrayType,
        prefixItems: [
          {
            kind: TypeMetadataKind.noneType,
          },
        ],
      },
      {
        child: {
          kind: TypeMetadataKind.noneType,
        },
        kind: TypeMetadataKind.arrayType,
      },
    ],
    [
      'an and TypeMetadata with a noneType first prefixItem',
      {
        children: [
          {
            child: {
              kind: TypeMetadataKind.anyType,
            },
            kind: TypeMetadataKind.arrayType,
            prefixItems: [
              {
                kind: TypeMetadataKind.noneType,
              },
            ],
          },
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
        child: {
          kind: TypeMetadataKind.noneType,
        },
        kind: TypeMetadataKind.arrayType,
      },
    ],
    [
      'an and TypeMetadata with minItems arrayType children',
      {
        children: [
          {
            child: {
              kind: TypeMetadataKind.anyType,
            },
            kind: TypeMetadataKind.arrayType,
            minItems: 1,
          },
          {
            child: {
              kind: TypeMetadataKind.anyType,
            },
            kind: TypeMetadataKind.arrayType,
            minItems: 3,
          },
        ],
        kind: TypeMetadataKind.and,
      },
      {
        child: {
          kind: TypeMetadataKind.anyType,
        },
        kind: TypeMetadataKind.arrayType,
        minItems: 3,
      },
    ],
    [
      'an and TypeMetadata with conflicting minItems and maxItems arrayType children',
      {
        children: [
          {
            child: {
              kind: TypeMetadataKind.anyType,
            },
            kind: TypeMetadataKind.arrayType,
            minItems: 3,
          },
          {
            child: {
              kind: TypeMetadataKind.anyType,
            },
            kind: TypeMetadataKind.arrayType,
            maxItems: 2,
          },
        ],
        kind: TypeMetadataKind.and,
      },
      {
        kind: TypeMetadataKind.noneType,
      },
    ],
    [
      'an and TypeMetadata with prefixItems and a minItems arrayType child',
      {
        children: [
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
          {
            child: {
              kind: TypeMetadataKind.anyType,
            },
            kind: TypeMetadataKind.arrayType,
            minItems: 2,
          },
        ],
        kind: TypeMetadataKind.and,
      },
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

  describe('having an and TypeMetadata of two closed object TypeMetadata children and an object literalType child with both properties', () => {
    let typeMetadataFixture: TypeMetadata;

    beforeAll(() => {
      typeMetadataFixture = {
        children: [
          {
            children: [
              { kind: TypeMetadataKind.objectType },
              {
                child: { kind: TypeMetadataKind.stringType },
                isOptional: false,
                kind: TypeMetadataKind.propertyType,
                property: 'foo',
              },
              {
                child: { kind: TypeMetadataKind.noneType },
                kind: TypeMetadataKind.stringIndexSignatureType,
              },
            ],
            kind: TypeMetadataKind.and,
          },
          {
            children: [
              { kind: TypeMetadataKind.objectType },
              {
                child: { kind: TypeMetadataKind.integerType },
                isOptional: false,
                kind: TypeMetadataKind.propertyType,
                property: 'bar',
              },
              {
                child: { kind: TypeMetadataKind.noneType },
                kind: TypeMetadataKind.stringIndexSignatureType,
              },
            ],
            kind: TypeMetadataKind.and,
          },
          {
            kind: TypeMetadataKind.literalType,
            literal: {
              bar: 2,
              foo: 'x',
            },
          },
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

  describe('having an and TypeMetadata of a closed object and an open allOf property bag', () => {
    let typeMetadataFixture: TypeMetadata;

    beforeAll(() => {
      typeMetadataFixture = {
        children: [
          { kind: TypeMetadataKind.objectType },
          {
            child: { kind: TypeMetadataKind.stringType },
            isOptional: true,
            kind: TypeMetadataKind.propertyType,
            property: 'foo',
          },
          {
            child: { kind: TypeMetadataKind.noneType },
            kind: TypeMetadataKind.stringIndexSignatureType,
          },
          {
            children: [
              {
                child: { kind: TypeMetadataKind.floatType },
                isOptional: true,
                kind: TypeMetadataKind.propertyType,
                property: 'bar',
              },
            ],
            kind: TypeMetadataKind.and,
          },
        ],
        kind: TypeMetadataKind.and,
      };
    });

    describe('when called', () => {
      let result: TypeMetadata;

      beforeAll(() => {
        result = simplifyTypeMetadata(typeMetadataFixture);
      });

      it('should keep the open property bag out of the parent additionalProperties scope', () => {
        const valueWithOnlyDeclaredParentProperty: JsonValue = {
          foo: 'x',
        };
        const valueWithAllOfProperty: JsonValue = {
          bar: 1,
          foo: 'x',
        };

        expect(
          doesJsonValueInhabitTypeMetadata(
            valueWithOnlyDeclaredParentProperty,
            result,
          ),
        ).toBe(true);
        expect(
          doesJsonValueInhabitTypeMetadata(valueWithAllOfProperty, result),
        ).toBe(false);
      });
    });
  });

  describe('having an and TypeMetadata of a closed object, an open allOf property bag, and a const with both properties', () => {
    let typeMetadataFixture: TypeMetadata;

    beforeAll(() => {
      typeMetadataFixture = {
        children: [
          { kind: TypeMetadataKind.objectType },
          {
            child: { kind: TypeMetadataKind.stringType },
            isOptional: false,
            kind: TypeMetadataKind.propertyType,
            property: 'foo',
          },
          {
            child: { kind: TypeMetadataKind.noneType },
            kind: TypeMetadataKind.stringIndexSignatureType,
          },
          {
            children: [
              {
                child: { kind: TypeMetadataKind.floatType },
                isOptional: true,
                kind: TypeMetadataKind.propertyType,
                property: 'bar',
              },
            ],
            kind: TypeMetadataKind.and,
          },
          {
            kind: TypeMetadataKind.literalType,
            literal: {
              bar: 1,
              foo: 'x',
            },
          },
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

  describe('having an and TypeMetadata with two propertyType children that share an or TypeMetadata and a matching object literalType', () => {
    let colorTypeMetadataFixture: OrTypeMetadata;
    let typeMetadataFixture: TypeMetadata;

    beforeAll(() => {
      colorTypeMetadataFixture = {
        children: [
          {
            kind: TypeMetadataKind.literalType,
            literal: 'red',
          },
          {
            kind: TypeMetadataKind.literalType,
            literal: 'green',
          },
        ],
        kind: TypeMetadataKind.or,
      };
      typeMetadataFixture = {
        children: [
          { kind: TypeMetadataKind.objectType },
          {
            child: colorTypeMetadataFixture,
            isOptional: false,
            kind: TypeMetadataKind.propertyType,
            property: 'primary',
          },
          {
            child: colorTypeMetadataFixture,
            isOptional: false,
            kind: TypeMetadataKind.propertyType,
            property: 'secondary',
          },
          {
            kind: TypeMetadataKind.literalType,
            literal: {
              primary: 'red',
              secondary: 'red',
            },
          },
        ],
        kind: TypeMetadataKind.and,
      };
    });

    describe('when called', () => {
      let result: unknown;

      beforeAll(() => {
        result = simplifyTypeMetadata(typeMetadataFixture);
      });

      it('should absorb the object literalType', () => {
        const expected: TypeMetadata = {
          kind: TypeMetadataKind.literalType,
          literal: {
            primary: 'red',
            secondary: 'red',
          },
        };

        expect(result).toStrictEqual(expected);
      });
    });
  });

  describe('having an and TypeMetadata of an or of shared stringType propertyType children and a mismatching object literalType', () => {
    let stringTypeMetadataFixture: TypeMetadata;
    let typeMetadataFixture: TypeMetadata;

    beforeAll(() => {
      stringTypeMetadataFixture = {
        kind: TypeMetadataKind.stringType,
      };
      typeMetadataFixture = {
        children: [
          {
            children: [
              {
                child: stringTypeMetadataFixture,
                isOptional: true,
                kind: TypeMetadataKind.propertyType,
                property: 'foo',
              },
              {
                child: stringTypeMetadataFixture,
                isOptional: true,
                kind: TypeMetadataKind.propertyType,
                property: 'bar',
              },
            ],
            kind: TypeMetadataKind.or,
          },
          {
            kind: TypeMetadataKind.literalType,
            literal: {
              bar: 1,
              foo: 1,
            },
          },
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

  describe('having an and TypeMetadata of the same or TypeMetadata twice and a matching literalType', () => {
    let colorTypeMetadataFixture: OrTypeMetadata;
    let typeMetadataFixture: TypeMetadata;

    beforeAll(() => {
      colorTypeMetadataFixture = {
        children: [
          {
            kind: TypeMetadataKind.literalType,
            literal: 'red',
          },
          {
            kind: TypeMetadataKind.literalType,
            literal: 'green',
          },
        ],
        kind: TypeMetadataKind.or,
      };
      typeMetadataFixture = {
        children: [
          colorTypeMetadataFixture,
          colorTypeMetadataFixture,
          {
            kind: TypeMetadataKind.literalType,
            literal: 'red',
          },
        ],
        kind: TypeMetadataKind.and,
      };
    });

    describe('when called', () => {
      let result: unknown;

      beforeAll(() => {
        result = simplifyTypeMetadata(typeMetadataFixture);
      });

      it('should absorb the literalType', () => {
        const expected: TypeMetadata = {
          kind: TypeMetadataKind.literalType,
          literal: 'red',
        };

        expect(result).toStrictEqual(expected);
      });
    });
  });

  describe('having a titled and TypeMetadata with stringType and a literalType child', () => {
    let typeMetadataFixture: TypeMetadata;

    beforeAll(() => {
      typeMetadataFixture = {
        children: [
          {
            kind: TypeMetadataKind.stringType,
          },
          {
            kind: TypeMetadataKind.literalType,
            literal: 'discreteNumericRange',
          },
        ],
        id: 'Kind',
        kind: TypeMetadataKind.and,
      };
    });

    describe('when called', () => {
      let result: unknown;

      beforeAll(() => {
        result = simplifyTypeMetadata(typeMetadataFixture);
      });

      it('should keep the TypeMetadata id on the absorbed literalType', () => {
        const expected: TypeMetadata = {
          id: 'Kind',
          kind: TypeMetadataKind.literalType,
          literal: 'discreteNumericRange',
        };

        expect(result).toStrictEqual(expected);
      });
    });
  });

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
