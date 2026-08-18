import {
  type JsonRootSchema,
  type JsonSchema,
} from '@inversifyjs/json-schema-types/2020-12';

import { type JsonSchemaResource } from '../models/JsonSchemaResource.js';
import { type TransformJsonSchemaContext } from '../models/TransformJsonSchemaContext.js';
import { type TransformJsonSchemaScope } from '../models/TransformJsonSchemaScope.js';

/**
 * Applies the `$dynamicRef` substitution to a statically resolved target.
 *
 * The substitution only happens when the target is bookended, that is, when
 * the fragment the reference resolved to was created by `$dynamicAnchor`.
 * Otherwise, and when no resource in the dynamic scope declares the name, the
 * target is applied as a `$ref` would apply it.
 */
export function resolveDynamicAnchorSchema(
  anchor: string | undefined,
  initialSchema: JsonRootSchema | JsonSchema,
  context: TransformJsonSchemaContext,
  scope: TransformJsonSchemaScope,
): JsonRootSchema | JsonSchema {
  if (
    anchor === undefined ||
    !isDynamicAnchorSchema(initialSchema, anchor, context)
  ) {
    return initialSchema;
  }

  const outermostResource: JsonSchemaResource | undefined =
    scope.dynamicAnchorBindings.nameToResourceMap.get(anchor);

  if (outermostResource === undefined) {
    return initialSchema;
  }

  return outermostResource.dynamicAnchorMap.get(anchor) ?? initialSchema;
}

function isDynamicAnchorSchema(
  schema: JsonRootSchema | JsonSchema,
  anchor: string,
  context: TransformJsonSchemaContext,
): boolean {
  const resource: JsonSchemaResource | undefined =
    context.resourceMap.get(schema);

  if (resource !== undefined) {
    return resource.dynamicAnchorMap.get(anchor) === schema;
  }

  return typeof schema !== 'boolean' && schema.$dynamicAnchor === anchor;
}
