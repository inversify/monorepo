import {
  type JsonRootSchema,
  type JsonSchema,
} from '@inversifyjs/json-schema-types/2020-12';

import { type ParsedJsonSchemaReference } from '../models/ParsedJsonSchemaReference.js';
import { type TransformJsonSchemaContext } from '../models/TransformJsonSchemaContext.js';
import { type TransformJsonSchemaScope } from '../models/TransformJsonSchemaScope.js';

/**
 * Resolves the schema a reference statically targets, which is the same
 * operation for `$ref` and for the initial target of a `$dynamicRef`.
 *
 * A plain name fragment with no path part is resource relative, so it is
 * resolved against the current resource anchors. A `referenceMap` entry cannot
 * express which resource such a name belongs to, so it is only used as a
 * fallback. Any other form is left entirely to `referenceMap`, since resolving
 * it would require interpreting a URI.
 */
export function resolveJsonSchemaReference(
  reference: ParsedJsonSchemaReference,
  context: TransformJsonSchemaContext,
  scope: TransformJsonSchemaScope,
): JsonRootSchema | JsonSchema | undefined {
  if (reference.isLocal && reference.anchor !== undefined) {
    const anchoredSchema: JsonRootSchema | JsonSchema | undefined =
      scope.resource.dynamicAnchorMap.get(reference.anchor) ??
      scope.resource.anchorMap.get(reference.anchor);

    if (anchoredSchema !== undefined) {
      return anchoredSchema;
    }
  }

  return context.referenceMap.get(reference.value);
}
