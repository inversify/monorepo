import { beforeAll, describe, expect, it } from 'vitest';

import { type DynamicAnchorBindings } from '../models/DynamicAnchorBindings.js';
import { type JsonSchemaResource } from '../models/JsonSchemaResource.js';
import { extendDynamicAnchorBindings } from './extendDynamicAnchorBindings.js';

const EMPTY_BINDINGS_FIXTURE: DynamicAnchorBindings = {
  key: '',
  nameToResourceMap: new Map(),
};

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

describe(extendDynamicAnchorBindings, () => {
  describe('having a resource with no dynamic anchors', () => {
    describe('when called', () => {
      let result: DynamicAnchorBindings;

      beforeAll(() => {
        result = extendDynamicAnchorBindings(
          EMPTY_BINDINGS_FIXTURE,
          buildResourceFixture(0, []),
        );
      });

      it('should return the same bindings', () => {
        expect(result).toBe(EMPTY_BINDINGS_FIXTURE);
      });
    });
  });

  describe('having a resource with an unbound dynamic anchor', () => {
    describe('when called', () => {
      let resourceFixture: JsonSchemaResource;
      let result: DynamicAnchorBindings;

      beforeAll(() => {
        resourceFixture = buildResourceFixture(2, ['node']);

        result = extendDynamicAnchorBindings(
          EMPTY_BINDINGS_FIXTURE,
          resourceFixture,
        );
      });

      it('should bind the name to the resource', () => {
        expect(result.nameToResourceMap.get('node')).toBe(resourceFixture);
      });

      it('should rebuild the key', () => {
        expect(result.key).toBe('node:2');
      });

      it('should leave the original bindings untouched', () => {
        expect(EMPTY_BINDINGS_FIXTURE.nameToResourceMap.size).toBe(0);
      });
    });
  });

  describe('having a resource whose dynamic anchors are all bound', () => {
    describe('when called', () => {
      let bindingsFixture: DynamicAnchorBindings;
      let outerResourceFixture: JsonSchemaResource;
      let result: DynamicAnchorBindings;

      beforeAll(() => {
        outerResourceFixture = buildResourceFixture(1, ['node']);
        bindingsFixture = extendDynamicAnchorBindings(
          EMPTY_BINDINGS_FIXTURE,
          outerResourceFixture,
        );

        result = extendDynamicAnchorBindings(
          bindingsFixture,
          buildResourceFixture(5, ['node']),
        );
      });

      it('should return the same bindings', () => {
        expect(result).toBe(bindingsFixture);
      });

      it('should keep the first binding', () => {
        expect(result.nameToResourceMap.get('node')).toBe(outerResourceFixture);
      });
    });
  });

  describe('having a resource with a bound and an unbound dynamic anchor', () => {
    describe('when called', () => {
      let innerResourceFixture: JsonSchemaResource;
      let outerResourceFixture: JsonSchemaResource;
      let result: DynamicAnchorBindings;

      beforeAll(() => {
        outerResourceFixture = buildResourceFixture(1, ['node']);
        innerResourceFixture = buildResourceFixture(4, ['node', 'leaf']);

        result = extendDynamicAnchorBindings(
          extendDynamicAnchorBindings(
            EMPTY_BINDINGS_FIXTURE,
            outerResourceFixture,
          ),
          innerResourceFixture,
        );
      });

      it('should bind the unbound name only', () => {
        expect(result.nameToResourceMap.get('node')).toBe(outerResourceFixture);
        expect(result.nameToResourceMap.get('leaf')).toBe(innerResourceFixture);
      });

      it('should rebuild the key', () => {
        expect(result.key).toBe('leaf:4,node:1');
      });
    });
  });
});
