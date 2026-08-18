import { beforeAll, describe, expect, it } from 'vitest';

import { type JsonSchemaObject } from '@inversifyjs/json-schema-types/2020-12';

import { type JsonSchemaResource } from '../models/JsonSchemaResource.js';
import { type TransformJsonSchemaContext } from '../models/TransformJsonSchemaContext.js';
import { type TransformJsonSchemaScope } from '../models/TransformJsonSchemaScope.js';
import { enterJsonSchemaScope } from './enterJsonSchemaScope.js';

function buildResourceFixture(
  index: number,
  dynamicAnchorNameList: string[],
): JsonSchemaResource {
  return {
    anchorMap: new Map(),
    dynamicAnchorMap: new Map(
      dynamicAnchorNameList.map((name: string) => [name, true]),
    ),
    index,
  };
}

function buildContextFixture(): TransformJsonSchemaContext {
  return {
    referenceMap: new Map(),
    resourceList: [],
    resourceMap: new Map(),
    schemaToBindingsToTypeMap: new Map(),
  };
}

describe(enterJsonSchemaScope, () => {
  describe('having a JsonSchema owned by the current resource', () => {
    describe('when called', () => {
      let scopeFixture: TransformJsonSchemaScope;
      let result: TransformJsonSchemaScope;

      beforeAll(() => {
        const jsonSchemaFixture: JsonSchemaObject = {};
        const resourceFixture: JsonSchemaResource = buildResourceFixture(0, [
          'node',
        ]);
        const contextFixture: TransformJsonSchemaContext =
          buildContextFixture();

        contextFixture.resourceMap.set(jsonSchemaFixture, resourceFixture);

        scopeFixture = {
          dynamicAnchorBindings: {
            key: 'node:0',
            nameToResourceMap: new Map([['node', resourceFixture]]),
          },
          resource: resourceFixture,
        };

        result = enterJsonSchemaScope(
          jsonSchemaFixture,
          contextFixture,
          scopeFixture,
        );
      });

      it('should return the same scope', () => {
        expect(result).toBe(scopeFixture);
      });
    });
  });

  describe('having a JsonSchema the context never indexed', () => {
    describe('when called', () => {
      let scopeFixture: TransformJsonSchemaScope;
      let result: TransformJsonSchemaScope;

      beforeAll(() => {
        const resourceFixture: JsonSchemaResource = buildResourceFixture(0, []);
        const contextFixture: TransformJsonSchemaContext =
          buildContextFixture();

        scopeFixture = {
          dynamicAnchorBindings: {
            key: '',
            nameToResourceMap: new Map(),
          },
          resource: resourceFixture,
        };

        result = enterJsonSchemaScope({}, contextFixture, scopeFixture);
      });

      it('should return the same scope', () => {
        expect(result).toBe(scopeFixture);
      });
    });
  });

  describe('having a JsonSchema owned by another resource', () => {
    describe('when called', () => {
      let enteredResourceFixture: JsonSchemaResource;
      let outerResourceFixture: JsonSchemaResource;
      let result: TransformJsonSchemaScope;

      beforeAll(() => {
        const jsonSchemaFixture: JsonSchemaObject = {};

        enteredResourceFixture = buildResourceFixture(1, ['node', 'leaf']);
        outerResourceFixture = buildResourceFixture(0, ['node']);

        const contextFixture: TransformJsonSchemaContext =
          buildContextFixture();

        contextFixture.resourceMap.set(
          jsonSchemaFixture,
          enteredResourceFixture,
        );

        result = enterJsonSchemaScope(jsonSchemaFixture, contextFixture, {
          dynamicAnchorBindings: {
            key: 'node:0',
            nameToResourceMap: new Map([['node', outerResourceFixture]]),
          },
          resource: outerResourceFixture,
        });
      });

      it('should enter the owning resource', () => {
        expect(result.resource).toBe(enteredResourceFixture);
      });

      it('should extend the bindings with its unbound dynamic anchors', () => {
        expect(result.dynamicAnchorBindings.nameToResourceMap.get('leaf')).toBe(
          enteredResourceFixture,
        );
        expect(result.dynamicAnchorBindings.nameToResourceMap.get('node')).toBe(
          outerResourceFixture,
        );
      });
    });
  });
});
