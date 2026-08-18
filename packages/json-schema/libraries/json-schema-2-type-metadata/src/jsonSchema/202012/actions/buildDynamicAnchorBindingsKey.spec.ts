import { beforeAll, describe, expect, it } from 'vitest';

import { type JsonSchemaResource } from '../models/JsonSchemaResource.js';
import { buildDynamicAnchorBindingsKey } from './buildDynamicAnchorBindingsKey.js';

function buildResourceFixture(index: number): JsonSchemaResource {
  return {
    anchorMap: new Map(),
    dynamicAnchorMap: new Map(),
    index,
  };
}

describe(buildDynamicAnchorBindingsKey, () => {
  describe('having empty bindings', () => {
    describe('when called', () => {
      let result: string;

      beforeAll(() => {
        result = buildDynamicAnchorBindingsKey(new Map());
      });

      it('should return an empty string', () => {
        expect(result).toBe('');
      });
    });
  });

  describe('having bindings with a single name', () => {
    describe('when called', () => {
      let result: string;

      beforeAll(() => {
        result = buildDynamicAnchorBindingsKey(
          new Map([['node', buildResourceFixture(3)]]),
        );
      });

      it('should return the name and the resource index', () => {
        expect(result).toBe('node:3');
      });
    });
  });

  describe('having bindings with the same entries in a different insertion order', () => {
    describe('when called', () => {
      let result: string;
      let reversedResult: string;

      beforeAll(() => {
        const firstResourceFixture: JsonSchemaResource =
          buildResourceFixture(1);
        const secondResourceFixture: JsonSchemaResource =
          buildResourceFixture(2);

        result = buildDynamicAnchorBindingsKey(
          new Map([
            ['alpha', firstResourceFixture],
            ['beta', secondResourceFixture],
          ]),
        );
        reversedResult = buildDynamicAnchorBindingsKey(
          new Map([
            ['beta', secondResourceFixture],
            ['alpha', firstResourceFixture],
          ]),
        );
      });

      it('should return the same key', () => {
        expect(result).toBe('alpha:1,beta:2');
        expect(reversedResult).toBe(result);
      });
    });
  });

  describe('having bindings differing on a resource index', () => {
    describe('when called', () => {
      let result: string;
      let otherResult: string;

      beforeAll(() => {
        result = buildDynamicAnchorBindingsKey(
          new Map([['node', buildResourceFixture(1)]]),
        );
        otherResult = buildDynamicAnchorBindingsKey(
          new Map([['node', buildResourceFixture(2)]]),
        );
      });

      it('should return different keys', () => {
        expect(result).not.toBe(otherResult);
      });
    });
  });
});
