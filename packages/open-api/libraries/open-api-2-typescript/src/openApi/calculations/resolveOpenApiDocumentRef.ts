import { resolveJsonPointer } from '@inversifyjs/json-schema-pointer';
import { type JsonValue } from '@inversifyjs/json-schema-types';
import { Uri } from '@inversifyjs/uri';

export function resolveOpenApiDocumentRef(
  ref: string,
  baseUri: string,
  resolveId: (id: string) => JsonValue | undefined,
): JsonValue | undefined {
  let canonicalUri: Uri;

  try {
    canonicalUri = new Uri(ref, baseUri);
  } catch (_error: unknown) {
    return undefined;
  }

  const documentUri: string = Uri.fromAttributes({
    ...canonicalUri.attributes,
    fragment: undefined,
  }).toString();
  const document: JsonValue | undefined = resolveId(documentUri);

  if (document === undefined) {
    return undefined;
  }

  const fragment: string | undefined = canonicalUri.attributes.fragment;

  if (fragment === undefined || fragment === '') {
    return document;
  }

  let decodedFragment: string;

  try {
    decodedFragment = decodeURIComponent(fragment);
  } catch (_error: unknown) {
    return undefined;
  }

  if (!decodedFragment.startsWith('/')) {
    return undefined;
  }

  try {
    return resolveJsonPointer(document, decodedFragment);
  } catch (_error: unknown) {
    return undefined;
  }
}
