import { beforeAll, describe, expect, it } from 'vitest';

import {
  type TypeMetadata,
  TypeMetadataKind,
} from '@inversifyjs/json-schema-type-metadata';

import { type PrintTypeMetadataContext } from '../models/PrintTypeMetadataContext.js';
import {
  printTypeMetadata,
  printTypeMetadataExpanded,
} from './printTypeMetadata.js';

function generatePrintTypeMetadataContext(
  namedTypeMetadata: [TypeMetadata, string][] = [],
): PrintTypeMetadataContext {
  return {
    typeMetadataToNameMap: new Map(namedTypeMetadata),
  };
}

describe(printTypeMetadata, () => {
  describe('having a TypeMetadata in the name map', () => {
    let typeMetadataFixture: TypeMetadata;
    let contextFixture: PrintTypeMetadataContext;

    beforeAll(() => {
      typeMetadataFixture = {
        kind: TypeMetadataKind.stringType,
      };
      contextFixture = generatePrintTypeMetadataContext([
        [typeMetadataFixture, 'Foo'],
      ]);
    });

    describe('when called', () => {
      let result: unknown;

      beforeAll(() => {
        result = printTypeMetadata(typeMetadataFixture, contextFixture);
      });

      it('should return the mapped name', () => {
        expect(result).toBe('Foo');
      });
    });
  });

  describe.each<[string, TypeMetadata, string]>([
    ['an anyType TypeMetadata', { kind: TypeMetadataKind.anyType }, 'unknown'],
    ['a noneType TypeMetadata', { kind: TypeMetadataKind.noneType }, 'never'],
    [
      'a booleanType TypeMetadata',
      { kind: TypeMetadataKind.booleanType },
      'boolean',
    ],
    [
      'a floatType TypeMetadata',
      { kind: TypeMetadataKind.floatType },
      'number',
    ],
    [
      'an integerType TypeMetadata',
      { kind: TypeMetadataKind.integerType },
      'number',
    ],
    [
      'a stringType TypeMetadata',
      { kind: TypeMetadataKind.stringType },
      'string',
    ],
    [
      'an objectType TypeMetadata',
      { kind: TypeMetadataKind.objectType },
      'object',
    ],
    [
      'a null literalType TypeMetadata',
      { kind: TypeMetadataKind.literalType, literal: null },
      'null',
    ],
    [
      'a boolean literalType TypeMetadata',
      { kind: TypeMetadataKind.literalType, literal: true },
      'true',
    ],
    [
      'a number literalType TypeMetadata',
      { kind: TypeMetadataKind.literalType, literal: 1 },
      '1',
    ],
    [
      'a string literalType TypeMetadata',
      { kind: TypeMetadataKind.literalType, literal: 'foo' },
      '"foo"',
    ],
    [
      'an array literalType TypeMetadata',
      { kind: TypeMetadataKind.literalType, literal: [1, 'a'] },
      '[1, "a"]',
    ],
    [
      'an object literalType TypeMetadata',
      { kind: TypeMetadataKind.literalType, literal: { 'foo-bar': false } },
      '{ "foo-bar": false }',
    ],
    [
      'an arrayType TypeMetadata',
      {
        child: { kind: TypeMetadataKind.stringType },
        kind: TypeMetadataKind.arrayType,
      },
      'string[]',
    ],
    [
      'an arrayType TypeMetadata of an or TypeMetadata',
      {
        child: {
          children: [
            { kind: TypeMetadataKind.stringType },
            { kind: TypeMetadataKind.floatType },
          ],
          kind: TypeMetadataKind.or,
        },
        kind: TypeMetadataKind.arrayType,
      },
      '(string | number)[]',
    ],
    [
      'an arrayType TypeMetadata of an and TypeMetadata',
      {
        child: {
          children: [
            { kind: TypeMetadataKind.stringType },
            { kind: TypeMetadataKind.booleanType },
          ],
          kind: TypeMetadataKind.and,
        },
        kind: TypeMetadataKind.arrayType,
      },
      '(string & boolean)[]',
    ],
    [
      'an arrayType TypeMetadata of an object and TypeMetadata',
      {
        child: {
          children: [
            {
              child: { kind: TypeMetadataKind.stringType },
              isOptional: false,
              kind: TypeMetadataKind.propertyType,
              property: 'id',
            },
            { kind: TypeMetadataKind.objectType },
          ],
          kind: TypeMetadataKind.and,
        },
        kind: TypeMetadataKind.arrayType,
      },
      '{ id: string }[]',
    ],
    [
      'an or TypeMetadata',
      {
        children: [
          { kind: TypeMetadataKind.stringType },
          { kind: TypeMetadataKind.floatType },
        ],
        kind: TypeMetadataKind.or,
      },
      'string | number',
    ],
    [
      'an or TypeMetadata with an and member',
      {
        children: [
          {
            children: [
              { kind: TypeMetadataKind.stringType },
              { kind: TypeMetadataKind.booleanType },
            ],
            kind: TypeMetadataKind.and,
          },
          { kind: TypeMetadataKind.floatType },
        ],
        kind: TypeMetadataKind.or,
      },
      '(string & boolean) | number',
    ],
    [
      'an or TypeMetadata with an object and member',
      {
        children: [
          {
            children: [
              {
                child: { kind: TypeMetadataKind.stringType },
                isOptional: false,
                kind: TypeMetadataKind.propertyType,
                property: 'id',
              },
              { kind: TypeMetadataKind.objectType },
            ],
            kind: TypeMetadataKind.and,
          },
          { kind: TypeMetadataKind.floatType },
        ],
        kind: TypeMetadataKind.or,
      },
      '{ id: string } | number',
    ],
    [
      'an optional propertyType TypeMetadata',
      {
        child: { kind: TypeMetadataKind.stringType },
        isOptional: true,
        kind: TypeMetadataKind.propertyType,
        property: 'foo',
      },
      '{ foo?: string }',
    ],
    [
      'a required propertyType TypeMetadata with a quoted key',
      {
        child: { kind: TypeMetadataKind.stringType },
        isOptional: false,
        kind: TypeMetadataKind.propertyType,
        property: 'foo-bar',
      },
      '{ "foo-bar": string }',
    ],
    [
      'a propertyType TypeMetadata with a reserved word key',
      {
        child: { kind: TypeMetadataKind.floatType },
        isOptional: true,
        kind: TypeMetadataKind.propertyType,
        property: 'class',
      },
      '{ class?: number }',
    ],
    [
      'a stringIndexSignatureType TypeMetadata',
      {
        child: { kind: TypeMetadataKind.stringType },
        kind: TypeMetadataKind.stringIndexSignatureType,
      },
      '{ [key: string]: string }',
    ],
    [
      'an empty and TypeMetadata',
      {
        children: [],
        kind: TypeMetadataKind.and,
      },
      'unknown',
    ],
    [
      'an and TypeMetadata with only objectType',
      {
        children: [{ kind: TypeMetadataKind.objectType }],
        kind: TypeMetadataKind.and,
      },
      'object',
    ],
    [
      'an and TypeMetadata with properties and objectType',
      {
        children: [
          {
            child: { kind: TypeMetadataKind.stringType },
            isOptional: false,
            kind: TypeMetadataKind.propertyType,
            property: 'id',
          },
          {
            child: { kind: TypeMetadataKind.stringType },
            isOptional: true,
            kind: TypeMetadataKind.propertyType,
            property: 'name',
          },
          { kind: TypeMetadataKind.objectType },
        ],
        kind: TypeMetadataKind.and,
      },
      '{ id: string; name?: string }',
    ],
    [
      'an and TypeMetadata with a propertyType and a stringType',
      {
        children: [
          {
            child: { kind: TypeMetadataKind.stringType },
            isOptional: true,
            kind: TypeMetadataKind.propertyType,
            property: 'foo',
          },
          { kind: TypeMetadataKind.stringType },
        ],
        kind: TypeMetadataKind.and,
      },
      '{ foo?: string } & string',
    ],
    [
      'an and TypeMetadata with an or child',
      {
        children: [
          {
            children: [
              { kind: TypeMetadataKind.stringType },
              { kind: TypeMetadataKind.floatType },
            ],
            kind: TypeMetadataKind.or,
          },
          { kind: TypeMetadataKind.booleanType },
        ],
        kind: TypeMetadataKind.and,
      },
      '(string | number) & boolean',
    ],
    [
      'an and TypeMetadata with a stringIndexSignatureType and objectType',
      {
        children: [
          {
            child: { kind: TypeMetadataKind.stringType },
            kind: TypeMetadataKind.stringIndexSignatureType,
          },
          { kind: TypeMetadataKind.objectType },
        ],
        kind: TypeMetadataKind.and,
      },
      '{ [key: string]: string }',
    ],
    [
      'an and TypeMetadata with properties and a stringIndexSignatureType',
      {
        children: [
          {
            child: { kind: TypeMetadataKind.stringType },
            isOptional: false,
            kind: TypeMetadataKind.propertyType,
            property: 'id',
          },
          {
            child: { kind: TypeMetadataKind.stringType },
            kind: TypeMetadataKind.stringIndexSignatureType,
          },
        ],
        kind: TypeMetadataKind.and,
      },
      '{ id: string; [key: string]: string }',
    ],
    [
      'an and TypeMetadata with an optional propertyType and a stringIndexSignatureType',
      {
        children: [
          {
            child: { kind: TypeMetadataKind.stringType },
            isOptional: true,
            kind: TypeMetadataKind.propertyType,
            property: 'id',
          },
          {
            child: { kind: TypeMetadataKind.stringType },
            kind: TypeMetadataKind.stringIndexSignatureType,
          },
        ],
        kind: TypeMetadataKind.and,
      },
      '{ id?: string; [key: string]: string | undefined }',
    ],
    [
      'an and TypeMetadata with a never stringIndexSignatureType',
      {
        children: [
          {
            child: { kind: TypeMetadataKind.noneType },
            kind: TypeMetadataKind.stringIndexSignatureType,
          },
          { kind: TypeMetadataKind.objectType },
        ],
        kind: TypeMetadataKind.and,
      },
      '{ [key: string]: never }',
    ],
    [
      'an and TypeMetadata with properties and a never stringIndexSignatureType',
      {
        children: [
          {
            child: { kind: TypeMetadataKind.stringType },
            isOptional: false,
            kind: TypeMetadataKind.propertyType,
            property: 'id',
          },
          {
            child: { kind: TypeMetadataKind.noneType },
            kind: TypeMetadataKind.stringIndexSignatureType,
          },
          { kind: TypeMetadataKind.objectType },
        ],
        kind: TypeMetadataKind.and,
      },
      '{ id: string }',
    ],
  ])(
    'having %s',
    (_: string, typeMetadataFixture: TypeMetadata, expected: string) => {
      describe('when called', () => {
        let result: unknown;

        beforeAll(() => {
          result = printTypeMetadata(
            typeMetadataFixture,
            generatePrintTypeMetadataContext(),
          );
        });

        it('should return the expected TypeScript type', () => {
          expect(result).toBe(expected);
        });
      });
    },
  );

  describe('having an arrayType TypeMetadata of a named or TypeMetadata', () => {
    let orTypeMetadataFixture: TypeMetadata;
    let typeMetadataFixture: TypeMetadata;
    let contextFixture: PrintTypeMetadataContext;

    beforeAll(() => {
      orTypeMetadataFixture = {
        children: [
          { kind: TypeMetadataKind.stringType },
          { kind: TypeMetadataKind.floatType },
        ],
        kind: TypeMetadataKind.or,
      };
      typeMetadataFixture = {
        child: orTypeMetadataFixture,
        kind: TypeMetadataKind.arrayType,
      };
      contextFixture = generatePrintTypeMetadataContext([
        [orTypeMetadataFixture, 'Foo'],
      ]);
    });

    describe('when called', () => {
      let result: unknown;

      beforeAll(() => {
        result = printTypeMetadata(typeMetadataFixture, contextFixture);
      });

      it('should not parenthesize the named array element', () => {
        expect(result).toBe('Foo[]');
      });
    });
  });

  describe('having an or TypeMetadata with a named and member', () => {
    let andTypeMetadataFixture: TypeMetadata;
    let typeMetadataFixture: TypeMetadata;
    let contextFixture: PrintTypeMetadataContext;

    beforeAll(() => {
      andTypeMetadataFixture = {
        children: [
          { kind: TypeMetadataKind.stringType },
          { kind: TypeMetadataKind.booleanType },
        ],
        kind: TypeMetadataKind.and,
      };
      typeMetadataFixture = {
        children: [
          andTypeMetadataFixture,
          { kind: TypeMetadataKind.floatType },
        ],
        kind: TypeMetadataKind.or,
      };
      contextFixture = generatePrintTypeMetadataContext([
        [andTypeMetadataFixture, 'Foo'],
      ]);
    });

    describe('when called', () => {
      let result: unknown;

      beforeAll(() => {
        result = printTypeMetadata(typeMetadataFixture, contextFixture);
      });

      it('should not parenthesize the named union member', () => {
        expect(result).toBe('Foo | number');
      });
    });
  });

  describe('having an and TypeMetadata with a named or child', () => {
    let orTypeMetadataFixture: TypeMetadata;
    let typeMetadataFixture: TypeMetadata;
    let contextFixture: PrintTypeMetadataContext;

    beforeAll(() => {
      orTypeMetadataFixture = {
        children: [
          { kind: TypeMetadataKind.stringType },
          { kind: TypeMetadataKind.floatType },
        ],
        kind: TypeMetadataKind.or,
      };
      typeMetadataFixture = {
        children: [
          orTypeMetadataFixture,
          { kind: TypeMetadataKind.booleanType },
        ],
        kind: TypeMetadataKind.and,
      };
      contextFixture = generatePrintTypeMetadataContext([
        [orTypeMetadataFixture, 'Foo'],
      ]);
    });

    describe('when called', () => {
      let result: unknown;

      beforeAll(() => {
        result = printTypeMetadata(typeMetadataFixture, contextFixture);
      });

      it('should not parenthesize the named intersection member', () => {
        expect(result).toBe('Foo & boolean');
      });
    });
  });

  describe('having an and TypeMetadata with a named propertyType child', () => {
    let propertyTypeMetadataFixture: TypeMetadata;
    let typeMetadataFixture: TypeMetadata;
    let contextFixture: PrintTypeMetadataContext;

    beforeAll(() => {
      propertyTypeMetadataFixture = {
        child: { kind: TypeMetadataKind.stringType },
        isOptional: false,
        kind: TypeMetadataKind.propertyType,
        property: 'foo',
      };
      typeMetadataFixture = {
        children: [
          propertyTypeMetadataFixture,
          { kind: TypeMetadataKind.objectType },
        ],
        kind: TypeMetadataKind.and,
      };
      contextFixture = generatePrintTypeMetadataContext([
        [propertyTypeMetadataFixture, 'Foo'],
      ]);
    });

    describe('when called', () => {
      let result: unknown;

      beforeAll(() => {
        result = printTypeMetadata(typeMetadataFixture, contextFixture);
      });

      it('should use the mapped name instead of folding the property', () => {
        expect(result).toBe('object & Foo');
      });
    });
  });

  describe('having an and TypeMetadata with a string property and a boolean stringIndexSignatureType', () => {
    let typeMetadataFixture: TypeMetadata;

    beforeAll(() => {
      typeMetadataFixture = {
        children: [
          {
            child: { kind: TypeMetadataKind.stringType },
            isOptional: false,
            kind: TypeMetadataKind.propertyType,
            property: 'id',
          },
          {
            child: { kind: TypeMetadataKind.booleanType },
            kind: TypeMetadataKind.stringIndexSignatureType,
          },
        ],
        kind: TypeMetadataKind.and,
      };
    });

    describe('when called', () => {
      let result: unknown;

      beforeAll(() => {
        try {
          printTypeMetadata(
            typeMetadataFixture,
            generatePrintTypeMetadataContext(),
          );
        } catch (error: unknown) {
          result = error;
        }
      });

      it('should throw an Error', () => {
        expect(result).toBeInstanceOf(Error);
        expect((result as Error).message).toBe(
          "Property 'id' of type 'string' is not assignable to 'string' index type 'boolean'.",
        );
      });
    });
  });
});

describe(printTypeMetadataExpanded, () => {
  describe('having a TypeMetadata in the name map', () => {
    let typeMetadataFixture: TypeMetadata;
    let contextFixture: PrintTypeMetadataContext;

    beforeAll(() => {
      typeMetadataFixture = {
        kind: TypeMetadataKind.stringType,
      };
      contextFixture = generatePrintTypeMetadataContext([
        [typeMetadataFixture, 'Foo'],
      ]);
    });

    describe('when called', () => {
      let result: unknown;

      beforeAll(() => {
        result = printTypeMetadataExpanded(typeMetadataFixture, contextFixture);
      });

      it('should return the expanded TypeScript type', () => {
        expect(result).toBe('string');
      });
    });
  });
});
