import { beforeAll, describe, expect, it } from 'vitest';

import {
  type JsonSchema,
  type JsonSchemaObject,
} from '@inversifyjs/json-schema-types/2020-12';
import { JsonSchemaResolver } from '@inversifyjs/json-schema-utils/2020-12';
import ts from 'typescript';

import {
  type TransformJsonSchemaContext,
  transformJsonSchemaToTypeScript,
} from '../index.js';

function generateTransformJsonSchemaContext(
  schemas: JsonSchema[] = [],
): TransformJsonSchemaContext {
  const schemaById: Map<string, JsonSchema> = new Map();

  for (const schema of schemas) {
    if (typeof schema === 'object' && schema.$id !== undefined) {
      schemaById.set(schema.$id, schema);
    }
  }

  return {
    resolver: new JsonSchemaResolver((id: string) => schemaById.get(id)),
  };
}

function getTypeScriptDiagnosticMessages(
  source: string,
  exactOptionalPropertyTypes: boolean = true,
): string[] {
  const fileName: string = 'generated.ts';
  const compilerOptions: ts.CompilerOptions = {
    exactOptionalPropertyTypes,
    module: ts.ModuleKind.ESNext,
    noEmit: true,
    noLib: true,
    strict: true,
    target: ts.ScriptTarget.ESNext,
  };
  const sourceFile: ts.SourceFile = ts.createSourceFile(
    fileName,
    source,
    ts.ScriptTarget.ESNext,
    true,
    ts.ScriptKind.TS,
  );
  const compilerHost: ts.CompilerHost = {
    directoryExists: () => true,
    fileExists: (path: string) => path === fileName,
    getCanonicalFileName: (path: string) => path,
    getCurrentDirectory: () => '',
    getDefaultLibFileName: () => '',
    getDirectories: () => [],
    getNewLine: () => '\n',
    getSourceFile: (path: string) =>
      path === fileName ? sourceFile : undefined,
    readFile: (path: string) => (path === fileName ? source : undefined),
    useCaseSensitiveFileNames: () => true,
    writeFile: () => undefined,
  };
  const program: ts.Program = ts.createProgram(
    [fileName],
    compilerOptions,
    compilerHost,
  );

  return [
    ...program.getSyntacticDiagnostics(sourceFile),
    ...program.getSemanticDiagnostics(sourceFile),
  ].map((diagnostic: ts.Diagnostic) =>
    ts.flattenDiagnosticMessageText(diagnostic.messageText, '\n'),
  );
}

