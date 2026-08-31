import { beforeAll, describe, expect, it } from 'vitest';

import { type Either } from '@inversifyjs/common';
import {
  type JsonSchema,
  type JsonSchemaObject,
} from '@inversifyjs/json-schema-types/2020-12';
import { Uri } from '@inversifyjs/uri';

import {
  type DynamicScopeEntry,
  JsonSchemaResolver,
  type ResolutionFailure,
  type SchemaResolutionSuccessTree,
} from './JsonSchemaResolver.js';

function buildDynamicScopeEntries(
  first: DynamicScopeEntry,
  ...rest: DynamicScopeEntry[]
): DynamicScopeEntry[] {
  return [first, ...rest];
}

function buildResourceDynamicScopeEntry(id: string): DynamicScopeEntry {
  return {
    lexicalScope: {
      $canonicalId: new Uri(id),
    },
    resolutionContext: {
      $ref: id,
      isDynamic: false,
    },
  };
}

describe(JsonSchemaResolver, () => {
  describe('.resolveSchema', () => {
    describe('having a boolean schema', () => {
      let jsonSchemaResolver: JsonSchemaResolver;
      let schemaFixture: JsonSchema;

      beforeAll(() => {
        schemaFixture = true;

        jsonSchemaResolver = new JsonSchemaResolver(() => undefined);
      });

      describe('when called', () => {
        let result: Either<ResolutionFailure, SchemaResolutionSuccessTree>;

        beforeAll(() => {
          result = jsonSchemaResolver.resolveSchema(schemaFixture);
        });

        it('should return an empty resolution tree', () => {
          const expected: Either<
            ResolutionFailure,
            SchemaResolutionSuccessTree
          > = {
            isRight: true,
            value: {
              $dynamicRef: undefined,
              $ref: undefined,
              dynamicScopeEntries: [],
            },
          };

          expect(result).toStrictEqual(expected);
        });
      });
    });

    describe('having a boolean schema and an incoming dynamic scope', () => {
      let incomingDynamicScopeEntriesFixture: DynamicScopeEntry[];
      let jsonSchemaResolver: JsonSchemaResolver;
      let schemaFixture: JsonSchema;

      beforeAll(() => {
        schemaFixture = true;
        incomingDynamicScopeEntriesFixture = [
          buildResourceDynamicScopeEntry('https://example.com/parent.json'),
        ];

        jsonSchemaResolver = new JsonSchemaResolver(() => undefined);
      });

      describe('when called', () => {
        let result: Either<ResolutionFailure, SchemaResolutionSuccessTree>;

        beforeAll(() => {
          result = jsonSchemaResolver.resolveSchema(
            schemaFixture,
            incomingDynamicScopeEntriesFixture,
          );
        });

        it('should return the incoming dynamic scope', () => {
          const expected: Either<
            ResolutionFailure,
            SchemaResolutionSuccessTree
          > = {
            isRight: true,
            value: {
              $dynamicRef: undefined,
              $ref: undefined,
              dynamicScopeEntries: incomingDynamicScopeEntriesFixture,
            },
          };

          expect(result).toStrictEqual(expected);
        });
      });
    });

    describe('having a schema object without $id, $ref, or $dynamicRef and an incoming dynamic scope', () => {
      let incomingDynamicScopeEntriesFixture: DynamicScopeEntry[];
      let jsonSchemaResolver: JsonSchemaResolver;
      let schemaFixture: JsonSchemaObject;

      beforeAll(() => {
        schemaFixture = {
          type: 'string',
        };
        incomingDynamicScopeEntriesFixture = [
          buildResourceDynamicScopeEntry('https://example.com/parent.json'),
        ];

        jsonSchemaResolver = new JsonSchemaResolver(() => undefined);
      });

      describe('when called', () => {
        let result: Either<ResolutionFailure, SchemaResolutionSuccessTree>;

        beforeAll(() => {
          result = jsonSchemaResolver.resolveSchema(
            schemaFixture,
            incomingDynamicScopeEntriesFixture,
          );
        });

        it('should return the incoming dynamic scope', () => {
          const expected: Either<
            ResolutionFailure,
            SchemaResolutionSuccessTree
          > = {
            isRight: true,
            value: {
              $dynamicRef: undefined,
              $ref: undefined,
              dynamicScopeEntries: incomingDynamicScopeEntriesFixture,
            },
          };

          expect(result).toStrictEqual(expected);
        });
      });
    });

    describe('having a schema object with no $ref or $dynamicRef', () => {
      let jsonSchemaResolver: JsonSchemaResolver;
      let schemaFixture: JsonSchemaObject;
      let schemaIdFixture: string;

      beforeAll(() => {
        schemaIdFixture = 'https://example.com/schema.json';
        schemaFixture = {
          $id: schemaIdFixture,
          type: 'object',
        };

        const schemaById: Map<string, JsonSchema> = new Map([
          [schemaIdFixture, schemaFixture],
        ]);

        jsonSchemaResolver = new JsonSchemaResolver((id: string) =>
          schemaById.get(id),
        );
      });

      describe('when called', () => {
        let result: Either<ResolutionFailure, SchemaResolutionSuccessTree>;

        beforeAll(() => {
          result = jsonSchemaResolver.resolveSchema(schemaFixture);
        });

        it('should return an empty resolution tree', () => {
          const expected: Either<
            ResolutionFailure,
            SchemaResolutionSuccessTree
          > = {
            isRight: true,
            value: {
              $dynamicRef: undefined,
              $ref: undefined,
              dynamicScopeEntries: [
                buildResourceDynamicScopeEntry(schemaIdFixture),
              ],
            },
          };

          expect(result).toStrictEqual(expected);
        });
      });

      describe('when called with the schema already in the incoming dynamic scope', () => {
        let result: Either<ResolutionFailure, SchemaResolutionSuccessTree>;

        beforeAll(() => {
          result = jsonSchemaResolver.resolveSchema(schemaFixture, [
            buildResourceDynamicScopeEntry(schemaIdFixture),
          ]);
        });

        it('should not append the same resource twice', () => {
          const expected: Either<
            ResolutionFailure,
            SchemaResolutionSuccessTree
          > = {
            isRight: true,
            value: {
              $dynamicRef: undefined,
              $ref: undefined,
              dynamicScopeEntries: [
                buildResourceDynamicScopeEntry(schemaIdFixture),
              ],
            },
          };

          expect(result).toStrictEqual(expected);
        });
      });
    });

    describe('having a schema with a relative $ref to another resource', () => {
      let jsonSchemaResolver: JsonSchemaResolver;
      let otherSchemaFixture: JsonSchemaObject;
      let otherSchemaIdFixture: string;
      let schemaFixture: JsonSchemaObject;
      let schemaIdFixture: string;

      beforeAll(() => {
        schemaIdFixture = 'https://example.com/schema.json';
        otherSchemaIdFixture = 'https://example.com/other.json';
        otherSchemaFixture = {
          $id: otherSchemaIdFixture,
          type: 'string',
        };
        schemaFixture = {
          $id: schemaIdFixture,
          $ref: 'other.json',
          type: 'object',
        };

        const schemaById: Map<string, JsonSchema> = new Map([
          [otherSchemaIdFixture, otherSchemaFixture],
          [schemaIdFixture, schemaFixture],
        ]);

        jsonSchemaResolver = new JsonSchemaResolver((id: string) =>
          schemaById.get(id),
        );
      });

      describe('when called', () => {
        let result: Either<ResolutionFailure, SchemaResolutionSuccessTree>;

        beforeAll(() => {
          result = jsonSchemaResolver.resolveSchema(schemaFixture);
        });

        it('should return a tree with the referenced resource', () => {
          const expected: Either<
            ResolutionFailure,
            SchemaResolutionSuccessTree
          > = {
            isRight: true,
            value: {
              $dynamicRef: undefined,
              $ref: {
                $dynamicRef: undefined,
                $ref: undefined,
                dynamicScopeEntries: buildDynamicScopeEntries(
                  {
                    lexicalScope: {
                      $canonicalId: new Uri(schemaIdFixture),
                    },
                    resolutionContext: {
                      $ref: schemaIdFixture,
                      isDynamic: false,
                    },
                  },
                  {
                    lexicalScope: {
                      $canonicalId: new Uri(otherSchemaIdFixture),
                    },
                    resolutionContext: {
                      $ref: 'other.json',
                      isDynamic: false,
                    },
                  },
                ),
                value: otherSchemaFixture,
              },
              dynamicScopeEntries: [
                buildResourceDynamicScopeEntry(schemaIdFixture),
              ],
            },
          };

          expect(result).toStrictEqual(expected);
        });
      });
    });

    describe('having a schema with a JSON Pointer $ref to a $defs subschema', () => {
      let jsonSchemaResolver: JsonSchemaResolver;
      let schemaFixture: JsonSchemaObject;
      let schemaIdFixture: string;
      let subschemaFixture: JsonSchemaObject;

      beforeAll(() => {
        schemaIdFixture = 'https://example.com/schema.json';
        subschemaFixture = {
          exclusiveMinimum: 0,
          type: 'integer',
        };
        schemaFixture = {
          $defs: {
            positiveInteger: subschemaFixture,
          },
          $id: schemaIdFixture,
          $ref: '#/$defs/positiveInteger',
        };

        const schemaById: Map<string, JsonSchema> = new Map([
          [schemaIdFixture, schemaFixture],
        ]);

        jsonSchemaResolver = new JsonSchemaResolver((id: string) =>
          schemaById.get(id),
        );
      });

      describe('when called', () => {
        let result: Either<ResolutionFailure, SchemaResolutionSuccessTree>;

        beforeAll(() => {
          result = jsonSchemaResolver.resolveSchema(schemaFixture);
        });

        it('should return a tree with the referenced subschema', () => {
          const expected: Either<
            ResolutionFailure,
            SchemaResolutionSuccessTree
          > = {
            isRight: true,
            value: {
              $dynamicRef: undefined,
              $ref: {
                $dynamicRef: undefined,
                $ref: undefined,
                dynamicScopeEntries: buildDynamicScopeEntries(
                  {
                    lexicalScope: {
                      $canonicalId: new Uri(schemaIdFixture),
                    },
                    resolutionContext: {
                      $ref: schemaIdFixture,
                      isDynamic: false,
                    },
                  },
                  {
                    lexicalScope: {
                      $canonicalId: new Uri(schemaIdFixture),
                    },
                    resolutionContext: {
                      $ref: '#/$defs/positiveInteger',
                      isDynamic: false,
                    },
                  },
                ),
                value: subschemaFixture,
              },
              dynamicScopeEntries: [
                buildResourceDynamicScopeEntry(schemaIdFixture),
              ],
            },
          };

          expect(result).toStrictEqual(expected);
        });
      });
    });

    describe('having a schema with a $ref only inside properties', () => {
      let jsonSchemaResolver: JsonSchemaResolver;
      let otherSchemaFixture: JsonSchemaObject;
      let otherSchemaIdFixture: string;
      let schemaFixture: JsonSchemaObject;
      let schemaIdFixture: string;

      beforeAll(() => {
        schemaIdFixture = 'https://example.com/schema.json';
        otherSchemaIdFixture = 'https://example.com/other.json';
        otherSchemaFixture = {
          $id: otherSchemaIdFixture,
          type: 'string',
        };
        schemaFixture = {
          $id: schemaIdFixture,
          properties: {
            foo: {
              $ref: 'other.json',
            },
          },
          type: 'object',
        };

        const schemaById: Map<string, JsonSchema> = new Map([
          [otherSchemaIdFixture, otherSchemaFixture],
          [schemaIdFixture, schemaFixture],
        ]);

        jsonSchemaResolver = new JsonSchemaResolver((id: string) =>
          schemaById.get(id),
        );
      });

      describe('when called', () => {
        let result: Either<ResolutionFailure, SchemaResolutionSuccessTree>;

        beforeAll(() => {
          result = jsonSchemaResolver.resolveSchema(schemaFixture);
        });

        it('should return an empty resolution tree', () => {
          const expected: Either<
            ResolutionFailure,
            SchemaResolutionSuccessTree
          > = {
            isRight: true,
            value: {
              $dynamicRef: undefined,
              $ref: undefined,
              dynamicScopeEntries: [
                buildResourceDynamicScopeEntry(schemaIdFixture),
              ],
            },
          };

          expect(result).toStrictEqual(expected);
        });
      });
    });

    describe('having a schema with a $ref to itself', () => {
      let jsonSchemaResolver: JsonSchemaResolver;
      let schemaFixture: JsonSchemaObject;
      let schemaIdFixture: string;

      beforeAll(() => {
        schemaIdFixture = 'https://example.com/node.json';
        schemaFixture = {
          $id: schemaIdFixture,
          $ref: '#',
        };

        const schemaById: Map<string, JsonSchema> = new Map([
          [schemaIdFixture, schemaFixture],
        ]);

        jsonSchemaResolver = new JsonSchemaResolver((id: string) =>
          schemaById.get(id),
        );
      });

      describe('when called', () => {
        let result: Either<ResolutionFailure, SchemaResolutionSuccessTree>;

        beforeAll(() => {
          result = jsonSchemaResolver.resolveSchema(schemaFixture);
        });

        it('should return a tree with a single self-reference hop', () => {
          const expected: Either<
            ResolutionFailure,
            SchemaResolutionSuccessTree
          > = {
            isRight: true,
            value: {
              $dynamicRef: undefined,
              $ref: {
                $dynamicRef: undefined,
                $ref: undefined,
                dynamicScopeEntries: buildDynamicScopeEntries(
                  {
                    lexicalScope: {
                      $canonicalId: new Uri(schemaIdFixture),
                    },
                    resolutionContext: {
                      $ref: schemaIdFixture,
                      isDynamic: false,
                    },
                  },
                  {
                    lexicalScope: {
                      $canonicalId: new Uri(schemaIdFixture),
                    },
                    resolutionContext: {
                      $ref: '#',
                      isDynamic: false,
                    },
                  },
                ),
                value: schemaFixture,
              },
              dynamicScopeEntries: [
                buildResourceDynamicScopeEntry(schemaIdFixture),
              ],
            },
          };

          expect(result).toStrictEqual(expected);
        });
      });
    });

    describe('having a schema with a $ref to a missing resource', () => {
      let jsonSchemaResolver: JsonSchemaResolver;
      let missingSchemaIdFixture: string;
      let schemaFixture: JsonSchemaObject;
      let schemaIdFixture: string;

      beforeAll(() => {
        schemaIdFixture = 'https://example.com/schema.json';
        missingSchemaIdFixture = 'https://example.com/missing.json';
        schemaFixture = {
          $id: schemaIdFixture,
          $ref: missingSchemaIdFixture,
        };

        const schemaById: Map<string, JsonSchema> = new Map([
          [schemaIdFixture, schemaFixture],
        ]);

        jsonSchemaResolver = new JsonSchemaResolver((id: string) =>
          schemaById.get(id),
        );
      });

      describe('when called', () => {
        let result: Either<ResolutionFailure, SchemaResolutionSuccessTree>;

        beforeAll(() => {
          result = jsonSchemaResolver.resolveSchema(schemaFixture);
        });

        it('should return a resolution failure', () => {
          const expected: Either<
            ResolutionFailure,
            SchemaResolutionSuccessTree
          > = {
            isRight: false,
            value: {
              reason: `Failed to resolve resource identified by: ${missingSchemaIdFixture}`,
              resolutionContextStack: [
                {
                  $ref: schemaIdFixture,
                  isDynamic: false,
                },
                {
                  $ref: missingSchemaIdFixture,
                  isDynamic: false,
                },
              ],
            },
          };

          expect(result).toStrictEqual(expected);
        });
      });
    });

    describe('having a schema with a $ref chain through two other resources', () => {
      let aSchemaFixture: JsonSchemaObject;
      let aSchemaIdFixture: string;
      let bSchemaFixture: JsonSchemaObject;
      let bSchemaIdFixture: string;
      let cSchemaFixture: JsonSchemaObject;
      let cSchemaIdFixture: string;
      let jsonSchemaResolver: JsonSchemaResolver;

      beforeAll(() => {
        aSchemaIdFixture = 'https://example.com/a.json';
        bSchemaIdFixture = 'https://example.com/b.json';
        cSchemaIdFixture = 'https://example.com/c.json';
        cSchemaFixture = {
          $id: cSchemaIdFixture,
          type: 'string',
        };
        bSchemaFixture = {
          $id: bSchemaIdFixture,
          $ref: 'c.json',
        };
        aSchemaFixture = {
          $id: aSchemaIdFixture,
          $ref: 'b.json',
        };

        const schemaById: Map<string, JsonSchema> = new Map([
          [aSchemaIdFixture, aSchemaFixture],
          [bSchemaIdFixture, bSchemaFixture],
          [cSchemaIdFixture, cSchemaFixture],
        ]);

        jsonSchemaResolver = new JsonSchemaResolver((id: string) =>
          schemaById.get(id),
        );
      });

      describe('when called', () => {
        let result: Either<ResolutionFailure, SchemaResolutionSuccessTree>;

        beforeAll(() => {
          result = jsonSchemaResolver.resolveSchema(aSchemaFixture);
        });

        it('should return a tree with each referenced resource', () => {
          const aOriginEntry: DynamicScopeEntry = {
            lexicalScope: {
              $canonicalId: new Uri(aSchemaIdFixture),
            },
            resolutionContext: {
              $ref: aSchemaIdFixture,
              isDynamic: false,
            },
          };
          const bHopEntry: DynamicScopeEntry = {
            lexicalScope: {
              $canonicalId: new Uri(bSchemaIdFixture),
            },
            resolutionContext: {
              $ref: 'b.json',
              isDynamic: false,
            },
          };
          const cHopEntry: DynamicScopeEntry = {
            lexicalScope: {
              $canonicalId: new Uri(cSchemaIdFixture),
            },
            resolutionContext: {
              $ref: 'c.json',
              isDynamic: false,
            },
          };

          const expected: Either<
            ResolutionFailure,
            SchemaResolutionSuccessTree
          > = {
            isRight: true,
            value: {
              $dynamicRef: undefined,
              $ref: {
                $dynamicRef: undefined,
                $ref: {
                  $dynamicRef: undefined,
                  $ref: undefined,
                  dynamicScopeEntries: buildDynamicScopeEntries(
                    aOriginEntry,
                    bHopEntry,
                    cHopEntry,
                  ),
                  value: cSchemaFixture,
                },
                dynamicScopeEntries: buildDynamicScopeEntries(
                  aOriginEntry,
                  bHopEntry,
                ),
                value: bSchemaFixture,
              },
              dynamicScopeEntries: [
                buildResourceDynamicScopeEntry(aSchemaIdFixture),
              ],
            },
          };

          expect(result).toStrictEqual(expected);
        });
      });
    });

    describe('having a schema with a cyclic $ref through another resource', () => {
      let aSchemaFixture: JsonSchemaObject;
      let aSchemaIdFixture: string;
      let bSchemaFixture: JsonSchemaObject;
      let bSchemaIdFixture: string;
      let jsonSchemaResolver: JsonSchemaResolver;

      beforeAll(() => {
        aSchemaIdFixture = 'https://example.com/a.json';
        bSchemaIdFixture = 'https://example.com/b.json';
        aSchemaFixture = {
          $id: aSchemaIdFixture,
          $ref: 'b.json',
        };
        bSchemaFixture = {
          $id: bSchemaIdFixture,
          $ref: 'a.json',
        };

        const schemaById: Map<string, JsonSchema> = new Map([
          [aSchemaIdFixture, aSchemaFixture],
          [bSchemaIdFixture, bSchemaFixture],
        ]);

        jsonSchemaResolver = new JsonSchemaResolver((id: string) =>
          schemaById.get(id),
        );
      });

      describe('when called', () => {
        let result: Either<ResolutionFailure, SchemaResolutionSuccessTree>;

        beforeAll(() => {
          result = jsonSchemaResolver.resolveSchema(aSchemaFixture);
        });

        it('should return a tree that records the cycle hop without expanding it again', () => {
          const aOriginEntry: DynamicScopeEntry = {
            lexicalScope: {
              $canonicalId: new Uri(aSchemaIdFixture),
            },
            resolutionContext: {
              $ref: aSchemaIdFixture,
              isDynamic: false,
            },
          };
          const bHopEntry: DynamicScopeEntry = {
            lexicalScope: {
              $canonicalId: new Uri(bSchemaIdFixture),
            },
            resolutionContext: {
              $ref: 'b.json',
              isDynamic: false,
            },
          };
          const aHopEntry: DynamicScopeEntry = {
            lexicalScope: {
              $canonicalId: new Uri(aSchemaIdFixture),
            },
            resolutionContext: {
              $ref: 'a.json',
              isDynamic: false,
            },
          };

          const expected: Either<
            ResolutionFailure,
            SchemaResolutionSuccessTree
          > = {
            isRight: true,
            value: {
              $dynamicRef: undefined,
              $ref: {
                $dynamicRef: undefined,
                $ref: {
                  $dynamicRef: undefined,
                  $ref: undefined,
                  dynamicScopeEntries: buildDynamicScopeEntries(
                    aOriginEntry,
                    bHopEntry,
                    aHopEntry,
                  ),
                  value: aSchemaFixture,
                },
                dynamicScopeEntries: buildDynamicScopeEntries(
                  aOriginEntry,
                  bHopEntry,
                ),
                value: bSchemaFixture,
              },
              dynamicScopeEntries: [
                buildResourceDynamicScopeEntry(aSchemaIdFixture),
              ],
            },
          };

          expect(result).toStrictEqual(expected);
        });
      });
    });

    describe('having a schema with a $dynamicRef to a $dynamicAnchor also defined on the root', () => {
      let jsonSchemaResolver: JsonSchemaResolver;
      let strictTreeFixture: JsonSchemaObject;
      let strictTreeIdFixture: string;
      let treeFixture: JsonSchemaObject;
      let treeIdFixture: string;

      beforeAll(() => {
        treeIdFixture = 'https://example.com/tree';
        strictTreeIdFixture = 'https://example.com/strict-tree';
        treeFixture = {
          $dynamicAnchor: 'node',
          $id: treeIdFixture,
          type: 'object',
        };
        strictTreeFixture = {
          $dynamicAnchor: 'node',
          $dynamicRef: 'tree#node',
          $id: strictTreeIdFixture,
        };

        const schemaById: Map<string, JsonSchema> = new Map([
          [strictTreeIdFixture, strictTreeFixture],
          [treeIdFixture, treeFixture],
        ]);

        jsonSchemaResolver = new JsonSchemaResolver((id: string) =>
          schemaById.get(id),
        );
      });

      describe('when called', () => {
        let result: Either<ResolutionFailure, SchemaResolutionSuccessTree>;

        beforeAll(() => {
          result = jsonSchemaResolver.resolveSchema(strictTreeFixture);
        });

        it('should return a tree retargeted to the outermost $dynamicAnchor', () => {
          const expected: Either<
            ResolutionFailure,
            SchemaResolutionSuccessTree
          > = {
            isRight: true,
            value: {
              $dynamicRef: {
                $dynamicRef: undefined,
                $ref: undefined,
                dynamicScopeEntries: buildDynamicScopeEntries(
                  {
                    lexicalScope: {
                      $canonicalId: new Uri(strictTreeIdFixture),
                    },
                    resolutionContext: {
                      $ref: strictTreeIdFixture,
                      isDynamic: false,
                    },
                  },
                  {
                    lexicalScope: {
                      $canonicalId: new Uri(treeIdFixture),
                    },
                    resolutionContext: {
                      $ref: 'tree#node',
                      isDynamic: true,
                    },
                  },
                  {
                    lexicalScope: {
                      $canonicalId: new Uri(strictTreeIdFixture),
                    },
                    resolutionContext: {
                      $ref: 'tree#node',
                      isDynamic: true,
                    },
                  },
                ),
                value: strictTreeFixture,
              },
              $ref: undefined,
              dynamicScopeEntries: [
                buildResourceDynamicScopeEntry(strictTreeIdFixture),
              ],
            },
          };

          expect(result).toStrictEqual(expected);
        });
      });
    });

    describe('having a nested $dynamicRef and an incoming dynamic scope with an outer $dynamicAnchor', () => {
      let childSchemaFixture: JsonSchemaObject;
      let jsonSchemaResolver: JsonSchemaResolver;
      let strictTreeFixture: JsonSchemaObject;
      let strictTreeIdFixture: string;
      let treeFixture: JsonSchemaObject;
      let treeIdFixture: string;

      beforeAll(() => {
        treeIdFixture = 'https://example.com/tree';
        strictTreeIdFixture = 'https://example.com/strict-tree';
        childSchemaFixture = {
          $dynamicRef: '#node',
        };
        treeFixture = {
          $dynamicAnchor: 'node',
          $id: treeIdFixture,
          properties: {
            child: childSchemaFixture,
          },
        };
        strictTreeFixture = {
          $dynamicAnchor: 'node',
          $id: strictTreeIdFixture,
        };

        const schemaById: Map<string, JsonSchema> = new Map([
          [strictTreeIdFixture, strictTreeFixture],
          [treeIdFixture, treeFixture],
        ]);

        jsonSchemaResolver = new JsonSchemaResolver((id: string) =>
          schemaById.get(id),
        );
      });

      describe('when called', () => {
        let result: Either<ResolutionFailure, SchemaResolutionSuccessTree>;

        beforeAll(() => {
          const strictTreeResult: Either<
            ResolutionFailure,
            SchemaResolutionSuccessTree
          > = jsonSchemaResolver.resolveSchema(strictTreeFixture);

          if (!strictTreeResult.isRight) {
            throw new Error(strictTreeResult.value.reason);
          }

          const treeResult: Either<
            ResolutionFailure,
            SchemaResolutionSuccessTree
          > = jsonSchemaResolver.resolveSchema(
            treeFixture,
            strictTreeResult.value.dynamicScopeEntries,
          );

          if (!treeResult.isRight) {
            throw new Error(treeResult.value.reason);
          }

          result = jsonSchemaResolver.resolveSchema(
            childSchemaFixture,
            treeResult.value.dynamicScopeEntries,
          );
        });

        it('should retarget the nested $dynamicRef to the outermost $dynamicAnchor', () => {
          const expected: Either<
            ResolutionFailure,
            SchemaResolutionSuccessTree
          > = {
            isRight: true,
            value: {
              $dynamicRef: {
                $dynamicRef: undefined,
                $ref: undefined,
                dynamicScopeEntries: buildDynamicScopeEntries(
                  buildResourceDynamicScopeEntry(strictTreeIdFixture),
                  buildResourceDynamicScopeEntry(treeIdFixture),
                  {
                    lexicalScope: {
                      $canonicalId: new Uri(treeIdFixture),
                    },
                    resolutionContext: {
                      $ref: '#node',
                      isDynamic: true,
                    },
                  },
                  {
                    lexicalScope: {
                      $canonicalId: new Uri(strictTreeIdFixture),
                    },
                    resolutionContext: {
                      $ref: '#node',
                      isDynamic: true,
                    },
                  },
                ),
                value: strictTreeFixture,
              },
              $ref: undefined,
              dynamicScopeEntries: [
                buildResourceDynamicScopeEntry(strictTreeIdFixture),
                buildResourceDynamicScopeEntry(treeIdFixture),
              ],
            },
          };

          expect(result).toStrictEqual(expected);
        });
      });
    });

    describe('having a schema with sibling $ref and $dynamicRef', () => {
      let dynamicTargetFixture: JsonSchemaObject;
      let dynamicTargetIdFixture: string;
      let jsonSchemaResolver: JsonSchemaResolver;
      let refTargetFixture: JsonSchemaObject;
      let refTargetIdFixture: string;
      let schemaFixture: JsonSchemaObject;
      let schemaIdFixture: string;

      beforeAll(() => {
        schemaIdFixture = 'https://example.com/root.json';
        refTargetIdFixture = 'https://example.com/ref-target.json';
        dynamicTargetIdFixture = 'https://example.com/dynamic-target.json';
        refTargetFixture = {
          $id: refTargetIdFixture,
          type: 'string',
        };
        dynamicTargetFixture = {
          $id: dynamicTargetIdFixture,
          type: 'number',
        };
        schemaFixture = {
          $dynamicRef: 'dynamic-target.json',
          $id: schemaIdFixture,
          $ref: 'ref-target.json',
        };

        const schemaById: Map<string, JsonSchema> = new Map([
          [dynamicTargetIdFixture, dynamicTargetFixture],
          [refTargetIdFixture, refTargetFixture],
          [schemaIdFixture, schemaFixture],
        ]);

        jsonSchemaResolver = new JsonSchemaResolver((id: string) =>
          schemaById.get(id),
        );
      });

      describe('when called', () => {
        let result: Either<ResolutionFailure, SchemaResolutionSuccessTree>;

        beforeAll(() => {
          result = jsonSchemaResolver.resolveSchema(schemaFixture);
        });

        it('should return a tree with independent $ref and $dynamicRef branches', () => {
          const expected: Either<
            ResolutionFailure,
            SchemaResolutionSuccessTree
          > = {
            isRight: true,
            value: {
              $dynamicRef: {
                $dynamicRef: undefined,
                $ref: undefined,
                dynamicScopeEntries: buildDynamicScopeEntries(
                  {
                    lexicalScope: {
                      $canonicalId: new Uri(schemaIdFixture),
                    },
                    resolutionContext: {
                      $ref: schemaIdFixture,
                      isDynamic: false,
                    },
                  },
                  {
                    lexicalScope: {
                      $canonicalId: new Uri(dynamicTargetIdFixture),
                    },
                    resolutionContext: {
                      $ref: 'dynamic-target.json',
                      isDynamic: true,
                    },
                  },
                ),
                value: dynamicTargetFixture,
              },
              $ref: {
                $dynamicRef: undefined,
                $ref: undefined,
                dynamicScopeEntries: buildDynamicScopeEntries(
                  {
                    lexicalScope: {
                      $canonicalId: new Uri(schemaIdFixture),
                    },
                    resolutionContext: {
                      $ref: schemaIdFixture,
                      isDynamic: false,
                    },
                  },
                  {
                    lexicalScope: {
                      $canonicalId: new Uri(refTargetIdFixture),
                    },
                    resolutionContext: {
                      $ref: 'ref-target.json',
                      isDynamic: false,
                    },
                  },
                ),
                value: refTargetFixture,
              },
              dynamicScopeEntries: [
                buildResourceDynamicScopeEntry(schemaIdFixture),
              ],
            },
          };

          expect(result).toStrictEqual(expected);
        });
      });
    });

    describe('having a schema with a JSON Pointer $ref to a nested $id that itself has a relative $ref', () => {
      let barSchemaFixture: JsonSchemaObject;
      let barSchemaIdFixture: string;
      let fooSchemaFixture: JsonSchemaObject;
      let fooSchemaIdFixture: string;
      let jsonSchemaResolver: JsonSchemaResolver;
      let schemaFixture: JsonSchemaObject;
      let schemaIdFixture: string;

      beforeAll(() => {
        schemaIdFixture = 'https://example.com/schema.json';
        fooSchemaIdFixture = 'https://example.com/foo.json';
        barSchemaIdFixture = 'https://example.com/bar.json';
        barSchemaFixture = {
          $id: barSchemaIdFixture,
          type: 'boolean',
        };
        fooSchemaFixture = {
          $id: fooSchemaIdFixture,
          $ref: 'bar.json',
        };
        schemaFixture = {
          $id: schemaIdFixture,
          $ref: '#/properties/foo',
          properties: {
            foo: fooSchemaFixture,
          },
        };

        const schemaById: Map<string, JsonSchema> = new Map([
          [barSchemaIdFixture, barSchemaFixture],
          [fooSchemaIdFixture, fooSchemaFixture],
          [schemaIdFixture, schemaFixture],
        ]);

        jsonSchemaResolver = new JsonSchemaResolver((id: string) =>
          schemaById.get(id),
        );
      });

      describe('when called', () => {
        let result: Either<ResolutionFailure, SchemaResolutionSuccessTree>;

        beforeAll(() => {
          result = jsonSchemaResolver.resolveSchema(schemaFixture);
        });

        it('should resolve the nested $ref against the nested resource base URI', () => {
          const originEntry: DynamicScopeEntry = {
            lexicalScope: {
              $canonicalId: new Uri(schemaIdFixture),
            },
            resolutionContext: {
              $ref: schemaIdFixture,
              isDynamic: false,
            },
          };
          const nestedIdEntry: DynamicScopeEntry = {
            lexicalScope: {
              $canonicalId: new Uri(fooSchemaIdFixture),
            },
            resolutionContext: {
              $ref: '#/properties/foo',
              isDynamic: false,
            },
          };
          const barHopEntry: DynamicScopeEntry = {
            lexicalScope: {
              $canonicalId: new Uri(barSchemaIdFixture),
            },
            resolutionContext: {
              $ref: 'bar.json',
              isDynamic: false,
            },
          };

          const expected: Either<
            ResolutionFailure,
            SchemaResolutionSuccessTree
          > = {
            isRight: true,
            value: {
              $dynamicRef: undefined,
              $ref: {
                $dynamicRef: undefined,
                $ref: {
                  $dynamicRef: undefined,
                  $ref: undefined,
                  dynamicScopeEntries: buildDynamicScopeEntries(
                    originEntry,
                    nestedIdEntry,
                    barHopEntry,
                  ),
                  value: barSchemaFixture,
                },
                dynamicScopeEntries: buildDynamicScopeEntries(
                  originEntry,
                  nestedIdEntry,
                ),
                value: fooSchemaFixture,
              },
              dynamicScopeEntries: [
                buildResourceDynamicScopeEntry(schemaIdFixture),
              ],
            },
          };

          expect(result).toStrictEqual(expected);
        });
      });
    });

    describe('having a schema with a $ref to an $anchor fragment', () => {
      let jsonSchemaResolver: JsonSchemaResolver;
      let schemaFixture: JsonSchemaObject;
      let schemaIdFixture: string;
      let subschemaFixture: JsonSchemaObject;

      beforeAll(() => {
        schemaIdFixture = 'https://example.com/schema.json';
        subschemaFixture = {
          $anchor: 'item',
          type: 'object',
        };
        schemaFixture = {
          $defs: {
            single: subschemaFixture,
          },
          $id: schemaIdFixture,
          $ref: '#item',
        };

        const schemaById: Map<string, JsonSchema> = new Map([
          [schemaIdFixture, schemaFixture],
        ]);

        jsonSchemaResolver = new JsonSchemaResolver((id: string) =>
          schemaById.get(id),
        );
      });

      describe('when called', () => {
        let result: Either<ResolutionFailure, SchemaResolutionSuccessTree>;

        beforeAll(() => {
          result = jsonSchemaResolver.resolveSchema(schemaFixture);
        });

        it('should return a tree with the node identified by the $anchor', () => {
          const expected: Either<
            ResolutionFailure,
            SchemaResolutionSuccessTree
          > = {
            isRight: true,
            value: {
              $dynamicRef: undefined,
              $ref: {
                $dynamicRef: undefined,
                $ref: undefined,
                dynamicScopeEntries: buildDynamicScopeEntries(
                  {
                    lexicalScope: {
                      $canonicalId: new Uri(schemaIdFixture),
                    },
                    resolutionContext: {
                      $ref: schemaIdFixture,
                      isDynamic: false,
                    },
                  },
                  {
                    lexicalScope: {
                      $canonicalId: new Uri(schemaIdFixture),
                    },
                    resolutionContext: {
                      $ref: '#item',
                      isDynamic: false,
                    },
                  },
                ),
                value: subschemaFixture,
              },
              dynamicScopeEntries: [
                buildResourceDynamicScopeEntry(schemaIdFixture),
              ],
            },
          };

          expect(result).toStrictEqual(expected);
        });
      });
    });

    describe('having a schema with a $ref to a $dynamicAnchor fragment', () => {
      let jsonSchemaResolver: JsonSchemaResolver;
      let schemaFixture: JsonSchemaObject;
      let schemaIdFixture: string;
      let subschemaFixture: JsonSchemaObject;

      beforeAll(() => {
        schemaIdFixture = 'https://example.com/schema.json';
        subschemaFixture = {
          $dynamicAnchor: 'node',
          type: 'object',
        };
        schemaFixture = {
          $defs: {
            node: subschemaFixture,
          },
          $id: schemaIdFixture,
          $ref: '#node',
        };

        const schemaById: Map<string, JsonSchema> = new Map([
          [schemaIdFixture, schemaFixture],
        ]);

        jsonSchemaResolver = new JsonSchemaResolver((id: string) =>
          schemaById.get(id),
        );
      });

      describe('when called', () => {
        let result: Either<ResolutionFailure, SchemaResolutionSuccessTree>;

        beforeAll(() => {
          result = jsonSchemaResolver.resolveSchema(schemaFixture);
        });

        it('should return a tree with the node identified by the $dynamicAnchor', () => {
          const expected: Either<
            ResolutionFailure,
            SchemaResolutionSuccessTree
          > = {
            isRight: true,
            value: {
              $dynamicRef: undefined,
              $ref: {
                $dynamicRef: undefined,
                $ref: undefined,
                dynamicScopeEntries: buildDynamicScopeEntries(
                  {
                    lexicalScope: {
                      $canonicalId: new Uri(schemaIdFixture),
                    },
                    resolutionContext: {
                      $ref: schemaIdFixture,
                      isDynamic: false,
                    },
                  },
                  {
                    lexicalScope: {
                      $canonicalId: new Uri(schemaIdFixture),
                    },
                    resolutionContext: {
                      $ref: '#node',
                      isDynamic: false,
                    },
                  },
                ),
                value: subschemaFixture,
              },
              dynamicScopeEntries: [
                buildResourceDynamicScopeEntry(schemaIdFixture),
              ],
            },
          };

          expect(result).toStrictEqual(expected);
        });
      });
    });

    describe('having a schema with a $dynamicRef to a resource that only defines that name with $anchor', () => {
      let jsonSchemaResolver: JsonSchemaResolver;
      let otherSchemaFixture: JsonSchemaObject;
      let otherSchemaIdFixture: string;
      let otherSubschemaFixture: JsonSchemaObject;
      let treeFixture: JsonSchemaObject;
      let treeIdFixture: string;

      beforeAll(() => {
        treeIdFixture = 'https://example.com/tree';
        otherSchemaIdFixture = 'https://example.com/other.json';
        otherSubschemaFixture = {
          $anchor: 'node',
          type: 'string',
        };
        otherSchemaFixture = {
          $defs: {
            node: otherSubschemaFixture,
          },
          $id: otherSchemaIdFixture,
        };
        treeFixture = {
          $dynamicAnchor: 'node',
          $dynamicRef: 'other.json#node',
          $id: treeIdFixture,
          type: 'object',
        };

        const schemaById: Map<string, JsonSchema> = new Map([
          [otherSchemaIdFixture, otherSchemaFixture],
          [treeIdFixture, treeFixture],
        ]);

        jsonSchemaResolver = new JsonSchemaResolver((id: string) =>
          schemaById.get(id),
        );
      });

      describe('when called', () => {
        let result: Either<ResolutionFailure, SchemaResolutionSuccessTree>;

        beforeAll(() => {
          result = jsonSchemaResolver.resolveSchema(treeFixture);
        });

        it('should resolve the $dynamicRef like a $ref and not retarget to the outer $dynamicAnchor', () => {
          const expected: Either<
            ResolutionFailure,
            SchemaResolutionSuccessTree
          > = {
            isRight: true,
            value: {
              $dynamicRef: {
                $dynamicRef: undefined,
                $ref: undefined,
                dynamicScopeEntries: buildDynamicScopeEntries(
                  {
                    lexicalScope: {
                      $canonicalId: new Uri(treeIdFixture),
                    },
                    resolutionContext: {
                      $ref: treeIdFixture,
                      isDynamic: false,
                    },
                  },
                  {
                    lexicalScope: {
                      $canonicalId: new Uri(otherSchemaIdFixture),
                    },
                    resolutionContext: {
                      $ref: 'other.json#node',
                      isDynamic: true,
                    },
                  },
                ),
                value: otherSubschemaFixture,
              },
              $ref: undefined,
              dynamicScopeEntries: [
                buildResourceDynamicScopeEntry(treeIdFixture),
              ],
            },
          };

          expect(result).toStrictEqual(expected);
        });
      });
    });

    describe('having a schema with a $ref to an invalid fragment', () => {
      let jsonSchemaResolver: JsonSchemaResolver;
      let schemaFixture: JsonSchemaObject;
      let schemaIdFixture: string;

      beforeAll(() => {
        schemaIdFixture = 'https://example.com/schema.json';
        schemaFixture = {
          $id: schemaIdFixture,
          $ref: '#1node',
        };

        const schemaById: Map<string, JsonSchema> = new Map([
          [schemaIdFixture, schemaFixture],
        ]);

        jsonSchemaResolver = new JsonSchemaResolver((id: string) =>
          schemaById.get(id),
        );
      });

      describe('when called', () => {
        let result: Either<ResolutionFailure, SchemaResolutionSuccessTree>;

        beforeAll(() => {
          result = jsonSchemaResolver.resolveSchema(schemaFixture);
        });

        it('should return a resolution failure', () => {
          const expected: Either<
            ResolutionFailure,
            SchemaResolutionSuccessTree
          > = {
            isRight: false,
            value: {
              reason: 'Invalid JSON Schema fragment: 1node',
              resolutionContextStack: [
                {
                  $ref: schemaIdFixture,
                  isDynamic: false,
                },
                {
                  $ref: '#1node',
                  isDynamic: false,
                },
              ],
            },
          };

          expect(result).toStrictEqual(expected);
        });
      });
    });

    describe('having a schema with a $ref to a malformed JSON Pointer fragment', () => {
      let jsonSchemaResolver: JsonSchemaResolver;
      let schemaFixture: JsonSchemaObject;
      let schemaIdFixture: string;

      beforeAll(() => {
        schemaIdFixture = 'https://example.com/schema.json';
        schemaFixture = {
          $id: schemaIdFixture,
          $ref: '#/foo~2',
        };

        const schemaById: Map<string, JsonSchema> = new Map([
          [schemaIdFixture, schemaFixture],
        ]);

        jsonSchemaResolver = new JsonSchemaResolver((id: string) =>
          schemaById.get(id),
        );
      });

      describe('when called', () => {
        let result: Either<ResolutionFailure, SchemaResolutionSuccessTree>;

        beforeAll(() => {
          result = jsonSchemaResolver.resolveSchema(schemaFixture);
        });

        it('should return a resolution failure', () => {
          const expected: Either<
            ResolutionFailure,
            SchemaResolutionSuccessTree
          > = {
            isRight: false,
            value: {
              reason: 'Invalid JSON Schema fragment: /foo~2',
              resolutionContextStack: [
                {
                  $ref: schemaIdFixture,
                  isDynamic: false,
                },
                {
                  $ref: '#/foo~2',
                  isDynamic: false,
                },
              ],
            },
          };

          expect(result).toStrictEqual(expected);
        });
      });
    });

    describe('having a schema with a $ref to an unknown $anchor', () => {
      let jsonSchemaResolver: JsonSchemaResolver;
      let schemaFixture: JsonSchemaObject;
      let schemaIdFixture: string;

      beforeAll(() => {
        schemaIdFixture = 'https://example.com/schema.json';
        schemaFixture = {
          $id: schemaIdFixture,
          $ref: '#missing',
        };

        const schemaById: Map<string, JsonSchema> = new Map([
          [schemaIdFixture, schemaFixture],
        ]);

        jsonSchemaResolver = new JsonSchemaResolver((id: string) =>
          schemaById.get(id),
        );
      });

      describe('when called', () => {
        let result: Either<ResolutionFailure, SchemaResolutionSuccessTree>;

        beforeAll(() => {
          result = jsonSchemaResolver.resolveSchema(schemaFixture);
        });

        it('should return a resolution failure', () => {
          const expected: Either<
            ResolutionFailure,
            SchemaResolutionSuccessTree
          > = {
            isRight: false,
            value: {
              reason: 'Failed to resolve anchor: missing',
              resolutionContextStack: [
                {
                  $ref: schemaIdFixture,
                  isDynamic: false,
                },
                {
                  $ref: '#missing',
                  isDynamic: false,
                },
              ],
            },
          };

          expect(result).toStrictEqual(expected);
        });
      });
    });

    describe('having a schema with a JSON Pointer $ref to an allOf item', () => {
      let jsonSchemaResolver: JsonSchemaResolver;
      let schemaFixture: JsonSchemaObject;
      let schemaIdFixture: string;
      let subschemaFixture: JsonSchemaObject;

      beforeAll(() => {
        schemaIdFixture = 'https://example.com/schema.json';
        subschemaFixture = {
          type: 'string',
        };
        schemaFixture = {
          $id: schemaIdFixture,
          $ref: '#/allOf/0',
          allOf: [subschemaFixture],
        };

        const schemaById: Map<string, JsonSchema> = new Map([
          [schemaIdFixture, schemaFixture],
        ]);

        jsonSchemaResolver = new JsonSchemaResolver((id: string) =>
          schemaById.get(id),
        );
      });

      describe('when called', () => {
        let result: Either<ResolutionFailure, SchemaResolutionSuccessTree>;

        beforeAll(() => {
          result = jsonSchemaResolver.resolveSchema(schemaFixture);
        });

        it('should return a tree with the referenced allOf item', () => {
          const expected: Either<
            ResolutionFailure,
            SchemaResolutionSuccessTree
          > = {
            isRight: true,
            value: {
              $dynamicRef: undefined,
              $ref: {
                $dynamicRef: undefined,
                $ref: undefined,
                dynamicScopeEntries: buildDynamicScopeEntries(
                  {
                    lexicalScope: {
                      $canonicalId: new Uri(schemaIdFixture),
                    },
                    resolutionContext: {
                      $ref: schemaIdFixture,
                      isDynamic: false,
                    },
                  },
                  {
                    lexicalScope: {
                      $canonicalId: new Uri(schemaIdFixture),
                    },
                    resolutionContext: {
                      $ref: '#/allOf/0',
                      isDynamic: false,
                    },
                  },
                ),
                value: subschemaFixture,
              },
              dynamicScopeEntries: [
                buildResourceDynamicScopeEntry(schemaIdFixture),
              ],
            },
          };

          expect(result).toStrictEqual(expected);
        });
      });
    });

    describe.each<[string, string]>([
      ['1abc', '#/allOf/1abc'],
      ['01', '#/allOf/01'],
    ])(
      'having a schema with a $ref to a non-RFC 6901 array index "%s"',
      (_pointerSegment: string, refFixture: string) => {
        let jsonSchemaResolver: JsonSchemaResolver;
        let schemaFixture: JsonSchemaObject;
        let schemaIdFixture: string;

        beforeAll(() => {
          schemaIdFixture = 'https://example.com/schema.json';
          schemaFixture = {
            $id: schemaIdFixture,
            $ref: refFixture,
            allOf: [
              {
                type: 'string',
              },
              {
                type: 'number',
              },
            ],
          };

          const schemaById: Map<string, JsonSchema> = new Map([
            [schemaIdFixture, schemaFixture],
          ]);

          jsonSchemaResolver = new JsonSchemaResolver((id: string) =>
            schemaById.get(id),
          );
        });

        describe('when called', () => {
          let result: Either<ResolutionFailure, SchemaResolutionSuccessTree>;

          beforeAll(() => {
            result = jsonSchemaResolver.resolveSchema(schemaFixture);
          });

          it('should return a resolution failure', () => {
            const expected: Either<
              ResolutionFailure,
              SchemaResolutionSuccessTree
            > = {
              isRight: false,
              value: {
                reason: `Failed to resolve JSON Pointer: ${refFixture.slice(1)}`,
                resolutionContextStack: [
                  {
                    $ref: schemaIdFixture,
                    isDynamic: false,
                  },
                  {
                    $ref: refFixture,
                    isDynamic: false,
                  },
                ],
              },
            };

            expect(result).toStrictEqual(expected);
          });
        });
      },
    );

    describe('having a schema with a $ref to a missing JSON Pointer node', () => {
      let jsonSchemaResolver: JsonSchemaResolver;
      let schemaFixture: JsonSchemaObject;
      let schemaIdFixture: string;

      beforeAll(() => {
        schemaIdFixture = 'https://example.com/schema.json';
        schemaFixture = {
          $id: schemaIdFixture,
          $ref: '#/$defs/missing',
        };

        const schemaById: Map<string, JsonSchema> = new Map([
          [schemaIdFixture, schemaFixture],
        ]);

        jsonSchemaResolver = new JsonSchemaResolver((id: string) =>
          schemaById.get(id),
        );
      });

      describe('when called', () => {
        let result: Either<ResolutionFailure, SchemaResolutionSuccessTree>;

        beforeAll(() => {
          result = jsonSchemaResolver.resolveSchema(schemaFixture);
        });

        it('should return a resolution failure', () => {
          const expected: Either<
            ResolutionFailure,
            SchemaResolutionSuccessTree
          > = {
            isRight: false,
            value: {
              reason: 'Failed to resolve JSON Pointer: /$defs/missing',
              resolutionContextStack: [
                {
                  $ref: schemaIdFixture,
                  isDynamic: false,
                },
                {
                  $ref: '#/$defs/missing',
                  isDynamic: false,
                },
              ],
            },
          };

          expect(result).toStrictEqual(expected);
        });
      });
    });

    describe('having a nested relative $ref and an incoming dynamic scope', () => {
      let jsonSchemaResolver: JsonSchemaResolver;
      let otherSchemaFixture: JsonSchemaObject;
      let otherSchemaIdFixture: string;
      let parentSchemaFixture: JsonSchemaObject;
      let parentSchemaIdFixture: string;
      let childSchemaFixture: JsonSchemaObject;

      beforeAll(() => {
        parentSchemaIdFixture = 'https://example.com/schema.json';
        otherSchemaIdFixture = 'https://example.com/other.json';
        otherSchemaFixture = {
          $id: otherSchemaIdFixture,
          type: 'string',
        };
        childSchemaFixture = {
          $ref: 'other.json',
        };
        parentSchemaFixture = {
          $id: parentSchemaIdFixture,
          properties: {
            foo: childSchemaFixture,
          },
        };

        const schemaById: Map<string, JsonSchema> = new Map([
          [otherSchemaIdFixture, otherSchemaFixture],
          [parentSchemaIdFixture, parentSchemaFixture],
        ]);

        jsonSchemaResolver = new JsonSchemaResolver((id: string) =>
          schemaById.get(id),
        );
      });

      describe('when called', () => {
        let result: Either<ResolutionFailure, SchemaResolutionSuccessTree>;

        beforeAll(() => {
          const parentResult: Either<
            ResolutionFailure,
            SchemaResolutionSuccessTree
          > = jsonSchemaResolver.resolveSchema(parentSchemaFixture);

          if (!parentResult.isRight) {
            throw new Error(parentResult.value.reason);
          }

          result = jsonSchemaResolver.resolveSchema(
            childSchemaFixture,
            parentResult.value.dynamicScopeEntries,
          );
        });

        it('should resolve the relative $ref against the parent lexical scope', () => {
          const expected: Either<
            ResolutionFailure,
            SchemaResolutionSuccessTree
          > = {
            isRight: true,
            value: {
              $dynamicRef: undefined,
              $ref: {
                $dynamicRef: undefined,
                $ref: undefined,
                dynamicScopeEntries: buildDynamicScopeEntries(
                  {
                    lexicalScope: {
                      $canonicalId: new Uri(parentSchemaIdFixture),
                    },
                    resolutionContext: {
                      $ref: parentSchemaIdFixture,
                      isDynamic: false,
                    },
                  },
                  {
                    lexicalScope: {
                      $canonicalId: new Uri(otherSchemaIdFixture),
                    },
                    resolutionContext: {
                      $ref: 'other.json',
                      isDynamic: false,
                    },
                  },
                ),
                value: otherSchemaFixture,
              },
              dynamicScopeEntries: [
                buildResourceDynamicScopeEntry(parentSchemaIdFixture),
              ],
            },
          };

          expect(result).toStrictEqual(expected);
        });
      });
    });
  });
});
