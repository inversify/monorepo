import {
  type JsonRootSchema,
  type JsonSchema,
} from '@inversifyjs/json-schema-types/2020-12';

import { type JsonSchemaResource } from '../models/JsonSchemaResource.js';
import { type TransformJsonSchemaContext } from '../models/TransformJsonSchemaContext.js';
import { type TransformJsonSchemaScope } from '../models/TransformJsonSchemaScope.js';
import { extendDynamicAnchorBindings } from './extendDynamicAnchorBindings.js';

/**
 * Derives the scope a schema is transformed in.
 *
 * Every way of reaching a schema is covered by comparing owning resources:
 * descending into an `$id` subschema, following a `$ref` and following a
 * `$dynamicRef` all land here. Schemas the context never indexed keep the
 * current scope.
 */
export function enterJsonSchemaScope(
  schema: JsonRootSchema | JsonSchema,
  context: TransformJsonSchemaContext,
  scope: TransformJsonSchemaScope,
): TransformJsonSchemaScope {
  const resource: JsonSchemaResource | undefined =
    context.resourceMap.get(schema);

  if (resource === undefined || resource === scope.resource) {
    return scope;
  }

  return {
    dynamicAnchorBindings: extendDynamicAnchorBindings(
      scope.dynamicAnchorBindings,
      resource,
    ),
    resource,
  };
}
