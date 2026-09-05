import { beforeAll, describe, expect, it } from 'vitest';

import {
  type TypeMetadata,
  TypeMetadataKind,
} from '@inversifyjs/json-schema-type-metadata';

import { collectPropertyTypeMetadataChildren } from './collectPropertyTypeMetadataChildren.js';

describe(collectPropertyTypeMetadataChildren, () => {
  describe('having a property TypeMetadata', () => {
    let childTypeMetadataFixture: TypeMetadata;
    let typeMetadataFixture: TypeMetadata;

    beforeAll(() => {
      childTypeMetadataFixture = {
        id: 'User',
        kind: TypeMetadataKind.stringType,
      };
      typeMetadataFixture = {
        child: childTypeMetadataFixture,
        isOptional: false,
        kind: TypeMetadataKind.propertyType,
        property: '0',
      };
    });

    describe('when called', () => {
      let result: unknown;

      beforeAll(() => {
        result = collectPropertyTypeMetadataChildren(typeMetadataFixture);
      });

      it('should return the property child', () => {
        expect(result).toStrictEqual([childTypeMetadataFixture]);
      });
    });
  });

  describe('having an and TypeMetadata with unordered numeric properties', () => {
    let firstChildTypeMetadataFixture: TypeMetadata;
    let secondChildTypeMetadataFixture: TypeMetadata;
    let typeMetadataFixture: TypeMetadata;

    beforeAll(() => {
      firstChildTypeMetadataFixture = {
        id: 'User',
        kind: TypeMetadataKind.stringType,
      };
      secondChildTypeMetadataFixture = {
        id: 'Flag',
        kind: TypeMetadataKind.booleanType,
      };
      typeMetadataFixture = {
        children: [
          {
            kind: TypeMetadataKind.objectType,
          },
          {
            child: secondChildTypeMetadataFixture,
            isOptional: false,
            kind: TypeMetadataKind.propertyType,
            property: '1',
          },
          {
            child: firstChildTypeMetadataFixture,
            isOptional: false,
            kind: TypeMetadataKind.propertyType,
            property: '0',
          },
        ],
        kind: TypeMetadataKind.and,
      };
    });

    describe('when called', () => {
      let result: unknown;

      beforeAll(() => {
        result = collectPropertyTypeMetadataChildren(typeMetadataFixture);
      });

      it('should return property children in index order', () => {
        expect(result).toStrictEqual([
          firstChildTypeMetadataFixture,
          secondChildTypeMetadataFixture,
        ]);
      });
    });
  });

  describe('having a string TypeMetadata', () => {
    let typeMetadataFixture: TypeMetadata;

    beforeAll(() => {
      typeMetadataFixture = {
        kind: TypeMetadataKind.stringType,
      };
    });

    describe('when called', () => {
      let result: unknown;

      beforeAll(() => {
        result = collectPropertyTypeMetadataChildren(typeMetadataFixture);
      });

      it('should return an empty array', () => {
        expect(result).toStrictEqual([]);
      });
    });
  });
});
