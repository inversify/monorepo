import {
  type JsonValue,
  type JsonValueObject,
} from '@inversifyjs/json-schema-types';
import { Uri } from '@inversifyjs/uri';

import { resolveOpenApiDocumentRef } from './resolveOpenApiDocumentRef.js';

export function resolvePathItem(
  pathItem: JsonValue,
  baseUri: string,
  resolveId: (id: string) => JsonValue | undefined,
  visited: Set<string>,
): JsonValueObject | undefined {
  if (!isJsonValueObject(pathItem)) {
    return undefined;
  }

  const ref: JsonValue | undefined = pathItem['$ref'];

  if (typeof ref !== 'string') {
    return pathItem;
  }

  let canonicalUri: Uri;

  try {
    canonicalUri = new Uri(ref, baseUri);
  } catch (_error: unknown) {
    return omitRefProperty(pathItem);
  }

  const canonicalId: string = canonicalUri.toString();

  if (visited.has(canonicalId)) {
    return omitRefProperty(pathItem);
  }

  visited.add(canonicalId);

  const target: JsonValue | undefined = resolveOpenApiDocumentRef(
    ref,
    baseUri,
    resolveId,
  );

  if (target === undefined) {
    return omitRefProperty(pathItem);
  }

  const resolvedTarget: JsonValueObject | undefined = resolvePathItem(
    target,
    getFragmentlessUri(canonicalUri),
    resolveId,
    visited,
  );

  if (resolvedTarget === undefined) {
    return omitRefProperty(pathItem);
  }

  return {
    ...resolvedTarget,
    ...omitRefProperty(pathItem),
  };
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

function omitRefProperty(pathItem: JsonValueObject): JsonValueObject {
  const rest: JsonValueObject = {};

  for (const [key, value] of Object.entries(pathItem)) {
    if (key !== '$ref') {
      rest[key] = value;
    }
  }

  return rest;
}
