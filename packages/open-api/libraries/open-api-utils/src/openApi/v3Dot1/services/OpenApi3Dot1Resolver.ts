/*
 * Resolves OpenAPI 3.1 Reference Objects per:
 * - https://github.com/OAI/OpenAPI-Specification/blob/main/versions/3.1.1.md#referenceObject
 * - https://github.com/OAI/OpenAPI-Specification/blob/main/versions/3.1.1.md#relativeReferencesInApiDescriptionUris
 *
 * Unlike JsonSchemaResolver, this resolver does not interpret JSON Schema
 * keywords ($ref, $dynamicRef, $anchor, $id, ...). It only follows OpenAPI
 * Reference Objects (`$ref` with optional `summary` and `description`) until
 * a non-reference target is reached.
 */

import { resolveJsonPointer } from '@inversifyjs/json-schema-pointer';
import { type JsonValue } from '@inversifyjs/json-schema-types';
import { Uri } from '@inversifyjs/uri';

import { isOpenApi3Dot1ReferenceObject } from '../calculations/isOpenApi3Dot1ReferenceObject.js';

export interface OpenApi3Dot1RefResolutionContext {
  /** The `$ref` URI exactly as declared in the Reference Object. */
  readonly $ref: string;
  /** The canonical URI of the referenced location. */
  readonly canonicalId: string;
}

export interface OpenApi3Dot1RefResolutionChainEntry extends OpenApi3Dot1RefResolutionContext {
  /** The Reference Object of the hop. */
  readonly value: JsonValue;
}

export interface OpenApi3Dot1RefResolutionFailure {
  readonly resolutionContextStack: readonly OpenApi3Dot1RefResolutionContext[];
  readonly reason: string;
}

export interface OpenApi3Dot1RefResolutionSuccess {
  /** The references followed, in order, from the first hop to the last. */
  readonly chain: readonly OpenApi3Dot1RefResolutionChainEntry[];
  /** The final resolved value. OpenAPI Reference Object chains are fully followed. The value may still be a Schema Object or Path Item Object that uses `$ref` with sibling fields. */
  readonly value: JsonValue;
}

export type OpenApi3Dot1RefResolutionResult =
  | {
      isRight: false;
      value: OpenApi3Dot1RefResolutionFailure;
    }
  | {
      isRight: true;
      value: OpenApi3Dot1RefResolutionSuccess;
    };

export class OpenApi3Dot1Resolver {
  readonly #idToDocumentMap: Map<string, JsonValue>;
  readonly #openApiDocumentUri: string;
  readonly #resolveId: (id: string) => JsonValue | undefined;

  constructor(
    openApiDocumentUri: string,
    resolveId: (id: string) => JsonValue | undefined,
  ) {
    let documentUri: Uri;

    try {
      documentUri = new Uri(openApiDocumentUri);
    } catch (error: unknown) {
      throw new Error(`Invalid OpenAPI document URI: ${openApiDocumentUri}`, {
        cause: error,
      });
    }

    this.#idToDocumentMap = new Map();
    this.#openApiDocumentUri = Uri.fromAttributes({
      ...documentUri.attributes,
      fragment: undefined,
    }).toString();
    this.#resolveId = resolveId;
  }

  public resolveRef(openApiRef: JsonValue): OpenApi3Dot1RefResolutionResult {
    return this.#resolveRefChain(
      openApiRef,
      this.#openApiDocumentUri,
      [],
      new Set<string>(),
    );
  }

  #resolveRefChain(
    openApiRef: JsonValue,
    baseRef: string,
    chain: readonly OpenApi3Dot1RefResolutionChainEntry[],
    visitedCanonicalIds: ReadonlySet<string>,
  ): OpenApi3Dot1RefResolutionResult {
    if (!isOpenApi3Dot1ReferenceObject(openApiRef)) {
      return this.#buildFailure(
        chain,
        'Invalid OpenAPI Reference Object: expected an object with a string "$ref" property and optional "summary" and "description" properties',
      );
    }

    const ref: string = openApiRef['$ref'];

    let canonicalUri: Uri;

    try {
      canonicalUri = new Uri(ref, baseRef);
    } catch (_error: unknown) {
      return this.#buildFailure(chain, `Invalid URI: ${ref} Base: ${baseRef}`);
    }

    const canonicalId: string = canonicalUri.toString();
    const nextChain: readonly OpenApi3Dot1RefResolutionChainEntry[] = [
      ...chain,
      {
        $ref: ref,
        canonicalId,
        value: openApiRef,
      },
    ];

    if (visitedCanonicalIds.has(canonicalId)) {
      return this.#buildFailure(
        nextChain,
        `Circular reference detected: ${canonicalId}`,
      );
    }

    const nextVisitedCanonicalIds: Set<string> = new Set(visitedCanonicalIds);

    nextVisitedCanonicalIds.add(canonicalId);

    const documentUri: Uri = Uri.fromAttributes({
      ...canonicalUri.attributes,
      fragment: undefined,
    });

    const document: JsonValue | undefined = this.#tryGetDocument(documentUri);

    if (document === undefined) {
      return this.#buildFailure(
        nextChain,
        `Failed to resolve resource identified by: ${documentUri.toString()}`,
      );
    }

    const fragment: string | undefined = canonicalUri.attributes.fragment;

    let target: JsonValue;

    if (fragment === undefined || fragment === '') {
      target = document;
    } else {
      let decodedFragment: string;

      try {
        decodedFragment = decodeURIComponent(fragment);
      } catch (_error: unknown) {
        return this.#buildFailure(
          nextChain,
          `Invalid URI fragment: ${fragment}`,
        );
      }

      if (decodedFragment.startsWith('/')) {
        const resolvedTarget: JsonValue | undefined = resolveJsonPointer(
          document,
          decodedFragment,
        );

        if (resolvedTarget === undefined) {
          return this.#buildFailure(
            nextChain,
            `Failed to resolve JSON Pointer: ${decodedFragment}`,
          );
        }

        target = resolvedTarget;
      } else {
        return this.#buildFailure(
          nextChain,
          `Invalid fragment: ${decodedFragment} (OpenAPI reference fragments MUST be JSON Pointers)`,
        );
      }
    }

    if (isOpenApi3Dot1ReferenceObject(target)) {
      return this.#resolveRefChain(
        target,
        documentUri.toString(),
        nextChain,
        nextVisitedCanonicalIds,
      );
    }

    return {
      isRight: true,
      value: {
        chain: nextChain,
        value: target,
      },
    };
  }

  #buildFailure(
    chain: readonly OpenApi3Dot1RefResolutionChainEntry[],
    reason: string,
  ): OpenApi3Dot1RefResolutionResult {
    return {
      isRight: false,
      value: {
        reason,
        resolutionContextStack: chain.map(
          (entry: OpenApi3Dot1RefResolutionChainEntry) => ({
            $ref: entry.$ref,
            canonicalId: entry.canonicalId,
          }),
        ),
      },
    };
  }

  #tryGetDocument(documentUri: Uri): JsonValue | undefined {
    const canonicalId: string = documentUri.toString();
    let document: JsonValue | undefined =
      this.#idToDocumentMap.get(canonicalId);

    if (document === undefined) {
      document = this.#resolveId(canonicalId);

      if (document !== undefined) {
        this.#idToDocumentMap.set(canonicalId, document);
      }
    }

    return document;
  }
}
