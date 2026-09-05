import { beforeAll, describe, expect, it } from 'vitest';

import { type OpenApi3Dot1Object } from '@inversifyjs/open-api-types/v3Dot1';
import ts from 'typescript';

import { transformOpenApiToTypeScript } from './transformOpenApiToTypeScript.js';

function getTypeScriptDiagnosticMessages(source: string): string[] {
  const fileName: string = 'generated.ts';
  const compilerOptions: ts.CompilerOptions = {
    exactOptionalPropertyTypes: true,
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

describe(transformOpenApiToTypeScript, () => {
  describe.each<[string, OpenApi3Dot1Object, string]>([
    [
      'an OpenAPI document without components',
      {
        info: { title: 'API', version: '1.0.0' },
        openapi: '3.1.0',
      },
      'export type Root = never;',
    ],
    [
      'an OpenAPI document with empty component schemas',
      {
        components: {
          schemas: {},
        },
        info: { title: 'API', version: '1.0.0' },
        openapi: '3.1.0',
      },
      'export type Root = never;',
    ],
    [
      'an untitled component schema',
      {
        components: {
          schemas: {
            User: {
              type: 'string',
            },
          },
        },
        info: { title: 'API', version: '1.0.0' },
        openapi: '3.1.0',
      },
      'export type User = string;\nexport type Root = User;',
    ],
    [
      'a titled component schema',
      {
        components: {
          schemas: {
            User: {
              title: 'Person',
              type: 'string',
            },
          },
        },
        info: { title: 'API', version: '1.0.0' },
        openapi: '3.1.0',
      },
      'export type Person = string;\nexport type Root = Person;',
    ],
    [
      'boolean component schemas',
      {
        components: {
          schemas: {
            Allowed: true,
            Denied: false,
          },
        },
        info: { title: 'API', version: '1.0.0' },
        openapi: '3.1.0',
      },
      'export type Allowed = unknown;\nexport type Denied = never;\nexport type Root = Allowed | Denied;',
    ],
  ])(
    'having %s',
    (_: string, openApiObjectFixture: OpenApi3Dot1Object, expected: string) => {
      describe('when called', () => {
        let result: unknown;

        beforeAll(() => {
          result = transformOpenApiToTypeScript(openApiObjectFixture);
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

  describe('having component schemas that $ref each other', () => {
    let openApiObjectFixture: OpenApi3Dot1Object;

    beforeAll(() => {
      openApiObjectFixture = {
        components: {
          schemas: {
            Address: {
              properties: {
                city: {
                  type: 'string',
                },
              },
              required: ['city'],
              type: 'object',
            },
            User: {
              properties: {
                address: {
                  $ref: '#/components/schemas/Address',
                },
                id: {
                  type: 'string',
                },
              },
              required: ['address', 'id'],
              type: 'object',
            },
          },
        },
        info: { title: 'API', version: '1.0.0' },
        openapi: '3.1.0',
      };
    });

    describe('when called', () => {
      let result: unknown;

      beforeAll(() => {
        result = transformOpenApiToTypeScript(openApiObjectFixture);
      });

      it('should return named aliases and a Root union', () => {
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

    describe('when called twice', () => {
      beforeAll(() => {
        transformOpenApiToTypeScript(openApiObjectFixture);
        transformOpenApiToTypeScript(openApiObjectFixture);
      });

      it('should not mutate the input document', () => {
        expect(
          (
            openApiObjectFixture.components?.schemas?.['Address'] as {
              title?: string;
            }
          ).title,
        ).toBeUndefined();
      });
    });
  });

  describe('having a custom root name', () => {
    let openApiObjectFixture: OpenApi3Dot1Object;

    beforeAll(() => {
      openApiObjectFixture = {
        components: {
          schemas: {
            Flag: {
              type: 'boolean',
            },
          },
        },
        info: { title: 'API', version: '1.0.0' },
        openapi: '3.1.0',
      };
    });

    describe('when called', () => {
      let result: unknown;

      beforeAll(() => {
        result = transformOpenApiToTypeScript(openApiObjectFixture, {
          rootName: 'Models',
        });
      });

      it('should use the custom root name', () => {
        expect(result).toBe(
          'export type Flag = boolean;\nexport type Models = Flag;',
        );
      });

      it('should return a TypeScript module that compiles', () => {
        expect(getTypeScriptDiagnosticMessages(result as string)).toStrictEqual(
          [],
        );
      });
    });
  });

  describe('having a schema that $ref a boolean component schema', () => {
    let openApiObjectFixture: OpenApi3Dot1Object;

    beforeAll(() => {
      openApiObjectFixture = {
        components: {
          schemas: {
            Allowed: true,
            User: {
              properties: {
                allowed: {
                  $ref: '#/components/schemas/Allowed',
                },
              },
              required: ['allowed'],
              type: 'object',
            },
          },
        },
        info: { title: 'API', version: '1.0.0' },
        openapi: '3.1.0',
      };
    });

    describe('when called', () => {
      let result: unknown;

      beforeAll(() => {
        result = transformOpenApiToTypeScript(openApiObjectFixture);
      });

      it('should use the boolean component alias', () => {
        expect(result).toBe(
          'export type Allowed = unknown;\nexport type User = { allowed: Allowed };\nexport type Root = Allowed | User;',
        );
      });

      it('should return a TypeScript module that compiles', () => {
        expect(getTypeScriptDiagnosticMessages(result as string)).toStrictEqual(
          [],
        );
      });
    });
  });

  describe('having a schema that $ref another schema by $id', () => {
    let openApiObjectFixture: OpenApi3Dot1Object;

    beforeAll(() => {
      openApiObjectFixture = {
        components: {
          schemas: {
            User: {
              $id: 'https://example.com/schemas/user.json',
              type: 'string',
            },
            Wrapper: {
              $ref: 'https://example.com/schemas/user.json',
            },
          },
        },
        info: { title: 'API', version: '1.0.0' },
        openapi: '3.1.0',
      };
    });

    describe('when called', () => {
      let result: unknown;

      beforeAll(() => {
        result = transformOpenApiToTypeScript(openApiObjectFixture);
      });

      it('should resolve the $id against the document URI map', () => {
        expect(result).toBe(
          'export type User = string;\nexport type Wrapper = string;\nexport type Root = User | Wrapper;',
        );
      });

      it('should return a TypeScript module that compiles', () => {
        expect(getTypeScriptDiagnosticMessages(result as string)).toStrictEqual(
          [],
        );
      });
    });
  });
});
