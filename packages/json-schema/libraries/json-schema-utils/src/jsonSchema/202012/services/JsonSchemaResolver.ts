import { type Either } from '@inversifyjs/common';
import { type JsonValue } from '@inversifyjs/json-schema-types';
import {
  type JsonSchema,
  type JsonSchemaObject,
} from '@inversifyjs/json-schema-types/2020-12';
import { Uri } from '@inversifyjs/uri';

import { SingleImmutableLinkedList } from '../../../common/models/SingleImmutableLinkedList.js';
import { traverse } from '../actions/traverse.js';
import { type TraverseJsonSchemaCallbackParams } from '../models/TraverseJsonSchemaCallbackParams.js';
import { type TraverseJsonSchemaCallbackParamsResult } from '../models/TraverseJsonSchemaCallbackParamsResult.js';

const ANCHOR_FRAGMENT_REGEXP: RegExp = /^[A-Za-z_][A-Za-z0-9._-]*$/;
const JSON_POINTER_ARRAY_INDEX_REGEXP: RegExp = /^(?:0|[1-9]\d*)$/;
const JSON_POINTER_FRAGMENT_REGEXP: RegExp = /^(?:\/(?:[^~/]|~[01])*)*$/u;
const JSON_POINTER_SEGMENT_SEPARATOR: string = '/';
const JSON_POINTER_SEGMENT_SEPARATOR_ENCODED: string = '~1';
const JSON_POINTER_SEGMENT_ENCODER: string = '~';
const JSON_POINTER_SEGMENT_ENCODER_ENCODED: string = '~0';
const WHOLE_DOCUMENT_FRAGMENT: string = '';

export interface DynamicScopeEntry {
  readonly resolutionContext: ResolutionContext;
  readonly lexicalScope: LexicalScope;
}

interface JsonSchemaResolverCacheEntry {
  readonly $anchorToValueMap: Map<string, JsonValue>;
  readonly $canonicalId: Uri;
  readonly $dynamicAnchorToValueMap: Map<string, JsonValue>;
  readonly value: JsonValue;
}

export interface LexicalScope {
  /** Absolute URI reference from the lexical scope. */
  readonly $canonicalId: Uri;
}

export interface ResolutionContext {
  readonly $ref: string;
  readonly isDynamic: boolean;
}

export interface ResolutionFailure {
  readonly resolutionContextStack: ResolutionContext[];
  readonly reason: string;
}

interface ResolutionSuccess {
  readonly dynamicScopeEntries: SingleImmutableLinkedList<DynamicScopeEntry>;
  readonly value: JsonValue;
}

export interface SchemaResolutionSuccessLinks {
  $dynamicRef: SchemaResolutionSuccessNode | undefined;
  $ref: SchemaResolutionSuccessNode | undefined;
}

export interface SchemaResolutionSuccessNode extends SchemaResolutionSuccessLinks {
  readonly dynamicScopeEntries: Iterable<DynamicScopeEntry>;
  readonly value: JsonValue;
}

export type SchemaResolutionSuccessTree = SchemaResolutionSuccessLinks;

export class JsonSchemaResolver {
  readonly #idToCacheEntryMap: Map<string, JsonSchemaResolverCacheEntry>;
  readonly #resolveId: (id: string) => JsonValue | undefined;

  constructor(resolveId: (id: string) => JsonValue | undefined) {
    this.#idToCacheEntryMap = new Map();
    this.#resolveId = resolveId;
  }

