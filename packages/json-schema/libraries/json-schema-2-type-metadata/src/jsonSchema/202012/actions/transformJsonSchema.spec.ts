import { beforeAll, describe, expect, it } from 'vitest';

import {
  type AndTypeMetadata,
  type TypeMetadata,
  TypeMetadataKind,
} from '@inversifyjs/json-schema-type-metadata';
import {
  type JsonRootSchema,
  type JsonRootSchemaObject,
  type JsonSchema,
  type JsonSchemaBoolean,
  type JsonSchemaObject,
} from '@inversifyjs/json-schema-types/2020-12';

import {
  JsonRootSchemaFixtures,
  STRICT_TREE_ID,
  TREE_ID,
} from '../fixtures/JsonRootSchemaFixtures.js';
import { type TransformJsonSchemaContext } from '../models/TransformJsonSchemaContext.js';
import { buildTransformJsonSchemaContext } from './buildTransformJsonSchemaContext.js';
import { transformJsonSchema } from './transformJsonSchema.js';

function buildTreeChildrenTypeMetadata(
  itemsTypeMetadata: TypeMetadata,
): TypeMetadata {
  return {
    children: [
      {
        children: [
          {
            child: itemsTypeMetadata,
            kind: TypeMetadataKind.arrayType,
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
        child: {
          kind: TypeMetadataKind.anyType,
        },
        kind: TypeMetadataKind.arrayType,
      },
    ],
    kind: TypeMetadataKind.and,
  };
}

function buildTreeTypeMetadata(
  nodeTypeMetadata: TypeMetadata,
): AndTypeMetadata {
  return {
    children: [
      {
        child: buildTreeChildrenTypeMetadata({
          children: [
            nodeTypeMetadata,
            {
              kind: TypeMetadataKind.objectType,
            },
          ],
          kind: TypeMetadataKind.and,
        }),
        isOptional: true,
        kind: TypeMetadataKind.propertyType,
        property: 'children',
      },
      {
        kind: TypeMetadataKind.objectType,
      },
    ],
    kind: TypeMetadataKind.and,
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
            buildTransformJsonSchemaContext({ schema: jsonSchemaFixture }),
          );
        });

        it('should return expected TypeMetadata', () => {
          expect(result).toStrictEqual(expectedTypeMetadata);
        });
      });
    },
  );

  describe('having a self referenced JsonSchema', () => {
    let uriFixture: string;
    let jsonSchemaFixture: JsonSchemaObject;

    beforeAll(() => {
      uriFixture = 'sample://uri/fixture';
      jsonSchemaFixture = {
        $ref: uriFixture,
      };
    });

    describe('when called', () => {
      let result: unknown;

      beforeAll(() => {
        const referenceMap: Map<string, JsonRootSchema | JsonSchema> = new Map([
          [uriFixture, jsonSchemaFixture],
        ]);

        result = transformJsonSchema(
          jsonSchemaFixture,
          buildTransformJsonSchemaContext({
            referenceMap,
            schema: jsonSchemaFixture,
          }),
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
    let uriFixture: string;
    let childUriFixture: string;
    let jsonSchemaFixture: JsonSchemaObject;
    let childJsonSchemaFixture: JsonSchemaObject;

    beforeAll(() => {
      childUriFixture = 'sample://uri/child';
      uriFixture = 'sample://uri/schema';
      jsonSchemaFixture = {
        $ref: childUriFixture,
      };
      childJsonSchemaFixture = {
        $ref: uriFixture,
      };
    });

    describe('when called', () => {
      let result: unknown;

      beforeAll(() => {
        const referenceMap: Map<string, JsonRootSchema | JsonSchema> = new Map([
          [uriFixture, jsonSchemaFixture],
          [childUriFixture, childJsonSchemaFixture],
        ]);

        result = transformJsonSchema(
          jsonSchemaFixture,
          buildTransformJsonSchemaContext({
            referenceMap,
            schema: jsonSchemaFixture,
          }),
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
    let uriFixture: string;
    let childUriFixture: string;
    let jsonSchemaFixture: JsonSchemaObject;
    let childJsonSchemaFixture: JsonSchemaObject;

    beforeAll(() => {
      childUriFixture = 'sample://uri/child';
      uriFixture = 'sample://uri/schema';
      jsonSchemaFixture = {
        $ref: childUriFixture,
      };
      childJsonSchemaFixture = {
        $ref: uriFixture,
        type: 'object',
      };
    });

    describe('when called', () => {
      let result: unknown;

      beforeAll(() => {
        const referenceMap: Map<string, JsonRootSchema | JsonSchema> = new Map([
          [uriFixture, jsonSchemaFixture],
          [childUriFixture, childJsonSchemaFixture],
        ]);

        result = transformJsonSchema(
          jsonSchemaFixture,
          buildTransformJsonSchemaContext({
            referenceMap,
            schema: jsonSchemaFixture,
          }),
        );
      });

      it('should return TypeMetadata', () => {
        const expected: AndTypeMetadata = {
          children: [],
          kind: TypeMetadataKind.and,
        };
        expected.children.push(expected, {
          kind: TypeMetadataKind.objectType,
        });

        expect(result).toStrictEqual(expected);
      });
    });
  });

  describe('having a circular referenced JsonSchema with parent and child additional constraints', () => {
    let uriFixture: string;
    let childUriFixture: string;
    let jsonSchemaFixture: JsonSchemaObject;
    let childJsonSchemaFixture: JsonSchemaObject;

    beforeAll(() => {
      childUriFixture = 'sample://uri/child';
      uriFixture = 'sample://uri/schema';
      jsonSchemaFixture = {
        $ref: childUriFixture,
        properties: {
          foo: {
            type: 'string',
          },
        },
        type: 'object',
      };
      childJsonSchemaFixture = {
        $ref: uriFixture,
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
        const referenceMap: Map<string, JsonRootSchema | JsonSchema> = new Map([
          [uriFixture, jsonSchemaFixture],
          [childUriFixture, childJsonSchemaFixture],
        ]);

        result = transformJsonSchema(
          jsonSchemaFixture,
          buildTransformJsonSchemaContext({
            referenceMap,
            schema: jsonSchemaFixture,
          }),
        );
      });

      it('should return TypeMetadata', () => {
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
          ],
          kind: TypeMetadataKind.and,
        };

        expected.children.push(
          {
            children: [
              {
                child: {
                  kind: TypeMetadataKind.stringType,
                },
                isOptional: true,
                kind: TypeMetadataKind.propertyType,
                property: 'bar',
              },
              expected,
              {
                kind: TypeMetadataKind.objectType,
              },
            ],
            kind: TypeMetadataKind.and,
          },
          {
            kind: TypeMetadataKind.objectType,
          },
        );

        expect(result).toStrictEqual(expected);
      });
    });
  });

  describe('having a JsonSchema reached twice through the same dynamic scope', () => {
    let sharedJsonSchemaFixture: JsonSchemaObject;
    let jsonSchemaFixture: JsonSchemaObject;

    beforeAll(() => {
      sharedJsonSchemaFixture = {
        type: 'string',
      };
      jsonSchemaFixture = {
        allOf: [sharedJsonSchemaFixture, sharedJsonSchemaFixture],
      };
    });

    describe('when called', () => {
      let result: unknown;

      beforeAll(() => {
        result = transformJsonSchema(
          jsonSchemaFixture,
          buildTransformJsonSchemaContext({ schema: jsonSchemaFixture }),
        );
      });

      it('should return the same TypeMetadata instance for both occurrences', () => {
        const andTypeMetadata: AndTypeMetadata = result as AndTypeMetadata;

        expect(andTypeMetadata.children[0]).toBe(andTypeMetadata.children[1]);
      });
    });
  });

  describe('having a JsonSchema with a $ref plain name fragment declared as $anchor', () => {
    let jsonSchemaFixture: JsonSchemaObject;
    let referenceMapFixture: Map<string, JsonRootSchema | JsonSchema>;

    beforeAll(() => {
      jsonSchemaFixture = {
        $defs: {
          anchored: {
            $anchor: 'node',
            type: 'string',
          },
        },
        $id: 'https://example.com/precedence',
        $ref: '#node',
      };
      referenceMapFixture = new Map([['#node', { type: 'integer' }]]);
    });

    describe('when called', () => {
      let result: unknown;

      beforeAll(() => {
        result = transformJsonSchema(
          jsonSchemaFixture,
          buildTransformJsonSchemaContext({
            referenceMap: referenceMapFixture,
            schema: jsonSchemaFixture,
          }),
        );
      });

      it('should resolve the anchor over the reference map entry', () => {
        const expected: TypeMetadata = {
          kind: TypeMetadataKind.stringType,
        };

        expect(result).toStrictEqual(expected);
      });
    });
  });

  describe('having a JsonSchema with a $ref JSON pointer fragment', () => {
    let jsonSchemaFixture: JsonSchemaObject;
    let referenceMapFixture: Map<string, JsonRootSchema | JsonSchema>;

    beforeAll(() => {
      jsonSchemaFixture = {
        $defs: {
          leaf: {
            type: 'string',
          },
        },
        $ref: '#/$defs/leaf',
      };
      referenceMapFixture = new Map([['#/$defs/leaf', { type: 'integer' }]]);
    });

    describe('when called', () => {
      let result: unknown;

      beforeAll(() => {
        result = transformJsonSchema(
          jsonSchemaFixture,
          buildTransformJsonSchemaContext({
            referenceMap: referenceMapFixture,
            schema: jsonSchemaFixture,
          }),
        );
      });

      it('should resolve the reference map entry', () => {
        const expected: TypeMetadata = {
          kind: TypeMetadataKind.integerType,
        };

        expect(result).toStrictEqual(expected);
      });
    });
  });

  describe('having a JsonSchema with a $ref plain name fragment matching no anchor', () => {
    let jsonSchemaFixture: JsonSchemaObject;
    let referenceMapFixture: Map<string, JsonRootSchema | JsonSchema>;

    beforeAll(() => {
      jsonSchemaFixture = {
        $ref: '#node',
      };
      referenceMapFixture = new Map([['#node', { type: 'string' }]]);
    });

    describe('when called', () => {
      let result: unknown;

      beforeAll(() => {
        result = transformJsonSchema(
          jsonSchemaFixture,
          buildTransformJsonSchemaContext({
            referenceMap: referenceMapFixture,
            schema: jsonSchemaFixture,
          }),
        );
      });

      it('should fall back to the reference map entry', () => {
        const expected: TypeMetadata = {
          kind: TypeMetadataKind.stringType,
        };

        expect(result).toStrictEqual(expected);
      });
    });
  });

  describe('having a JsonSchema with an unresolvable $ref', () => {
    let jsonSchemaFixture: JsonSchemaObject;

    beforeAll(() => {
      jsonSchemaFixture = {
        $ref: 'https://example.com/missing',
      };
    });

    describe('when called', () => {
      let result: unknown;

      beforeAll(() => {
        try {
          transformJsonSchema(
            jsonSchemaFixture,
            buildTransformJsonSchemaContext({ schema: jsonSchemaFixture }),
          );
        } catch (error: unknown) {
          result = error;
        }
      });

      it('should throw an Error', () => {
        expect(result).toStrictEqual(
          new Error('Unable to resolve "https://example.com/missing" $ref'),
        );
      });
    });
  });

  describe('having a JsonSchema with an unresolvable $dynamicRef', () => {
    let jsonSchemaFixture: JsonSchemaObject;

    beforeAll(() => {
      jsonSchemaFixture = {
        $dynamicRef: '#missing',
      };
    });

    describe('when called', () => {
      let result: unknown;

      beforeAll(() => {
        try {
          transformJsonSchema(
            jsonSchemaFixture,
            buildTransformJsonSchemaContext({ schema: jsonSchemaFixture }),
          );
        } catch (error: unknown) {
          result = error;
        }
      });

      it('should throw an Error', () => {
        expect(result).toStrictEqual(
          new Error('Unable to resolve "#missing" $dynamicRef'),
        );
      });
    });
  });

  describe('having a JsonSchema with a $dynamicRef targeting an $anchor', () => {
    let jsonSchemaFixture: JsonSchemaObject;

    beforeAll(() => {
      jsonSchemaFixture = {
        $defs: {
          leaf: {
            $anchor: 'node',
            type: 'string',
          },
        },
        $dynamicRef: '#node',
        $id: 'https://example.com/plain',
      };
    });

    describe('when called', () => {
      let result: unknown;

      beforeAll(() => {
        result = transformJsonSchema(
          jsonSchemaFixture,
          buildTransformJsonSchemaContext({ schema: jsonSchemaFixture }),
        );
      });

      it('should apply the anchored schema, as a $ref would', () => {
        const expected: TypeMetadata = {
          kind: TypeMetadataKind.stringType,
        };

        expect(result).toStrictEqual(expected);
      });
    });
  });

  describe('having a JsonSchema with a $dynamicRef whose name is unbound in the dynamic scope', () => {
    let jsonSchemaFixture: JsonSchemaObject;
    let referenceMapFixture: Map<string, JsonRootSchema | JsonSchema>;

    beforeAll(() => {
      jsonSchemaFixture = {
        $dynamicRef: 'https://example.com/other#node',
        $id: 'https://example.com/entry',
      };
      referenceMapFixture = new Map([
        [
          'https://example.com/other#node',
          {
            $dynamicAnchor: 'node',
            $id: 'https://example.com/other',
            type: 'string',
          },
        ],
      ]);
    });

    describe('when called', () => {
      let result: unknown;

      beforeAll(() => {
        result = transformJsonSchema(
          jsonSchemaFixture,
          buildTransformJsonSchemaContext({
            referenceMap: referenceMapFixture,
            schema: jsonSchemaFixture,
          }),
        );
      });

      it('should apply the initially resolved schema', () => {
        const expected: TypeMetadata = {
          kind: TypeMetadataKind.stringType,
        };

        expect(result).toStrictEqual(expected);
      });
    });
  });

  describe('having a JsonSchema with a $dynamicRef carrying a path part', () => {
    let consumerJsonSchemaFixture: JsonSchemaObject;
    let referenceMapFixture: Map<string, JsonRootSchema | JsonSchema>;

    beforeAll(() => {
      const targetJsonSchema: JsonSchemaObject = {
        $dynamicAnchor: 'node',
        $dynamicRef: 'https://example.com/target#node',
        $id: 'https://example.com/target',
        type: 'object',
      };

      consumerJsonSchemaFixture = {
        $dynamicAnchor: 'node',
        $id: 'https://example.com/consumer',
        $ref: 'https://example.com/target',
        properties: {
          value: {
            type: 'string',
          },
        },
      };

      referenceMapFixture = new Map([
        ['https://example.com/target', targetJsonSchema],
        ['https://example.com/target#node', targetJsonSchema],
      ]);
    });

    describe('when called', () => {
      let result: unknown;

      beforeAll(() => {
        result = transformJsonSchema(
          consumerJsonSchemaFixture,
          buildTransformJsonSchemaContext({
            referenceMap: referenceMapFixture,
            schema: consumerJsonSchemaFixture,
          }),
        );
      });

      it('should substitute the outermost declaration in the dynamic scope', () => {
        const expected: AndTypeMetadata = {
          children: [],
          kind: TypeMetadataKind.and,
        };

        expected.children.push(
          {
            child: {
              kind: TypeMetadataKind.stringType,
            },
            isOptional: true,
            kind: TypeMetadataKind.propertyType,
            property: 'value',
          },
          {
            children: [
              expected,
              {
                kind: TypeMetadataKind.objectType,
              },
            ],
            kind: TypeMetadataKind.and,
          },
        );

        expect(result).toStrictEqual(expected);
      });
    });
  });

  describe('having a JsonSchema whose dynamic scope holds an outer and an inner declaration of the same name', () => {
    let outerJsonSchemaFixture: JsonSchemaObject;
    let referenceMapFixture: Map<string, JsonRootSchema | JsonSchema>;

    beforeAll(() => {
      outerJsonSchemaFixture = {
        $dynamicAnchor: 'node',
        $id: 'https://example.com/outer',
        $ref: 'https://example.com/middle',
        properties: {
          outer: {
            type: 'string',
          },
        },
      };

      referenceMapFixture = new Map<string, JsonRootSchema | JsonSchema>([
        [
          'https://example.com/middle',
          {
            $id: 'https://example.com/middle',
            $ref: 'https://example.com/inner',
          },
        ],
        [
          'https://example.com/inner',
          {
            $dynamicAnchor: 'node',
            $dynamicRef: '#node',
            $id: 'https://example.com/inner',
            type: 'object',
          },
        ],
      ]);
    });

    describe('when called', () => {
      let result: unknown;

      beforeAll(() => {
        result = transformJsonSchema(
          outerJsonSchemaFixture,
          buildTransformJsonSchemaContext({
            referenceMap: referenceMapFixture,
            schema: outerJsonSchemaFixture,
          }),
        );
      });

      it('should resolve to the outermost declaration', () => {
        const expected: AndTypeMetadata = {
          children: [],
          kind: TypeMetadataKind.and,
        };

        expected.children.push(
          {
            child: {
              kind: TypeMetadataKind.stringType,
            },
            isOptional: true,
            kind: TypeMetadataKind.propertyType,
            property: 'outer',
          },
          {
            children: [
              expected,
              {
                kind: TypeMetadataKind.objectType,
              },
            ],
            kind: TypeMetadataKind.and,
          },
        );

        expect(result).toStrictEqual(expected);
      });
    });
  });

  describe('having a JsonSchema reached through two dynamic scopes binding the same name differently', () => {
    let jsonSchemaFixture: JsonSchemaObject;
    let referenceMapFixture: Map<string, JsonRootSchema | JsonSchema>;

    beforeAll(() => {
      jsonSchemaFixture = {
        allOf: [
          { $ref: 'https://example.com/first' },
          { $ref: 'https://example.com/second' },
        ],
      };

      referenceMapFixture = new Map<string, JsonRootSchema | JsonSchema>([
        [
          'https://example.com/first',
          {
            $dynamicAnchor: 'node',
            $id: 'https://example.com/first',
            $ref: 'https://example.com/shared',
            type: 'string',
          },
        ],
        [
          'https://example.com/second',
          {
            $dynamicAnchor: 'node',
            $id: 'https://example.com/second',
            $ref: 'https://example.com/shared',
            type: 'integer',
          },
        ],
        [
          'https://example.com/shared',
          {
            $dynamicAnchor: 'node',
            $dynamicRef: '#node',
            $id: 'https://example.com/shared',
            type: 'object',
          },
        ],
      ]);
    });

    describe('when called', () => {
      let result: unknown;

      beforeAll(() => {
        result = transformJsonSchema(
          jsonSchemaFixture,
          buildTransformJsonSchemaContext({
            referenceMap: referenceMapFixture,
            schema: jsonSchemaFixture,
          }),
        );
      });

      it('should produce a distinct type per dynamic scope', () => {
        const [firstTypeMetadata, secondTypeMetadata]: TypeMetadata[] = (
          result as AndTypeMetadata
        ).children;

        const firstSharedTypeMetadata: AndTypeMetadata = (
          firstTypeMetadata as AndTypeMetadata
        ).children[0] as AndTypeMetadata;
        const secondSharedTypeMetadata: AndTypeMetadata = (
          secondTypeMetadata as AndTypeMetadata
        ).children[0] as AndTypeMetadata;

        expect(firstSharedTypeMetadata).not.toBe(secondSharedTypeMetadata);
        expect(
          (firstSharedTypeMetadata.children[0] as AndTypeMetadata).children[1],
        ).toStrictEqual({
          kind: TypeMetadataKind.stringType,
        });
        expect(
          (secondSharedTypeMetadata.children[0] as AndTypeMetadata).children[1],
        ).toStrictEqual({
          kind: TypeMetadataKind.integerType,
        });
      });
    });
  });

  describe('having a strict-tree JsonSchema extending a tree JsonSchema', () => {
    let strictTreeJsonSchemaFixture: JsonRootSchemaObject;
    let referenceMapFixture: Map<string, JsonRootSchema | JsonSchema>;

    beforeAll(() => {
      strictTreeJsonSchemaFixture =
        JsonRootSchemaFixtures.withUseCaseDynamicAnchorStrictTree;

      referenceMapFixture = new Map<string, JsonRootSchema | JsonSchema>([
        [TREE_ID, JsonRootSchemaFixtures.withUseCaseDynamicAnchorTree],
        [STRICT_TREE_ID, strictTreeJsonSchemaFixture],
      ]);
    });

    describe('when called', () => {
      let context: TransformJsonSchemaContext;
      let result: unknown;

      beforeAll(() => {
        context = buildTransformJsonSchemaContext({
          referenceMap: referenceMapFixture,
          schema: strictTreeJsonSchemaFixture,
        });

        result = transformJsonSchema(strictTreeJsonSchemaFixture, context);
      });

      it('should resolve #node to the strict-tree schema', () => {
        const expected: AndTypeMetadata = {
          children: [],
          kind: TypeMetadataKind.and,
        };

        expected.children.push(
          {
            child: {
              kind: TypeMetadataKind.stringType,
            },
            isOptional: false,
            kind: TypeMetadataKind.propertyType,
            property: 'name',
          },
          buildTreeTypeMetadata(expected),
        );

        expect(result).toStrictEqual(expected);
      });

      it('should reach a single dynamic anchor bindings key', () => {
        const bindingsKeySet: Set<string> = new Set();

        for (const bindingsToTypeMap of context.schemaToBindingsToTypeMap.values()) {
          for (const bindingsKey of bindingsToTypeMap.keys()) {
            bindingsKeySet.add(bindingsKey);
          }
        }

        expect(bindingsKeySet).toStrictEqual(new Set(['node:0']));
      });
    });
  });

  describe('having a tree JsonSchema', () => {
    let treeJsonSchemaFixture: JsonRootSchemaObject;
    let referenceMapFixture: Map<string, JsonRootSchema | JsonSchema>;

    beforeAll(() => {
      treeJsonSchemaFixture =
        JsonRootSchemaFixtures.withUseCaseDynamicAnchorTree;

      referenceMapFixture = new Map<string, JsonRootSchema | JsonSchema>([
        [TREE_ID, treeJsonSchemaFixture],
        [
          STRICT_TREE_ID,
          JsonRootSchemaFixtures.withUseCaseDynamicAnchorStrictTree,
        ],
      ]);
    });

    describe('when called', () => {
      let result: unknown;

      beforeAll(() => {
        result = transformJsonSchema(
          treeJsonSchemaFixture,
          buildTransformJsonSchemaContext({
            referenceMap: referenceMapFixture,
            schema: treeJsonSchemaFixture,
          }),
        );
      });

      it('should resolve #node to the tree schema', () => {
        const expected: AndTypeMetadata = {
          children: [],
          kind: TypeMetadataKind.and,
        };

        expected.children.push(...buildTreeTypeMetadata(expected).children);

        expect(result).toStrictEqual(expected);
      });
    });
  });

  describe('having a JsonSchema subschema of an indexed document', () => {
    let jsonSchemaFixture: JsonSchemaObject;
    let subschemaFixture: JsonSchema;

    beforeAll(() => {
      subschemaFixture = {
        $ref: '#leaf',
      };
      jsonSchemaFixture = {
        $defs: {
          child: subschemaFixture,
          leaf: {
            $anchor: 'leaf',
            type: 'string',
          },
        },
        $id: 'https://example.com/document',
      };
    });

    describe('when called', () => {
      let result: unknown;

      beforeAll(() => {
        result = transformJsonSchema(
          subschemaFixture,
          buildTransformJsonSchemaContext({ schema: jsonSchemaFixture }),
        );
      });

      it('should resolve anchors declared elsewhere in the owning resource', () => {
        const expected: TypeMetadata = {
          kind: TypeMetadataKind.stringType,
        };

        expect(result).toStrictEqual(expected);
      });
    });
  });

  describe('having a JsonSchema the context never indexed', () => {
    let indexedJsonSchemaFixture: JsonSchemaObject;
    let unindexedJsonSchemaFixture: JsonSchemaObject;

    beforeAll(() => {
      indexedJsonSchemaFixture = {
        $id: 'https://example.com/indexed',
      };
      unindexedJsonSchemaFixture = {
        type: 'string',
      };
    });

    describe('when called', () => {
      let result: unknown;

      beforeAll(() => {
        result = transformJsonSchema(
          unindexedJsonSchemaFixture,
          buildTransformJsonSchemaContext({
            schema: indexedJsonSchemaFixture,
          }),
        );
      });

      it('should return expected TypeMetadata', () => {
        const expected: TypeMetadata = {
          kind: TypeMetadataKind.stringType,
        };

        expect(result).toStrictEqual(expected);
      });
    });
  });

  describe.each<[string, JsonSchemaObject, TypeMetadata]>([
    ['any schema', {}, { kind: TypeMetadataKind.anyType }],
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
    [
      'an schema with a title',
      {
        title: 'Foo',
      },
      {
        id: 'Foo',
        kind: TypeMetadataKind.anyType,
      },
    ],
    [
      'an schema with an array type',
      {
        type: 'array',
      },
      {
        child: {
          kind: TypeMetadataKind.anyType,
        },
        kind: TypeMetadataKind.arrayType,
      },
    ],
    [
      'an schema with a boolean type',
      {
        type: 'boolean',
      },
      {
        kind: TypeMetadataKind.booleanType,
      },
    ],
    [
      'an schema with an integer type',
      {
        type: 'integer',
      },
      {
        kind: TypeMetadataKind.integerType,
      },
    ],
    [
      'an schema with a null type',
      {
        type: 'null',
      },
      {
        kind: TypeMetadataKind.literalType,
        literal: null,
      },
    ],
    [
      'an schema with a number type',
      {
        type: 'number',
      },
      {
        kind: TypeMetadataKind.floatType,
      },
    ],
    [
      'an schema with an object type',
      {
        type: 'object',
      },
      {
        kind: TypeMetadataKind.objectType,
      },
    ],
    [
      'an schema with a string type',
      {
        type: 'string',
      },
      {
        kind: TypeMetadataKind.stringType,
      },
    ],
    [
      'an schema with a type list',
      {
        type: ['string', 'null'],
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
            buildTransformJsonSchemaContext({ schema: jsonSchemaFixture }),
          );
        });

        it('should return expected TypeMetadata', () => {
          expect(result).toStrictEqual(expectedTypeMetadata);
        });
      });
    },
  );
});
