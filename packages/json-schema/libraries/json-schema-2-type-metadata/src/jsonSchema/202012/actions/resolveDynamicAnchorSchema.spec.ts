import { beforeAll, describe, expect, it } from 'vitest';

import {
  type JsonRootSchema,
  type JsonSchema,
  type JsonSchemaObject,
} from '@inversifyjs/json-schema-types/2020-12';

import { type JsonSchemaResource } from '../models/JsonSchemaResource.js';
import { type TransformJsonSchemaContext } from '../models/TransformJsonSchemaContext.js';
import { type TransformJsonSchemaScope } from '../models/TransformJsonSchemaScope.js';
import { resolveDynamicAnchorSchema } from './resolveDynamicAnchorSchema.js';

function buildContextFixture(): TransformJsonSchemaContext {
  return {
    referenceMap: new Map(),
    resourceList: [],
    resourceMap: new Map(),
    schemaToBindingsToTypeMap: new Map(),
  };
}

describe(resolveDynamicAnchorSchema, () => {
  describe('having no anchor', () => {
    describe('when called', () => {
      let initialJsonSchemaFixture: JsonSchemaObject;
      let result: JsonRootSchema | JsonSchema;

      beforeAll(() => {
        initialJsonSchemaFixture = { type: 'string' };

        const resourceFixture: JsonSchemaResource = {
          anchorMap: new Map(),
          dynamicAnchorMap: new Map(),
          index: 0,
        };
        const scopeFixture: TransformJsonSchemaScope = {
          dynamicAnchorBindings: {
            key: '',
            nameToResourceMap: new Map(),
          },
          resource: resourceFixture,
        };

        result = resolveDynamicAnchorSchema(
          undefined,
          initialJsonSchemaFixture,
          buildContextFixture(),
          scopeFixture,
        );
      });

      it('should return the initial schema', () => {
        expect(result).toBe(initialJsonSchemaFixture);
      });
    });
  });

  describe('having an initial schema declaring no matching $dynamicAnchor', () => {
    describe('when called', () => {
      let initialJsonSchemaFixture: JsonSchemaObject;
      let result: JsonRootSchema | JsonSchema;

      beforeAll(() => {
        initialJsonSchemaFixture = { $anchor: 'node', type: 'string' };

        const contextFixture: TransformJsonSchemaContext =
          buildContextFixture();
        const targetResourceFixture: JsonSchemaResource = {
          anchorMap: new Map([['node', initialJsonSchemaFixture]]),
          dynamicAnchorMap: new Map(),
          index: 0,
        };

        contextFixture.resourceMap.set(
          initialJsonSchemaFixture,
          targetResourceFixture,
        );

        const outerResourceFixture: JsonSchemaResource = {
          anchorMap: new Map(),
          dynamicAnchorMap: new Map([['node', { type: 'integer' }]]),
          index: 1,
        };

        result = resolveDynamicAnchorSchema(
          'node',
          initialJsonSchemaFixture,
          contextFixture,
          {
            dynamicAnchorBindings: {
              key: 'node:1',
              nameToResourceMap: new Map([['node', outerResourceFixture]]),
            },
            resource: targetResourceFixture,
          },
        );
      });

      it('should return the initial schema', () => {
        expect(result).toBe(initialJsonSchemaFixture);
      });
    });
  });

  describe('having a bookended anchor unbound in the dynamic scope', () => {
    describe('when called', () => {
      let initialJsonSchemaFixture: JsonSchemaObject;
      let result: JsonRootSchema | JsonSchema;

      beforeAll(() => {
        initialJsonSchemaFixture = { $dynamicAnchor: 'node' };

        const contextFixture: TransformJsonSchemaContext =
          buildContextFixture();
        const targetResourceFixture: JsonSchemaResource = {
          anchorMap: new Map(),
          dynamicAnchorMap: new Map([['node', initialJsonSchemaFixture]]),
          index: 0,
        };

        contextFixture.resourceMap.set(
          initialJsonSchemaFixture,
          targetResourceFixture,
        );

        result = resolveDynamicAnchorSchema(
          'node',
          initialJsonSchemaFixture,
          contextFixture,
          {
            dynamicAnchorBindings: {
              key: '',
              nameToResourceMap: new Map(),
            },
            resource: targetResourceFixture,
          },
        );
      });

      it('should return the initial schema', () => {
        expect(result).toBe(initialJsonSchemaFixture);
      });
    });
  });

  describe('having a bookended anchor bound in the dynamic scope', () => {
    describe('when called', () => {
      let outerJsonSchemaFixture: JsonSchemaObject;
      let result: JsonRootSchema | JsonSchema;

      beforeAll(() => {
        const initialJsonSchemaFixture: JsonSchemaObject = {
          $dynamicAnchor: 'node',
        };

        outerJsonSchemaFixture = { $dynamicAnchor: 'node', type: 'object' };

        const contextFixture: TransformJsonSchemaContext =
          buildContextFixture();
        const targetResourceFixture: JsonSchemaResource = {
          anchorMap: new Map(),
          dynamicAnchorMap: new Map([['node', initialJsonSchemaFixture]]),
          index: 0,
        };
        const outerResourceFixture: JsonSchemaResource = {
          anchorMap: new Map(),
          dynamicAnchorMap: new Map([['node', outerJsonSchemaFixture]]),
          index: 1,
        };

        contextFixture.resourceMap.set(
          initialJsonSchemaFixture,
          targetResourceFixture,
        );
        contextFixture.resourceMap.set(
          outerJsonSchemaFixture,
          outerResourceFixture,
        );

        result = resolveDynamicAnchorSchema(
          'node',
          initialJsonSchemaFixture,
          contextFixture,
          {
            dynamicAnchorBindings: {
              key: 'node:1',
              nameToResourceMap: new Map([['node', outerResourceFixture]]),
            },
            resource: targetResourceFixture,
          },
        );
      });

      it('should return the outermost declaration', () => {
        expect(result).toBe(outerJsonSchemaFixture);
      });
    });
  });

  describe('having a bookended anchor on a schema the context never indexed', () => {
    describe('when called', () => {
      let outerJsonSchemaFixture: JsonSchemaObject;
      let result: JsonRootSchema | JsonSchema;

      beforeAll(() => {
        const initialJsonSchemaFixture: JsonSchemaObject = {
          $dynamicAnchor: 'node',
        };

        outerJsonSchemaFixture = { $dynamicAnchor: 'node', type: 'object' };

        const outerResourceFixture: JsonSchemaResource = {
          anchorMap: new Map(),
          dynamicAnchorMap: new Map([['node', outerJsonSchemaFixture]]),
          index: 1,
        };

        result = resolveDynamicAnchorSchema(
          'node',
          initialJsonSchemaFixture,
          buildContextFixture(),
          {
            dynamicAnchorBindings: {
              key: 'node:1',
              nameToResourceMap: new Map([['node', outerResourceFixture]]),
            },
            resource: outerResourceFixture,
          },
        );
      });

      it('should fall back to its $dynamicAnchor keyword', () => {
        expect(result).toBe(outerJsonSchemaFixture);
      });
    });
  });

  describe('having a bookended anchor bound to a resource missing the declaration', () => {
    describe('when called', () => {
      let initialJsonSchemaFixture: JsonSchemaObject;
      let result: JsonRootSchema | JsonSchema;

      beforeAll(() => {
        initialJsonSchemaFixture = { $dynamicAnchor: 'node' };

        const contextFixture: TransformJsonSchemaContext =
          buildContextFixture();
        const targetResourceFixture: JsonSchemaResource = {
          anchorMap: new Map(),
          dynamicAnchorMap: new Map([['node', initialJsonSchemaFixture]]),
          index: 0,
        };
        const outerResourceFixture: JsonSchemaResource = {
          anchorMap: new Map(),
          dynamicAnchorMap: new Map(),
          index: 1,
        };

        contextFixture.resourceMap.set(
          initialJsonSchemaFixture,
          targetResourceFixture,
        );

        result = resolveDynamicAnchorSchema(
          'node',
          initialJsonSchemaFixture,
          contextFixture,
          {
            dynamicAnchorBindings: {
              key: 'node:1',
              nameToResourceMap: new Map([['node', outerResourceFixture]]),
            },
            resource: targetResourceFixture,
          },
        );
      });

      it('should return the initial schema', () => {
        expect(result).toBe(initialJsonSchemaFixture);
      });
    });
  });
});
