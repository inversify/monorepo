import {
  type JsonRootSchema,
  type JsonRootSchemaObject,
  type JsonSchema,
  type JsonSchemaObject,
} from '@inversifyjs/json-schema-types/2020-12';
import {
  traverse,
  type TraverseJsonSchemaCallbackParams,
} from '@inversifyjs/json-schema-utils/2020-12';

import { type BuildTransformJsonSchemaContextParams } from '../models/BuildTransformJsonSchemaContextParams.js';
import { type JsonSchemaResource } from '../models/JsonSchemaResource.js';
import { type TransformJsonSchemaContext } from '../models/TransformJsonSchemaContext.js';
import { buildJsonSchemaResource } from './buildJsonSchemaResource.js';

const JSON_POINTER_SEPARATOR: string = '/';

interface JsonSchemaResourceScope {
  jsonPointer: string;
  resource: JsonSchemaResource;
}

/**
 * Builds a context, indexing the entry schema and every schema supplied
 * through `referenceMap` into resources and anchors.
 *
 * Indexing is eager because the `$dynamicRef` bookending rule asks whether a
 * resource declares a name anywhere, including in branches the transformation
 * never reaches.
 */
export function buildTransformJsonSchemaContext(
  params: BuildTransformJsonSchemaContextParams,
): TransformJsonSchemaContext {
  const referenceMap: Map<string, JsonRootSchema | JsonSchema> =
    params.referenceMap ?? new Map<string, JsonRootSchema | JsonSchema>();

  const context: TransformJsonSchemaContext = {
    referenceMap,
    resourceList: [],
    resourceMap: new Map(),
    schemaToBindingsToTypeMap: new Map(),
  };

  indexJsonSchemaDocument(context, params.schema);

  for (const referencedSchema of referenceMap.values()) {
    if (!context.resourceMap.has(referencedSchema)) {
      indexJsonSchemaDocument(context, referencedSchema);
    }
  }

  return context;
}

function indexJsonSchemaDocument(
  context: TransformJsonSchemaContext,
  document: JsonRootSchema | JsonSchema,
): void {
  if (typeof document === 'boolean') {
    return;
  }

  /*
   * Traversal is lexical and depth first, so resource nesting is recovered by
   * popping every scope the current JSON pointer no longer belongs to.
   */
  const resourceScopeStack: JsonSchemaResourceScope[] = [];

  traverse(
    { schema: document },
    (params: TraverseJsonSchemaCallbackParams): void => {
      if (typeof params.schema === 'boolean') {
        return;
      }

      let resourceScope: JsonSchemaResourceScope | undefined =
        resourceScopeStack.at(-1);

      while (
        resourceScope !== undefined &&
        !isJsonPointerInScope(params.jsonPointer, resourceScope.jsonPointer)
      ) {
        resourceScopeStack.pop();

        resourceScope = resourceScopeStack.at(-1);
      }

      if (resourceScope === undefined || params.schema.$id !== undefined) {
        resourceScope = {
          jsonPointer: params.jsonPointer,
          resource: buildJsonSchemaResource(context),
        };

        resourceScopeStack.push(resourceScope);
      }

      indexJsonSchemaNode(context, params.schema, resourceScope.resource);
    },
  );
}

function indexJsonSchemaNode(
  context: TransformJsonSchemaContext,
  schema: JsonRootSchemaObject | JsonSchemaObject,
  resource: JsonSchemaResource,
): void {
  context.resourceMap.set(schema, resource);

  if (schema.$anchor !== undefined) {
    resource.anchorMap.set(schema.$anchor, schema);
  }

  if (schema.$dynamicAnchor !== undefined) {
    resource.dynamicAnchorMap.set(schema.$dynamicAnchor, schema);
  }
}

function isJsonPointerInScope(
  jsonPointer: string,
  scopeJsonPointer: string,
): boolean {
  return (
    jsonPointer === scopeJsonPointer ||
    jsonPointer.startsWith(`${scopeJsonPointer}${JSON_POINTER_SEPARATOR}`)
  );
}
