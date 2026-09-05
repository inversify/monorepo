import { transformJsonSchema } from '@inversifyjs/json-schema-2-type-metadata/2020-12';
import { transformTypeMetadataToTypeScript } from '@inversifyjs/json-schema-2-typescript';
import { type TypeMetadata } from '@inversifyjs/json-schema-type-metadata';
import { type JsonValue } from '@inversifyjs/json-schema-types';
import { type JsonSchema } from '@inversifyjs/json-schema-types/2020-12';
import {
  type DynamicScopeEntry,
  JsonSchemaResolver,
  type TraverseJsonSchemaCallbackParams,
} from '@inversifyjs/json-schema-utils/2020-12';
import { Uri } from '@inversifyjs/uri';

import { buildRootUnionTypeMetadata } from '../calculations/buildRootUnionTypeMetadata.js';
import { collectNamedComponentSchemas } from '../calculations/collectNamedComponentSchemas.js';
import { collectPropertyTypeMetadataChildren } from '../calculations/collectPropertyTypeMetadataChildren.js';
import { getOpenApiComponentSchemas } from '../calculations/getOpenApiComponentSchemas.js';
import { type BuildOpenApiUriToSchemaMapResult } from '../models/BuildOpenApiUriToSchemaMapResult.js';
import { type TransformOpenApiToTypeScriptOptions } from '../models/TransformOpenApiToTypeScriptOptions.js';
import { buildOpenApiUriToSchemaMap } from './buildOpenApiUriToSchemaMap.js';

export function transformOpenApiObjectToTypeScript(
  openApiObject: JsonValue,
  params: {
    declaredDocumentUri?: string | undefined;
    fallbackDocumentUri: string;
    options?: TransformOpenApiToTypeScriptOptions | undefined;
    traverse: (
      document: JsonValue,
      callback: (params: TraverseJsonSchemaCallbackParams) => void,
    ) => void;
  },
): string {
  const document: JsonValue = JSON.parse(
    JSON.stringify(openApiObject),
  ) as JsonValue;
  const namedSchemas: JsonSchema[] = collectNamedComponentSchemas(
    getOpenApiComponentSchemas(document),
  );

  const uriToSchemaMapResult: BuildOpenApiUriToSchemaMapResult =
    buildOpenApiUriToSchemaMap(
      document,
      params.fallbackDocumentUri,
      params.declaredDocumentUri,
      (callback: (params: TraverseJsonSchemaCallbackParams) => void): void => {
        params.traverse(document, callback);
      },
    );
  const documentBaseUri: string = uriToSchemaMapResult.documentBaseUri;
  const uriToSchemaMap: Map<string, JsonValue> =
    uriToSchemaMapResult.uriToSchemaMap;

  const dynamicScopeEntries: DynamicScopeEntry[] = [
    {
      lexicalScope: {
        $canonicalId: new Uri(documentBaseUri),
      },
      resolutionContext: {
        $ref: documentBaseUri,
        isDynamic: false,
      },
    },
  ];

  const namedSchemasHolder: JsonSchema | undefined =
    buildNamedSchemasHolderSchema(namedSchemas);
  const namedTypeMetadata: TypeMetadata[] =
    namedSchemasHolder === undefined
      ? []
      : collectPropertyTypeMetadataChildren(
          transformJsonSchema(namedSchemasHolder, {
            dynamicScopeEntries,
            resolver: new JsonSchemaResolver((id: string) =>
              uriToSchemaMap.get(id),
            ),
          }),
        );

  return transformTypeMetadataToTypeScript(
    buildRootUnionTypeMetadata(namedTypeMetadata),
    params.options,
  );
}

function buildNamedSchemasHolderSchema(
  namedSchemas: JsonSchema[],
): JsonSchema | undefined {
  const firstNamedSchema: JsonSchema | undefined = namedSchemas[0];

  if (firstNamedSchema === undefined) {
    return undefined;
  }

  const properties: Record<string, JsonSchema> = {
    '0': firstNamedSchema,
  };

  for (let index: number = 1; index < namedSchemas.length; index += 1) {
    properties[index.toString()] = namedSchemas[index] as JsonSchema;
  }

  return {
    properties,
    type: 'object',
  };
}
