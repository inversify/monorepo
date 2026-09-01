import { beforeAll, describe, expect, it } from 'vitest';

import {
  type AndTypeMetadata,
  type TypeMetadata,
  TypeMetadataKind,
} from '@inversifyjs/json-schema-type-metadata';

import { isTypeMetadataAssignableTo } from './isTypeMetadataAssignableTo.js';

describe(isTypeMetadataAssignableTo, () => {
  describe.each<[string, TypeMetadata, TypeMetadata, boolean]>([
    [
      'an anyType TypeMetadata to an anyType TypeMetadata',
      { kind: TypeMetadataKind.anyType },
      { kind: TypeMetadataKind.anyType },
      true,
    ],
    [
      'a stringType TypeMetadata to an anyType TypeMetadata',
      { kind: TypeMetadataKind.stringType },
      { kind: TypeMetadataKind.anyType },
      true,
    ],
    [
      'an anyType TypeMetadata to a stringType TypeMetadata',
      { kind: TypeMetadataKind.anyType },
      { kind: TypeMetadataKind.stringType },
      false,
    ],
    [
      'a noneType TypeMetadata to a stringType TypeMetadata',
      { kind: TypeMetadataKind.noneType },
      { kind: TypeMetadataKind.stringType },
      true,
    ],
    [
      'a stringType TypeMetadata to a noneType TypeMetadata',
      { kind: TypeMetadataKind.stringType },
      { kind: TypeMetadataKind.noneType },
      false,
    ],
    [
      'a stringType TypeMetadata to a stringType TypeMetadata',
      { kind: TypeMetadataKind.stringType },
      { kind: TypeMetadataKind.stringType },
      true,
    ],
    [
      'a stringType TypeMetadata to a booleanType TypeMetadata',
      { kind: TypeMetadataKind.stringType },
      { kind: TypeMetadataKind.booleanType },
      false,
    ],
    [
      'an integerType TypeMetadata to a floatType TypeMetadata',
      { kind: TypeMetadataKind.integerType },
      { kind: TypeMetadataKind.floatType },
      true,
    ],
    [
      'a floatType TypeMetadata to an integerType TypeMetadata',
      { kind: TypeMetadataKind.floatType },
      { kind: TypeMetadataKind.integerType },
      true,
    ],
    [
      'a string literalType TypeMetadata to a stringType TypeMetadata',
      { kind: TypeMetadataKind.literalType, literal: 'foo' },
      { kind: TypeMetadataKind.stringType },
      true,
    ],
    [
      'a string literalType TypeMetadata to a booleanType TypeMetadata',
      { kind: TypeMetadataKind.literalType, literal: 'foo' },
      { kind: TypeMetadataKind.booleanType },
      false,
    ],
    [
      'a stringType TypeMetadata to a string literalType TypeMetadata',
      { kind: TypeMetadataKind.stringType },
      { kind: TypeMetadataKind.literalType, literal: 'foo' },
      false,
    ],
    [
      'a number literalType TypeMetadata to a floatType TypeMetadata',
      { kind: TypeMetadataKind.literalType, literal: 1 },
      { kind: TypeMetadataKind.floatType },
      true,
    ],
    [
      'a boolean literalType TypeMetadata to a booleanType TypeMetadata',
      { kind: TypeMetadataKind.literalType, literal: true },
      { kind: TypeMetadataKind.booleanType },
      true,
    ],
    [
      'a null literalType TypeMetadata to a stringType TypeMetadata',
      { kind: TypeMetadataKind.literalType, literal: null },
      { kind: TypeMetadataKind.stringType },
      false,
    ],
    [
      'a null literalType TypeMetadata to a null literalType TypeMetadata',
      { kind: TypeMetadataKind.literalType, literal: null },
      { kind: TypeMetadataKind.literalType, literal: null },
      true,
    ],
    [
      'an object literalType TypeMetadata to an objectType TypeMetadata',
      { kind: TypeMetadataKind.literalType, literal: { foo: 'bar' } },
      { kind: TypeMetadataKind.objectType },
      true,
    ],
    [
      'an object literalType TypeMetadata to a required name propertyType TypeMetadata',
      { kind: TypeMetadataKind.literalType, literal: { name: 'x' } },
      {
        child: { kind: TypeMetadataKind.stringType },
        isOptional: false,
        kind: TypeMetadataKind.propertyType,
        property: 'name',
      },
      true,
    ],
    [
      'an empty object literalType TypeMetadata to a required name propertyType TypeMetadata',
      { kind: TypeMetadataKind.literalType, literal: {} },
      {
        child: { kind: TypeMetadataKind.stringType },
        isOptional: false,
        kind: TypeMetadataKind.propertyType,
        property: 'name',
      },
      false,
    ],
    [
      'an empty object literalType TypeMetadata to an optional name propertyType TypeMetadata',
      { kind: TypeMetadataKind.literalType, literal: {} },
      {
        child: { kind: TypeMetadataKind.stringType },
        isOptional: true,
        kind: TypeMetadataKind.propertyType,
        property: 'name',
      },
      true,
    ],
    [
      'an object literalType TypeMetadata to a stringIndexSignatureType TypeMetadata of stringType',
      { kind: TypeMetadataKind.literalType, literal: { foo: 'bar' } },
      {
        child: { kind: TypeMetadataKind.stringType },
        kind: TypeMetadataKind.stringIndexSignatureType,
      },
      true,
    ],
    [
      'an object literalType TypeMetadata with a number value to a stringIndexSignatureType TypeMetadata of stringType',
      { kind: TypeMetadataKind.literalType, literal: { foo: 1 } },
      {
        child: { kind: TypeMetadataKind.stringType },
        kind: TypeMetadataKind.stringIndexSignatureType,
      },
      false,
    ],
    [
      'an object literalType TypeMetadata to an and TypeMetadata of a required name propertyType and objectType',
      { kind: TypeMetadataKind.literalType, literal: { name: 'x' } },
      {
        children: [
          {
            child: { kind: TypeMetadataKind.stringType },
            isOptional: false,
            kind: TypeMetadataKind.propertyType,
            property: 'name',
          },
          { kind: TypeMetadataKind.objectType },
        ],
        kind: TypeMetadataKind.and,
      },
      true,
    ],
    [
      'an array literalType TypeMetadata to an arrayType TypeMetadata of stringType',
      { kind: TypeMetadataKind.literalType, literal: ['foo'] },
      {
        child: { kind: TypeMetadataKind.stringType },
        kind: TypeMetadataKind.arrayType,
      },
      true,
    ],
    [
      'an arrayType TypeMetadata of stringType to an arrayType TypeMetadata of anyType',
      {
        child: { kind: TypeMetadataKind.stringType },
        kind: TypeMetadataKind.arrayType,
      },
      {
        child: { kind: TypeMetadataKind.anyType },
        kind: TypeMetadataKind.arrayType,
      },
      true,
    ],
    [
      'an arrayType TypeMetadata of anyType to an arrayType TypeMetadata of stringType',
      {
        child: { kind: TypeMetadataKind.anyType },
        kind: TypeMetadataKind.arrayType,
      },
      {
        child: { kind: TypeMetadataKind.stringType },
        kind: TypeMetadataKind.arrayType,
      },
      false,
    ],
    [
      'an arrayType TypeMetadata to an objectType TypeMetadata',
      {
        child: { kind: TypeMetadataKind.stringType },
        kind: TypeMetadataKind.arrayType,
      },
      { kind: TypeMetadataKind.objectType },
      true,
    ],
    [
      'a stringType TypeMetadata to an or TypeMetadata of stringType and booleanType',
      { kind: TypeMetadataKind.stringType },
      {
        children: [
          { kind: TypeMetadataKind.stringType },
          { kind: TypeMetadataKind.booleanType },
        ],
        kind: TypeMetadataKind.or,
      },
      true,
    ],
    [
      'an or TypeMetadata of stringType and booleanType to a stringType TypeMetadata',
      {
        children: [
          { kind: TypeMetadataKind.stringType },
          { kind: TypeMetadataKind.booleanType },
        ],
        kind: TypeMetadataKind.or,
      },
      { kind: TypeMetadataKind.stringType },
      false,
    ],
    [
      'a stringType TypeMetadata to an and TypeMetadata of stringType and anyType',
      { kind: TypeMetadataKind.stringType },
      {
        children: [
          { kind: TypeMetadataKind.stringType },
          { kind: TypeMetadataKind.anyType },
        ],
        kind: TypeMetadataKind.and,
      },
      true,
    ],
    [
      'an and TypeMetadata of stringType and objectType to a stringType TypeMetadata',
      {
        children: [
          { kind: TypeMetadataKind.stringType },
          { kind: TypeMetadataKind.objectType },
        ],
        kind: TypeMetadataKind.and,
      },
      { kind: TypeMetadataKind.stringType },
      true,
    ],
    [
      'a propertyType TypeMetadata to an objectType TypeMetadata',
      {
        child: { kind: TypeMetadataKind.stringType },
        isOptional: true,
        kind: TypeMetadataKind.propertyType,
        property: 'id',
      },
      { kind: TypeMetadataKind.objectType },
      true,
    ],
    [
      'a propertyType TypeMetadata to a stringIndexSignatureType TypeMetadata of stringType',
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
      true,
    ],
    [
      'a propertyType TypeMetadata of stringType to a stringIndexSignatureType TypeMetadata of booleanType',
      {
        child: { kind: TypeMetadataKind.stringType },
        isOptional: true,
        kind: TypeMetadataKind.propertyType,
        property: 'id',
      },
      {
        child: { kind: TypeMetadataKind.booleanType },
        kind: TypeMetadataKind.stringIndexSignatureType,
      },
      false,
    ],
    [
      'a stringIndexSignatureType TypeMetadata of stringType to a stringIndexSignatureType TypeMetadata of anyType',
      {
        child: { kind: TypeMetadataKind.stringType },
        kind: TypeMetadataKind.stringIndexSignatureType,
      },
      {
        child: { kind: TypeMetadataKind.anyType },
        kind: TypeMetadataKind.stringIndexSignatureType,
      },
      true,
    ],
  ])(
    'having %s',
    (
      _: string,
      sourceTypeMetadataFixture: TypeMetadata,
      targetTypeMetadataFixture: TypeMetadata,
      expected: boolean,
    ) => {
      describe('when called', () => {
        let result: unknown;

        beforeAll(() => {
          result = isTypeMetadataAssignableTo(
            sourceTypeMetadataFixture,
            targetTypeMetadataFixture,
          );
        });

        it('should return the expected boolean', () => {
          expect(result).toBe(expected);
        });
      });
    },
  );

  describe('having a circular and TypeMetadata and an objectType TypeMetadata', () => {
    let sourceTypeMetadataFixture: AndTypeMetadata;
    let targetTypeMetadataFixture: TypeMetadata;

    beforeAll(() => {
      sourceTypeMetadataFixture = {
        children: [],
        kind: TypeMetadataKind.and,
      };
      sourceTypeMetadataFixture.children.push(
        {
          child: sourceTypeMetadataFixture,
          isOptional: true,
          kind: TypeMetadataKind.propertyType,
          property: 'next',
        },
        {
          kind: TypeMetadataKind.objectType,
        },
      );
      targetTypeMetadataFixture = {
        kind: TypeMetadataKind.objectType,
      };
    });

    describe('when called', () => {
      let result: unknown;

      beforeAll(() => {
        result = isTypeMetadataAssignableTo(
          sourceTypeMetadataFixture,
          targetTypeMetadataFixture,
        );
      });

      it('should return true', () => {
        expect(result).toBe(true);
      });
    });
  });

  describe('having a circular and TypeMetadata and a booleanType TypeMetadata', () => {
    let sourceTypeMetadataFixture: AndTypeMetadata;
    let targetTypeMetadataFixture: TypeMetadata;

    beforeAll(() => {
      sourceTypeMetadataFixture = {
        children: [],
        kind: TypeMetadataKind.and,
      };
      sourceTypeMetadataFixture.children.push(
        {
          child: sourceTypeMetadataFixture,
          isOptional: true,
          kind: TypeMetadataKind.propertyType,
          property: 'next',
        },
        {
          kind: TypeMetadataKind.objectType,
        },
      );
      targetTypeMetadataFixture = {
        kind: TypeMetadataKind.booleanType,
      };
    });

    describe('when called', () => {
      let result: unknown;

      beforeAll(() => {
        result = isTypeMetadataAssignableTo(
          sourceTypeMetadataFixture,
          targetTypeMetadataFixture,
        );
      });

      it('should return false', () => {
        expect(result).toBe(false);
      });
    });
  });
});
