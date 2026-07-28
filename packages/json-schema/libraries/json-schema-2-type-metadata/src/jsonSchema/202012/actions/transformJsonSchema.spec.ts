import { beforeAll, describe, expect, it } from 'vitest';

import {
  type AndTypeMetadata,
  type TypeMetadata,
  TypeMetadataKind,
} from '@inversifyjs/json-schema-type-metadata';
import {
  type JsonSchemaBoolean,
  type JsonSchemaObject,
} from '@inversifyjs/json-schema-types/2020-12';

import { type TransformJsonSchemaContext } from '../models/TransformJsonSchemaContext.js';
import { transformJsonSchema } from './transformJsonSchema.js';

function generateTransformJsonSchemaContext(): TransformJsonSchemaContext {
  return {
    jsonSchemaToTypeMap: new Map(),
    referenceMap: new Map(),
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
        const context: TransformJsonSchemaContext =
          generateTransformJsonSchemaContext();

        context.referenceMap.set(uriFixture, jsonSchemaFixture);

        result = transformJsonSchema(jsonSchemaFixture, context);
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
        const context: TransformJsonSchemaContext =
          generateTransformJsonSchemaContext();

        context.referenceMap.set(uriFixture, jsonSchemaFixture);
        context.referenceMap.set(childUriFixture, childJsonSchemaFixture);

        result = transformJsonSchema(jsonSchemaFixture, context);
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
        const context: TransformJsonSchemaContext =
          generateTransformJsonSchemaContext();

        context.referenceMap.set(uriFixture, jsonSchemaFixture);
        context.referenceMap.set(childUriFixture, childJsonSchemaFixture);

        result = transformJsonSchema(jsonSchemaFixture, context);
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
        const context: TransformJsonSchemaContext =
          generateTransformJsonSchemaContext();

        context.referenceMap.set(uriFixture, jsonSchemaFixture);
        context.referenceMap.set(childUriFixture, childJsonSchemaFixture);

        result = transformJsonSchema(jsonSchemaFixture, context);
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
});
