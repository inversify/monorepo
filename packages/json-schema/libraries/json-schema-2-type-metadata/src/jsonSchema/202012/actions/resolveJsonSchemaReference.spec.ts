import { beforeAll, describe, expect, it } from 'vitest';

import {
  type JsonRootSchema,
  type JsonSchema,
  type JsonSchemaObject,
} from '@inversifyjs/json-schema-types/2020-12';

import { type JsonSchemaResource } from '../models/JsonSchemaResource.js';
import { type ParsedJsonSchemaReference } from '../models/ParsedJsonSchemaReference.js';
import { type TransformJsonSchemaContext } from '../models/TransformJsonSchemaContext.js';
import { type TransformJsonSchemaScope } from '../models/TransformJsonSchemaScope.js';
import { resolveJsonSchemaReference } from './resolveJsonSchemaReference.js';

function buildContextFixture(
  referenceMap: Map<string, JsonRootSchema | JsonSchema>,
): TransformJsonSchemaContext {
  return {
    referenceMap,
    resourceList: [],
    resourceMap: new Map(),
    schemaToBindingsToTypeMap: new Map(),
  };
}

function buildScopeFixture(
  resource: JsonSchemaResource,
): TransformJsonSchemaScope {
  return {
    dynamicAnchorBindings: {
      key: '',
      nameToResourceMap: new Map(),
    },
    resource,
  };
}

describe(resolveJsonSchemaReference, () => {
  describe('having a local plain name reference matching an $anchor', () => {
    describe('when called', () => {
      let anchoredJsonSchemaFixture: JsonSchemaObject;
      let result: JsonRootSchema | JsonSchema | undefined;

      beforeAll(() => {
        anchoredJsonSchemaFixture = { type: 'string' };

        const referenceFixture: ParsedJsonSchemaReference = {
          anchor: 'node',
          isLocal: true,
          value: '#node',
        };
        const resourceFixture: JsonSchemaResource = {
          anchorMap: new Map([['node', anchoredJsonSchemaFixture]]),
          dynamicAnchorMap: new Map(),
          index: 0,
        };

        result = resolveJsonSchemaReference(
          referenceFixture,
          buildContextFixture(new Map([['#node', { type: 'integer' }]])),
          buildScopeFixture(resourceFixture),
        );
      });

      it('should return the anchored schema', () => {
        expect(result).toBe(anchoredJsonSchemaFixture);
      });
    });
  });

  describe('having a local plain name reference matching a $dynamicAnchor', () => {
    describe('when called', () => {
      let anchoredJsonSchemaFixture: JsonSchemaObject;
      let result: JsonRootSchema | JsonSchema | undefined;

      beforeAll(() => {
        anchoredJsonSchemaFixture = { type: 'string' };

        const referenceFixture: ParsedJsonSchemaReference = {
          anchor: 'node',
          isLocal: true,
          value: '#node',
        };
        const resourceFixture: JsonSchemaResource = {
          anchorMap: new Map(),
          dynamicAnchorMap: new Map([['node', anchoredJsonSchemaFixture]]),
          index: 0,
        };

        result = resolveJsonSchemaReference(
          referenceFixture,
          buildContextFixture(new Map()),
          buildScopeFixture(resourceFixture),
        );
      });

      it('should return the anchored schema', () => {
        expect(result).toBe(anchoredJsonSchemaFixture);
      });
    });
  });

  describe('having a local plain name reference matching no anchor', () => {
    describe('when called', () => {
      let referencedJsonSchemaFixture: JsonSchemaObject;
      let result: JsonRootSchema | JsonSchema | undefined;

      beforeAll(() => {
        referencedJsonSchemaFixture = { type: 'string' };

        const referenceFixture: ParsedJsonSchemaReference = {
          anchor: 'node',
          isLocal: true,
          value: '#node',
        };
        const resourceFixture: JsonSchemaResource = {
          anchorMap: new Map(),
          dynamicAnchorMap: new Map(),
          index: 0,
        };

        result = resolveJsonSchemaReference(
          referenceFixture,
          buildContextFixture(
            new Map([['#node', referencedJsonSchemaFixture]]),
          ),
          buildScopeFixture(resourceFixture),
        );
      });

      it('should return the reference map entry', () => {
        expect(result).toBe(referencedJsonSchemaFixture);
      });
    });
  });

  describe('having a local JSON pointer reference', () => {
    describe('when called', () => {
      let referencedJsonSchemaFixture: JsonSchemaObject;
      let result: JsonRootSchema | JsonSchema | undefined;

      beforeAll(() => {
        referencedJsonSchemaFixture = { type: 'string' };

        const referenceFixture: ParsedJsonSchemaReference = {
          anchor: undefined,
          isLocal: true,
          value: '#/$defs/node',
        };
        const resourceFixture: JsonSchemaResource = {
          anchorMap: new Map([['node', { type: 'integer' }]]),
          dynamicAnchorMap: new Map(),
          index: 0,
        };

        result = resolveJsonSchemaReference(
          referenceFixture,
          buildContextFixture(
            new Map([['#/$defs/node', referencedJsonSchemaFixture]]),
          ),
          buildScopeFixture(resourceFixture),
        );
      });

      it('should return the reference map entry', () => {
        expect(result).toBe(referencedJsonSchemaFixture);
      });
    });
  });

  describe('having a reference with a path part matching an anchor name', () => {
    describe('when called', () => {
      let referencedJsonSchemaFixture: JsonSchemaObject;
      let result: JsonRootSchema | JsonSchema | undefined;

      beforeAll(() => {
        referencedJsonSchemaFixture = { type: 'string' };

        const referenceFixture: ParsedJsonSchemaReference = {
          anchor: 'node',
          isLocal: false,
          value: 'https://example.com/tree#node',
        };
        const resourceFixture: JsonSchemaResource = {
          anchorMap: new Map([['node', { type: 'integer' }]]),
          dynamicAnchorMap: new Map(),
          index: 0,
        };

        result = resolveJsonSchemaReference(
          referenceFixture,
          buildContextFixture(
            new Map([
              ['https://example.com/tree#node', referencedJsonSchemaFixture],
            ]),
          ),
          buildScopeFixture(resourceFixture),
        );
      });

      it('should return the reference map entry', () => {
        expect(result).toBe(referencedJsonSchemaFixture);
      });
    });
  });

  describe('having an unresolvable reference', () => {
    describe('when called', () => {
      let result: JsonRootSchema | JsonSchema | undefined;

      beforeAll(() => {
        const referenceFixture: ParsedJsonSchemaReference = {
          anchor: undefined,
          isLocal: false,
          value: 'https://example.com/missing',
        };
        const resourceFixture: JsonSchemaResource = {
          anchorMap: new Map(),
          dynamicAnchorMap: new Map(),
          index: 0,
        };

        result = resolveJsonSchemaReference(
          referenceFixture,
          buildContextFixture(new Map()),
          buildScopeFixture(resourceFixture),
        );
      });

      it('should return undefined', () => {
        expect(result).toBeUndefined();
      });
    });
  });
});
