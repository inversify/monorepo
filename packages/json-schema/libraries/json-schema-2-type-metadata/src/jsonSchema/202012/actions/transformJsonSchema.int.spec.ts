import { beforeAll, describe, expect, it } from 'vitest';

import {
  type OrTypeMetadata,
  type PropertyTypeMetadata,
  type TypeMetadata,
  TypeMetadataKind,
} from '@inversifyjs/json-schema-type-metadata';
import {
  type JsonSchema,
  type JsonSchemaObject,
} from '@inversifyjs/json-schema-types/2020-12';
import { JsonSchemaResolver } from '@inversifyjs/json-schema-utils/2020-12';

import { type TransformJsonSchemaContext } from '../models/TransformJsonSchemaContext.js';
import { transformJsonSchema } from './transformJsonSchema.js';

function generateTransformJsonSchemaContext(
  schemas: JsonSchema[] = [],
): TransformJsonSchemaContext {
  const schemaById: Map<string, JsonSchema> = new Map();

  for (const schema of schemas) {
    if (typeof schema === 'object' && schema.$id !== undefined) {
      schemaById.set(schema.$id, schema);
    }
  }

  return {
    resolver: new JsonSchemaResolver((id: string) => schemaById.get(id)),
  };
}

function collectTypeMetadata(
  typeMetadata: TypeMetadata,
  seenTypeMetadataSet: Set<TypeMetadata> = new Set(),
): TypeMetadata[] {
  if (seenTypeMetadataSet.has(typeMetadata)) {
    return [];
  }

  seenTypeMetadataSet.add(typeMetadata);

  const collectedTypeMetadata: TypeMetadata[] = [typeMetadata];

  switch (typeMetadata.kind) {
    case TypeMetadataKind.and:
    case TypeMetadataKind.or:
      for (const child of typeMetadata.children) {
        collectedTypeMetadata.push(
          ...collectTypeMetadata(child, seenTypeMetadataSet),
        );
      }
      break;
    case TypeMetadataKind.arrayType:
    case TypeMetadataKind.propertyType:
    case TypeMetadataKind.stringIndexSignatureType:
      collectedTypeMetadata.push(
        ...collectTypeMetadata(typeMetadata.child, seenTypeMetadataSet),
      );
      break;
    default:
      break;
  }

  return collectedTypeMetadata;
}

function findPropertyTypeMetadata(
  typeMetadata: TypeMetadata,
  property: string,
): PropertyTypeMetadata | undefined {
  return collectTypeMetadata(typeMetadata).find(
    (node: TypeMetadata): node is PropertyTypeMetadata =>
      node.kind === TypeMetadataKind.propertyType && node.property === property,
  );
}