  public resolveSchema(
    schema: JsonValue,
  ): Either<ResolutionFailure, SchemaResolutionSuccessTree> {
    if (
      schema === null ||
      typeof schema !== 'object' ||
      Array.isArray(schema)
    ) {
      return {
        isRight: true,
        value: {
          $dynamicRef: undefined,
          $ref: undefined,
        },
      };
    }

    const tree: SchemaResolutionSuccessTree = {
      $dynamicRef: undefined,
      $ref: undefined,
    };

    const jsonSchema: JsonSchemaObject = schema;

    if (jsonSchema.$id !== undefined) {
      let idUri: Uri;

      try {
        idUri = new Uri(jsonSchema.$id);
      } catch (_error: unknown) {
        return {
          isRight: false,
          value: this.#buildResolutionFailure(
            undefined,
            `Invalid URI: ${jsonSchema.$id}`,
          ),
        };
      }

      // Load root schema to cache
      this.#tryGetOrCreateCacheEntry(
        Uri.fromAttributes({
          ...idUri.attributes,
          fragment: undefined,
        }),
      );
    }

    if (jsonSchema.$dynamicRef !== undefined) {
      const result: Either<ResolutionFailure, ResolutionSuccess> =
        this.#resolveRootJsonSchemaDynamicRef(
          jsonSchema as JsonSchemaObject &
            Required<Pick<JsonSchemaObject, '$dynamicRef'>>,
        );

      if (!result.isRight) {
        return result;
      }

      tree.$dynamicRef = {
        $dynamicRef: undefined,
        $ref: undefined,
        dynamicScopeEntries: result.value.dynamicScopeEntries,
        value: result.value.value,
      };

      const nodePropagationResult: Either<ResolutionFailure, void> =
        this.#resolveNodeRefs(
          result.value.dynamicScopeEntries,
          tree.$dynamicRef,
          new Set([jsonSchema]),
        );

      if (!nodePropagationResult.isRight) {
        return nodePropagationResult;
      }
    }

    if (jsonSchema.$ref !== undefined) {
      const result: Either<ResolutionFailure, ResolutionSuccess> =
        this.#resolveRootJsonSchemaRef(
          jsonSchema as JsonSchemaObject &
            Required<Pick<JsonSchemaObject, '$ref'>>,
        );

      if (!result.isRight) {
        return result;
      }

      tree.$ref = {
        $dynamicRef: undefined,
        $ref: undefined,
        dynamicScopeEntries: result.value.dynamicScopeEntries,
        value: result.value.value,
      };

      const nodePropagationResult: Either<ResolutionFailure, void> =
        this.#resolveNodeRefs(
          result.value.dynamicScopeEntries,
          tree.$ref,
          new Set([jsonSchema]),
        );

      if (!nodePropagationResult.isRight) {
        return nodePropagationResult;
      }
    }

    return {
      isRight: true,
      value: tree,
    };
  }

  #buildAnchorToValueMap(schema: JsonValue): Map<string, JsonValue> {
    const $anchorToValueMap: Map<string, JsonValue> = new Map();

    traverse(
      {
        schema: schema as JsonSchema,
      },
      (
        params: TraverseJsonSchemaCallbackParams,
      ): TraverseJsonSchemaCallbackParamsResult => {
        if (
          params.schema === true ||
          params.schema === false ||
          (params.schema.$id !== undefined &&
            params.schema !== params.rootSchema)
        ) {
          return {
            traverseChildren: false,
          };
        }

        if (params.schema.$anchor !== undefined) {
          $anchorToValueMap.set(params.schema.$anchor, params.schema);
        }

        return {
          traverseChildren: true,
        };
      },
    );

    return $anchorToValueMap;
  }

  #buildDynamicAnchorToValueMap(schema: JsonValue): Map<string, JsonValue> {
    const $dynamicAnchorToValueMap: Map<string, JsonValue> = new Map();

    traverse(
      {
        schema: schema as JsonSchema,
      },
      (
        params: TraverseJsonSchemaCallbackParams,
      ): TraverseJsonSchemaCallbackParamsResult => {
        if (
          params.schema === true ||
          params.schema === false ||
          (params.schema.$id !== undefined &&
            params.schema !== params.rootSchema)
        ) {
          return {
            traverseChildren: false,
          };
        }

        if (params.schema.$dynamicAnchor !== undefined) {
          $dynamicAnchorToValueMap.set(
            params.schema.$dynamicAnchor,
            params.schema,
          );
        }

        return {
          traverseChildren: true,
        };
      },
    );

    return $dynamicAnchorToValueMap;
  }

  #buildResolutionFailure(
    dynamicScopeEntries:
      SingleImmutableLinkedList<DynamicScopeEntry> | undefined,
    reason: string,
  ): ResolutionFailure {
    const resolutionContextStack: ResolutionContext[] = (
      dynamicScopeEntries?.toArray() ?? []
    ).map((dynamicScope: DynamicScopeEntry) => dynamicScope.resolutionContext);

    return {
      reason,
      resolutionContextStack,
    };
  }

  #calculateBaseUri(
    dynamicScopeEntries: SingleImmutableLinkedList<DynamicScopeEntry>,
  ): Uri | undefined {
    const lastLexicalScope: LexicalScope =
      dynamicScopeEntries.last.elem.lexicalScope;

    return lastLexicalScope.$canonicalId;
  }

  #calculateCanonicalId(
    dynamicScopeEntries:
      SingleImmutableLinkedList<DynamicScopeEntry> | undefined,
    ref: string,
    baseRef: string | undefined,
  ): Either<ResolutionFailure, Uri> {
    try {
      const canonicalUri: Uri = new Uri(ref, baseRef);
      return {
        isRight: true,
        value: Uri.fromAttributes({
          ...canonicalUri.attributes,
          fragment: undefined,
        }),
      };
    } catch (error: unknown) {
      return {
        isRight: false,
        value: this.#buildResolutionFailure(
          dynamicScopeEntries,
          `Failed to calculate canonical ID: ${error instanceof Error ? error.message : String(error)}`,
        ),
      };
    }
  }

  #getAnchorValue(
    anchor: string,
    currentCacheEntry: JsonSchemaResolverCacheEntry,
  ): JsonValue | undefined {
    return (
      currentCacheEntry.$anchorToValueMap.get(anchor) ??
      currentCacheEntry.$dynamicAnchorToValueMap.get(anchor)
    );
  }

  #getCacheEntryOrFail(
    canonicalId: string,
    dynamicScopeEntries: SingleImmutableLinkedList<DynamicScopeEntry>,
  ): Either<ResolutionFailure, JsonSchemaResolverCacheEntry> {
    const currentCacheEntry: JsonSchemaResolverCacheEntry | undefined =
      this.#idToCacheEntryMap.get(canonicalId);

    if (currentCacheEntry === undefined) {
      return {
        isRight: false,
        value: this.#buildResolutionFailure(
          dynamicScopeEntries,
          `Failed to resolve resource identified by: ${canonicalId}`,
        ),
      };
    }

    return {
      isRight: true,
      value: currentCacheEntry,
    };
  }

  #resolve(
    dynamicScopeEntries: SingleImmutableLinkedList<DynamicScopeEntry>,
  ): Either<ResolutionFailure, ResolutionSuccess> {
    /*
     * 1. Resolve resolutionContext.$ref against the current lexical base URI
     *    (last dynamic scope entry). On URI parse failure, return error.
     * 2. Take the fragment aside. Look up the fragment-less URI with
     *    #resolveId / cache. If missing, return error.
     * 3. Append a new dynamic scope entry for that resource (this hop) and
     *    return { value, dynamicScopeEntries } as follows:
     * 4. No fragment, or empty fragment: return the resource root.
     * 5. Plain-name fragment:
     *    5.1 If isDynamic:
     *        If the current (last) entry's resource defines that name with
     *        $dynamicAnchor, walk entries from the outside and return the
     *        first match. If that match is not the last entry, append a new
     *        entry with the matched resource's $canonicalId and this hop's
     *        resolutionContext. Otherwise resolve like $ref (step 5.2).
     *        If $anchor and $dynamicAnchor both define the name in the
     *        current resource, $ref prefers $anchor; $dynamicRef still uses
     *        the $dynamicAnchor gate.
     *    5.2 If not isDynamic: resolve the name in the current resource
     *        ($anchor, then $dynamicAnchor). If missing, return error.
     * 6. JSON Pointer fragment: walk the pointer. On each object node with
     *    $id, resolve that id against the current lexical base, require it
     *    in the cache, and replace the last dynamic scope entry with that
     *    resource (same resolutionContext). If the pointer fails, return
     *    error. Return the node at the pointer.
     * 7. Any other fragment: return error.
     *
     * This method returns the referenced node. It does not follow $ref or
     * $dynamicRef on that node; those are applicators for the evaluator.
     */

    const lastDynamicScope: DynamicScopeEntry = dynamicScopeEntries.last.elem;

    const canonicalId: Uri = lastDynamicScope.lexicalScope.$canonicalId;

    const currentCacheEntry: JsonSchemaResolverCacheEntry | undefined =
      this.#tryGetOrCreateCacheEntry(canonicalId);

    if (currentCacheEntry === undefined) {
      return {
        isRight: false,
        value: this.#buildResolutionFailure(
          dynamicScopeEntries,
          `Failed to resolve resource identified by: ${canonicalId.toString()}`,
        ),
      };
    }

    let canonicalUri: Uri;

    try {
      canonicalUri = new Uri(
        lastDynamicScope.resolutionContext.$ref,
        canonicalId.toString(),
      );
    } catch (_error: unknown) {
      return {
        isRight: false,
        value: this.#buildResolutionFailure(
          dynamicScopeEntries,
          `Invalid URI: ${lastDynamicScope.resolutionContext.$ref} Base: ${canonicalId.toString()}`,
        ),
      };
    }

    if (
      canonicalUri.attributes.fragment === undefined ||
      canonicalUri.attributes.fragment === WHOLE_DOCUMENT_FRAGMENT
    ) {
      return {
        isRight: true,
        value: {
          dynamicScopeEntries,
          value: currentCacheEntry.value,
        },
      };
    }

    if (ANCHOR_FRAGMENT_REGEXP.test(canonicalUri.attributes.fragment)) {
      if (lastDynamicScope.resolutionContext.isDynamic) {
        return this.#resolveFromDynamicAnchor(
          canonicalUri.attributes.fragment,
          currentCacheEntry,
          dynamicScopeEntries,
        );
      } else {
        return this.#resolveFromAnchor(
          canonicalUri.attributes.fragment,
          currentCacheEntry,
          dynamicScopeEntries,
        );
      }
    }

    if (JSON_POINTER_FRAGMENT_REGEXP.test(canonicalUri.attributes.fragment)) {
      return this.#resolveFromJsonPointer(
        canonicalUri.attributes.fragment,
        currentCacheEntry,
        dynamicScopeEntries,
      );
    }

    return {
      isRight: false,
      value: this.#buildResolutionFailure(
        dynamicScopeEntries,
        `Invalid JSON Schema fragment: ${canonicalUri.attributes.fragment}`,
      ),
    };
  }

  #resolveFromAnchor(
    anchor: string,
    currentCacheEntry: JsonSchemaResolverCacheEntry,
    dynamicScopeEntries: SingleImmutableLinkedList<DynamicScopeEntry>,
  ): Either<ResolutionFailure, ResolutionSuccess> {
    const anchorValue: JsonValue | undefined = this.#getAnchorValue(
      anchor,
      currentCacheEntry,
    );

    if (anchorValue === undefined) {
      return {
        isRight: false,
        value: this.#buildResolutionFailure(
          dynamicScopeEntries,
          `Failed to resolve anchor: ${anchor}`,
        ),
      };
    }

    return {
      isRight: true,
      value: {
        dynamicScopeEntries,
        value: anchorValue,
      },
    };
  }

  #resolveFromDynamicAnchor(
    anchor: string,
    currentCacheEntry: JsonSchemaResolverCacheEntry,
    dynamicScopeEntries: SingleImmutableLinkedList<DynamicScopeEntry>,
  ): Either<ResolutionFailure, ResolutionSuccess> {
    const isAnchorInCurrentDynamicScope: boolean =
      currentCacheEntry.$dynamicAnchorToValueMap.get(anchor) !== undefined;

    if (isAnchorInCurrentDynamicScope) {
      for (const dynamicScope of dynamicScopeEntries.toArray()) {
        const canonicalId: Uri = dynamicScope.lexicalScope.$canonicalId;

        const cacheEntryResult: Either<
          ResolutionFailure,
          JsonSchemaResolverCacheEntry
        > = this.#getCacheEntryOrFail(
          canonicalId.toString(),
          dynamicScopeEntries,
        );

        if (!cacheEntryResult.isRight) {
          return cacheEntryResult;
        }

        const dynamicAnchorValue: JsonValue | undefined =
          cacheEntryResult.value.$dynamicAnchorToValueMap.get(anchor);

        if (dynamicAnchorValue !== undefined) {
          const lastDynamicScope: DynamicScopeEntry =
            dynamicScopeEntries.last.elem;

          return {
            isRight: true,
            value: {
              dynamicScopeEntries:
                dynamicScope === lastDynamicScope
                  ? dynamicScopeEntries
                  : dynamicScopeEntries.concat({
                      lexicalScope: dynamicScope.lexicalScope,
                      resolutionContext: lastDynamicScope.resolutionContext,
                    }),
              value: dynamicAnchorValue,
            },
          };
        }
      }

      return {
        isRight: false,
        value: this.#buildResolutionFailure(
          dynamicScopeEntries,
          `Failed to resolve dynamic anchor: ${anchor}`,
        ),
      };
    } else {
      return this.#resolveFromAnchor(
        anchor,
        currentCacheEntry,
        dynamicScopeEntries,
      );
    }
  }

  #resolveFromJsonPointer(
    jsonPointer: string,
    currentCacheEntry: JsonSchemaResolverCacheEntry,
    dynamicScopeEntries: SingleImmutableLinkedList<DynamicScopeEntry>,
  ): Either<ResolutionFailure, ResolutionSuccess> {
    const pointerSegments: string[] = jsonPointer
      .split(JSON_POINTER_SEGMENT_SEPARATOR)
      .map((segment: string) =>
        segment
          .replaceAll(
            JSON_POINTER_SEGMENT_SEPARATOR_ENCODED,
            JSON_POINTER_SEGMENT_SEPARATOR,
          )
          .replaceAll(
            JSON_POINTER_SEGMENT_ENCODER_ENCODED,
            JSON_POINTER_SEGMENT_ENCODER,
          ),
      );

    let result: JsonValue | undefined = currentCacheEntry.value;
    let currentDynamicScopeEntries: SingleImmutableLinkedList<DynamicScopeEntry> =
      dynamicScopeEntries;

    for (let i: number = 1; i < pointerSegments.length; ++i) {
      const pointerSegment: string = pointerSegments[i] as string;

      if (result == null || typeof result !== 'object') {
        result = undefined;
        break;
      }

      if (Array.isArray(result)) {
        if (!JSON_POINTER_ARRAY_INDEX_REGEXP.test(pointerSegment)) {
          result = undefined;
          break;
        }

        result = result[Number.parseInt(pointerSegment, 10)];
      } else {
        const syncResult: Either<
          ResolutionFailure,
          SingleImmutableLinkedList<DynamicScopeEntry>
        > = this.#syncCacheAndDynamicScopeOnJsonPointerObjectTraversal(
          currentDynamicScopeEntries,
          result,
        );

        if (syncResult.isRight) {
          currentDynamicScopeEntries = syncResult.value;
        } else {
          return syncResult;
        }

        result = result[pointerSegment];
      }
    }

    if (result === undefined) {
      return {
        isRight: false,
        value: this.#buildResolutionFailure(
          currentDynamicScopeEntries,
          `Failed to resolve JSON Pointer: ${jsonPointer}`,
        ),
      };
    }

    if (
      result !== null &&
      typeof result === 'object' &&
      !Array.isArray(result)
    ) {
      const syncResult: Either<
        ResolutionFailure,
        SingleImmutableLinkedList<DynamicScopeEntry>
      > = this.#syncCacheAndDynamicScopeOnJsonPointerObjectTraversal(
        currentDynamicScopeEntries,
        result,
      );

      if (syncResult.isRight) {
        currentDynamicScopeEntries = syncResult.value;
      } else {
        return syncResult;
      }
    }

    return {
      isRight: true,
      value: {
        dynamicScopeEntries: currentDynamicScopeEntries,
        value: result,
      },
    };
  }

  #resolveRootJsonSchemaDynamicRef(
    jsonSchema: JsonSchemaObject &
      Required<Pick<JsonSchemaObject, '$dynamicRef'>>,
  ): Either<ResolutionFailure, ResolutionSuccess> {
    const canonicalIdResult: Either<ResolutionFailure, Uri> =
      this.#calculateCanonicalId(
        undefined,
        jsonSchema.$dynamicRef,
        jsonSchema.$id,
      );

    if (!canonicalIdResult.isRight) {
      return canonicalIdResult;
    }

    let dynamicScopeEntries: SingleImmutableLinkedList<DynamicScopeEntry>;

    if (jsonSchema.$id === undefined) {
      dynamicScopeEntries = new SingleImmutableLinkedList({
        elem: {
          lexicalScope: {
            $canonicalId: canonicalIdResult.value,
          },
          resolutionContext: {
            $ref: jsonSchema.$dynamicRef,
            isDynamic: true,
          },
        },
        previous: undefined,
      });
    } else {
      let $canonicalId: Uri;

      try {
        $canonicalId = Uri.fromAttributes({
          ...new Uri(jsonSchema.$id).attributes,
          fragment: undefined,
        });
      } catch (_error: unknown) {
        return {
          isRight: false,
          value: this.#buildResolutionFailure(
            undefined,
            `Invalid URI: ${jsonSchema.$id}`,
          ),
        };
      }

      dynamicScopeEntries = new SingleImmutableLinkedList({
        elem: {
          lexicalScope: {
            $canonicalId,
          },
          resolutionContext: {
            $ref: jsonSchema.$id,
            isDynamic: true,
          },
        },
        previous: undefined,
      }).concat({
        lexicalScope: {
          $canonicalId: canonicalIdResult.value,
        },
        resolutionContext: {
          $ref: jsonSchema.$dynamicRef,
          isDynamic: true,
        },
      });
    }

    return this.#resolve(dynamicScopeEntries);
  }

  #resolveRootJsonSchemaRef(
    jsonSchema: JsonSchemaObject & Required<Pick<JsonSchemaObject, '$ref'>>,
  ): Either<ResolutionFailure, ResolutionSuccess> {
    const canonicalIdResult: Either<ResolutionFailure, Uri> =
      this.#calculateCanonicalId(undefined, jsonSchema.$ref, jsonSchema.$id);

    if (!canonicalIdResult.isRight) {
      return canonicalIdResult;
    }

    let dynamicScopeEntries: SingleImmutableLinkedList<DynamicScopeEntry>;

    if (jsonSchema.$id === undefined) {
      dynamicScopeEntries = new SingleImmutableLinkedList({
        elem: {
          lexicalScope: {
            $canonicalId: canonicalIdResult.value,
          },
          resolutionContext: {
            $ref: jsonSchema.$ref,
            isDynamic: false,
          },
        },
        previous: undefined,
      });
    } else {
      let $canonicalId: Uri;

      try {
        $canonicalId = Uri.fromAttributes({
          ...new Uri(jsonSchema.$id).attributes,
          fragment: undefined,
        });
      } catch (_error: unknown) {
        return {
          isRight: false,
          value: this.#buildResolutionFailure(
            undefined,
            `Invalid URI: ${jsonSchema.$id}`,
          ),
        };
      }

      dynamicScopeEntries = new SingleImmutableLinkedList({
        elem: {
          lexicalScope: {
            $canonicalId,
          },
          resolutionContext: {
            $ref: jsonSchema.$id,
            isDynamic: false,
          },
        },
        previous: undefined,
      }).concat({
        lexicalScope: {
          $canonicalId: canonicalIdResult.value,
        },
        resolutionContext: {
          $ref: jsonSchema.$ref,
          isDynamic: false,
        },
      });
    }

    return this.#resolve(dynamicScopeEntries);
  }

  #resolveNodeRefs(
    dynamicScopeEntries: SingleImmutableLinkedList<DynamicScopeEntry>,
    node: SchemaResolutionSuccessNode,
    visitedJsonSchemas: Set<JsonSchemaObject>,
  ): Either<ResolutionFailure, void> {
    const value: JsonValue = node.value;

    if (value === null || typeof value !== 'object' || Array.isArray(value)) {
      return {
        isRight: true,
        value: undefined,
      };
    }

    const jsonSchema: JsonSchemaObject = value;

    const nextVisitedJsonSchemas: Set<JsonSchemaObject> | undefined =
      this.#tryVisitJsonSchema(visitedJsonSchemas, jsonSchema);

    if (nextVisitedJsonSchemas === undefined) {
      return {
        isRight: true,
        value: undefined,
      };
    }

    if (jsonSchema.$dynamicRef !== undefined) {
      const canonicalIdResult: Either<ResolutionFailure, Uri> =
        this.#calculateCanonicalId(
          dynamicScopeEntries,
          jsonSchema.$dynamicRef,
          dynamicScopeEntries.last.elem.lexicalScope.$canonicalId.toString(),
        );

      if (!canonicalIdResult.isRight) {
        return canonicalIdResult;
      }

      const result: Either<ResolutionFailure, ResolutionSuccess> =
        this.#resolve(
          dynamicScopeEntries.concat({
            lexicalScope: {
              $canonicalId: canonicalIdResult.value,
            },
            resolutionContext: {
              $ref: jsonSchema.$dynamicRef,
              isDynamic: true,
            },
          }),
        );

      if (!result.isRight) {
        return result;
      }

      node.$dynamicRef = {
        $dynamicRef: undefined,
        $ref: undefined,
        dynamicScopeEntries: result.value.dynamicScopeEntries,
        value: result.value.value,
      };

      const nodePropagationResult: Either<ResolutionFailure, void> =
        this.#resolveNodeRefs(
          result.value.dynamicScopeEntries,
          node.$dynamicRef,
          nextVisitedJsonSchemas,
        );

      if (!nodePropagationResult.isRight) {
        return nodePropagationResult;
      }
    }

    if (jsonSchema.$ref !== undefined) {
      const canonicalIdResult: Either<ResolutionFailure, Uri> =
        this.#calculateCanonicalId(
          dynamicScopeEntries,
          jsonSchema.$ref,
          dynamicScopeEntries.last.elem.lexicalScope.$canonicalId.toString(),
        );

      if (!canonicalIdResult.isRight) {
        return canonicalIdResult;
      }

      const result: Either<ResolutionFailure, ResolutionSuccess> =
        this.#resolve(
          dynamicScopeEntries.concat({
            lexicalScope: {
              $canonicalId: canonicalIdResult.value,
            },
            resolutionContext: {
              $ref: jsonSchema.$ref,
              isDynamic: false,
            },
          }),
        );

      if (!result.isRight) {
        return result;
      }

      node.$ref = {
        $dynamicRef: undefined,
        $ref: undefined,
        dynamicScopeEntries: result.value.dynamicScopeEntries,
        value: result.value.value,
      };

      const nodePropagationResult: Either<ResolutionFailure, void> =
        this.#resolveNodeRefs(
          result.value.dynamicScopeEntries,
          node.$ref,
          nextVisitedJsonSchemas,
        );

      if (!nodePropagationResult.isRight) {
        return nodePropagationResult;
      }
    }

    return {
      isRight: true,
      value: undefined,
    };
  }

  #syncCacheAndDynamicScopeOnJsonPointerObjectTraversal(
    dynamicScopeEntries: SingleImmutableLinkedList<DynamicScopeEntry>,
    maybeJsonSchema: Partial<JsonSchemaObject>,
  ): Either<ResolutionFailure, SingleImmutableLinkedList<DynamicScopeEntry>> {
    if (maybeJsonSchema.$id !== undefined) {
      const baseUri: Uri | undefined =
        this.#calculateBaseUri(dynamicScopeEntries);
      let canonicalUri: Uri;

      try {
        canonicalUri = new Uri(maybeJsonSchema.$id, baseUri?.toString());
      } catch (_error: unknown) {
        return {
          isRight: false,
          value: this.#buildResolutionFailure(
            dynamicScopeEntries,
            `Failed to create canonical URI from ID: ${maybeJsonSchema.$id}`,
          ),
        };
      }

      const canonicalId: Uri = Uri.fromAttributes({
        ...canonicalUri.attributes,
        fragment: undefined,
      });
      const currentCacheEntry: JsonSchemaResolverCacheEntry | undefined =
        this.#tryGetOrCreateCacheEntry(canonicalId);

      if (currentCacheEntry === undefined) {
        return {
          isRight: false,
          value: this.#buildResolutionFailure(
            dynamicScopeEntries,
            `Failed to resolve resource identified by: ${canonicalId.toString()}`,
          ),
        };
      }

      const lastDynamicScope: DynamicScopeEntry = dynamicScopeEntries.last.elem;

      return {
        isRight: true,
        value: new SingleImmutableLinkedList(
          {
            elem: {
              lexicalScope: {
                $canonicalId: canonicalId,
              },
              resolutionContext: lastDynamicScope.resolutionContext,
            },
            previous: dynamicScopeEntries.last.previous,
          },
          dynamicScopeEntries.length,
        ),
      };
    }

    return {
      isRight: true,
      value: dynamicScopeEntries,
    };
  }

  #tryGetOrCreateCacheEntry(
    canonicalId: Uri,
  ): JsonSchemaResolverCacheEntry | undefined {
    let currentCacheEntry: JsonSchemaResolverCacheEntry | undefined =
      this.#idToCacheEntryMap.get(canonicalId.toString());

    if (currentCacheEntry === undefined) {
      const canonicalIdResource: JsonValue | undefined = this.#resolveId(
        canonicalId.toString(),
      );

      if (canonicalIdResource === undefined) {
        return undefined;
      }

      currentCacheEntry = {
        $anchorToValueMap: this.#buildAnchorToValueMap(canonicalIdResource),
        $canonicalId: canonicalId,
        $dynamicAnchorToValueMap:
          this.#buildDynamicAnchorToValueMap(canonicalIdResource),
        value: canonicalIdResource,
      };

      this.#idToCacheEntryMap.set(canonicalId.toString(), currentCacheEntry);
    }

    return currentCacheEntry;
  }

  #tryVisitJsonSchema(
    visitedJsonSchemas: Set<JsonSchemaObject>,
    jsonSchema: JsonSchemaObject,
  ): Set<JsonSchemaObject> | undefined {
    if (visitedJsonSchemas.has(jsonSchema)) {
      return undefined;
    }

    const nextVisitedJsonSchemas: Set<JsonSchemaObject> = new Set(
      visitedJsonSchemas,
    );

    nextVisitedJsonSchemas.add(jsonSchema);

    return nextVisitedJsonSchemas;
  }
}
