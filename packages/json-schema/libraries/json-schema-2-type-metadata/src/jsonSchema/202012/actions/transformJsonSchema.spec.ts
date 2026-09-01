import { beforeAll, describe, expect, it } from 'vitest';

import {
  type AndTypeMetadata,
  type PropertyTypeMetadata,
  type TypeMetadata,
  TypeMetadataKind,
} from '@inversifyjs/json-schema-type-metadata';
import {
  type JsonSchema,
  type JsonSchemaBoolean,
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

describe(transformJsonSchema, () => {
  describe.each<[JsonSchemaBoolean, TypeMetadata]>([
    [false, { kind: TypeMetadataKind.noneType }],
    [true, { kind: TypeMetadataKind.anyType }],
  ])(
    'having a boolean %s schema',
    (
      jsonSchemaFixture: JsonSchemaBoolean,
      expectedTypeMetadata: TypeMetadata,
    ) => {
      describe('when called', () => {
        let result: unknown;

        beforeAll(() => {
          result = transformJsonSchema(
            jsonSchemaFixture,
            generateTransformJsonSchemaContext(),
          );
        });

        it('should return expected TypeMetadata', () => {
          expect(result).toStrictEqual(expectedTypeMetadata);
        });
      });
    },
  );

  describe('having a self referenced JsonSchema', () => {
    let jsonSchemaFixture: JsonSchemaObject;

    beforeAll(() => {
      jsonSchemaFixture = {
        $id: 'https://example.com/fixture',
        $ref: '#',
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

      it('should return TypeMetadata', () => {
        const expected: TypeMetadata = {
          kind: TypeMetadataKind.anyType,
        };

        expect(result).toStrictEqual(expected);
      });
    });
  });

  describe('having a circular referenced JsonSchema with no other constraints', () => {
    let jsonSchemaFixture: JsonSchemaObject;
    let childJsonSchemaFixture: JsonSchemaObject;

    beforeAll(() => {
      jsonSchemaFixture = {
        $id: 'https://example.com/schema',
        $ref: 'https://example.com/child',
      };
      childJsonSchemaFixture = {
        $id: 'https://example.com/child',
        $ref: 'https://example.com/schema',
      };
    });

    describe('when called', () => {
      let result: unknown;

      beforeAll(() => {
        result = transformJsonSchema(
          jsonSchemaFixture,
          generateTransformJsonSchemaContext([
            childJsonSchemaFixture,
            jsonSchemaFixture,
          ]),
        );
      });

      it('should return TypeMetadata', () => {
        const expected: TypeMetadata = {
          kind: TypeMetadataKind.anyType,
        };

        expect(result).toStrictEqual(expected);
      });
    });
  });

  describe('having a circular referenced JsonSchema with child additional constraints', () => {
    let jsonSchemaFixture: JsonSchemaObject;
    let childJsonSchemaFixture: JsonSchemaObject;

    beforeAll(() => {
      jsonSchemaFixture = {
        $id: 'https://example.com/schema',
        $ref: 'https://example.com/child',
      };
      childJsonSchemaFixture = {
        $id: 'https://example.com/child',
        $ref: 'https://example.com/schema',
        type: 'object',
      };
    });

    describe('when called', () => {
      let result: unknown;

      beforeAll(() => {
        result = transformJsonSchema(
          jsonSchemaFixture,
          generateTransformJsonSchemaContext([
            childJsonSchemaFixture,
            jsonSchemaFixture,
          ]),
        );
      });

      it('should return TypeMetadata', () => {
        const inner: AndTypeMetadata = {
          children: [],
          kind: TypeMetadataKind.and,
        };
        inner.children.push(inner, {
          kind: TypeMetadataKind.objectType,
        });

        const expected: AndTypeMetadata = {
          children: [
            inner,
            {
              kind: TypeMetadataKind.objectType,
            },
          ],
          kind: TypeMetadataKind.and,
        };

        expect(result).toStrictEqual(expected);
      });
    });
  });

  describe('having a circular referenced JsonSchema with parent and child additional constraints', () => {
    let jsonSchemaFixture: JsonSchemaObject;
    let childJsonSchemaFixture: JsonSchemaObject;

    beforeAll(() => {
      jsonSchemaFixture = {
        $id: 'https://example.com/schema',
        $ref: 'https://example.com/child',
        properties: {
          foo: {
            type: 'string',
          },
        },
        type: 'object',
      };
      childJsonSchemaFixture = {
        $id: 'https://example.com/child',
        $ref: 'https://example.com/schema',
        properties: {
          bar: {
            type: 'string',
          },
        },
        type: 'object',
      };
    });

    describe('when called', () => {
      let result: unknown;

      beforeAll(() => {
        result = transformJsonSchema(
          jsonSchemaFixture,
          generateTransformJsonSchemaContext([
            childJsonSchemaFixture,
            jsonSchemaFixture,
          ]),
        );
      });

      it('should return TypeMetadata', () => {
        const childAnd: AndTypeMetadata = {
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
        const inner: AndTypeMetadata = {
          children: [
            {
              child: {
                kind: TypeMetadataKind.stringType,
              },
              isOptional: true,
              kind: TypeMetadataKind.propertyType,
              property: 'foo',
            },
            childAnd,
            {
              kind: TypeMetadataKind.objectType,
            },
          ],
          kind: TypeMetadataKind.and,
        };

        childAnd.children.push(inner, {
          kind: TypeMetadataKind.objectType,
        });

        const expected: AndTypeMetadata = {
          children: [
            {
              child: {
                kind: TypeMetadataKind.stringType,
              },
              isOptional: true,
              kind: TypeMetadataKind.propertyType,
              property: 'foo',
            },
            childAnd,
            {
              kind: TypeMetadataKind.objectType,
            },
          ],
          kind: TypeMetadataKind.and,
        };

        expect(result).toStrictEqual(expected);
      });
    });
  });

  describe.each<[string, JsonSchemaObject, TypeMetadata]>([
    ['any schema', {}, { kind: TypeMetadataKind.anyType }],
    [
      'an schema with a title',
      {
        title: 'Foo',
        type: 'string',
      },
      {
        id: 'Foo',
        kind: TypeMetadataKind.stringType,
      },
    ],
    [
      'an schema with additional properties',
      {
        additionalProperties: true,
      },
      {
        child: {
          kind: TypeMetadataKind.anyType,
        },
        kind: TypeMetadataKind.stringIndexSignatureType,
      },
    ],
    [
      'an schema with allOf properties',
      {
        allOf: [
          {
            properties: {
              foo: {
                type: 'string',
              },
            },
          },
          {
            properties: {
              bar: {
                type: 'string',
              },
            },
          },
        ],
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
        ],
        kind: TypeMetadataKind.and,
      },
    ],
    [
      'an schema with allOf overlapping properties of the same type',
      {
        allOf: [
          {
            properties: {
              bar: {
                type: 'boolean',
              },
              foo: {
                type: 'string',
              },
            },
          },
          {
            properties: {
              foo: {
                type: 'string',
              },
            },
          },
          {
            properties: {
              bar: {
                type: 'boolean',
              },
              foo: {
                type: 'string',
              },
            },
          },
        ],
      },
      {
        children: [
          {
            child: {
              kind: TypeMetadataKind.booleanType,
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
            property: 'foo',
          },
        ],
        kind: TypeMetadataKind.and,
      },
    ],
    [
      'an schema with allOf overlapping required properties of disjoint types',
      {
        allOf: [
          {
            properties: {
              id: {
                type: 'string',
              },
            },
            required: ['id'],
          },
          {
            properties: {
              id: {
                type: 'number',
              },
            },
            required: ['id'],
          },
        ],
      },
      {
        kind: TypeMetadataKind.noneType,
      },
    ],
    [
      'an schema with allOf overlapping optional properties of disjoint types',
      {
        allOf: [
          {
            properties: {
              id: {
                type: 'string',
              },
            },
          },
          {
            properties: {
              id: {
                type: 'number',
              },
            },
          },
        ],
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
      'an schema with allOf including a boolean true schema',
      {
        allOf: [
          true,
          {
            type: 'string',
          },
        ],
      },
      {
        kind: TypeMetadataKind.stringType,
      },
    ],
    [
      'an schema with allOf including a boolean false schema',
      {
        allOf: [
          false,
          {
            type: 'string',
          },
        ],
      },
      {
        kind: TypeMetadataKind.noneType,
      },
    ],
    [
      'an schema with a single allOf child',
      {
        allOf: [
          {
            type: 'string',
          },
        ],
      },
      {
        kind: TypeMetadataKind.stringType,
      },
    ],
    [
      'an schema with anyOf including a boolean true schema',
      {
        anyOf: [
          true,
          {
            type: 'string',
          },
        ],
      },
      {
        kind: TypeMetadataKind.anyType,
      },
    ],
    [
      'an schema with anyOf including a boolean false schema',
      {
        anyOf: [
          false,
          {
            type: 'string',
          },
        ],
      },
      {
        kind: TypeMetadataKind.stringType,
      },
    ],
    [
      'an schema with a single anyOf child',
      {
        anyOf: [
          {
            type: 'string',
          },
        ],
      },
      {
        kind: TypeMetadataKind.stringType,
      },
    ],
    [
      'an schema with type and a tautology allOf',
      {
        allOf: [true],
        type: 'string',
      },
      {
        kind: TypeMetadataKind.stringType,
      },
    ],
    [
      'an schema with nested simplifiable anyOf',
      {
        anyOf: [
          {
            allOf: [true],
          },
          {
            type: 'string',
          },
        ],
      },
      {
        kind: TypeMetadataKind.anyType,
      },
    ],
    [
      'an schema with nested simplifiable allOf',
      {
        allOf: [
          {
            anyOf: [false],
          },
          {
            type: 'string',
          },
        ],
      },
      {
        kind: TypeMetadataKind.noneType,
      },
    ],
    [
      'an schema with anyOf properties',
      {
        anyOf: [
          {
            properties: {
              foo: {
                type: 'string',
              },
            },
          },
          {
            properties: {
              bar: {
                type: 'string',
              },
            },
          },
        ],
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
        ],
        kind: TypeMetadataKind.or,
      },
    ],
    [
      'an schema with oneOf properties',
      {
        oneOf: [
          {
            properties: {
              foo: {
                type: 'string',
              },
            },
          },
          {
            properties: {
              bar: {
                type: 'string',
              },
            },
          },
        ],
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
        ],
        kind: TypeMetadataKind.or,
      },
    ],
    [
      'an schema with const',
      {
        const: { foo: 'bar' },
      },
      {
        kind: TypeMetadataKind.literalType,
        literal: { foo: 'bar' },
      },
    ],
    [
      'an schema with enum',
      {
        enum: ['foo', 'bar'],
      },
      {
        children: [
          {
            kind: TypeMetadataKind.literalType,
            literal: 'foo',
          },
          {
            kind: TypeMetadataKind.literalType,
            literal: 'bar',
          },
        ],
        kind: TypeMetadataKind.or,
      },
    ],
    [
      'an schema with items',
      {
        items: {
          type: 'string',
        },
      },
      {
        children: [
          {
            child: { kind: TypeMetadataKind.stringType },
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
      'an schema with type array and items',
      {
        items: {
          type: 'string',
        },
        type: 'array',
      },
      {
        child: {
          kind: TypeMetadataKind.stringType,
        },
        kind: TypeMetadataKind.arrayType,
      },
    ],
    [
      'an schema with type array or null and items',
      {
        items: {
          type: 'string',
        },
        type: ['array', 'null'],
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
      'an schema with a title, type array and items',
      {
        items: {
          type: 'string',
        },
        title: 'Foo',
        type: 'array',
      },
      {
        child: {
          kind: TypeMetadataKind.stringType,
        },
        id: 'Foo',
        kind: TypeMetadataKind.arrayType,
      },
    ],
    [
      'an schema with type object and items',
      {
        items: {
          type: 'string',
        },
        type: 'object',
      },
      {
        kind: TypeMetadataKind.objectType,
      },
    ],
    [
      'an schema with type integer and items',
      {
        items: {
          type: 'string',
        },
        type: 'integer',
      },
      {
        kind: TypeMetadataKind.integerType,
      },
    ],
    [
      'an schema with properties and required',
      {
        properties: {
          foo: {
            type: 'string',
          },
        },
        required: ['foo'],
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
  ])(
    'having %s',
    (
      _: string,
      jsonSchemaFixture: JsonSchemaObject,
      expectedTypeMetadata: TypeMetadata,
    ) => {
      describe('when called', () => {
        let result: unknown;

        beforeAll(() => {
          result = transformJsonSchema(
            jsonSchemaFixture,
            generateTransformJsonSchemaContext(),
          );
        });

        it('should return expected TypeMetadata', () => {
          expect(result).toStrictEqual(expectedTypeMetadata);
        });
      });
    },
  );

  describe('having a $ref to another schema', () => {
    let jsonSchemaFixture: JsonSchemaObject;
    let referencedJsonSchemaFixture: JsonSchemaObject;

    beforeAll(() => {
      referencedJsonSchemaFixture = {
        $id: 'https://example.com/referenced',
        type: 'string',
      };
      jsonSchemaFixture = {
        $id: 'https://example.com/schema',
        $ref: 'https://example.com/referenced',
      };
    });

    describe('when called', () => {
      let result: unknown;

      beforeAll(() => {
        result = transformJsonSchema(
          jsonSchemaFixture,
          generateTransformJsonSchemaContext([
            jsonSchemaFixture,
            referencedJsonSchemaFixture,
          ]),
        );
      });

      it('should return the referenced TypeMetadata', () => {
        const expected: TypeMetadata = {
          kind: TypeMetadataKind.stringType,
        };

        expect(result).toStrictEqual(expected);
      });
    });
  });

  describe('having a titled $ref wrapper around a titled schema', () => {
    let jsonSchemaFixture: JsonSchemaObject;
    let referencedJsonSchemaFixture: JsonSchemaObject;

    beforeAll(() => {
      referencedJsonSchemaFixture = {
        $id: 'https://example.com/user',
        title: 'User',
        type: 'string',
      };
      jsonSchemaFixture = {
        $id: 'https://example.com/alias',
        $ref: 'https://example.com/user',
        title: 'Alias',
      };
    });

    describe('when called', () => {
      let result: unknown;

      beforeAll(() => {
        result = transformJsonSchema(
          jsonSchemaFixture,
          generateTransformJsonSchemaContext([
            jsonSchemaFixture,
            referencedJsonSchemaFixture,
          ]),
        );
      });

      it('should keep the wrapper title', () => {
        const expected: TypeMetadata = {
          id: 'Alias',
          kind: TypeMetadataKind.stringType,
        };

        expect(result).toStrictEqual(expected);
      });
    });
  });

  describe('having a $ref with a sibling type keyword', () => {
    let jsonSchemaFixture: JsonSchemaObject;
    let referencedJsonSchemaFixture: JsonSchemaObject;

    beforeAll(() => {
      referencedJsonSchemaFixture = {
        $id: 'https://example.com/referenced',
        type: 'object',
      };
      jsonSchemaFixture = {
        $id: 'https://example.com/schema',
        $ref: 'https://example.com/referenced',
        type: 'string',
      };
    });

    describe('when called', () => {
      let result: unknown;

      beforeAll(() => {
        result = transformJsonSchema(
          jsonSchemaFixture,
          generateTransformJsonSchemaContext([
            jsonSchemaFixture,
            referencedJsonSchemaFixture,
          ]),
        );
      });

      it('should return noneType TypeMetadata', () => {
        const expected: TypeMetadata = {
          kind: TypeMetadataKind.noneType,
        };

        expect(result).toStrictEqual(expected);
      });
    });
  });

  describe('having sibling $ref and $dynamicRef', () => {
    let dynamicTargetFixture: JsonSchemaObject;
    let jsonSchemaFixture: JsonSchemaObject;
    let refTargetFixture: JsonSchemaObject;

    beforeAll(() => {
      dynamicTargetFixture = {
        $id: 'https://example.com/dynamic-target.json',
        type: 'number',
      };
      refTargetFixture = {
        $id: 'https://example.com/ref-target.json',
        type: 'string',
      };
      jsonSchemaFixture = {
        $dynamicRef: 'dynamic-target.json',
        $id: 'https://example.com/root.json',
        $ref: 'ref-target.json',
      };
    });

    describe('when called', () => {
      let result: unknown;

      beforeAll(() => {
        result = transformJsonSchema(
          jsonSchemaFixture,
          generateTransformJsonSchemaContext([
            dynamicTargetFixture,
            jsonSchemaFixture,
            refTargetFixture,
          ]),
        );
      });

      it('should return noneType TypeMetadata', () => {
        const expected: TypeMetadata = {
          kind: TypeMetadataKind.noneType,
        };

        expect(result).toStrictEqual(expected);
      });
    });
  });

  describe('having a nested relative $ref in properties', () => {
    let jsonSchemaFixture: JsonSchemaObject;
    let referencedJsonSchemaFixture: JsonSchemaObject;

    beforeAll(() => {
      referencedJsonSchemaFixture = {
        $id: 'https://example.com/other.json',
        type: 'string',
      };
      jsonSchemaFixture = {
        $id: 'https://example.com/schema.json',
        properties: {
          foo: {
            $ref: 'other.json',
          },
        },
        required: ['foo'],
      };
    });

    describe('when called', () => {
      let result: unknown;

      beforeAll(() => {
        result = transformJsonSchema(
          jsonSchemaFixture,
          generateTransformJsonSchemaContext([
            jsonSchemaFixture,
            referencedJsonSchemaFixture,
          ]),
        );
      });

      it('should return a property TypeMetadata', () => {
        const expected: TypeMetadata = {
          child: {
            kind: TypeMetadataKind.stringType,
          },
          isOptional: false,
          kind: TypeMetadataKind.propertyType,
          property: 'foo',
        };

        expect(result).toStrictEqual(expected);
      });
    });
  });

  describe('having a $dynamicRef retargeted by an outer $dynamicAnchor', () => {
    let strictTreeFixture: JsonSchemaObject;
    let treeFixture: JsonSchemaObject;

    beforeAll(() => {
      treeFixture = {
        $dynamicAnchor: 'node',
        $id: 'https://example.com/tree',
        type: 'string',
      };
      strictTreeFixture = {
        $dynamicAnchor: 'node',
        $dynamicRef: 'https://example.com/tree#node',
        $id: 'https://example.com/strict-tree',
        type: 'object',
      };
    });

    describe('when called', () => {
      let result: unknown;

      beforeAll(() => {
        result = transformJsonSchema(
          strictTreeFixture,
          generateTransformJsonSchemaContext([strictTreeFixture, treeFixture]),
        );
      });

      it('should return a circular and TypeMetadata', () => {
        const inner: AndTypeMetadata = {
          children: [],
          kind: TypeMetadataKind.and,
        };
        inner.children.push(inner, {
          kind: TypeMetadataKind.objectType,
        });

        const expected: AndTypeMetadata = {
          children: [
            inner,
            {
              kind: TypeMetadataKind.objectType,
            },
          ],
          kind: TypeMetadataKind.and,
        };

        expect(result).toStrictEqual(expected);
      });
    });
  });

  describe('having a $dynamicRef nested under properties and retargeted by an outer $dynamicAnchor', () => {
    let strictTreeFixture: JsonSchemaObject;
    let treeFixture: JsonSchemaObject;

    beforeAll(() => {
      treeFixture = {
        $dynamicAnchor: 'node',
        $id: 'https://example.com/tree',
        properties: {
          child: {
            $dynamicRef: '#node',
          },
        },
        required: ['child'],
      };
      strictTreeFixture = {
        $dynamicAnchor: 'node',
        $id: 'https://example.com/strict-tree',
        $ref: 'https://example.com/tree',
        type: 'object',
      };
    });

    describe('when called', () => {
      let result: unknown;

      beforeAll(() => {
        result = transformJsonSchema(
          strictTreeFixture,
          generateTransformJsonSchemaContext([strictTreeFixture, treeFixture]),
        );
      });

      it('should return a circular and TypeMetadata', () => {
        const inner: AndTypeMetadata = {
          children: [],
          kind: TypeMetadataKind.and,
        };
        const childProperty: TypeMetadata = {
          child: inner,
          isOptional: false,
          kind: TypeMetadataKind.propertyType,
          property: 'child',
        };
        inner.children.push(childProperty, {
          kind: TypeMetadataKind.objectType,
        });

        const expected: AndTypeMetadata = {
          children: [
            childProperty,
            {
              kind: TypeMetadataKind.objectType,
            },
          ],
          kind: TypeMetadataKind.and,
        };

        expect(result).toStrictEqual(expected);
      });
    });
  });

  describe('having a titled $dynamicRef wrapper around an in-progress schema', () => {
    let strictTreeFixture: JsonSchemaObject;
    let treeFixture: JsonSchemaObject;

    beforeAll(() => {
      treeFixture = {
        $dynamicAnchor: 'node',
        $id: 'https://example.com/tree',
        properties: {
          child: {
            $dynamicRef: '#node',
            title: 'Alias',
          },
        },
        required: ['child'],
      };
      strictTreeFixture = {
        $dynamicAnchor: 'node',
        $id: 'https://example.com/strict-tree',
        $ref: 'https://example.com/tree',
        type: 'object',
      };
    });

    describe('when called', () => {
      let result: unknown;

      beforeAll(() => {
        result = transformJsonSchema(
          strictTreeFixture,
          generateTransformJsonSchemaContext([strictTreeFixture, treeFixture]),
        );
      });

      it('should keep the wrapper title on the circular TypeMetadata', () => {
        const inner: AndTypeMetadata = {
          children: [],
          id: 'Alias',
          kind: TypeMetadataKind.and,
        };
        const childProperty: TypeMetadata = {
          child: inner,
          isOptional: false,
          kind: TypeMetadataKind.propertyType,
          property: 'child',
        };
        inner.children.push(childProperty, {
          kind: TypeMetadataKind.objectType,
        });

        const expected: AndTypeMetadata = {
          children: [
            childProperty,
            {
              kind: TypeMetadataKind.objectType,
            },
          ],
          kind: TypeMetadataKind.and,
        };

        expect(result).toStrictEqual(expected);
      });
    });
  });

  describe('having a titled $ref wrapper around a titled in-progress schema', () => {
    let jsonSchemaFixture: JsonSchemaObject;

    beforeAll(() => {
      jsonSchemaFixture = {
        $id: 'https://example.com/root',
        properties: {
          child: {
            $ref: '#',
            title: 'Alias',
          },
        },
        required: ['child'],
        title: 'Root',
        type: 'object',
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

      it('should keep the wrapper title on the circular TypeMetadata', () => {
        const expected: AndTypeMetadata = {
          children: [],
          id: 'Alias',
          kind: TypeMetadataKind.and,
        };
        expected.children.push(
          {
            child: expected,
            isOptional: false,
            kind: TypeMetadataKind.propertyType,
            property: 'child',
          },
          {
            kind: TypeMetadataKind.objectType,
          },
        );

        expect(result).toStrictEqual(expected);
      });
    });
  });

  describe('having an id-less $dynamicRef schema visited under the same resources with a different last resource', () => {
    let aSchemaFixture: JsonSchemaObject;
    let bSchemaFixture: JsonSchemaObject;
    let sharedSchemaFixture: JsonSchemaObject;

    beforeAll(() => {
      sharedSchemaFixture = {
        $dynamicRef: '#node',
      };
      aSchemaFixture = {
        $dynamicAnchor: 'node',
        $id: 'https://example.com/a',
        properties: {
          childB: {
            $ref: 'https://example.com/b',
          },
          shared: sharedSchemaFixture,
        },
        required: ['childB', 'shared'],
        type: 'string',
      };
      bSchemaFixture = {
        $anchor: 'node',
        $id: 'https://example.com/b',
        properties: {
          shared: sharedSchemaFixture,
          toA: {
            $ref: 'https://example.com/a',
          },
        },
        required: ['shared', 'toA'],
        type: 'number',
      };
    });

    describe('when called', () => {
      let result: unknown;

      beforeAll(() => {
        result = transformJsonSchema(
          aSchemaFixture,
          generateTransformJsonSchemaContext([aSchemaFixture, bSchemaFixture]),
        );
      });

      it('should retarget the $dynamicRef using the last dynamic scope resource', () => {
        const rootTypeMetadata: AndTypeMetadata = result as AndTypeMetadata;
        const bTypeMetadata: AndTypeMetadata = (
          rootTypeMetadata.children[0] as PropertyTypeMetadata
        ).child as AndTypeMetadata;

        const bSharedTypeMetadata: AndTypeMetadata = (
          bTypeMetadata.children[0] as PropertyTypeMetadata
        ).child as AndTypeMetadata;
        const reenteredSchemaTypeMetadata: AndTypeMetadata = (
          bTypeMetadata.children[1] as PropertyTypeMetadata
        ).child as AndTypeMetadata;
        const reenteredSharedTypeMetadata: AndTypeMetadata = (
          reenteredSchemaTypeMetadata.children[1] as PropertyTypeMetadata
        ).child as AndTypeMetadata;

        expect(
          bSharedTypeMetadata.children.some(
            (child: TypeMetadata) => child.kind === TypeMetadataKind.floatType,
          ),
        ).toBe(true);
        expect(
          reenteredSharedTypeMetadata.children.some(
            (child: TypeMetadata) => child.kind === TypeMetadataKind.stringType,
          ),
        ).toBe(true);
      });
    });
  });

  describe('having a $ref from A to B and a $dynamicRef from B back to A', () => {
    let aSchemaFixture: JsonSchemaObject;
    let bSchemaFixture: JsonSchemaObject;

    beforeAll(() => {
      aSchemaFixture = {
        $dynamicAnchor: 'node',
        $id: 'https://example.com/a',
        properties: {
          toB: {
            $ref: 'https://example.com/b',
          },
        },
        required: ['toB'],
      };
      bSchemaFixture = {
        $id: 'https://example.com/b',
        properties: {
          toA: {
            $dynamicRef: 'https://example.com/a#node',
          },
        },
        required: ['toA'],
      };
    });

    describe('when called', () => {
      let result: unknown;

      beforeAll(() => {
        result = transformJsonSchema(
          aSchemaFixture,
          generateTransformJsonSchemaContext([aSchemaFixture, bSchemaFixture]),
        );
      });

      it('should return a circular TypeMetadata', () => {
        const innerA: PropertyTypeMetadata = {
          child: {
            child: undefined as unknown as TypeMetadata,
            isOptional: false,
            kind: TypeMetadataKind.propertyType,
            property: 'toA',
          },
          isOptional: false,
          kind: TypeMetadataKind.propertyType,
          property: 'toB',
        };
        (innerA.child as PropertyTypeMetadata).child = innerA;

        const expected: PropertyTypeMetadata = {
          child: {
            child: innerA,
            isOptional: false,
            kind: TypeMetadataKind.propertyType,
            property: 'toA',
          },
          isOptional: false,
          kind: TypeMetadataKind.propertyType,
          property: 'toB',
        };

        expect(result).toStrictEqual(expected);
      });
    });
  });

  describe('having a $ref to a $dynamicAnchor that is not retargeted', () => {
    let jsonSchemaFixture: JsonSchemaObject;
    let treeFixture: JsonSchemaObject;

    beforeAll(() => {
      treeFixture = {
        $dynamicAnchor: 'node',
        $id: 'https://example.com/tree',
        type: 'string',
      };
      jsonSchemaFixture = {
        $id: 'https://example.com/wrapper',
        $ref: 'https://example.com/tree#node',
      };
    });

    describe('when called', () => {
      let result: unknown;

      beforeAll(() => {
        result = transformJsonSchema(
          jsonSchemaFixture,
          generateTransformJsonSchemaContext([jsonSchemaFixture, treeFixture]),
        );
      });

      it('should return the referenced TypeMetadata', () => {
        const expected: TypeMetadata = {
          kind: TypeMetadataKind.stringType,
        };

        expect(result).toStrictEqual(expected);
      });
    });
  });

  describe('having an unresolved $ref', () => {
    let jsonSchemaFixture: JsonSchemaObject;

    beforeAll(() => {
      jsonSchemaFixture = {
        $id: 'https://example.com/schema',
        $ref: 'https://example.com/missing',
      };
    });

    describe('when called', () => {
      let result: unknown;

      beforeAll(() => {
        try {
          transformJsonSchema(
            jsonSchemaFixture,
            generateTransformJsonSchemaContext([jsonSchemaFixture]),
          );
        } catch (error: unknown) {
          result = error;
        }
      });

      it('should throw an Error', () => {
        expect(result).toBeInstanceOf(Error);
        expect((result as Error).message).toBe(
          'Failed to resolve resource identified by: https://example.com/missing (https://example.com/schema -> https://example.com/missing)',
        );
      });
    });
  });

  describe('having two schemas with the same title', () => {
    let jsonSchemaFixture: JsonSchemaObject;

    beforeAll(() => {
      jsonSchemaFixture = {
        allOf: [
          {
            title: 'Foo',
            type: 'string',
          },
          {
            title: 'Foo',
            type: 'number',
          },
        ],
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

  describe('having a string schema allOf a self-referencing anyOf schema', () => {
    let jsonSchemaFixture: JsonSchemaObject;
    let loopJsonSchemaFixture: JsonSchemaObject;

    beforeAll(() => {
      loopJsonSchemaFixture = {
        $id: 'https://example.com/loop',
        anyOf: [
          {
            type: 'boolean',
          },
          {
            $ref: '#',
          },
        ],
      };
      jsonSchemaFixture = {
        $id: 'https://example.com/schema',
        allOf: [
          {
            type: 'string',
          },
          {
            $ref: 'https://example.com/loop',
          },
        ],
      };
    });

    describe('when called', () => {
      let result: unknown;

      beforeAll(() => {
        result = transformJsonSchema(
          jsonSchemaFixture,
          generateTransformJsonSchemaContext([
            jsonSchemaFixture,
            loopJsonSchemaFixture,
          ]),
        );
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
