import { beforeAll, describe, expect, it } from 'vitest';

import {
  type AndTypeMetadata,
  type ArrayTypeMetadata,
  type OrTypeMetadata,
  type PropertyTypeMetadata,
  type TypeMetadata,
  TypeMetadataKind,
} from '@inversifyjs/json-schema-type-metadata';

import { unifyCollidingTypeMetadataIds } from './unifyCollidingTypeMetadataIds.js';

function findPropertyTypeMetadata(
  typeMetadata: TypeMetadata,
  property: string,
  seenTypeMetadataSet: Set<TypeMetadata> = new Set(),
): PropertyTypeMetadata | undefined {
  if (seenTypeMetadataSet.has(typeMetadata)) {
    return undefined;
  }

  seenTypeMetadataSet.add(typeMetadata);

  if (
    typeMetadata.kind === TypeMetadataKind.propertyType &&
    typeMetadata.property === property
  ) {
    return typeMetadata;
  }

  switch (typeMetadata.kind) {
    case TypeMetadataKind.and:
    case TypeMetadataKind.or:
      for (const child of typeMetadata.children) {
        const propertyTypeMetadata: PropertyTypeMetadata | undefined =
          findPropertyTypeMetadata(child, property, seenTypeMetadataSet);

        if (propertyTypeMetadata !== undefined) {
          return propertyTypeMetadata;
        }
      }
      break;
    case TypeMetadataKind.arrayType:
    case TypeMetadataKind.propertyType:
    case TypeMetadataKind.stringIndexSignatureType:
      return findPropertyTypeMetadata(
        typeMetadata.child,
        property,
        seenTypeMetadataSet,
      );
    default:
      break;
  }

  return undefined;
}

