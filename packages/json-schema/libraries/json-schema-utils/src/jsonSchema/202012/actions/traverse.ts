import { escapeJsonPointerFragments } from '@inversifyjs/json-schema-pointer';
import {
  type JsonRootSchemaKnownPropertiesObject,
  type JsonRootSchemaObject,
  type JsonSchema,
} from '@inversifyjs/json-schema-types/2020-12';

import { type TraverseJsonSchemaCallback } from '../models/TraverseJsonSchemaCallback.js';
import { type TraverseJsonSchemaCallbackParams } from '../models/TraverseJsonSchemaCallbackParams.js';
import { type TraverseJsonSchemaCallbackParamsResult } from '../models/TraverseJsonSchemaCallbackParamsResult.js';
import { type TraverseJsonSchemaParams } from '../models/TraverseJsonSchemaParams.js';

type JsonRootSchemaSchemaProperty =
  JsonSchema | JsonSchema[] | Record<string, JsonSchema>;

type JsonRootSchemaSchemaPropertyHandler = (
  params: TraverseJsonSchemaCallbackParams,
  childSchema: JsonRootSchemaSchemaProperty,
  key: string,
  callback: TraverseJsonSchemaCallback,
) => void;

const jsonRootSchemaObjectPropertyToHandlerMap: {
  [TKey in keyof JsonRootSchemaKnownPropertiesObject]?: (
    params: TraverseJsonSchemaCallbackParams,
    childSchema: Exclude<JsonRootSchemaObject[TKey], undefined>,
    key: string,
    callback: TraverseJsonSchemaCallback,
  ) => void;
} = {
  $defs: traverseDirectChildSchemaMap,
  additionalProperties: traverseDirectChildSchema,
  allOf: traverseDirectChildSchemaArray,
  anyOf: traverseDirectChildSchemaArray,
  contains: traverseDirectChildSchema,
  dependentSchemas: traverseDirectChildSchemaMap,
  else: traverseDirectChildSchema,
  if: traverseDirectChildSchema,
  items: traverseDirectChildSchema,
  not: traverseDirectChildSchema,
  oneOf: traverseDirectChildSchemaArray,
  patternProperties: traverseDirectChildSchemaMap,
  prefixItems: traverseDirectChildSchemaArray,
  properties: traverseDirectChildSchemaMap,
  propertyNames: traverseDirectChildSchema,
  then: traverseDirectChildSchema,
  unevaluatedItems: traverseDirectChildSchema,
  unevaluatedProperties: traverseDirectChildSchema,
};

export function traverse(
  params: TraverseJsonSchemaParams,
  callback: TraverseJsonSchemaCallback,
): void {
  traverseJsonSchemaFromParams(
    {
      jsonPointer: params.jsonPointer ?? '',
      rootSchema: params.schema,
      schema: params.schema,
    },
    callback,
  );
}

function traverseJsonSchemaFromParams(
  params: TraverseJsonSchemaCallbackParams,
  callback: TraverseJsonSchemaCallback,
): void {
  const callbackResult: TraverseJsonSchemaCallbackParamsResult =
    callback(params);

  const shouldTraverseChildren: boolean =
    callbackResult.traverseChildren ?? true;

  if (
    shouldTraverseChildren &&
    params.schema !== true &&
    params.schema !== false
  ) {
    for (const key of Object.keys(params.schema)) {
      const handler: JsonRootSchemaSchemaPropertyHandler | undefined =
        jsonRootSchemaObjectPropertyToHandlerMap[
          key as keyof JsonRootSchemaKnownPropertiesObject
        ] as JsonRootSchemaSchemaPropertyHandler | undefined;

      if (handler !== undefined) {
        handler(
          params,
          params.schema[key] as JsonRootSchemaSchemaProperty,
          key,
          callback,
        );
      }
    }
  }
}

function traverseDirectChildSchema(
  params: TraverseJsonSchemaCallbackParams,
  childSchema: JsonSchema,
  key: string,
  callback: TraverseJsonSchemaCallback,
): void {
  const traverseChildSchemaCallbackParams: TraverseJsonSchemaCallbackParams = {
    jsonPointer: `${params.jsonPointer}/${escapeJsonPointerFragments(key)}`,
    rootSchema: params.rootSchema,
    schema: childSchema,
  };

  traverseJsonSchemaFromParams(traverseChildSchemaCallbackParams, callback);
}

function traverseDirectChildSchemaArray(
  params: TraverseJsonSchemaCallbackParams,
  childSchemas: JsonSchema[],
  key: string,
  callback: TraverseJsonSchemaCallback,
): void {
  for (const [index, schema] of childSchemas.entries()) {
    const traverseChildSchemaCallbackParams: TraverseJsonSchemaCallbackParams =
      {
        jsonPointer: `${params.jsonPointer}/${escapeJsonPointerFragments(key)}/${index.toString()}`,
        rootSchema: params.rootSchema,
        schema,
      };

    traverseJsonSchemaFromParams(traverseChildSchemaCallbackParams, callback);
  }
}

function traverseDirectChildSchemaMap(
  params: TraverseJsonSchemaCallbackParams,
  schemasMap: Record<string, JsonSchema>,
  key: string,
  callback: TraverseJsonSchemaCallback,
): void {
  for (const [mapKey, schema] of Object.entries(schemasMap)) {
    const traverseChildSchemaCallbackParams: TraverseJsonSchemaCallbackParams =
      {
        jsonPointer: `${params.jsonPointer}/${escapeJsonPointerFragments(key, mapKey)}`,
        rootSchema: params.rootSchema,
        schema,
      };

    traverseJsonSchemaFromParams(traverseChildSchemaCallbackParams, callback);
  }
}
