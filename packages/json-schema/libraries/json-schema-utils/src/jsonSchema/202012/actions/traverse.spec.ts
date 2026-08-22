import {
  afterAll,
  beforeAll,
  describe,
  expect,
  it,
  type Mock,
  vitest,
} from 'vitest';

import {
  type JsonRootSchemaObject,
  type JsonSchema,
} from '@inversifyjs/json-schema-types/2020-12';

import { JsonRootSchemaFixtures } from '../fixtures/JsonRootSchemaFixtures.js';
import { type TraverseJsonSchemaCallback } from '../models/TraverseJsonSchemaCallback.js';
import { type TraverseJsonSchemaCallbackParams } from '../models/TraverseJsonSchemaCallbackParams.js';
import { traverse } from './traverse.js';

describe(traverse, () => {
  let callbackMock: Mock<TraverseJsonSchemaCallback>;

  beforeAll(() => {
    callbackMock = vitest.fn();
  });

  describe('when called', () => {
    beforeAll(() => {
      traverse({ schema: JsonRootSchemaFixtures.any }, callbackMock);
    });

    afterAll(() => {
      vitest.clearAllMocks();
    });

    it('should call callback() with the schema', () => {
      const expectedTraverseJsonSchemaCallbackParams: TraverseJsonSchemaCallbackParams =
        {
          jsonPointer: '',
          rootSchema: JsonRootSchemaFixtures.any,
          schema: JsonRootSchemaFixtures.any,
        };

      expect(callbackMock).toHaveBeenCalledTimes(1);
      expect(callbackMock).toHaveBeenCalledWith(
        expectedTraverseJsonSchemaCallbackParams,
      );
    });
  });

  describe.each<[string, JsonRootSchemaObject]>([
    ['$defs', JsonRootSchemaFixtures.with$DefsOne],
    ['dependentSchemas', JsonRootSchemaFixtures.withDependentSchemasOne],
    ['patternProperties', JsonRootSchemaFixtures.withPatternProperiesOne],
    ['properties', JsonRootSchemaFixtures.withProperiesOne],
  ])(
    '(key to schema map) having a schema with "%s"',
    (schemaKey: string, schemaFixture: JsonRootSchemaObject): void => {
      beforeAll(() => {
        traverse({ schema: schemaFixture }, callbackMock);
      });

      afterAll(() => {
        vitest.clearAllMocks();
      });

      it('should call callback() with the schema', () => {
        const expectedTraverseJsonSchemaCallbackParams: TraverseJsonSchemaCallbackParams =
          {
            jsonPointer: '',
            rootSchema: schemaFixture,
            schema: schemaFixture,
          };

        expect(callbackMock).toHaveBeenNthCalledWith(
          1,
          expectedTraverseJsonSchemaCallbackParams,
        );
      });

      it('should call callback() with every subschema', () => {
        const subschemaMap: Record<string, JsonSchema> = schemaFixture[
          schemaKey
        ] as Record<string, JsonSchema>;

        const subschemaMapEntries: [string, JsonSchema][] =
          Object.entries(subschemaMap);

        expect(callbackMock).toHaveBeenCalledTimes(
          subschemaMapEntries.length + 1,
        );

        for (const [
          index,
          [subschemaKey, subschema],
        ] of subschemaMapEntries.entries()) {
          const expectedTraverseJsonSchemaCallbackParams: TraverseJsonSchemaCallbackParams =
            {
              jsonPointer: `/${schemaKey}/${subschemaKey}`,
              rootSchema: schemaFixture,
              schema: subschema,
            };

          expect(callbackMock).toHaveBeenNthCalledWith(
            index + 2,
            expectedTraverseJsonSchemaCallbackParams,
          );
        }
      });
    },
  );

  describe.each<[string, JsonRootSchemaObject]>([
    ['allOf', JsonRootSchemaFixtures.withAllOfTwo],
    ['anyOf', JsonRootSchemaFixtures.withAnyOfTwo],
    ['oneOf', JsonRootSchemaFixtures.withOneOfTwo],
    ['prefixItems', JsonRootSchemaFixtures.withPrefixItemsOne],
  ])(
    '(schema array) having a schema with "%s"',
    (schemaKey: string, schemaFixture: JsonRootSchemaObject): void => {
      beforeAll(() => {
        traverse({ schema: schemaFixture }, callbackMock);
      });

      afterAll(() => {
        vitest.clearAllMocks();
      });

      it('should call callback() with the schema', () => {
        const expectedTraverseJsonSchemaCallbackParams: TraverseJsonSchemaCallbackParams =
          {
            jsonPointer: '',
            rootSchema: schemaFixture,
            schema: schemaFixture,
          };

        expect(callbackMock).toHaveBeenNthCalledWith(
          1,
          expectedTraverseJsonSchemaCallbackParams,
        );
      });

      it('should call callback() with every subschema', () => {
        const schemaArrays: JsonSchema[] = schemaFixture[
          schemaKey
        ] as JsonSchema[];

        expect(callbackMock).toHaveBeenCalledTimes(schemaArrays.length + 1);

        for (const [subschemaIndex, subschema] of schemaArrays.entries()) {
          const expectedTraverseJsonSchemaCallbackParams: TraverseJsonSchemaCallbackParams =
            {
              jsonPointer: `/${schemaKey}/${subschemaIndex.toString()}`,
              rootSchema: schemaFixture,
              schema: subschema,
            };

          expect(callbackMock).toHaveBeenNthCalledWith(
            subschemaIndex + 2,
            expectedTraverseJsonSchemaCallbackParams,
          );
        }
      });
    },
  );

  describe.each<[string, JsonRootSchemaObject]>([
    ['additionalProperties', JsonRootSchemaFixtures.withAdditionalProperties],
    ['contains', JsonRootSchemaFixtures.withContains],
    ['else', JsonRootSchemaFixtures.withElse],
    ['if', JsonRootSchemaFixtures.withIf],
    ['items', JsonRootSchemaFixtures.withItems],
    ['not', JsonRootSchemaFixtures.withNot],
    ['propertyNames', JsonRootSchemaFixtures.withPropertyNames],
    ['then', JsonRootSchemaFixtures.withThen],
    ['unevaluatedItems', JsonRootSchemaFixtures.withUnevaluatedItems],
    ['unevaluatedProperties', JsonRootSchemaFixtures.withUnevaluatedProperties],
  ])(
    '(schema) having a schema with "%s"',
    (schemaKey: string, schemaFixture: JsonRootSchemaObject): void => {
      beforeAll(() => {
        traverse({ schema: schemaFixture }, callbackMock);
      });

      afterAll(() => {
        vitest.clearAllMocks();
      });

      it('should call callback() with the schema', () => {
        const expectedTraverseJsonSchemaCallbackParams: TraverseJsonSchemaCallbackParams =
          {
            jsonPointer: '',
            rootSchema: schemaFixture,
            schema: schemaFixture,
          };

        expect(callbackMock).toHaveBeenNthCalledWith(
          1,
          expectedTraverseJsonSchemaCallbackParams,
        );
      });

      it('should call callback() with the subschema', () => {
        const subschema: JsonSchema = schemaFixture[schemaKey] as JsonSchema;

        expect(callbackMock).toHaveBeenCalledTimes(2);

        const expectedTraverseJsonSchemaCallbackParams: TraverseJsonSchemaCallbackParams =
          {
            jsonPointer: `/${schemaKey}`,
            rootSchema: schemaFixture,
            schema: subschema,
          };

        expect(callbackMock).toHaveBeenNthCalledWith(
          2,
          expectedTraverseJsonSchemaCallbackParams,
        );
      });
    },
  );

  describe('having a schema with nested properties', () => {
    let schemaFixture: JsonRootSchemaObject;
    let nestedSchemaFixture: JsonSchema;
    let descendantSchemaFixture: JsonSchema;

    beforeAll(() => {
      descendantSchemaFixture = {
        type: 'string',
      };
      nestedSchemaFixture = {
        properties: {
          bar: descendantSchemaFixture,
        },
      };
      schemaFixture = {
        ...JsonRootSchemaFixtures.any,
        properties: {
          foo: nestedSchemaFixture,
        },
      };
    });

    describe('when called, and the root callback returns traverseChildren false', () => {
      beforeAll(() => {
        callbackMock.mockReturnValueOnce({
          traverseChildren: false,
        });

        traverse({ schema: schemaFixture }, callbackMock);
      });

      afterAll(() => {
        vitest.clearAllMocks();
      });

      it('should call callback() with the schema', () => {
        const expectedTraverseJsonSchemaCallbackParams: TraverseJsonSchemaCallbackParams =
          {
            jsonPointer: '',
            rootSchema: schemaFixture,
            schema: schemaFixture,
          };

        expect(callbackMock).toHaveBeenCalledTimes(1);
        expect(callbackMock).toHaveBeenCalledWith(
          expectedTraverseJsonSchemaCallbackParams,
        );
      });

      it('should not call callback() with descendants', () => {
        const expectedNestedTraverseJsonSchemaCallbackParams: TraverseJsonSchemaCallbackParams =
          {
            jsonPointer: '/properties/foo',
            rootSchema: schemaFixture,
            schema: nestedSchemaFixture,
          };
        const expectedDescendantTraverseJsonSchemaCallbackParams: TraverseJsonSchemaCallbackParams =
          {
            jsonPointer: '/properties/foo/properties/bar',
            rootSchema: schemaFixture,
            schema: descendantSchemaFixture,
          };

        expect(callbackMock).not.toHaveBeenCalledWith(
          expectedNestedTraverseJsonSchemaCallbackParams,
        );
        expect(callbackMock).not.toHaveBeenCalledWith(
          expectedDescendantTraverseJsonSchemaCallbackParams,
        );
      });
    });

    describe('when called, and a nested callback returns traverseChildren false', () => {
      beforeAll(() => {
        callbackMock.mockReturnValueOnce({
          traverseChildren: true,
        });
        callbackMock.mockReturnValueOnce({
          traverseChildren: false,
        });

        traverse({ schema: schemaFixture }, callbackMock);
      });

      afterAll(() => {
        vitest.clearAllMocks();
      });

      it('should call callback() with the schema', () => {
        const expectedTraverseJsonSchemaCallbackParams: TraverseJsonSchemaCallbackParams =
          {
            jsonPointer: '',
            rootSchema: schemaFixture,
            schema: schemaFixture,
          };

        expect(callbackMock).toHaveBeenNthCalledWith(
          1,
          expectedTraverseJsonSchemaCallbackParams,
        );
      });

      it('should call callback() with the nested schema', () => {
        const expectedTraverseJsonSchemaCallbackParams: TraverseJsonSchemaCallbackParams =
          {
            jsonPointer: '/properties/foo',
            rootSchema: schemaFixture,
            schema: nestedSchemaFixture,
          };

        expect(callbackMock).toHaveBeenCalledTimes(2);
        expect(callbackMock).toHaveBeenNthCalledWith(
          2,
          expectedTraverseJsonSchemaCallbackParams,
        );
      });

      it('should not call callback() with descendants of the nested schema', () => {
        const expectedDescendantTraverseJsonSchemaCallbackParams: TraverseJsonSchemaCallbackParams =
          {
            jsonPointer: '/properties/foo/properties/bar',
            rootSchema: schemaFixture,
            schema: descendantSchemaFixture,
          };

        expect(callbackMock).not.toHaveBeenCalledWith(
          expectedDescendantTraverseJsonSchemaCallbackParams,
        );
      });
    });
  });
});