describe(transformJsonSchemaToTypeScript, () => {
  describe.each<[string, JsonSchema, string]>([
    ['an empty schema', {}, 'export type Root = unknown;'],
    ['a true schema', true, 'export type Root = unknown;'],
    ['a false schema', false, 'export type Root = never;'],
    ['a string schema', { type: 'string' }, 'export type Root = string;'],
    ['a number schema', { type: 'number' }, 'export type Root = number;'],
    ['an integer schema', { type: 'integer' }, 'export type Root = number;'],
    ['a boolean schema', { type: 'boolean' }, 'export type Root = boolean;'],
    ['a null schema', { type: 'null' }, 'export type Root = null;'],
    ['an object schema', { type: 'object' }, 'export type Root = object;'],
    ['an array schema', { type: 'array' }, 'export type Root = unknown[];'],
    [
      'a nullable string schema',
      { type: ['string', 'null'] },
      'export type Root = string | null;',
    ],
    [
      'an array schema with string items',
      {
        items: {
          type: 'string',
        },
        type: 'array',
      },
      'export type Root = string[];',
    ],
    [
      'an array schema with boolean items',
      {
        items: false,
        type: 'array',
      },
      'export type Root = never[];',
    ],
    [
      'an array schema with unconstrained items',
      {
        items: true,
        type: 'array',
      },
      'export type Root = unknown[];',
    ],
    [
      'an array schema with nested array items',
      {
        items: {
          items: {
            type: 'number',
          },
          type: 'array',
        },
        type: 'array',
      },
      'export type Root = number[][];',
    ],
    [
      'an array schema with union items',
      {
        items: {
          type: ['string', 'number'],
        },
        type: 'array',
      },
      'export type Root = (string | number)[];',
    ],
    [
      'an array schema with object items',
      {
        items: {
          properties: {
            id: {
              type: 'string',
            },
          },
          required: ['id'],
          type: 'object',
        },
        type: 'array',
      },
      'export type Root = { id: string }[];',
    ],
    [
      'an items schema without a type keyword',
      {
        items: {
          type: 'string',
        },
      },
      'export type Root = string[] | boolean | number | null | object | string;',
    ],
    [
      'an object schema with items',
      {
        items: {
          type: 'string',
        },
        type: 'object',
      },
      'export type Root = object;',
    ],
    [
      'a nullable array schema with string items',
      {
        items: {
          type: 'string',
        },
        type: ['array', 'null'],
      },
      'export type Root = string[] | null;',
    ],
    [
      'a titled nullable array schema with string items',
      {
        items: {
          type: 'string',
        },
        title: 'Names',
        type: ['array', 'null'],
      },
      'export type Names = string[] | null;',
    ],
    [
      'an allOf items schema and a nullable array type',
      {
        allOf: [
          {
            items: {
              type: 'string',
            },
          },
          {
            type: ['array', 'null'],
          },
        ],
      },
      'export type Root = string[] | null;',
    ],
    [
      'a nullable array schema with union items',
      {
        items: {
          type: ['string', 'number'],
        },
        type: ['array', 'null'],
      },
      'export type Root = (string | number)[] | null;',
    ],
    [
      'a titled array schema',
      {
        items: {
          type: 'string',
        },
        title: 'Names',
        type: 'array',
      },
      'export type Names = string[];',
    ],
    [
      'an array schema with titled object items',
      {
        items: {
          properties: {
            id: {
              type: 'string',
            },
          },
          required: ['id'],
          title: 'User',
          type: 'object',
        },
        type: 'array',
      },
      'export type User = { id: string };\nexport type Root = User[];',
    ],
    ['a const string schema', { const: 'foo' }, 'export type Root = "foo";'],
    ['a const number schema', { const: 1 }, 'export type Root = 1;'],
    ['a const boolean schema', { const: true }, 'export type Root = true;'],
    ['a const null schema', { const: null }, 'export type Root = null;'],
    [
      'a const array schema',
      { const: [1, 'a'] },
      'export type Root = [1, "a"];',
    ],
    [
      'a const object schema',
      { const: { foo: 'bar' } },
      'export type Root = { foo: "bar" };',
    ],
    [
      'an enum schema',
      { enum: ['foo', 'bar'] },
      'export type Root = "foo" | "bar";',
    ],
    [
      'a mixed enum schema',
      { enum: [1, 'a', null, true] },
      'export type Root = 1 | "a" | null | true;',
    ],
    [
      'a string schema with an enum',
      {
        enum: ['a', 'b'],
        type: 'string',
      },
      'export type Type1 = string;\nexport type Root = (Type1 & "a") | (Type1 & "b");',
    ],
    [
      'a string schema with a const',
      {
        const: 'foo',
        type: 'string',
      },
      'export type Root = "foo" & string;',
    ],
    [
      'an allOf schema of properties',
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
                type: 'number',
              },
            },
          },
        ],
      },
      'export type Root = { foo?: string; bar?: number };',
    ],
    [
      'an allOf schema of overlapping properties of the same type',
      {
        allOf: [
          {
            properties: {
              bar: {
                type: 'boolean',
              },
              foo: {
                type: 'string',
              },
            },
          },
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
                type: 'boolean',
              },
              foo: {
                type: 'string',
              },
            },
          },
        ],
      },
      'export type Root = { bar?: boolean; foo?: string };',
    ],
    [
      'an allOf schema of overlapping required properties of disjoint types',
      {
        allOf: [
          {
            properties: {
              id: {
                type: 'string',
              },
            },
            required: ['id'],
          },
          {
            properties: {
              id: {
                type: 'number',
              },
            },
            required: ['id'],
          },
        ],
      },
      'export type Root = never;',
    ],
    [
      'an allOf schema of overlapping optional properties of disjoint types',
      {
        allOf: [
          {
            properties: {
              id: {
                type: 'string',
              },
            },
          },
          {
            properties: {
              id: {
                type: 'number',
              },
            },
          },
        ],
      },
      'export type Root = { id?: never };',
    ],
    [
      'an allOf schema of overlapping type unions',
      {
        allOf: [
          {
            type: ['string', 'number'],
          },
          {
            type: ['number', 'boolean'],
          },
        ],
      },
      'export type Root = number;',
    ],
    [
      'an allOf schema including true',
      {
        allOf: [
          true,
          {
            type: 'string',
          },
        ],
      },
      'export type Root = string;',
    ],
    [
      'an allOf schema including false',
      {
        allOf: [
          false,
          {
            type: 'string',
          },
        ],
      },
      'export type Root = never;',
    ],
    [
      'an anyOf schema of primitive types',
      {
        anyOf: [
          {
            type: 'string',
          },
          {
            type: 'number',
          },
        ],
      },
      'export type Root = string | number;',
    ],
    [
      'an anyOf schema of properties',
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
                type: 'number',
              },
            },
          },
        ],
      },
      'export type Root = { foo?: string } | { bar?: number };',
    ],
    [
      'an anyOf schema including true',
      {
        anyOf: [
          true,
          {
            type: 'string',
          },
        ],
      },
      'export type Root = unknown;',
    ],
    [
      'an anyOf schema including false',
      {
        anyOf: [
          false,
          {
            type: 'string',
          },
        ],
      },
      'export type Root = string;',
    ],
    [
      'a oneOf schema of primitive types',
      {
        oneOf: [
          {
            type: 'string',
          },
          {
            type: 'boolean',
          },
        ],
      },
      'export type Root = string | boolean;',
    ],
    [
      'a required property schema',
      {
        properties: {
          foo: {
            type: 'string',
          },
        },
        required: ['foo'],
      },
      'export type Root = { foo: string };',
    ],
    [
      'an additionalProperties schema',
      {
        additionalProperties: {
          type: 'string',
        },
      },
      'export type Root = { [key: string]: string };',
    ],
    [
      'an additionalProperties true schema',
      {
        additionalProperties: true,
      },
      'export type Root = { [key: string]: unknown };',
    ],
    [
      'an additionalProperties false schema',
      {
        additionalProperties: false,
      },
      'export type Root = { [key: string]: never };',
    ],
    [
      'an object schema with additionalProperties false',
      {
        additionalProperties: false,
        type: 'object',
      },
      'export type Root = { [key: string]: never };',
    ],
    [
      'an object schema with properties and additionalProperties false',
      {
        additionalProperties: false,
        properties: {
          id: {
            type: 'string',
          },
        },
        required: ['id'],
        type: 'object',
      },
      'export type Root = { id: string };',
    ],
    [
      'an object schema with properties and additionalProperties',
      {
        additionalProperties: {
          type: 'string',
        },
        properties: {
          id: {
            type: 'string',
          },
        },
        required: ['id'],
        type: 'object',
      },
      'export type Root = { [key: string]: string; id: string };',
    ],
    [
      'an object schema with optional properties and additionalProperties',
      {
        additionalProperties: {
          type: 'string',
        },
        properties: {
          id: {
            type: 'string',
          },
        },
        type: 'object',
      },
      'export type Root = { [key: string]: string | undefined; id?: string };',
    ],
    [
      'an object schema with quoted and reserved property names',
      {
        properties: {
          class: {
            type: 'number',
          },
          'foo-bar': {
            type: 'string',
          },
        },
        required: ['foo-bar'],
        type: 'object',
      },
      'export type Root = { class?: number; "foo-bar": string };',
    ],
    [
      'a titled schema whose title is a reserved word',
      {
        title: 'string',
        type: 'string',
      },
      'export type _string = string;',
    ],
    [
      'a $ref with a sibling type keyword',
      {
        $id: 'https://example.com/schema',
        $ref: 'https://example.com/referenced',
        type: 'string',
      },
      'export type Root = never;',
    ],
  ])(
    'having %s',
    (_: string, jsonSchemaFixture: JsonSchema, expected: string) => {
      describe('when called', () => {
        let result: unknown;

        beforeAll(() => {
          result = transformJsonSchemaToTypeScript(
            jsonSchemaFixture,
            generateTransformJsonSchemaContext(
              typeof jsonSchemaFixture === 'object' &&
                jsonSchemaFixture.$id !== undefined
                ? [
                    jsonSchemaFixture,
                    {
                      $id: 'https://example.com/referenced',
                      type: 'object',
                    },
                  ]
                : [],
            ),
          );
        });

        it('should return the expected TypeScript module', () => {
          expect(result).toBe(expected);
        });

        it('should return a TypeScript module that compiles', () => {
          expect(
            getTypeScriptDiagnosticMessages(result as string),
          ).toStrictEqual([]);
        });
      });
    },
  );

  describe('having an object schema with required and optional properties, nested objects, arrays and enums', () => {
    let jsonSchemaFixture: JsonSchemaObject;

    beforeAll(() => {
      jsonSchemaFixture = {
        $id: 'https://example.com/user',
        properties: {
          address: {
            properties: {
              city: {
                type: 'string',
              },
              zip: {
                type: 'string',
              },
            },
            required: ['city'],
            type: 'object',
          },
          id: {
            type: 'string',
          },
          roles: {
            items: {
              enum: ['admin', 'user'],
            },
            type: 'array',
          },
          tags: {
            additionalProperties: {
              type: 'string',
            },
            type: 'object',
          },
        },
        required: ['id', 'roles'],
        title: 'User',
        type: 'object',
      };
    });

    describe('when called', () => {
      let result: unknown;

      beforeAll(() => {
        result = transformJsonSchemaToTypeScript(
          jsonSchemaFixture,
          generateTransformJsonSchemaContext([jsonSchemaFixture]),
        );
      });

      it('should return the expected TypeScript module', () => {
        expect(result).toBe(
          'export type User = { address?: { city: string; zip?: string }; id: string; roles: ("admin" | "user")[]; tags?: { [key: string]: string } };',
        );
      });

      it('should return a TypeScript module that compiles', () => {
        expect(getTypeScriptDiagnosticMessages(result as string)).toStrictEqual(
          [],
        );
      });
    });
  });

  describe('having a recursive object schema', () => {
    let jsonSchemaFixture: JsonSchemaObject;

    beforeAll(() => {
      jsonSchemaFixture = {
        $id: 'https://example.com/node',
        properties: {
          next: {
            $ref: '#',
          },
          value: {
            type: 'string',
          },
        },
        required: ['value'],
        title: 'Node',
        type: 'object',
      };
    });

    describe('when called', () => {
      let result: unknown;

      beforeAll(() => {
        result = transformJsonSchemaToTypeScript(
          jsonSchemaFixture,
          generateTransformJsonSchemaContext([jsonSchemaFixture]),
        );
      });

      it('should return a recursive type alias', () => {
        expect(result).toBe(
          'export type Node = { next?: Node; value: string };',
        );
      });

      it('should return a TypeScript module that compiles', () => {
        expect(getTypeScriptDiagnosticMessages(result as string)).toStrictEqual(
          [],
        );
      });
    });
  });

  describe('having a titled $ref wrapper around a titled in-progress schema', () => {
    let jsonSchemaFixture: JsonSchemaObject;

    beforeAll(() => {
      jsonSchemaFixture = {
        $id: 'https://example.com/root',
        properties: {
          child: {
            $ref: '#',
            title: 'Alias',
          },
        },
        required: ['child'],
        title: 'Root',
        type: 'object',
      };
    });

    describe('when called', () => {
      let result: unknown;

      beforeAll(() => {
        result = transformJsonSchemaToTypeScript(
          jsonSchemaFixture,
          generateTransformJsonSchemaContext([jsonSchemaFixture]),
        );
      });

      it('should keep the wrapper title on the circular type alias', () => {
        expect(result).toBe('export type Alias = { child: Alias };');
      });

      it('should return a TypeScript module that compiles', () => {
        expect(getTypeScriptDiagnosticMessages(result as string)).toStrictEqual(
          [],
        );
      });
    });
  });

  describe('having a schema that $ref a titled schema', () => {
    let jsonSchemaFixture: JsonSchemaObject;
    let referencedJsonSchemaFixture: JsonSchemaObject;

    beforeAll(() => {
      referencedJsonSchemaFixture = {
        $id: 'https://example.com/user',
        properties: {
          id: {
            type: 'string',
          },
        },
        required: ['id'],
        title: 'User',
        type: 'object',
      };
      jsonSchemaFixture = {
        $id: 'https://example.com/response',
        properties: {
          user: {
            $ref: 'https://example.com/user',
          },
        },
        required: ['user'],
        title: 'Response',
        type: 'object',
      };
    });

    describe('when called', () => {
      let result: unknown;

      beforeAll(() => {
        result = transformJsonSchemaToTypeScript(
          jsonSchemaFixture,
          generateTransformJsonSchemaContext([
            jsonSchemaFixture,
            referencedJsonSchemaFixture,
          ]),
        );
      });

      it('should return named aliases for both schemas', () => {
        expect(result).toBe(
          'export type Response = { user: User };\nexport type User = { id: string };',
        );
      });

      it('should return a TypeScript module that compiles', () => {
        expect(getTypeScriptDiagnosticMessages(result as string)).toStrictEqual(
          [],
        );
      });
    });
  });

  describe('having a titled schema both as an anyOf sibling and via untitled $ref', () => {
    let addressJsonSchemaFixture: JsonSchemaObject;
    let jsonSchemaFixture: JsonSchemaObject;

    beforeAll(() => {
      addressJsonSchemaFixture = {
        $id: 'https://example.com/address',
        properties: {
          city: {
            type: 'string',
          },
        },
        required: ['city'],
        title: 'Address',
        type: 'object',
      };
      jsonSchemaFixture = {
        anyOf: [
          addressJsonSchemaFixture,
          {
            properties: {
              address: {
                $ref: 'https://example.com/address',
              },
              id: {
                type: 'string',
              },
            },
            required: ['address', 'id'],
            title: 'User',
            type: 'object',
          },
        ],
      };
    });

    describe('when called', () => {
      let result: unknown;

      beforeAll(() => {
        result = transformJsonSchemaToTypeScript(
          jsonSchemaFixture,
          generateTransformJsonSchemaContext([addressJsonSchemaFixture]),
        );
      });

      it('should reuse the titled alias for the $ref', () => {
        expect(result).toBe(
          'export type Address = { city: string };\nexport type User = { address: Address; id: string };\nexport type Root = Address | User;',
        );
      });

      it('should return a TypeScript module that compiles', () => {
        expect(getTypeScriptDiagnosticMessages(result as string)).toStrictEqual(
          [],
        );
      });
    });
  });

  describe('having a schema that $ref an untitled schema', () => {
    let jsonSchemaFixture: JsonSchemaObject;
    let referencedJsonSchemaFixture: JsonSchemaObject;

    beforeAll(() => {
      referencedJsonSchemaFixture = {
        $id: 'https://example.com/referenced',
        type: 'string',
      };
      jsonSchemaFixture = {
        $id: 'https://example.com/schema',
        $ref: 'https://example.com/referenced',
      };
    });

    describe('when called', () => {
      let result: unknown;

      beforeAll(() => {
        result = transformJsonSchemaToTypeScript(
          jsonSchemaFixture,
          generateTransformJsonSchemaContext([
            jsonSchemaFixture,
            referencedJsonSchemaFixture,
          ]),
        );
      });

      it('should inline the referenced type', () => {
        expect(result).toBe('export type Root = string;');
      });

      it('should return a TypeScript module that compiles', () => {
        expect(getTypeScriptDiagnosticMessages(result as string)).toStrictEqual(
          [],
        );
      });
    });
  });

  describe('having a nested relative $ref in properties', () => {
    let jsonSchemaFixture: JsonSchemaObject;
    let referencedJsonSchemaFixture: JsonSchemaObject;

    beforeAll(() => {
      referencedJsonSchemaFixture = {
        $id: 'https://example.com/other.json',
        type: 'string',
      };
      jsonSchemaFixture = {
        $id: 'https://example.com/schema.json',
        properties: {
          foo: {
            $ref: 'other.json',
          },
        },
        required: ['foo'],
      };
    });

    describe('when called', () => {
      let result: unknown;

      beforeAll(() => {
        result = transformJsonSchemaToTypeScript(
          jsonSchemaFixture,
          generateTransformJsonSchemaContext([
            jsonSchemaFixture,
            referencedJsonSchemaFixture,
          ]),
        );
      });

      it('should inline the referenced property type', () => {
        expect(result).toBe('export type Root = { foo: string };');
      });

      it('should return a TypeScript module that compiles', () => {
        expect(getTypeScriptDiagnosticMessages(result as string)).toStrictEqual(
          [],
        );
      });
    });
  });

  describe('having a $dynamicRef nested under properties and retargeted by an outer $dynamicAnchor', () => {
    let strictTreeFixture: JsonSchemaObject;
    let treeFixture: JsonSchemaObject;

    beforeAll(() => {
      treeFixture = {
        $dynamicAnchor: 'node',
        $id: 'https://example.com/tree',
        properties: {
          child: {
            $dynamicRef: '#node',
          },
        },
        required: ['child'],
      };
      strictTreeFixture = {
        $dynamicAnchor: 'node',
        $id: 'https://example.com/strict-tree',
        $ref: 'https://example.com/tree',
        type: 'object',
      };
    });

    describe('when called', () => {
      let result: unknown;

      beforeAll(() => {
        result = transformJsonSchemaToTypeScript(
          strictTreeFixture,
          generateTransformJsonSchemaContext([strictTreeFixture, treeFixture]),
        );
      });

      it('should return a recursive type alias', () => {
        expect(result).toBe(
          'export type Type1 = { child: Type1 };\nexport type Root = { child: Type1 };',
        );
      });

      it('should return a TypeScript module that compiles', () => {
        expect(getTypeScriptDiagnosticMessages(result as string)).toStrictEqual(
          [],
        );
      });
    });
  });

  describe('having a circular referenced JsonSchema with parent and child additional constraints', () => {
    let jsonSchemaFixture: JsonSchemaObject;
    let childJsonSchemaFixture: JsonSchemaObject;

    beforeAll(() => {
      jsonSchemaFixture = {
        $id: 'https://example.com/schema',
        $ref: 'https://example.com/child',
        properties: {
          foo: {
            type: 'string',
          },
        },
        type: 'object',
      };
      childJsonSchemaFixture = {
        $id: 'https://example.com/child',
        $ref: 'https://example.com/schema',
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
        result = transformJsonSchemaToTypeScript(
          jsonSchemaFixture,
          generateTransformJsonSchemaContext([
            childJsonSchemaFixture,
            jsonSchemaFixture,
          ]),
        );
      });

      it('should return a recursive intersection', () => {
        expect(result).toBe(
          'export type Type1 = { bar?: string; foo?: string };\nexport type Type2 = { foo?: string; bar?: string };\nexport type Root = { foo?: string } & Type1;',
        );
      });

      it('should return a TypeScript module that compiles', () => {
        expect(getTypeScriptDiagnosticMessages(result as string)).toStrictEqual(
          [],
        );
      });
    });
  });

  describe('having an untitled schema and a custom root name', () => {
    let jsonSchemaFixture: JsonSchemaObject;

    beforeAll(() => {
      jsonSchemaFixture = {
        type: 'boolean',
      };
    });

    describe('when called', () => {
      let result: unknown;

      beforeAll(() => {
        result = transformJsonSchemaToTypeScript(
          jsonSchemaFixture,
          generateTransformJsonSchemaContext(),
          {
            rootName: 'Flag',
          },
        );
      });

      it('should return the expected TypeScript module', () => {
        expect(result).toBe('export type Flag = boolean;');
      });

      it('should return a TypeScript module that compiles', () => {
        expect(getTypeScriptDiagnosticMessages(result as string)).toStrictEqual(
          [],
        );
      });
    });
  });

  describe('having a titled schema and a custom root name', () => {
    let jsonSchemaFixture: JsonSchemaObject;

    beforeAll(() => {
      jsonSchemaFixture = {
        title: 'User',
        type: 'string',
      };
    });

    describe('when called', () => {
      let result: unknown;

      beforeAll(() => {
        result = transformJsonSchemaToTypeScript(
          jsonSchemaFixture,
          generateTransformJsonSchemaContext(),
          {
            rootName: 'Ignored',
          },
        );
      });

      it('should use the schema title', () => {
        expect(result).toBe('export type User = string;');
      });

      it('should return a TypeScript module that compiles', () => {
        expect(getTypeScriptDiagnosticMessages(result as string)).toStrictEqual(
          [],
        );
      });
    });
  });

  describe('having an object schema with a const object property and structured additionalProperties', () => {
    let jsonSchemaFixture: JsonSchemaObject;

    beforeAll(() => {
      jsonSchemaFixture = {
        additionalProperties: {
          properties: {
            name: {
              type: 'string',
            },
          },
          required: ['name'],
          type: 'object',
        },
        properties: {
          data: {
            const: {
              name: 'x',
            },
          },
        },
        required: ['data'],
        type: 'object',
      };
    });

    describe('when called', () => {
      let result: unknown;

      beforeAll(() => {
        result = transformJsonSchemaToTypeScript(
          jsonSchemaFixture,
          generateTransformJsonSchemaContext(),
        );
      });

      it('should return the expected TypeScript module', () => {
        expect(result).toBe(
          'export type Root = { [key: string]: { name: string }; data: { name: "x" } };',
        );
      });

      it('should return a TypeScript module that compiles', () => {
        expect(getTypeScriptDiagnosticMessages(result as string)).toStrictEqual(
          [],
        );
      });
    });
  });

  describe('having an object schema with optional properties and additionalProperties', () => {
    let jsonSchemaFixture: JsonSchemaObject;

    beforeAll(() => {
      jsonSchemaFixture = {
        additionalProperties: {
          type: 'string',
        },
        properties: {
          id: {
            type: 'string',
          },
        },
        type: 'object',
      };
    });

    describe('when called', () => {
      let result: unknown;

      beforeAll(() => {
        result = transformJsonSchemaToTypeScript(
          jsonSchemaFixture,
          generateTransformJsonSchemaContext(),
        );
      });

      it('should return the expected TypeScript module', () => {
        expect(result).toBe(
          'export type Root = { [key: string]: string | undefined; id?: string };',
        );
      });

      it('should return a TypeScript module that compiles', () => {
        expect(getTypeScriptDiagnosticMessages(result as string)).toStrictEqual(
          [],
        );
      });

      it('should return a TypeScript module that compiles without exactOptionalPropertyTypes', () => {
        expect(
          getTypeScriptDiagnosticMessages(result as string, false),
        ).toStrictEqual([]);
      });
    });
  });

  describe('having an object schema with a string property and boolean additionalProperties', () => {
    let jsonSchemaFixture: JsonSchemaObject;

    beforeAll(() => {
      jsonSchemaFixture = {
        additionalProperties: {
          type: 'boolean',
        },
        properties: {
          id: {
            type: 'string',
          },
        },
        required: ['id'],
        type: 'object',
      };
    });

    describe('when called', () => {
      let result: unknown;

      beforeAll(() => {
        try {
          transformJsonSchemaToTypeScript(
            jsonSchemaFixture,
            generateTransformJsonSchemaContext(),
          );
        } catch (error: unknown) {
          result = error;
        }
      });

      it('should throw an Error', () => {
        expect(result).toBeInstanceOf(Error);
        expect((result as Error).message).toBe(
          "Property 'id' of type 'string' is not assignable to 'string' index type 'boolean'.",
        );
      });
    });
  });

  describe('having two schemas with the same title', () => {
    let jsonSchemaFixture: JsonSchemaObject;

    beforeAll(() => {
      jsonSchemaFixture = {
        allOf: [
          {
            title: 'Foo',
            type: 'string',
          },
          {
            title: 'Foo',
            type: 'number',
          },
        ],
      };
    });

    describe('when called', () => {
      let result: unknown;

      beforeAll(() => {
        try {
          transformJsonSchemaToTypeScript(
            jsonSchemaFixture,
            generateTransformJsonSchemaContext(),
          );
        } catch (error: unknown) {
          result = error;
        }
      });

      it('should throw an Error', () => {
        expect(result).toBeInstanceOf(Error);
        expect((result as Error).message).toBe(
          'Duplicated TypeMetadata id "Foo"',
        );
      });
    });
  });

  describe('having an unresolved $ref', () => {
    let jsonSchemaFixture: JsonSchemaObject;

    beforeAll(() => {
      jsonSchemaFixture = {
        $id: 'https://example.com/schema',
        $ref: 'https://example.com/missing',
      };
    });

    describe('when called', () => {
      let result: unknown;

      beforeAll(() => {
        try {
          transformJsonSchemaToTypeScript(
            jsonSchemaFixture,
            generateTransformJsonSchemaContext([jsonSchemaFixture]),
          );
        } catch (error: unknown) {
          result = error;
        }
      });

      it('should throw an Error', () => {
        expect(result).toBeInstanceOf(Error);
        expect((result as Error).message).toBe(
          'Failed to resolve resource identified by: https://example.com/missing (https://example.com/schema -> https://example.com/missing)',
        );
      });
    });
  });

  describe('having a string schema allOf a self-referencing anyOf schema', () => {
    let jsonSchemaFixture: JsonSchemaObject;
    let loopJsonSchemaFixture: JsonSchemaObject;

    beforeAll(() => {
      loopJsonSchemaFixture = {
        $id: 'https://example.com/loop',
        anyOf: [
          {
            type: 'boolean',
          },
          {
            $ref: '#',
          },
        ],
      };
      jsonSchemaFixture = {
        $id: 'https://example.com/schema',
        allOf: [
          {
            type: 'string',
          },
          {
            $ref: 'https://example.com/loop',
          },
        ],
      };
    });

    describe('when called', () => {
      let result: unknown;

      beforeAll(() => {
        result = transformJsonSchemaToTypeScript(
          jsonSchemaFixture,
          generateTransformJsonSchemaContext([
            jsonSchemaFixture,
            loopJsonSchemaFixture,
          ]),
        );
      });

      it('should return the expected TypeScript module', () => {
        expect(result).toBe('export type Root = never;');
      });

      it('should return a TypeScript module that compiles', () => {
        expect(getTypeScriptDiagnosticMessages(result as string)).toStrictEqual(
          [],
        );
      });
    });
  });
});
