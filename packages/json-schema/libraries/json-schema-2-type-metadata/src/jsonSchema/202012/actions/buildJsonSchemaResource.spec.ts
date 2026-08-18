import { beforeAll, describe, expect, it } from 'vitest';

import { type JsonSchemaResource } from '../models/JsonSchemaResource.js';
import { type TransformJsonSchemaContext } from '../models/TransformJsonSchemaContext.js';
import { buildJsonSchemaResource } from './buildJsonSchemaResource.js';

function buildContextFixture(): TransformJsonSchemaContext {
  return {
    referenceMap: new Map(),
    resourceList: [],
    resourceMap: new Map(),
    schemaToBindingsToTypeMap: new Map(),
  };
}

describe(buildJsonSchemaResource, () => {
  describe('having a context with no resources', () => {
    describe('when called', () => {
      let contextFixture: TransformJsonSchemaContext;
      let result: JsonSchemaResource;

      beforeAll(() => {
        contextFixture = buildContextFixture();

        result = buildJsonSchemaResource(contextFixture);
      });

      it('should return an empty resource', () => {
        expect(result).toStrictEqual({
          anchorMap: new Map(),
          dynamicAnchorMap: new Map(),
          index: 0,
        });
      });

      it('should append it to the resource list', () => {
        expect(contextFixture.resourceList).toStrictEqual([result]);
      });
    });
  });

  describe('having a context with a resource', () => {
    describe('when called', () => {
      let result: JsonSchemaResource;

      beforeAll(() => {
        const contextFixture: TransformJsonSchemaContext =
          buildContextFixture();

        buildJsonSchemaResource(contextFixture);

        result = buildJsonSchemaResource(contextFixture);
      });

      it('should assign the next index', () => {
        expect(result.index).toBe(1);
      });
    });
  });
});
