import { beforeAll, describe, expect, it } from 'vitest';

import {
  type AndTypeMetadata,
  type PropertyTypeMetadata,
  type TypeMetadata,
  TypeMetadataKind,
} from '@inversifyjs/json-schema-type-metadata';

import { transformTypeMetadataToTypeScript } from './transformTypeMetadataToTypeScript.js';

describe(transformTypeMetadataToTypeScript, () => {
  describe.each<[string, TypeMetadata, string]>([
    [
      'an anyType TypeMetadata',
      { kind: TypeMetadataKind.anyType },
      'export type Root = unknown;',
    ],
    [
      'a noneType TypeMetadata',
      { kind: TypeMetadataKind.noneType },
      'export type Root = never;',
    ],
    [
      'a booleanType TypeMetadata',
      { kind: TypeMetadataKind.booleanType },
      'export type Root = boolean;',
    ],
    [
      'a floatType TypeMetadata',
      { kind: TypeMetadataKind.floatType },
      'export type Root = number;',
    ],
    [
      'an integerType TypeMetadata',
      { kind: TypeMetadataKind.integerType },
      'export type Root = number;',
    ],
    [
      'a stringType TypeMetadata',
      { kind: TypeMetadataKind.stringType },
      'export type Root = string;',
    ],
    [
      'an objectType TypeMetadata',
      { kind: TypeMetadataKind.objectType },
      'export type Root = object;',
    ],
    [
      'a null literalType TypeMetadata',
      { kind: TypeMetadataKind.literalType, literal: null },
      'export type Root = null;',
    ],
    [
      'a string literalType TypeMetadata',
      { kind: TypeMetadataKind.literalType, literal: 'foo' },
      'export type Root = "foo";',
    ],
    [
      'an object literalType TypeMetadata',
      { kind: TypeMetadataKind.literalType, literal: { foo: 'bar' } },
      'export type Root = { foo: "bar" };',
    ],
    [
      'an arrayType TypeMetadata',
      {
        child: { kind: TypeMetadataKind.stringType },
        kind: TypeMetadataKind.arrayType,
      },
      'export type Root = string[];',
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
      'export type Root = (string | number)[];',
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
      'export type Root = string | number;',
    ],
    [
      'a propertyType TypeMetadata',
      {
        child: { kind: TypeMetadataKind.stringType },
        isOptional: true,
        kind: TypeMetadataKind.propertyType,
        property: 'foo',
      },
      'export type Root = { foo?: string };',
    ],
    [
      'a required propertyType TypeMetadata with a quoted key',
      {
        child: { kind: TypeMetadataKind.stringType },
        isOptional: false,
        kind: TypeMetadataKind.propertyType,
        property: 'foo-bar',
      },
      'export type Root = { "foo-bar": string };',
    ],
    [
      'a stringIndexSignatureType TypeMetadata',
      {
        child: { kind: TypeMetadataKind.stringType },
        kind: TypeMetadataKind.stringIndexSignatureType,
      },
      'export type Root = { [key: string]: string };',
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
      'export type Root = { id: string; name?: string };',
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
      'export type Root = { foo?: string } & string;',
    ],
    [
      'a titled stringType TypeMetadata',
      { id: 'Foo', kind: TypeMetadataKind.stringType },
      'export type Foo = string;',
    ],
    [
      'a titled stringType TypeMetadata whose id is a reserved word',
      { id: 'string', kind: TypeMetadataKind.stringType },
      'export type _string = string;',
    ],
    [
      'a titled stringType TypeMetadata whose id is not an identifier',
      { id: 'My Type', kind: TypeMetadataKind.stringType },
      'export type My_Type = string;',
    ],
    [
      'a titled stringType TypeMetadata whose id starts with a digit',
      { id: '2Foo', kind: TypeMetadataKind.stringType },
      'export type _2Foo = string;',
    ],
  ])(
    'having %s',
    (_: string, typeMetadataFixture: TypeMetadata, expected: string) => {
      describe('when called', () => {
        let result: unknown;

        beforeAll(() => {
          result = transformTypeMetadataToTypeScript(typeMetadataFixture);
        });

        it('should return the expected TypeScript module', () => {
          expect(result).toBe(expected);
        });
      });
    },
  );

  describe('having an untitled TypeMetadata and a custom root name', () => {
    let typeMetadataFixture: TypeMetadata;

    beforeAll(() => {
      typeMetadataFixture = {
        kind: TypeMetadataKind.booleanType,
      };
    });

    describe('when called', () => {
      let result: unknown;

      beforeAll(() => {
        result = transformTypeMetadataToTypeScript(typeMetadataFixture, {
          rootName: 'Flag',
        });
      });

      it('should return the expected TypeScript module', () => {
        expect(result).toBe('export type Flag = boolean;');
      });
    });
  });

  describe('having a titled child TypeMetadata referenced from a property', () => {
    let typeMetadataFixture: TypeMetadata;

    beforeAll(() => {
      const userTypeMetadata: TypeMetadata = {
        id: 'User',
        kind: TypeMetadataKind.stringType,
      };

      typeMetadataFixture = {
        children: [
          {
            child: userTypeMetadata,
            isOptional: false,
            kind: TypeMetadataKind.propertyType,
            property: 'owner',
          },
          { kind: TypeMetadataKind.objectType },
        ],
        kind: TypeMetadataKind.and,
      };
    });

    describe('when called', () => {
      let result: unknown;

      beforeAll(() => {
        result = transformTypeMetadataToTypeScript(typeMetadataFixture);
      });

      it('should return the expected TypeScript module', () => {
        expect(result).toBe(
          'export type User = string;\nexport type Root = { owner: User };',
        );
      });
    });
  });

  describe('having a circular and TypeMetadata', () => {
    let typeMetadataFixture: AndTypeMetadata;

    beforeAll(() => {
      typeMetadataFixture = {
        children: [],
        kind: TypeMetadataKind.and,
      };

      typeMetadataFixture.children.push(
        {
          child: typeMetadataFixture,
          isOptional: true,
          kind: TypeMetadataKind.propertyType,
          property: 'next',
        },
        {
          kind: TypeMetadataKind.objectType,
        },
      );
    });

    describe('when called', () => {
      let result: unknown;

      beforeAll(() => {
        result = transformTypeMetadataToTypeScript(typeMetadataFixture);
      });

      it('should return a recursive type alias', () => {
        expect(result).toBe('export type Type1 = { next?: Type1 };');
      });
    });
  });

  describe('having titled TypeMetadata whose ids collide after sanitizing', () => {
    let typeMetadataFixture: TypeMetadata;

    beforeAll(() => {
      typeMetadataFixture = {
        children: [
          {
            child: {
              id: 'My Type',
              kind: TypeMetadataKind.stringType,
            },
            isOptional: false,
            kind: TypeMetadataKind.propertyType,
            property: 'foo',
          },
          {
            child: {
              id: 'My_Type',
              kind: TypeMetadataKind.booleanType,
            },
            isOptional: false,
            kind: TypeMetadataKind.propertyType,
            property: 'bar',
          },
          { kind: TypeMetadataKind.objectType },
        ],
        kind: TypeMetadataKind.and,
      };
    });

    describe('when called', () => {
      let result: unknown;

      beforeAll(() => {
        result = transformTypeMetadataToTypeScript(typeMetadataFixture);
      });

      it('should suffix the colliding alias', () => {
        expect(result).toBe(
          'export type My_Type = string;\nexport type My_Type2 = boolean;\nexport type Root = { foo: My_Type; bar: My_Type2 };',
        );
      });
    });
  });

  describe('having three titled TypeMetadata with the same id', () => {
    let typeMetadataFixture: TypeMetadata;

    beforeAll(() => {
      typeMetadataFixture = {
        children: [
          {
            child: { id: 'Foo', kind: TypeMetadataKind.stringType },
            isOptional: false,
            kind: TypeMetadataKind.propertyType,
            property: 'a',
          },
          {
            child: { id: 'Foo', kind: TypeMetadataKind.booleanType },
            isOptional: false,
            kind: TypeMetadataKind.propertyType,
            property: 'b',
          },
          {
            child: { id: 'Foo', kind: TypeMetadataKind.floatType },
            isOptional: false,
            kind: TypeMetadataKind.propertyType,
            property: 'c',
          },
          { kind: TypeMetadataKind.objectType },
        ],
        kind: TypeMetadataKind.and,
      };
    });

    describe('when called', () => {
      let result: unknown;

      beforeAll(() => {
        result = transformTypeMetadataToTypeScript(typeMetadataFixture);
      });

      it('should suffix each colliding alias', () => {
        expect(result).toBe(
          'export type Foo = string;\nexport type Foo2 = boolean;\nexport type Foo3 = number;\nexport type Root = { a: Foo; b: Foo2; c: Foo3 };',
        );
      });
    });
  });

  describe('having a circular propertyType TypeMetadata', () => {
    let typeMetadataFixture: PropertyTypeMetadata;

    beforeAll(() => {
      typeMetadataFixture = {
        child: { kind: TypeMetadataKind.stringType },
        isOptional: true,
        kind: TypeMetadataKind.propertyType,
        property: 'foo',
      };
      typeMetadataFixture.child = typeMetadataFixture;
    });

    describe('when called', () => {
      let result: unknown;

      beforeAll(() => {
        result = transformTypeMetadataToTypeScript(typeMetadataFixture);
      });

      it('should return a recursive type alias', () => {
        expect(result).toBe('export type Root = { foo?: Root };');
      });
    });
  });

  describe('having a shared child TypeMetadata', () => {
    let typeMetadataFixture: TypeMetadata;

    beforeAll(() => {
      const sharedTypeMetadata: TypeMetadata = {
        kind: TypeMetadataKind.stringType,
      };

      typeMetadataFixture = {
        children: [
          {
            child: sharedTypeMetadata,
            isOptional: true,
            kind: TypeMetadataKind.propertyType,
            property: 'foo',
          },
          {
            child: sharedTypeMetadata,
            isOptional: true,
            kind: TypeMetadataKind.propertyType,
            property: 'bar',
          },
          { kind: TypeMetadataKind.objectType },
        ],
        kind: TypeMetadataKind.and,
      };
    });

    describe('when called', () => {
      let result: unknown;

      beforeAll(() => {
        result = transformTypeMetadataToTypeScript(typeMetadataFixture);
      });

      it('should return a named alias for the shared child', () => {
        expect(result).toBe(
          'export type Type1 = string;\nexport type Root = { foo?: Type1; bar?: Type1 };',
        );
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
          { kind: TypeMetadataKind.objectType },
        ],
        kind: TypeMetadataKind.and,
      };
    });

    describe('when called', () => {
      let result: unknown;

      beforeAll(() => {
        try {
          transformTypeMetadataToTypeScript(typeMetadataFixture);
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
