/*
 * Resolves OpenAPI 3.2 Reference Objects per:
 * - https://github.com/OAI/OpenAPI-Specification/blob/main/versions/3.2.0.md#referenceObject
 * - https://github.com/OAI/OpenAPI-Specification/blob/main/versions/3.2.0.md#relativeReferencesInApiDescriptionUris
 *
 * Unlike JsonSchemaResolver, this resolver does not follow JSON Schema
 * keywords ($ref, $dynamicRef, $anchor, $dynamicAnchor) or nested Schema
 * Object `$id` values. It only follows OpenAPI Reference Objects (`$ref`
 * with optional `summary` and `description`) until a non-reference target
 * is reached.
 *
 * A loaded document may declare its URI: OpenAPI Objects via `$self`, and
 * Schema Object documents (at the document root) via `$id`. That URI is the
 * document identity and the RFC 3986 base URI for relative `$ref` values.
 * Relative `$self` / `$id` values are resolved against the retrieval URI.
 *
 * The constructor URI is the entry document's retrieval URI. That document is
 * loaded on `resolveRef` so an invalid `$self` / `$id` fails immediately, and
 * so later lookups by the declared URI find it without `resolveId` knowing the
 * retrieval URI. Other documents are loaded by the URI a `$ref` resolves to,
 * which is the declared `$self` / `$id` when the target document has one.
 */

import { resolveJsonPointer } from '@inversifyjs/json-schema-pointer';
import { type JsonValue } from '@inversifyjs/json-schema-types';
import { Uri } from '@inversifyjs/uri';

import { isOpenApi3Dot2ReferenceObject } from '../calculations/isOpenApi3Dot2ReferenceObject.js';

export interface OpenApi3Dot2RefResolutionContext {
  /** The `$ref` URI exactly as declared in the Reference Object. */
  readonly $ref: string;
  /** The canonical URI of the referenced location. */
  readonly canonicalId: string;
}

export interface OpenApi3Dot2RefResolutionChainEntry extends OpenApi3Dot2RefResolutionContext {
  /** The Reference Object of the hop. */
  readonly value: JsonValue;
}

export interface OpenApi3Dot2RefResolutionFailure {
  readonly resolutionContextStack: readonly OpenApi3Dot2RefResolutionContext[];
  readonly reason: string;
}

export interface OpenApi3Dot2RefResolutionSuccess {
  /** The references followed, in order, from the first hop to the last. */
  readonly chain: readonly OpenApi3Dot2RefResolutionChainEntry[];
  /** The final resolved value. OpenAPI Reference Object chains are fully followed. The value may still be a Schema Object or Path Item Object that uses `$ref` with sibling fields. */
  readonly value: JsonValue;
}

export type OpenApi3Dot2RefResolutionResult =
  | {
      isRight: false;
      value: OpenApi3Dot2RefResolutionFailure;
    }
  | {
      isRight: true;
      value: OpenApi3Dot2RefResolutionSuccess;
    };

interface OpenApi3Dot2DocumentCacheEntry {
  readonly baseUri: string;
  readonly document: JsonValue;
}

type OpenApi3Dot2LoadDocumentResult =
  | {
      isRight: false;
      value: string;
    }
  | {
      isRight: true;
      value: OpenApi3Dot2DocumentCacheEntry | undefined;
    };

type OpenApi3Dot2DocumentBaseUriResult =
  | {
      isRight: false;
      value: string;
    }
  | {
      isRight: true;
      value: string;
    };

export class OpenApi3Dot2Resolver {
  readonly #idToDocumentMap: Map<string, OpenApi3Dot2DocumentCacheEntry>;
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

  public resolveRef(openApiRef: JsonValue): OpenApi3Dot2RefResolutionResult {
    if (!isOpenApi3Dot2ReferenceObject(openApiRef)) {
      return this.#buildFailure(
        [],
        'Invalid OpenAPI Reference Object: expected an object with a string "$ref" property and optional "summary" and "description" properties',
      );
    }

    const entryLoadResult: OpenApi3Dot2LoadDocumentResult = this.#loadDocument(
      new Uri(this.#openApiDocumentUri),
    );

    if (!entryLoadResult.isRight) {
      return this.#buildFailure([], entryLoadResult.value);
    }

    const firstHopBase: string =
      entryLoadResult.value?.baseUri ?? this.#openApiDocumentUri;

