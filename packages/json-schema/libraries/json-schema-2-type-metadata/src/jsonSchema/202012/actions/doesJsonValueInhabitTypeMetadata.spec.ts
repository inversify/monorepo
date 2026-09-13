import { beforeAll, describe, expect, it } from 'vitest';

import {
  type AndTypeMetadata,
  type OrTypeMetadata,
  type TypeMetadata,
  TypeMetadataKind,
} from '@inversifyjs/json-schema-type-metadata';
import { type JsonValue } from '@inversifyjs/json-schema-types';

import { doesJsonValueInhabitTypeMetadata } from './doesJsonValueInhabitTypeMetadata.js';

describe(doesJsonValueInhabitTypeMetadata, () => {
  describe.each<[string, JsonValue, TypeMetadata, boolean]>([
    [
      'a string value and stringType TypeMetadata',
      'foo',
      { kind: TypeMetadataKind.stringType },
      true,
    ],
    [
      'a number value and stringType TypeMetadata',
      1,
      { kind: TypeMetadataKind.stringType },
      false,
    ],
    [
      'an integer value and integerType TypeMetadata',
      1,
      { kind: TypeMetadataKind.integerType },
      true,
    ],
    [
      'a fractional number value and integerType TypeMetadata',
      1.5,
      { kind: TypeMetadataKind.integerType },
      false,
    ],
    [
      'an integer value and floatType TypeMetadata',
      1,
      { kind: TypeMetadataKind.floatType },
      true,
    ],
    [
      'an array value and objectType TypeMetadata',
      [1, 2],
      { kind: TypeMetadataKind.objectType },
      false,
    ],
    [
      'an object value and objectType TypeMetadata',
      { foo: 'bar' },
      { kind: TypeMetadataKind.objectType },
      true,
    ],
    [
      'an object value and arrayType TypeMetadata',
      { 0: 1 },
      {
        child: { kind: TypeMetadataKind.anyType },
        kind: TypeMetadataKind.arrayType,
      },
      false,
    ],
    [
      'a null value and a null literalType TypeMetadata',
      null,
      { kind: TypeMetadataKind.literalType, literal: null },
      true,
    ],
    [
      'an object value and an equal object literalType TypeMetadata',
      { foo: { items: [1, 'a'] } },
      {
        kind: TypeMetadataKind.literalType,
        literal: { foo: { items: [1, 'a'] } },
      },
      true,
    ],
    [
      'an object value and a different object literalType TypeMetadata',
      { foo: { items: [1, 'a'] } },
      {
        kind: TypeMetadataKind.literalType,
        literal: { foo: { items: [1, 'b'] } },
      },
      false,
    ],
    [
      'a string value and a propertyType TypeMetadata',
      'foo',
      {
        child: { kind: TypeMetadataKind.stringType },
        isOptional: false,
        kind: TypeMetadataKind.propertyType,
        property: 'name',
      },
      true,
    ],
    [
      'an array of numbers and an arrayType of integerType TypeMetadata',
      [1, 2],
      {
        child: { kind: TypeMetadataKind.integerType },
        kind: TypeMetadataKind.arrayType,
      },
      true,
    ],
    [
      'an array with a fractional number and an arrayType of integerType TypeMetadata',
      [1, 1.5],
      {
        child: { kind: TypeMetadataKind.integerType },
        kind: TypeMetadataKind.arrayType,
      },
      false,
    ],
    [
      'a matching tuple value and a closed prefixItems arrayType TypeMetadata',
      ['foo', 1],
      {
        child: { kind: TypeMetadataKind.noneType },
        kind: TypeMetadataKind.arrayType,
        prefixItems: [
          { kind: TypeMetadataKind.stringType },
          { kind: TypeMetadataKind.floatType },
        ],
      },
      true,
    ],
    [
      'a short array and a closed prefixItems arrayType TypeMetadata',
      ['foo'],
      {
        child: { kind: TypeMetadataKind.noneType },
        kind: TypeMetadataKind.arrayType,
        prefixItems: [
          { kind: TypeMetadataKind.stringType },
          { kind: TypeMetadataKind.floatType },
        ],
      },
      false,
    ],
    [
      'a long array and a closed prefixItems arrayType TypeMetadata',
      ['foo', 1, true],
      {
        child: { kind: TypeMetadataKind.noneType },
        kind: TypeMetadataKind.arrayType,
        prefixItems: [
          { kind: TypeMetadataKind.stringType },
          { kind: TypeMetadataKind.floatType },
        ],
      },
      false,
    ],
    [
      'a mismatched tuple value and a closed prefixItems arrayType TypeMetadata',
      ['foo', 'bar'],
      {
        child: { kind: TypeMetadataKind.noneType },
        kind: TypeMetadataKind.arrayType,
        prefixItems: [
          { kind: TypeMetadataKind.stringType },
          { kind: TypeMetadataKind.floatType },
        ],
      },
      false,
    ],
    [
      'a tuple with extra rest items and an open prefixItems arrayType TypeMetadata',
      ['foo', 1, true, false],
      {
        child: { kind: TypeMetadataKind.booleanType },
        kind: TypeMetadataKind.arrayType,
        prefixItems: [
          { kind: TypeMetadataKind.stringType },
          { kind: TypeMetadataKind.floatType },
        ],
      },
      true,
    ],
    [
      'a tuple with a mismatched rest item and an open prefixItems arrayType TypeMetadata',
      ['foo', 1, 'bar'],
      {
        child: { kind: TypeMetadataKind.booleanType },
        kind: TypeMetadataKind.arrayType,
        prefixItems: [
          { kind: TypeMetadataKind.stringType },
          { kind: TypeMetadataKind.floatType },
        ],
      },
      false,
    ],
  ])(
    'having %s',
    (
      _: string,
      jsonValueFixture: JsonValue,
      typeMetadataFixture: TypeMetadata,
      expected: boolean,
    ) => {
      describe('when called', () => {
        it('should return the expected inhabitance', () => {
          expect(
            doesJsonValueInhabitTypeMetadata(
              jsonValueFixture,
              typeMetadataFixture,
            ),
          ).toBe(expected);
        });
      });
    },
  );

  describe('having an object value and an and TypeMetadata of objectType, a required propertyType, and a never stringIndexSignatureType', () => {
    let jsonValueFixture: JsonValue;
    let typeMetadataFixture: TypeMetadata;

    beforeAll(() => {
      typeMetadataFixture = {
        children: [
          { kind: TypeMetadataKind.objectType },
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
      };
    });

    describe('having a value with only the declared property', () => {
      beforeAll(() => {
        jsonValueFixture = {
          name: 'alpha',
        };
      });

      describe('when called', () => {
        it('should return true', () => {
          expect(
            doesJsonValueInhabitTypeMetadata(
              jsonValueFixture,
              typeMetadataFixture,
            ),
          ).toBe(true);
        });
      });
    });

    describe('having a value with an additional property', () => {
      beforeAll(() => {
        jsonValueFixture = {
          extra: true,
          name: 'alpha',
        };
      });

      describe('when called', () => {
        it('should return false', () => {
          expect(
            doesJsonValueInhabitTypeMetadata(
              jsonValueFixture,
              typeMetadataFixture,
            ),
          ).toBe(false);
        });
      });
    });

    describe('having a value that is missing the required property', () => {
      beforeAll(() => {
        jsonValueFixture = {};
      });

      describe('when called', () => {
        it('should return false', () => {
          expect(
            doesJsonValueInhabitTypeMetadata(
              jsonValueFixture,
              typeMetadataFixture,
            ),
          ).toBe(false);
        });
      });
    });
  });

  describe('having an object value and an and TypeMetadata of two closed object TypeMetadata children', () => {
    let jsonValueFixture: JsonValue;
    let typeMetadataFixture: TypeMetadata;

    beforeAll(() => {
      jsonValueFixture = {
        bar: 2,
        foo: 'x',
      };
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
        ],
        kind: TypeMetadataKind.and,
      };
    });

    describe('when called', () => {
      it('should return false', () => {
        expect(
          doesJsonValueInhabitTypeMetadata(
            jsonValueFixture,
            typeMetadataFixture,
          ),
        ).toBe(false);
      });
    });
  });

  describe('having a nested object value and an and TypeMetadata with a nested propertyType', () => {
    let typeMetadataFixture: TypeMetadata;

    beforeAll(() => {
      typeMetadataFixture = {
        children: [
          { kind: TypeMetadataKind.objectType },
          {
            child: {
              children: [
                { kind: TypeMetadataKind.objectType },
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
            isOptional: false,
            kind: TypeMetadataKind.propertyType,
            property: 'user',
          },
        ],
        kind: TypeMetadataKind.and,
      };
    });

    describe('having a value whose nested array items inhabit the item TypeMetadata', () => {
      let jsonValueFixture: JsonValue;

      beforeAll(() => {
        jsonValueFixture = {
          user: {
            tags: ['a', 'b'],
          },
        };
      });

      describe('when called', () => {
        it('should return true', () => {
          expect(
            doesJsonValueInhabitTypeMetadata(
              jsonValueFixture,
              typeMetadataFixture,
            ),
          ).toBe(true);
        });
      });
    });

    describe('having a value whose nested array items do not inhabit the item TypeMetadata', () => {
      let jsonValueFixture: JsonValue;

      beforeAll(() => {
        jsonValueFixture = {
          user: {
            tags: ['a', 1],
          },
        };
      });

      describe('when called', () => {
        it('should return false', () => {
          expect(
            doesJsonValueInhabitTypeMetadata(
              jsonValueFixture,
              typeMetadataFixture,
            ),
          ).toBe(false);
        });
      });
    });
  });

  describe('having an object value and two propertyType children that share an or TypeMetadata', () => {
    let colorTypeMetadataFixture: TypeMetadata;
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
        ],
        kind: TypeMetadataKind.and,
      };
    });

    describe('having equal values that inhabit the shared or TypeMetadata', () => {
      let jsonValueFixture: JsonValue;

      beforeAll(() => {
        jsonValueFixture = {
          primary: 'red',
          secondary: 'red',
        };
      });

      describe('when called', () => {
        it('should return true', () => {
          expect(
            doesJsonValueInhabitTypeMetadata(
              jsonValueFixture,
              typeMetadataFixture,
            ),
          ).toBe(true);
        });
      });
    });

    describe('having a value that fails the second propertyType', () => {
      let jsonValueFixture: JsonValue;

      beforeAll(() => {
        jsonValueFixture = {
          primary: 'red',
          secondary: 1,
        };
      });

      describe('when called', () => {
        it('should return false', () => {
          expect(
            doesJsonValueInhabitTypeMetadata(
              jsonValueFixture,
              typeMetadataFixture,
            ),
          ).toBe(false);
        });
      });
    });
  });

  describe('having an object value and an or TypeMetadata of two propertyType children that share a stringType', () => {
    let jsonValueFixture: JsonValue;
    let stringTypeMetadataFixture: TypeMetadata;
    let typeMetadataFixture: TypeMetadata;

    beforeAll(() => {
      jsonValueFixture = {
        bar: 1,
        foo: 1,
      };
      stringTypeMetadataFixture = {
        kind: TypeMetadataKind.stringType,
      };
      typeMetadataFixture = {
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
      };
    });

    describe('when called', () => {
      it('should return false', () => {
        expect(
          doesJsonValueInhabitTypeMetadata(
            jsonValueFixture,
            typeMetadataFixture,
          ),
        ).toBe(false);
      });
    });
  });

  describe('having an array value and an or TypeMetadata of two arrayType children that share a stringType item', () => {
    let jsonValueFixture: JsonValue;
    let stringTypeMetadataFixture: TypeMetadata;
    let typeMetadataFixture: TypeMetadata;

    beforeAll(() => {
      jsonValueFixture = [1];
      stringTypeMetadataFixture = {
        kind: TypeMetadataKind.stringType,
      };
      typeMetadataFixture = {
        children: [
          {
            child: stringTypeMetadataFixture,
            kind: TypeMetadataKind.arrayType,
          },
          {
            child: stringTypeMetadataFixture,
            kind: TypeMetadataKind.arrayType,
          },
        ],
        kind: TypeMetadataKind.or,
      };
    });

    describe('when called', () => {
      it('should return false', () => {
        expect(
          doesJsonValueInhabitTypeMetadata(
            jsonValueFixture,
            typeMetadataFixture,
          ),
        ).toBe(false);
      });
    });
  });

  describe('having a circular or TypeMetadata', () => {
    let typeMetadataFixture: TypeMetadata;

    beforeAll(() => {
      const orTypeMetadataFixture: OrTypeMetadata = {
        children: [],
        kind: TypeMetadataKind.or,
      };

      orTypeMetadataFixture.children.push(orTypeMetadataFixture, {
        kind: TypeMetadataKind.stringType,
      });

      typeMetadataFixture = orTypeMetadataFixture;
    });

    describe('having a string value', () => {
      describe('when called', () => {
        it('should return true', () => {
          expect(
            doesJsonValueInhabitTypeMetadata('foo', typeMetadataFixture),
          ).toBe(true);
        });
      });
    });

    describe('having a number value', () => {
      describe('when called', () => {
        it('should return false', () => {
          expect(doesJsonValueInhabitTypeMetadata(1, typeMetadataFixture)).toBe(
            false,
          );
        });
      });
    });
  });

  describe('having a circular and TypeMetadata with a stringType child', () => {
    let typeMetadataFixture: TypeMetadata;

    beforeAll(() => {
      const andTypeMetadataFixture: AndTypeMetadata = {
        children: [],
        kind: TypeMetadataKind.and,
      };

      andTypeMetadataFixture.children.push(andTypeMetadataFixture, {
        kind: TypeMetadataKind.stringType,
      });

      typeMetadataFixture = andTypeMetadataFixture;
    });

    describe('having a string value', () => {
      describe('when called', () => {
        it('should return true', () => {
          expect(
            doesJsonValueInhabitTypeMetadata('foo', typeMetadataFixture),
          ).toBe(true);
        });
      });
    });

    describe('having a number value', () => {
      describe('when called', () => {
        it('should return false', () => {
          expect(doesJsonValueInhabitTypeMetadata(1, typeMetadataFixture)).toBe(
            false,
          );
        });
      });
    });
  });
});
