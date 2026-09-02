import { type JsonValue } from '@inversifyjs/json-schema-types';
import {
  type JsonRootSchemaObject,
  type JsonSchemaObject,
} from '@inversifyjs/json-schema-types/2020-12';
import { type TraverseJsonSchemaCallbackParams } from '@inversifyjs/json-schema-utils/2020-12';
import { Uri } from '@inversifyjs/uri';

import { getClosestAncestorId } from '../calculations/getClosestAncestorId.js';
import { type BuildOpenApiUriToSchemaMapResult } from '../models/BuildOpenApiUriToSchemaMapResult.js';

export function buildOpenApiUriToSchemaMap(
  openApiObject: JsonValue,
  fallbackDocumentUri: string,
  declaredDocumentUri: string | undefined,
  traverseJsonSchemas: (
    callback: (params: TraverseJsonSchemaCallbackParams) => void,
  ) => void,
): BuildOpenApiUriToSchemaMapResult {
  const uriToSchemaMap: Map<string, JsonValue> = new Map();

  uriToSchemaMap.set('', openApiObject);
  uriToSchemaMap.set(fallbackDocumentUri, openApiObject);

  const documentBaseUri: string = indexDeclaredDocumentUri(
    openApiObject,
    fallbackDocumentUri,
    declaredDocumentUri,
    uriToSchemaMap,
  );

  traverseJsonSchemas((params: TraverseJsonSchemaCallbackParams): void => {
    if (params.schema === true || params.schema === false) {
      return;
    }

    if (!hasId(params.schema)) {
      return;
    }

    const baseId: string = getClosestAncestorId(
      params.rootSchema,
      params.jsonPointer,
      documentBaseUri,
    );
    const idUri: Uri = new Uri(params.schema.$id, baseId);

    uriToSchemaMap.set(
      Uri.fromAttributes({
        ...idUri.attributes,
        fragment: undefined,
      }).toString(),
      params.schema,
    );
  });

  return {
    documentBaseUri,
    uriToSchemaMap,
  };
}

function hasId(
  schema: JsonRootSchemaObject | JsonSchemaObject,
): schema is (JsonRootSchemaObject | JsonSchemaObject) & { $id: string } {
  return schema.$id !== undefined;
}

function indexDeclaredDocumentUri(
  openApiObject: JsonValue,
  fallbackDocumentUri: string,
  declaredDocumentUri: string | undefined,
  uriToSchemaMap: Map<string, JsonValue>,
): string {
  if (declaredDocumentUri === undefined) {
    return fallbackDocumentUri;
  }

  const selfUri: Uri = new Uri(declaredDocumentUri, fallbackDocumentUri);
  const canonicalSelf: string = Uri.fromAttributes({
    ...selfUri.attributes,
    fragment: undefined,
  }).toString();

  uriToSchemaMap.set(canonicalSelf, openApiObject);

  if (declaredDocumentUri !== canonicalSelf) {
    uriToSchemaMap.set(declaredDocumentUri, openApiObject);
  }

  return canonicalSelf;
}