    return this.#resolveRefChain(
      openApiRef,
      firstHopBase,
      [],
      new Set<string>(),
    );
  }

  #resolveRefChain(
    openApiRef: JsonValue,
    baseRef: string,
    chain: readonly OpenApi3Dot2RefResolutionChainEntry[],
    visitedCanonicalIds: ReadonlySet<string>,
  ): OpenApi3Dot2RefResolutionResult {
    if (!isOpenApi3Dot2ReferenceObject(openApiRef)) {
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
    const nextChain: readonly OpenApi3Dot2RefResolutionChainEntry[] = [
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

    const loadResult: OpenApi3Dot2LoadDocumentResult =
      this.#loadDocument(documentUri);

    if (!loadResult.isRight) {
      return this.#buildFailure(nextChain, loadResult.value);
    }

    if (loadResult.value === undefined) {
      return this.#buildFailure(
        nextChain,
        `Failed to resolve resource identified by: ${documentUri.toString()}`,
      );
    }

    const document: JsonValue = loadResult.value.document;
    const documentBaseUri: string = loadResult.value.baseUri;

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

    if (isOpenApi3Dot2ReferenceObject(target)) {
      return this.#resolveRefChain(
        target,
        documentBaseUri,
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
    chain: readonly OpenApi3Dot2RefResolutionChainEntry[],
    reason: string,
  ): OpenApi3Dot2RefResolutionResult {
    return {
      isRight: false,
      value: {
        reason,
        resolutionContextStack: chain.map(
          (entry: OpenApi3Dot2RefResolutionChainEntry) => ({
            $ref: entry.$ref,
            canonicalId: entry.canonicalId,
          }),
        ),
      },
    };
  }

  #loadDocument(documentUri: Uri): OpenApi3Dot2LoadDocumentResult {
    const documentId: string = documentUri.toString();
    const cachedEntry: OpenApi3Dot2DocumentCacheEntry | undefined =
      this.#idToDocumentMap.get(documentId);

    if (cachedEntry !== undefined) {
      return {
        isRight: true,
        value: cachedEntry,
      };
    }

    const document: JsonValue | undefined = this.#resolveId(documentId);

    if (document === undefined) {
      return this.#loadEntryDocumentAndRetry(documentId);
    }

    return this.#indexDocument(documentId, document);
  }

  #loadEntryDocumentAndRetry(
    documentId: string,
  ): OpenApi3Dot2LoadDocumentResult {
    if (documentId === this.#openApiDocumentUri) {
      return {
        isRight: true,
        value: undefined,
      };
    }

    const entryLoadResult: OpenApi3Dot2LoadDocumentResult = this.#loadDocument(
      new Uri(this.#openApiDocumentUri),
    );

    if (!entryLoadResult.isRight) {
      return entryLoadResult;
    }

    return {
      isRight: true,
      value: this.#idToDocumentMap.get(documentId),
    };
  }

  #indexDocument(
    loadedId: string,
    document: JsonValue,
  ): OpenApi3Dot2LoadDocumentResult {
    const baseUriResult: OpenApi3Dot2DocumentBaseUriResult =
      this.#resolveDocumentBaseUri(document, loadedId);

    if (!baseUriResult.isRight) {
      return baseUriResult;
    }

    const entry: OpenApi3Dot2DocumentCacheEntry = {
      baseUri: baseUriResult.value,
      document,
    };

    this.#idToDocumentMap.set(loadedId, entry);

    if (entry.baseUri !== loadedId) {
      this.#idToDocumentMap.set(entry.baseUri, entry);
    }

    return {
      isRight: true,
      value: entry,
    };
  }

  #resolveDocumentBaseUri(
    document: JsonValue,
    retrievalUri: string,
  ): OpenApi3Dot2DocumentBaseUriResult {
    if (
      document === null ||
      typeof document !== 'object' ||
      Array.isArray(document)
    ) {
      return {
        isRight: true,
        value: retrievalUri,
      };
    }

    let declaredField: '$id' | '$self';
    let declaredUri: string;

    if (typeof document['$self'] === 'string') {
      declaredField = '$self';
      declaredUri = document['$self'];
    } else if (typeof document['$id'] === 'string') {
      declaredField = '$id';
      declaredUri = document['$id'];
    } else {
      return {
        isRight: true,
        value: retrievalUri,
      };
    }
    try {
      const uri: Uri = new Uri(declaredUri, retrievalUri);

      return {
        isRight: true,
        value: Uri.fromAttributes({
          ...uri.attributes,
          fragment: undefined,
        }).toString(),
      };
    } catch (_error: unknown) {
      return {
        isRight: false,
        value: `Invalid ${declaredField} URI: ${declaredUri}`,
      };
    }
  }
}
