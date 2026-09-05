import { beforeAll, describe, expect, it } from 'vitest';

import {
  type AndTypeMetadata,
  type TypeMetadata,
  TypeMetadataKind,
} from '@inversifyjs/json-schema-type-metadata';

import { collectNamedTypeMetadata } from './collectNamedTypeMetadata.js';

describe(collectNamedTypeMetadata, () => {
  describe('having an untitled leaf TypeMetadata', () => {
    let typeMetadataFixture: TypeMetadata;

    beforeAll(() => {
      typeMetadataFixture = {
        kind: TypeMetadataKind.stringType,
      };
    });

    describe('when called', () => {
      let result: unknown;

      beforeAll(() => {
        result = collectNamedTypeMetadata(typeMetadataFixture);
      });

      it('should return an empty array', () => {
        expect(result).toStrictEqual([]);
      });
    });
  });

  describe('having a titled leaf TypeMetadata', () => {
    let typeMetadataFixture: TypeMetadata;

    beforeAll(() => {
      typeMetadataFixture = {
        id: 'Foo',
        kind: TypeMetadataKind.stringType,
      };
    });

    describe('when called', () => {
      let result: unknown;

      beforeAll(() => {
        result = collectNamedTypeMetadata(typeMetadataFixture);
      });

      it('should return the titled TypeMetadata', () => {
        expect(result).toStrictEqual([typeMetadataFixture]);
      });
    });
  });

  describe('having an untitled object TypeMetadata with unique children', () => {
    let typeMetadataFixture: TypeMetadata;

    beforeAll(() => {
      typeMetadataFixture = {
        children: [
          {
            child: { kind: TypeMetadataKind.stringType },
            isOptional: false,
            kind: TypeMetadataKind.propertyType,
            property: 'foo',
          },
          { kind: TypeMetadataKind.objectType },
        ],
        kind: TypeMetadataKind.and,
      };
    });

    describe('when called', () => {
      let result: unknown;

      beforeAll(() => {
        result = collectNamedTypeMetadata(typeMetadataFixture);
      });

      it('should return an empty array', () => {
        expect(result).toStrictEqual([]);
      });
    });
  });

  describe('having a titled child TypeMetadata', () => {
    let titledTypeMetadataFixture: TypeMetadata;
    let typeMetadataFixture: TypeMetadata;

    beforeAll(() => {
      titledTypeMetadataFixture = {
        id: 'User',
        kind: TypeMetadataKind.stringType,
      };
      typeMetadataFixture = {
        children: [
          {
            child: titledTypeMetadataFixture,
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
        result = collectNamedTypeMetadata(typeMetadataFixture);
      });

      it('should return the titled child in visit order', () => {
        expect(result).toStrictEqual([titledTypeMetadataFixture]);
      });
    });
  });

  describe('having two titled children', () => {
    let firstTitledTypeMetadataFixture: TypeMetadata;
    let secondTitledTypeMetadataFixture: TypeMetadata;
    let typeMetadataFixture: TypeMetadata;

    beforeAll(() => {
      firstTitledTypeMetadataFixture = {
        id: 'B',
        kind: TypeMetadataKind.stringType,
      };
      secondTitledTypeMetadataFixture = {
        id: 'A',
        kind: TypeMetadataKind.booleanType,
      };
      typeMetadataFixture = {
        children: [
          {
            child: firstTitledTypeMetadataFixture,
            isOptional: false,
            kind: TypeMetadataKind.propertyType,
            property: 'first',
          },
          {
            child: secondTitledTypeMetadataFixture,
            isOptional: false,
            kind: TypeMetadataKind.propertyType,
            property: 'second',
          },
          { kind: TypeMetadataKind.objectType },
        ],
        kind: TypeMetadataKind.and,
      };
    });

    describe('when called', () => {
      let result: unknown;

      beforeAll(() => {
        result = collectNamedTypeMetadata(typeMetadataFixture);
      });

      it('should return the titled children in first-seen order', () => {
        expect(result).toStrictEqual([
          firstTitledTypeMetadataFixture,
          secondTitledTypeMetadataFixture,
        ]);
      });
    });
  });

  describe('having a shared child TypeMetadata', () => {
    let sharedTypeMetadataFixture: TypeMetadata;
    let typeMetadataFixture: TypeMetadata;

    beforeAll(() => {
      sharedTypeMetadataFixture = {
        kind: TypeMetadataKind.stringType,
      };
      typeMetadataFixture = {
        children: [
          {
            child: sharedTypeMetadataFixture,
            isOptional: true,
            kind: TypeMetadataKind.propertyType,
            property: 'foo',
          },
          {
            child: sharedTypeMetadataFixture,
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
        result = collectNamedTypeMetadata(typeMetadataFixture);
      });

      it('should return the shared child', () => {
        expect(result).toStrictEqual([sharedTypeMetadataFixture]);
      });
    });
  });

  describe('having a shared child TypeMetadata with a titled descendant', () => {
    let sharedTypeMetadataFixture: TypeMetadata;
    let titledTypeMetadataFixture: TypeMetadata;
    let typeMetadataFixture: TypeMetadata;

    beforeAll(() => {
      titledTypeMetadataFixture = {
        id: 'Inner',
        kind: TypeMetadataKind.stringType,
      };
      sharedTypeMetadataFixture = {
        child: titledTypeMetadataFixture,
        kind: TypeMetadataKind.arrayType,
      };
      typeMetadataFixture = {
        children: [sharedTypeMetadataFixture, sharedTypeMetadataFixture],
        kind: TypeMetadataKind.or,
      };
    });

    describe('when called', () => {
      let result: unknown;

      beforeAll(() => {
        result = collectNamedTypeMetadata(typeMetadataFixture);
      });

      it('should return the shared child and titled descendant once', () => {
        expect(result).toStrictEqual([
          sharedTypeMetadataFixture,
          titledTypeMetadataFixture,
        ]);
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
        result = collectNamedTypeMetadata(typeMetadataFixture);
      });

      it('should return the cyclic TypeMetadata', () => {
        expect(result).toStrictEqual([typeMetadataFixture]);
      });
    });
  });

  describe('having a titled circular and TypeMetadata', () => {
    let typeMetadataFixture: AndTypeMetadata;

    beforeAll(() => {
      typeMetadataFixture = {
        children: [],
        id: 'Node',
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
        result = collectNamedTypeMetadata(typeMetadataFixture);
      });

      it('should return the cyclic TypeMetadata once', () => {
        expect(result).toStrictEqual([typeMetadataFixture]);
      });
    });
  });

  describe('having two circular and TypeMetadata nodes connected by a property', () => {
    let innerTypeMetadataFixture: AndTypeMetadata;
    let outerTypeMetadataFixture: AndTypeMetadata;

    beforeAll(() => {
      innerTypeMetadataFixture = {
        children: [],
        kind: TypeMetadataKind.and,
      };
      outerTypeMetadataFixture = {
        children: [],
        kind: TypeMetadataKind.and,
      };

      const childPropertyTypeMetadata: TypeMetadata = {
        child: innerTypeMetadataFixture,
        isOptional: false,
        kind: TypeMetadataKind.propertyType,
        property: 'child',
      };

      innerTypeMetadataFixture.children.push(childPropertyTypeMetadata, {
        kind: TypeMetadataKind.objectType,
      });
      outerTypeMetadataFixture.children.push(childPropertyTypeMetadata, {
        kind: TypeMetadataKind.objectType,
      });
    });

    describe('when called', () => {
      let result: unknown;

      beforeAll(() => {
        result = collectNamedTypeMetadata(outerTypeMetadataFixture);
      });

      it('should name the cyclic and TypeMetadata and not the propertyType', () => {
        expect(result).toStrictEqual([innerTypeMetadataFixture]);
      });
    });
  });
});
