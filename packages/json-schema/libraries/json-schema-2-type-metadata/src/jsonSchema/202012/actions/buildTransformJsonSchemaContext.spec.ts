import { beforeAll, describe, expect, it } from 'vitest';

import {
  type JsonRootSchema,
  type JsonSchema,
  type JsonSchemaObject,
} from '@inversifyjs/json-schema-types/2020-12';

import { type JsonSchemaResource } from '../models/JsonSchemaResource.js';
import { type TransformJsonSchemaContext } from '../models/TransformJsonSchemaContext.js';
import { buildTransformJsonSchemaContext } from './buildTransformJsonSchemaContext.js';

describe(buildTransformJsonSchemaContext, () => {
  describe('having a JsonSchema with a nested $id', () => {
    let deepJsonSchemaFixture: JsonSchema;
    let innerJsonSchemaFixture: JsonSchema;
    let siblingJsonSchemaFixture: JsonSchema;
    let jsonSchemaFixture: JsonSchemaObject;

    beforeAll(() => {
      deepJsonSchemaFixture = {
        type: 'string',
      };
      innerJsonSchemaFixture = {
        $anchor: 'innerAnchor',
        $id: 'https://example.com/inner',
        properties: {
          deep: deepJsonSchemaFixture,
        },
      };
      siblingJsonSchemaFixture = {
        type: 'string',
      };
      jsonSchemaFixture = {
        $defs: {
          inner: innerJsonSchemaFixture,
          sibling: siblingJsonSchemaFixture,
        },
        $id: 'https://example.com/root',
      };
    });

    describe('when called', () => {
      let result: TransformJsonSchemaContext;

      beforeAll(() => {
        result = buildTransformJsonSchemaContext({ schema: jsonSchemaFixture });
      });

      it('should build a resource per $id', () => {
        expect(result.resourceList).toHaveLength(2);
      });

      it('should assign every schema outside the nested $id to the root resource', () => {
        expect(result.resourceMap.get(siblingJsonSchemaFixture)).toBe(
          result.resourceMap.get(jsonSchemaFixture),
        );
      });

      it('should assign every schema inside the nested $id to the nested resource', () => {
        expect(result.resourceMap.get(deepJsonSchemaFixture)).toBe(
          result.resourceMap.get(innerJsonSchemaFixture),
        );
      });

      it('should keep both resources apart', () => {
        expect(result.resourceMap.get(innerJsonSchemaFixture)).not.toBe(
          result.resourceMap.get(jsonSchemaFixture),
        );
      });

      it('should index the anchor in its own resource', () => {
        const innerResource: JsonSchemaResource = result.resourceMap.get(
          innerJsonSchemaFixture,
        ) as JsonSchemaResource;
        const rootResource: JsonSchemaResource = result.resourceMap.get(
          jsonSchemaFixture,
        ) as JsonSchemaResource;

        expect(innerResource.anchorMap.get('innerAnchor')).toBe(
          innerJsonSchemaFixture,
        );
        expect(rootResource.anchorMap.size).toBe(0);
      });
    });
  });

  describe.each<[string, string]>([
    ['a urn $id', 'urn:example:schema'],
    ['a relative $id', 'nested.json'],
  ])('having a JsonSchema with %s', (_: string, idFixture: string) => {
    let nestedJsonSchemaFixture: JsonSchema;
    let jsonSchemaFixture: JsonSchemaObject;

    beforeAll(() => {
      nestedJsonSchemaFixture = {
        $id: idFixture,
        type: 'string',
      };
      jsonSchemaFixture = {
        $defs: {
          nested: nestedJsonSchemaFixture,
        },
      };
    });

    describe('when called', () => {
      let result: TransformJsonSchemaContext;

      beforeAll(() => {
        result = buildTransformJsonSchemaContext({
          schema: jsonSchemaFixture,
        });
      });

      it('should treat the $id as a resource boundary', () => {
        expect(result.resourceMap.get(nestedJsonSchemaFixture)).not.toBe(
          result.resourceMap.get(jsonSchemaFixture),
        );
      });
    });
  });

  describe('having a JsonSchema with no $id', () => {
    let nestedJsonSchemaFixture: JsonSchema;
    let jsonSchemaFixture: JsonSchemaObject;

    beforeAll(() => {
      nestedJsonSchemaFixture = {
        $anchor: 'leaf',
        type: 'string',
      };
      jsonSchemaFixture = {
        $defs: {
          leaf: nestedJsonSchemaFixture,
        },
      };
    });

    describe('when called', () => {
      let result: TransformJsonSchemaContext;

      beforeAll(() => {
        result = buildTransformJsonSchemaContext({ schema: jsonSchemaFixture });
      });

      it('should build a single resource', () => {
        expect(result.resourceList).toHaveLength(1);
      });

      it('should index an anchor declared under $defs', () => {
        const resource: JsonSchemaResource = result
          .resourceList[0] as JsonSchemaResource;

        expect(resource.anchorMap.get('leaf')).toBe(nestedJsonSchemaFixture);
      });
    });
  });

  describe('having a JsonSchema with two resources declaring the same $dynamicAnchor', () => {
    let firstJsonSchemaFixture: JsonSchema;
    let secondJsonSchemaFixture: JsonSchema;
    let jsonSchemaFixture: JsonSchemaObject;

    beforeAll(() => {
      firstJsonSchemaFixture = {
        $dynamicAnchor: 'node',
        $id: 'https://example.com/first',
      };
      secondJsonSchemaFixture = {
        $dynamicAnchor: 'node',
        $id: 'https://example.com/second',
      };
      jsonSchemaFixture = {
        $defs: {
          first: firstJsonSchemaFixture,
          second: secondJsonSchemaFixture,
        },
      };
    });

    describe('when called', () => {
      let result: TransformJsonSchemaContext;

      beforeAll(() => {
        result = buildTransformJsonSchemaContext({ schema: jsonSchemaFixture });
      });

      it('should index each declaration in its own resource', () => {
        const firstResource: JsonSchemaResource = result.resourceMap.get(
          firstJsonSchemaFixture,
        ) as JsonSchemaResource;
        const secondResource: JsonSchemaResource = result.resourceMap.get(
          secondJsonSchemaFixture,
        ) as JsonSchemaResource;

        expect(firstResource.dynamicAnchorMap.get('node')).toBe(
          firstJsonSchemaFixture,
        );
        expect(secondResource.dynamicAnchorMap.get('node')).toBe(
          secondJsonSchemaFixture,
        );
      });

      it('should give each resource a distinct index', () => {
        const firstResource: JsonSchemaResource = result.resourceMap.get(
          firstJsonSchemaFixture,
        ) as JsonSchemaResource;
        const secondResource: JsonSchemaResource = result.resourceMap.get(
          secondJsonSchemaFixture,
        ) as JsonSchemaResource;

        expect(firstResource.index).not.toBe(secondResource.index);
      });
    });
  });

  describe('having a JsonSchema with a $dynamicAnchor', () => {
    let jsonSchemaFixture: JsonSchemaObject;

    beforeAll(() => {
      jsonSchemaFixture = {
        $dynamicAnchor: 'node',
      };
    });

    describe('when called', () => {
      let result: TransformJsonSchemaContext;

      beforeAll(() => {
        result = buildTransformJsonSchemaContext({ schema: jsonSchemaFixture });
      });

      it('should index it as a dynamic anchor', () => {
        const resource: JsonSchemaResource = result
          .resourceList[0] as JsonSchemaResource;

        expect(resource.dynamicAnchorMap.get('node')).toBe(jsonSchemaFixture);
        expect(resource.anchorMap.size).toBe(0);
      });
    });
  });

  describe('having a boolean JsonSchema', () => {
    let jsonSchemaFixture: JsonSchema;

    beforeAll(() => {
      jsonSchemaFixture = true;
    });

    describe('when called', () => {
      let result: TransformJsonSchemaContext;

      beforeAll(() => {
        result = buildTransformJsonSchemaContext({ schema: jsonSchemaFixture });
      });

      it('should build no resources', () => {
        expect(result.resourceList).toHaveLength(0);
      });
    });
  });

  describe('having a JsonSchema with a boolean subschema', () => {
    let jsonSchemaFixture: JsonSchemaObject;

    beforeAll(() => {
      jsonSchemaFixture = {
        additionalProperties: false,
        items: true,
      };
    });

    describe('when called', () => {
      let result: TransformJsonSchemaContext;

      beforeAll(() => {
        result = buildTransformJsonSchemaContext({ schema: jsonSchemaFixture });
      });

      it('should not index boolean subschemas', () => {
        expect(result.resourceMap.has(true)).toBe(false);
        expect(result.resourceMap.has(false)).toBe(false);
      });
    });
  });

  describe('having a referenceMap', () => {
    let referencedJsonSchemaFixture: JsonSchema;
    let referenceMapFixture: Map<string, JsonRootSchema | JsonSchema>;
    let jsonSchemaFixture: JsonSchemaObject;

    beforeAll(() => {
      referencedJsonSchemaFixture = {
        $dynamicAnchor: 'node',
        $id: 'https://example.com/referenced',
      };
      referenceMapFixture = new Map([
        ['https://example.com/referenced', referencedJsonSchemaFixture],
      ]);
      jsonSchemaFixture = {
        $id: 'https://example.com/root',
      };
    });

    describe('when called', () => {
      let result: TransformJsonSchemaContext;

      beforeAll(() => {
        result = buildTransformJsonSchemaContext({
          referenceMap: referenceMapFixture,
          schema: jsonSchemaFixture,
        });
      });

      it('should index every referenced schema', () => {
        const resource: JsonSchemaResource = result.resourceMap.get(
          referencedJsonSchemaFixture,
        ) as JsonSchemaResource;

        expect(resource.dynamicAnchorMap.get('node')).toBe(
          referencedJsonSchemaFixture,
        );
      });

      it('should keep the referenceMap', () => {
        expect(result.referenceMap).toBe(referenceMapFixture);
      });
    });
  });

  describe('having a referenceMap with a schema already indexed', () => {
    let jsonSchemaFixture: JsonSchemaObject;
    let referenceMapFixture: Map<string, JsonRootSchema | JsonSchema>;

    beforeAll(() => {
      jsonSchemaFixture = {
        $id: 'https://example.com/root',
      };
      referenceMapFixture = new Map([
        ['https://example.com/root', jsonSchemaFixture],
      ]);
    });

    describe('when called', () => {
      let result: TransformJsonSchemaContext;

      beforeAll(() => {
        result = buildTransformJsonSchemaContext({
          referenceMap: referenceMapFixture,
          schema: jsonSchemaFixture,
        });
      });

      it('should index it once', () => {
        expect(result.resourceList).toHaveLength(1);
      });
    });
  });

  describe('having no referenceMap', () => {
    let jsonSchemaFixture: JsonSchemaObject;

    beforeAll(() => {
      jsonSchemaFixture = {};
    });

    describe('when called', () => {
      let result: TransformJsonSchemaContext;

      beforeAll(() => {
        result = buildTransformJsonSchemaContext({ schema: jsonSchemaFixture });
      });

      it('should build an empty one', () => {
        expect(result.referenceMap).toStrictEqual(new Map());
      });
    });
  });
});