describe(transformJsonSchema, () => {
  describe('having a same-document untitled $ref wrapper A targeting titled B, and B.properties.a targeting A', () => {
    let jsonSchemaFixture: JsonSchemaObject;

    beforeAll(() => {
      jsonSchemaFixture = {
        $defs: {
          A: {
            $ref: '#/$defs/B',
          },
          B: {
            properties: {
              a: {
                $ref: '#/$defs/A',
              },
            },
            required: ['a'],
            title: 'B',
            type: 'object',
          },
        },
        $id: 'https://example.com/root',
        $ref: '#/$defs/A',
      };
    });

    describe('when called', () => {
      let result: unknown;

      beforeAll(() => {
        result = transformJsonSchema(
          jsonSchemaFixture,
          generateTransformJsonSchemaContext([jsonSchemaFixture]),
        );
      });

      it('should reuse one TypeMetadata node for B and the recursive untitled $ref wrapper', () => {
        const resultTypeMetadata: TypeMetadata = result as TypeMetadata;
        const propertyTypeMetadata: PropertyTypeMetadata | undefined =
          findPropertyTypeMetadata(resultTypeMetadata, 'a');

        expect(propertyTypeMetadata?.child).toBe(resultTypeMetadata);
      });

      it('should keep TypeMetadata ids unique', () => {
        const typeMetadataIds: string[] = collectTypeMetadata(
          result as TypeMetadata,
        )
          .map((typeMetadata: TypeMetadata) => typeMetadata.id)
          .filter((id: string | undefined): id is string => id !== undefined);

        expect(typeMetadataIds).toStrictEqual([...new Set(typeMetadataIds)]);
      });
    });
  });

  describe('having a same-document untitled $ref wrapper A targeting titled B as anyOf siblings, and B.properties.a targeting A', () => {
    let jsonSchemaFixture: JsonSchemaObject;

    beforeAll(() => {
      jsonSchemaFixture = {
        $defs: {
          A: {
            $ref: '#/$defs/B',
          },
          B: {
            properties: {
              a: {
                $ref: '#/$defs/A',
              },
            },
            required: ['a'],
            title: 'B',
            type: 'object',
          },
        },
        $id: 'https://example.com/root',
        anyOf: [
          {
            $ref: '#/$defs/A',
          },
          {
            $ref: '#/$defs/B',
          },
        ],
      };
    });

    describe('when called', () => {
      let result: unknown;

      beforeAll(() => {
        result = transformJsonSchema(
          jsonSchemaFixture,
          generateTransformJsonSchemaContext([jsonSchemaFixture]),
        );
      });

      it('should reuse one TypeMetadata node for A, B, and the recursive untitled $ref wrapper', () => {
        const resultTypeMetadata: OrTypeMetadata = result as OrTypeMetadata;
        const titledTypeMetadata: TypeMetadata = resultTypeMetadata
          .children[0] as TypeMetadata;
        const propertyTypeMetadata: PropertyTypeMetadata | undefined =
          findPropertyTypeMetadata(resultTypeMetadata, 'a');

        expect(resultTypeMetadata.children[1]).toBe(titledTypeMetadata);
        expect(propertyTypeMetadata?.child).toBe(titledTypeMetadata);
      });

      it('should keep TypeMetadata ids unique', () => {
        const typeMetadataIds: string[] = collectTypeMetadata(
          result as TypeMetadata,
        )
          .map((typeMetadata: TypeMetadata) => typeMetadata.id)
          .filter((id: string | undefined): id is string => id !== undefined);

        expect(typeMetadataIds).toStrictEqual([...new Set(typeMetadataIds)]);
      });
    });
  });

  describe('having two equivalent titled object schemas with nested object properties', () => {
    let jsonSchemaFixture: JsonSchemaObject;

    beforeAll(() => {
      jsonSchemaFixture = {
        properties: {
          a: {
            properties: {
              address: {
                properties: {
                  city: {
                    type: 'string',
                  },
                },
                required: ['city'],
                type: 'object',
              },
            },
            required: ['address'],
            title: 'Foo',
            type: 'object',
          },
          b: {
            properties: {
              address: {
                properties: {
                  city: {
                    type: 'string',
                  },
                },
                required: ['city'],
                type: 'object',
              },
            },
            required: ['address'],
            title: 'Foo',
            type: 'object',
          },
        },
        required: ['a', 'b'],
        type: 'object',
      };
    });

    describe('when called', () => {
      let result: unknown;

      beforeAll(() => {
        result = transformJsonSchema(
          jsonSchemaFixture,
          generateTransformJsonSchemaContext(),
        );
      });

      it('should reuse one TypeMetadata node for both titled objects', () => {
        const firstFooTypeMetadata: TypeMetadata | undefined =
          findPropertyTypeMetadata(result as TypeMetadata, 'a')?.child;
        const secondFooTypeMetadata: TypeMetadata | undefined =
          findPropertyTypeMetadata(result as TypeMetadata, 'b')?.child;

        expect(firstFooTypeMetadata).toBe(secondFooTypeMetadata);
        expect(firstFooTypeMetadata?.id).toBe('Foo');
      });

      it('should keep TypeMetadata ids unique', () => {
        const typeMetadataIds: string[] = collectTypeMetadata(
          result as TypeMetadata,
        )
          .map((typeMetadata: TypeMetadata) => typeMetadata.id)
          .filter((id: string | undefined): id is string => id !== undefined);

        expect(typeMetadataIds).toStrictEqual([...new Set(typeMetadataIds)]);
      });
    });
  });

  describe('having two titled object schemas that differ in a nested object property', () => {
    let jsonSchemaFixture: JsonSchemaObject;

    beforeAll(() => {
      jsonSchemaFixture = {
        properties: {
          a: {
            properties: {
              address: {
                properties: {
                  city: {
                    type: 'string',
                  },
                },
                required: ['city'],
                type: 'object',
              },
            },
            required: ['address'],
            title: 'Foo',
            type: 'object',
          },
          b: {
            properties: {
              address: {
                properties: {
                  city: {
                    type: 'number',
                  },
                },
                required: ['city'],
                type: 'object',
              },
            },
            required: ['address'],
            title: 'Foo',
            type: 'object',
          },
        },
        required: ['a', 'b'],
        type: 'object',
      };
    });

    describe('when called', () => {
      let result: unknown;

      beforeAll(() => {
        try {
          transformJsonSchema(
            jsonSchemaFixture,
            generateTransformJsonSchemaContext(),
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

  describe('having two equivalent titled object schemas with array properties', () => {
    let jsonSchemaFixture: JsonSchemaObject;

    beforeAll(() => {
      jsonSchemaFixture = {
        properties: {
          a: {
            properties: {
              tags: {
                items: {
                  type: 'string',
                },
                type: 'array',
              },
            },
            required: ['tags'],
            title: 'Foo',
            type: 'object',
          },
          b: {
            properties: {
              tags: {
                items: {
                  type: 'string',
                },
                type: 'array',
              },
            },
            required: ['tags'],
            title: 'Foo',
            type: 'object',
          },
        },
        required: ['a', 'b'],
        type: 'object',
      };
    });

    describe('when called', () => {
      let result: unknown;

      beforeAll(() => {
        result = transformJsonSchema(
          jsonSchemaFixture,
          generateTransformJsonSchemaContext(),
        );
      });

      it('should reuse one TypeMetadata node for both titled objects', () => {
        const firstFooTypeMetadata: TypeMetadata | undefined =
          findPropertyTypeMetadata(result as TypeMetadata, 'a')?.child;
        const secondFooTypeMetadata: TypeMetadata | undefined =
          findPropertyTypeMetadata(result as TypeMetadata, 'b')?.child;

        expect(firstFooTypeMetadata).toBe(secondFooTypeMetadata);
        expect(firstFooTypeMetadata?.id).toBe('Foo');
      });

      it('should keep TypeMetadata ids unique', () => {
        const typeMetadataIds: string[] = collectTypeMetadata(
          result as TypeMetadata,
        )
          .map((typeMetadata: TypeMetadata) => typeMetadata.id)
          .filter((id: string | undefined): id is string => id !== undefined);

        expect(typeMetadataIds).toStrictEqual([...new Set(typeMetadataIds)]);
      });
    });
  });

  describe('having two equivalent titled object schemas with array of object properties', () => {
    let jsonSchemaFixture: JsonSchemaObject;

    beforeAll(() => {
      jsonSchemaFixture = {
        properties: {
          a: {
            properties: {
              items: {
                items: {
                  properties: {
                    id: {
                      type: 'string',
                    },
                  },
                  required: ['id'],
                  type: 'object',
                },
                type: 'array',
              },
            },
            required: ['items'],
            title: 'Foo',
            type: 'object',
          },
          b: {
            properties: {
              items: {
                items: {
                  properties: {
                    id: {
                      type: 'string',
                    },
                  },
                  required: ['id'],
                  type: 'object',
                },
                type: 'array',
              },
            },
            required: ['items'],
            title: 'Foo',
            type: 'object',
          },
        },
        required: ['a', 'b'],
        type: 'object',
      };
    });

    describe('when called', () => {
      let result: unknown;

      beforeAll(() => {
        result = transformJsonSchema(
          jsonSchemaFixture,
          generateTransformJsonSchemaContext(),
        );
      });

      it('should reuse one TypeMetadata node for both titled objects', () => {
        const firstFooTypeMetadata: TypeMetadata | undefined =
          findPropertyTypeMetadata(result as TypeMetadata, 'a')?.child;
        const secondFooTypeMetadata: TypeMetadata | undefined =
          findPropertyTypeMetadata(result as TypeMetadata, 'b')?.child;

        expect(firstFooTypeMetadata).toBe(secondFooTypeMetadata);
        expect(firstFooTypeMetadata?.id).toBe('Foo');
      });

      it('should keep TypeMetadata ids unique', () => {
        const typeMetadataIds: string[] = collectTypeMetadata(
          result as TypeMetadata,
        )
          .map((typeMetadata: TypeMetadata) => typeMetadata.id)
          .filter((id: string | undefined): id is string => id !== undefined);

        expect(typeMetadataIds).toStrictEqual([...new Set(typeMetadataIds)]);
      });
    });
  });

  describe('having two titled object schemas that differ in an array item type', () => {
    let jsonSchemaFixture: JsonSchemaObject;

    beforeAll(() => {
      jsonSchemaFixture = {
        properties: {
          a: {
            properties: {
              items: {
                items: {
                  properties: {
                    id: {
                      type: 'string',
                    },
                  },
                  required: ['id'],
                  type: 'object',
                },
                type: 'array',
              },
            },
            required: ['items'],
            title: 'Foo',
            type: 'object',
          },
          b: {
            properties: {
              items: {
                items: {
                  properties: {
                    id: {
                      type: 'number',
                    },
                  },
                  required: ['id'],
                  type: 'object',
                },
                type: 'array',
              },
            },
            required: ['items'],
            title: 'Foo',
            type: 'object',
          },
        },
        required: ['a', 'b'],
        type: 'object',
      };
    });

    describe('when called', () => {
      let result: unknown;

      beforeAll(() => {
        try {
          transformJsonSchema(
            jsonSchemaFixture,
            generateTransformJsonSchemaContext(),
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

  describe('having two equivalent titled object schemas with nested titled object and array properties', () => {
    let jsonSchemaFixture: JsonSchemaObject;

    beforeAll(() => {
      jsonSchemaFixture = {
        properties: {
          a: {
            properties: {
              address: {
                properties: {
                  city: {
                    type: 'string',
                  },
                },
                required: ['city'],
                title: 'Address',
                type: 'object',
              },
              tags: {
                items: {
                  type: 'string',
                },
                type: 'array',
              },
            },
            required: ['address', 'tags'],
            title: 'Foo',
            type: 'object',
          },
          b: {
            properties: {
              address: {
                properties: {
                  city: {
                    type: 'string',
                  },
                },
                required: ['city'],
                title: 'Address',
                type: 'object',
              },
              tags: {
                items: {
                  type: 'string',
                },
                type: 'array',
              },
            },
            required: ['address', 'tags'],
            title: 'Foo',
            type: 'object',
          },
        },
        required: ['a', 'b'],
        type: 'object',
      };
    });

    describe('when called', () => {
      let result: unknown;

      beforeAll(() => {
        result = transformJsonSchema(
          jsonSchemaFixture,
          generateTransformJsonSchemaContext(),
        );
      });

      it('should reuse one TypeMetadata node for both titled objects and both nested titles', () => {
        const firstFooTypeMetadata: TypeMetadata | undefined =
          findPropertyTypeMetadata(result as TypeMetadata, 'a')?.child;
        const secondFooTypeMetadata: TypeMetadata | undefined =
          findPropertyTypeMetadata(result as TypeMetadata, 'b')?.child;
        const addressTypeMetadata: TypeMetadata | undefined =
          firstFooTypeMetadata === undefined
            ? undefined
            : findPropertyTypeMetadata(firstFooTypeMetadata, 'address')?.child;

        expect(firstFooTypeMetadata).toBe(secondFooTypeMetadata);
        expect(firstFooTypeMetadata?.id).toBe('Foo');
        expect(addressTypeMetadata?.id).toBe('Address');
      });

      it('should keep TypeMetadata ids unique', () => {
        const typeMetadataIds: string[] = collectTypeMetadata(
          result as TypeMetadata,
        )
          .map((typeMetadata: TypeMetadata) => typeMetadata.id)
          .filter((id: string | undefined): id is string => id !== undefined);

        expect(typeMetadataIds).toStrictEqual([...new Set(typeMetadataIds)]);
      });
    });
  });

  describe('having two titled object schemas with the same nested title and a different nested property type', () => {
    let jsonSchemaFixture: JsonSchemaObject;

    beforeAll(() => {
      jsonSchemaFixture = {
        properties: {
          a: {
            properties: {
              address: {
                properties: {
                  city: {
                    type: 'string',
                  },
                },
                required: ['city'],
                title: 'Address',
                type: 'object',
              },
            },
            required: ['address'],
            title: 'Foo',
            type: 'object',
          },
          b: {
            properties: {
              address: {
                properties: {
                  city: {
                    type: 'number',
                  },
                },
                required: ['city'],
                title: 'Address',
                type: 'object',
              },
            },
            required: ['address'],
            title: 'Foo',
            type: 'object',
          },
        },
        required: ['a', 'b'],
        type: 'object',
      };
    });

    describe('when called', () => {
      let result: unknown;

      beforeAll(() => {
        try {
          transformJsonSchema(
            jsonSchemaFixture,
            generateTransformJsonSchemaContext(),
          );
        } catch (error: unknown) {
          result = error;
        }
      });

      it('should throw an Error', () => {
        expect(result).toBeInstanceOf(Error);
        expect((result as Error).message).toBe(
          'Duplicated TypeMetadata id "Address"',
        );
      });
    });
  });
});
