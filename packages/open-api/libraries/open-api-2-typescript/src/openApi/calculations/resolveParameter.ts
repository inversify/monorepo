import {
  type JsonValue,
  type JsonValueObject,
} from '@inversifyjs/json-schema-types';
import { Uri } from '@inversifyjs/uri';

import { resolveOpenApiDocumentRef } from './resolveOpenApiDocumentRef.js';

const OPEN_API_REFERENCE_OBJECT_KEYS: ReadonlySet<string> = new Set([
  '$ref',
  'description',
  'summary',
]);

export function resolveParameter(
  value: JsonValue,
  baseUri: string,
  resolveId: (id: string) => JsonValue | undefined,
  visited: Set<string>,
): JsonValueObject | undefined {
  if (!isJsonValueObject(value)) {
    return undefined;
  }

  if (isOpenApiReferenceObject(value)) {
    const ref: string = value['$ref'] as string;
    let canonicalUri: Uri;

    try {
      canonicalUri = new Uri(ref, baseUri);
    } catch (_error: unknown) {
      return undefined;
    }

    const canonicalId: string = canonicalUri.toString();

    if (visited.has(canonicalId)) {
      return undefined;
    }

    visited.add(canonicalId);

    const resolved: JsonValue | undefined = resolveOpenApiDocumentRef(
      ref,
      baseUri,
      resolveId,
    );

    if (resolved === undefined) {
      return undefined;
    }

    return resolveParameter(
      resolved,
      getFragmentlessUri(canonicalUri),
      resolveId,
      visited,
    );
  }

  if (typeof value['in'] === 'string' && typeof value['name'] === 'string') {
    return value;
  }

  return undefined;
}

function getFragmentlessUri(uri: Uri): string {
  return Uri.fromAttributes({
    ...uri.attributes,
    fragment: undefined,
  }).toString();
}

function isJsonValueObject(
  value: JsonValue | undefined,
): value is JsonValueObject {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

function isOpenApiReferenceObject(value: JsonValueObject): boolean {
  return (
    typeof value['$ref'] === 'string' &&
    Object.keys(value).every((key: string) =>
      OPEN_API_REFERENCE_OBJECT_KEYS.has(key),
    )
  );
}