describe(unifyCollidingTypeMetadataIds, () => {
  describe('having two untitled string TypeMetadata nodes', () => {
    let leftStringTypeMetadata: TypeMetadata;
    let rightStringTypeMetadata: TypeMetadata;
    let typeMetadataFixture: OrTypeMetadata;

    beforeAll(() => {
      leftStringTypeMetadata = {
        kind: TypeMetadataKind.stringType,
      };
      rightStringTypeMetadata = {
        kind: TypeMetadataKind.stringType,
      };
      typeMetadataFixture = {
        children: [leftStringTypeMetadata, rightStringTypeMetadata],
        kind: TypeMetadataKind.or,
      };
    });

    describe('when called', () => {
      let result: unknown;

      beforeAll(() => {
        result = unifyCollidingTypeMetadataIds(typeMetadataFixture);
      });

      it('should keep both nodes', () => {
        const resultTypeMetadata: OrTypeMetadata = result as OrTypeMetadata;

        expect(resultTypeMetadata.children[0]).toBe(leftStringTypeMetadata);
        expect(resultTypeMetadata.children[1]).toBe(rightStringTypeMetadata);
      });
    });
  });

  describe('having two string TypeMetadata nodes with different ids', () => {
    let personTypeMetadata: TypeMetadata;
    let userTypeMetadata: TypeMetadata;
    let typeMetadataFixture: OrTypeMetadata;

    beforeAll(() => {
      personTypeMetadata = {
        id: 'Person',
        kind: TypeMetadataKind.stringType,
      };
      userTypeMetadata = {
        id: 'User',
        kind: TypeMetadataKind.stringType,
      };
      typeMetadataFixture = {
        children: [personTypeMetadata, userTypeMetadata],
        kind: TypeMetadataKind.or,
      };
    });

    describe('when called', () => {
      let result: unknown;

      beforeAll(() => {
        result = unifyCollidingTypeMetadataIds(typeMetadataFixture);
      });

      it('should keep both named nodes', () => {
        const resultTypeMetadata: OrTypeMetadata = result as OrTypeMetadata;

        expect(resultTypeMetadata.children[0]).toBe(personTypeMetadata);
        expect(resultTypeMetadata.children[1]).toBe(userTypeMetadata);
      });
    });
  });

  describe('having two equivalent string TypeMetadata nodes with the same id', () => {
    let firstFooTypeMetadata: TypeMetadata;
    let secondFooTypeMetadata: TypeMetadata;
    let typeMetadataFixture: OrTypeMetadata;

    beforeAll(() => {
      firstFooTypeMetadata = {
        id: 'Foo',
        kind: TypeMetadataKind.stringType,
      };
      secondFooTypeMetadata = {
        id: 'Foo',
        kind: TypeMetadataKind.stringType,
      };
      typeMetadataFixture = {
        children: [firstFooTypeMetadata, secondFooTypeMetadata],
        kind: TypeMetadataKind.or,
      };
    });

    describe('when called', () => {
      let result: unknown;

      beforeAll(() => {
        result = unifyCollidingTypeMetadataIds(typeMetadataFixture);
      });

      it('should retarget both children to one node', () => {
        const resultTypeMetadata: OrTypeMetadata = result as OrTypeMetadata;

        expect(resultTypeMetadata.children[0]).toBe(firstFooTypeMetadata);
        expect(resultTypeMetadata.children[1]).toBe(firstFooTypeMetadata);
      });
    });
  });

  describe('having two inequivalent TypeMetadata nodes with the same id', () => {
    let typeMetadataFixture: AndTypeMetadata;

    beforeAll(() => {
      typeMetadataFixture = {
        children: [
          {
            id: 'Foo',
            kind: TypeMetadataKind.stringType,
          },
          {
            id: 'Foo',
            kind: TypeMetadataKind.floatType,
          },
        ],
        kind: TypeMetadataKind.and,
      };
    });

    describe('when called', () => {
      let result: unknown;

      beforeAll(() => {
        try {
          unifyCollidingTypeMetadataIds(typeMetadataFixture);
        } catch (error: unknown) {
          result = error;
        }
      });

      it('should throw an Error', () => {
        expect(result).toBeInstanceOf(Error);
        expect((result as Error).message).toBe(
          'Duplicated TypeMetadata id "Foo"',
        );
      });
    });
  });

  describe('having two object TypeMetadata nodes with the same id and properties in opposite order', () => {
    let firstFooTypeMetadata: AndTypeMetadata;
    let secondFooTypeMetadata: AndTypeMetadata;
    let typeMetadataFixture: OrTypeMetadata;

    beforeAll(() => {
      firstFooTypeMetadata = {
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
              kind: TypeMetadataKind.booleanType,
            },
            isOptional: false,
            kind: TypeMetadataKind.propertyType,
            property: 'done',
          },
          {
            kind: TypeMetadataKind.objectType,
          },
        ],
        id: 'Foo',
        kind: TypeMetadataKind.and,
      };
      secondFooTypeMetadata = {
        children: [
          {
            child: {
              kind: TypeMetadataKind.booleanType,
            },
            isOptional: false,
            kind: TypeMetadataKind.propertyType,
            property: 'done',
          },
          {
            child: {
              kind: TypeMetadataKind.stringType,
            },
            isOptional: false,
            kind: TypeMetadataKind.propertyType,
            property: 'id',
          },
          {
            kind: TypeMetadataKind.objectType,
          },
        ],
        id: 'Foo',
        kind: TypeMetadataKind.and,
      };
      typeMetadataFixture = {
        children: [firstFooTypeMetadata, secondFooTypeMetadata],
        kind: TypeMetadataKind.or,
      };
    });

    describe('when called', () => {
      let result: unknown;

      beforeAll(() => {
        result = unifyCollidingTypeMetadataIds(typeMetadataFixture);
      });

      it('should merge the titled objects', () => {
        const resultTypeMetadata: OrTypeMetadata = result as OrTypeMetadata;

        expect(resultTypeMetadata.children[0]).toBe(firstFooTypeMetadata);
        expect(resultTypeMetadata.children[1]).toBe(firstFooTypeMetadata);
      });
    });
  });

  describe('having two object TypeMetadata nodes with the same id and a differently typed property', () => {
    let typeMetadataFixture: OrTypeMetadata;

    beforeAll(() => {
      typeMetadataFixture = {
        children: [
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
                kind: TypeMetadataKind.objectType,
              },
            ],
            id: 'Foo',
            kind: TypeMetadataKind.and,
          },
          {
            children: [
              {
                child: {
                  kind: TypeMetadataKind.integerType,
                },
                isOptional: false,
                kind: TypeMetadataKind.propertyType,
                property: 'id',
              },
              {
                kind: TypeMetadataKind.objectType,
              },
            ],
            id: 'Foo',
            kind: TypeMetadataKind.and,
          },
        ],
        kind: TypeMetadataKind.or,
      };
    });

    describe('when called', () => {
      let result: unknown;

      beforeAll(() => {
        try {
          unifyCollidingTypeMetadataIds(typeMetadataFixture);
        } catch (error: unknown) {
          result = error;
        }
      });

      it('should throw an Error', () => {
        expect(result).toBeInstanceOf(Error);
        expect((result as Error).message).toBe(
          'Duplicated TypeMetadata id "Foo"',
        );
      });
    });
  });

  describe('having two object TypeMetadata nodes with the same id and a required versus optional property', () => {
    let typeMetadataFixture: OrTypeMetadata;

    beforeAll(() => {
      typeMetadataFixture = {
        children: [
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
            ],
            id: 'Foo',
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
                property: 'id',
              },
            ],
            id: 'Foo',
            kind: TypeMetadataKind.and,
          },
        ],
        kind: TypeMetadataKind.or,
      };
    });

    describe('when called', () => {
      let result: unknown;

      beforeAll(() => {
        try {
          unifyCollidingTypeMetadataIds(typeMetadataFixture);
        } catch (error: unknown) {
          result = error;
        }
      });

      it('should throw an Error', () => {
        expect(result).toBeInstanceOf(Error);
        expect((result as Error).message).toBe(
          'Duplicated TypeMetadata id "Foo"',
        );
      });
    });
  });

  describe('having two recursive TypeMetadata nodes with the same id', () => {
    let firstNodeTypeMetadata: AndTypeMetadata;
    let secondNodeTypeMetadata: AndTypeMetadata;
    let typeMetadataFixture: OrTypeMetadata;

    beforeAll(() => {
      const firstChildPropertyTypeMetadata: PropertyTypeMetadata = {
        child: {
          kind: TypeMetadataKind.anyType,
        },
        isOptional: false,
        kind: TypeMetadataKind.propertyType,
        property: 'next',
      };
      firstNodeTypeMetadata = {
        children: [firstChildPropertyTypeMetadata],
        id: 'Node',
        kind: TypeMetadataKind.and,
      };
      firstChildPropertyTypeMetadata.child = firstNodeTypeMetadata;

      const secondChildPropertyTypeMetadata: PropertyTypeMetadata = {
        child: {
          kind: TypeMetadataKind.anyType,
        },
        isOptional: false,
        kind: TypeMetadataKind.propertyType,
        property: 'next',
      };
      secondNodeTypeMetadata = {
        children: [secondChildPropertyTypeMetadata],
        id: 'Node',
        kind: TypeMetadataKind.and,
      };
      secondChildPropertyTypeMetadata.child = secondNodeTypeMetadata;

      typeMetadataFixture = {
        children: [firstNodeTypeMetadata, secondNodeTypeMetadata],
        kind: TypeMetadataKind.or,
      };
    });

    describe('when called', () => {
      let result: unknown;

      beforeAll(() => {
        result = unifyCollidingTypeMetadataIds(typeMetadataFixture);
      });

      it('should merge the recursive titled nodes', () => {
        const resultTypeMetadata: OrTypeMetadata = result as OrTypeMetadata;
        const propertyTypeMetadata: PropertyTypeMetadata | undefined =
          findPropertyTypeMetadata(resultTypeMetadata, 'next');

        expect(resultTypeMetadata.children[0]).toBe(firstNodeTypeMetadata);
        expect(resultTypeMetadata.children[1]).toBe(firstNodeTypeMetadata);
        expect(propertyTypeMetadata?.child).toBe(firstNodeTypeMetadata);
      });
    });
  });

  describe('having two recursive TypeMetadata nodes with the same id and different child types', () => {
    let typeMetadataFixture: OrTypeMetadata;

    beforeAll(() => {
      const firstChildPropertyTypeMetadata: PropertyTypeMetadata = {
        child: {
          kind: TypeMetadataKind.anyType,
        },
        isOptional: false,
        kind: TypeMetadataKind.propertyType,
        property: 'next',
      };
      const firstNodeTypeMetadata: AndTypeMetadata = {
        children: [firstChildPropertyTypeMetadata],
        id: 'Node',
        kind: TypeMetadataKind.and,
      };
      firstChildPropertyTypeMetadata.child = firstNodeTypeMetadata;

      typeMetadataFixture = {
        children: [
          firstNodeTypeMetadata,
          {
            children: [
              {
                child: {
                  kind: TypeMetadataKind.stringType,
                },
                isOptional: false,
                kind: TypeMetadataKind.propertyType,
                property: 'next',
              },
            ],
            id: 'Node',
            kind: TypeMetadataKind.and,
          },
        ],
        kind: TypeMetadataKind.or,
      };
    });

    describe('when called', () => {
      let result: unknown;

      beforeAll(() => {
        try {
          unifyCollidingTypeMetadataIds(typeMetadataFixture);
        } catch (error: unknown) {
          result = error;
        }
      });

      it('should throw an Error', () => {
        expect(result).toBeInstanceOf(Error);
        expect((result as Error).message).toBe(
          'Duplicated TypeMetadata id "Node"',
        );
      });
    });
  });

  describe('having two parent TypeMetadata nodes with the same id and differently named but equally shaped children', () => {
    let typeMetadataFixture: OrTypeMetadata;

    beforeAll(() => {
      typeMetadataFixture = {
        children: [
          {
            children: [
              {
                child: {
                  id: 'Bar',
                  kind: TypeMetadataKind.stringType,
                },
                isOptional: false,
                kind: TypeMetadataKind.propertyType,
                property: 'child',
              },
            ],
            id: 'Foo',
            kind: TypeMetadataKind.and,
          },
          {
            children: [
              {
                child: {
                  id: 'Baz',
                  kind: TypeMetadataKind.stringType,
                },
                isOptional: false,
                kind: TypeMetadataKind.propertyType,
                property: 'child',
              },
            ],
            id: 'Foo',
            kind: TypeMetadataKind.and,
          },
        ],
        kind: TypeMetadataKind.or,
      };
    });

    describe('when called', () => {
      let result: unknown;

      beforeAll(() => {
        try {
          unifyCollidingTypeMetadataIds(typeMetadataFixture);
        } catch (error: unknown) {
          result = error;
        }
      });

      it('should throw an Error', () => {
        expect(result).toBeInstanceOf(Error);
        expect((result as Error).message).toBe(
          'Duplicated TypeMetadata id "Foo"',
        );
      });
    });
  });

  describe('having two parent TypeMetadata nodes with the same id and independently built children that share an id', () => {
    let firstBarTypeMetadata: TypeMetadata;
    let firstFooTypeMetadata: AndTypeMetadata;
    let secondBarTypeMetadata: TypeMetadata;
    let secondFooTypeMetadata: AndTypeMetadata;
    let typeMetadataFixture: OrTypeMetadata;

    beforeAll(() => {
      firstBarTypeMetadata = {
        id: 'Bar',
        kind: TypeMetadataKind.stringType,
      };
      secondBarTypeMetadata = {
        id: 'Bar',
        kind: TypeMetadataKind.stringType,
      };
      firstFooTypeMetadata = {
        children: [
          {
            child: firstBarTypeMetadata,
            isOptional: false,
            kind: TypeMetadataKind.propertyType,
            property: 'child',
          },
        ],
        id: 'Foo',
        kind: TypeMetadataKind.and,
      };
      secondFooTypeMetadata = {
        children: [
          {
            child: secondBarTypeMetadata,
            isOptional: false,
            kind: TypeMetadataKind.propertyType,
            property: 'child',
          },
        ],
        id: 'Foo',
        kind: TypeMetadataKind.and,
      };
      typeMetadataFixture = {
        children: [firstFooTypeMetadata, secondFooTypeMetadata],
        kind: TypeMetadataKind.or,
      };
    });

    describe('when called', () => {
      let result: unknown;

      beforeAll(() => {
        result = unifyCollidingTypeMetadataIds(typeMetadataFixture);
      });

      it('should merge both collision classes', () => {
        const resultTypeMetadata: OrTypeMetadata = result as OrTypeMetadata;
        const propertyTypeMetadata: PropertyTypeMetadata | undefined =
          findPropertyTypeMetadata(resultTypeMetadata, 'child');

        expect(resultTypeMetadata.children[0]).toBe(firstFooTypeMetadata);
        expect(resultTypeMetadata.children[1]).toBe(firstFooTypeMetadata);
        expect(propertyTypeMetadata?.child).toBe(firstBarTypeMetadata);
      });
    });
  });

  describe('having an array TypeMetadata whose item TypeMetadata is a clone with the same id', () => {
    let itemTypeMetadata: AndTypeMetadata;
    let clonedItemTypeMetadata: AndTypeMetadata;
    let typeMetadataFixture: AndTypeMetadata;

    beforeAll(() => {
      itemTypeMetadata = {
        children: [
          {
            child: {
              kind: TypeMetadataKind.stringType,
            },
            isOptional: false,
            kind: TypeMetadataKind.propertyType,
            property: 'id',
          },
        ],
        id: 'TodoV1',
        kind: TypeMetadataKind.and,
      };
      clonedItemTypeMetadata = {
        children: itemTypeMetadata.children,
        id: 'TodoV1',
        kind: TypeMetadataKind.and,
      };
      typeMetadataFixture = {
        children: [
          {
            child: itemTypeMetadata,
            isOptional: false,
            kind: TypeMetadataKind.propertyType,
            property: 'todo',
          },
          {
            child: {
              child: clonedItemTypeMetadata,
              kind: TypeMetadataKind.arrayType,
            },
            isOptional: false,
            kind: TypeMetadataKind.propertyType,
            property: 'items',
          },
        ],
        kind: TypeMetadataKind.and,
      };
    });

    describe('when called', () => {
      let result: unknown;

      beforeAll(() => {
        result = unifyCollidingTypeMetadataIds(typeMetadataFixture);
      });

      it('should retarget the array item to the titled node', () => {
        const itemsPropertyTypeMetadata: PropertyTypeMetadata | undefined =
          findPropertyTypeMetadata(result as TypeMetadata, 'items');
        const todoPropertyTypeMetadata: PropertyTypeMetadata | undefined =
          findPropertyTypeMetadata(result as TypeMetadata, 'todo');
        const arrayTypeMetadata: ArrayTypeMetadata | undefined =
          itemsPropertyTypeMetadata?.child.kind === TypeMetadataKind.arrayType
            ? itemsPropertyTypeMetadata.child
            : undefined;

        expect(todoPropertyTypeMetadata?.child).toBe(itemTypeMetadata);
        expect(arrayTypeMetadata?.child).toBe(itemTypeMetadata);
      });
    });
  });

  describe('having inequivalent titled TypeMetadata nodes that are not reachable from the root', () => {
    let typeMetadataFixture: TypeMetadata;
    let titledTypeMetadata: TypeMetadata[];

    beforeAll(() => {
      typeMetadataFixture = {
        kind: TypeMetadataKind.noneType,
      };
      titledTypeMetadata = [
        {
          id: 'Foo',
          kind: TypeMetadataKind.stringType,
        },
        {
          id: 'Foo',
          kind: TypeMetadataKind.floatType,
        },
      ];
    });

    describe('when called', () => {
      let result: unknown;

      beforeAll(() => {
        try {
          unifyCollidingTypeMetadataIds(
            typeMetadataFixture,
            titledTypeMetadata,
          );
        } catch (error: unknown) {
          result = error;
        }
      });

      it('should throw an Error', () => {
        expect(result).toBeInstanceOf(Error);
        expect((result as Error).message).toBe(
          'Duplicated TypeMetadata id "Foo"',
        );
      });
    });
  });

  describe('having equivalent titled TypeMetadata nodes that are not reachable from the root', () => {
    let typeMetadataFixture: TypeMetadata;

    beforeAll(() => {
      typeMetadataFixture = {
        kind: TypeMetadataKind.noneType,
      };
    });

    describe('when called', () => {
      let result: unknown;

      beforeAll(() => {
        result = unifyCollidingTypeMetadataIds(typeMetadataFixture, [
          {
            id: 'Foo',
            kind: TypeMetadataKind.stringType,
          },
          {
            id: 'Foo',
            kind: TypeMetadataKind.stringType,
          },
        ]);
      });

      it('should return the root TypeMetadata', () => {
        expect(result).toBe(typeMetadataFixture);
      });
    });
  });

  describe('having a string index signature TypeMetadata whose child is a colliding titled clone', () => {
    let firstFooTypeMetadata: TypeMetadata;
    let secondFooTypeMetadata: TypeMetadata;
    let typeMetadataFixture: AndTypeMetadata;

    beforeAll(() => {
      firstFooTypeMetadata = {
        id: 'Foo',
        kind: TypeMetadataKind.stringType,
      };
      secondFooTypeMetadata = {
        id: 'Foo',
        kind: TypeMetadataKind.stringType,
      };
      typeMetadataFixture = {
        children: [
          firstFooTypeMetadata,
          {
            child: secondFooTypeMetadata,
            kind: TypeMetadataKind.stringIndexSignatureType,
          },
        ],
        kind: TypeMetadataKind.and,
      };
    });

    describe('when called', () => {
      let result: unknown;

      beforeAll(() => {
        result = unifyCollidingTypeMetadataIds(typeMetadataFixture);
      });

      it('should retarget the index signature child', () => {
        const resultTypeMetadata: AndTypeMetadata = result as AndTypeMetadata;
        const indexSignatureTypeMetadata: TypeMetadata | undefined =
          resultTypeMetadata.children[1];

        expect(resultTypeMetadata.children[0]).toBe(firstFooTypeMetadata);
        expect(
          indexSignatureTypeMetadata?.kind ===
            TypeMetadataKind.stringIndexSignatureType
            ? indexSignatureTypeMetadata.child
            : undefined,
        ).toBe(firstFooTypeMetadata);
      });
    });
  });
});
