import { type TypeMetadata } from '@inversifyjs/json-schema-type-metadata';
import {
  type JsonRootSchema,
  type JsonSchema,
} from '@inversifyjs/json-schema-types/2020-12';

import { type JsonSchemaResource } from './JsonSchemaResource.js';

/**
 * Transformation state. Build it with `buildTransformJsonSchemaContext`
 * instead of assembling it by hand: `resourceMap` and `resourceList` are
 * populated by a lexical pre pass over the schemas being indexed.
 *
 * Types are memoized per pair of schema and dynamic anchor bindings key, since
 * a single schema yields a different type per dynamic scope it is reached
 * through.
 */
export interface TransformJsonSchemaContext {
  referenceMap: Map<string, JsonRootSchema | JsonSchema>;
  resourceList: JsonSchemaResource[];
  resourceMap: Map<JsonRootSchema | JsonSchema, JsonSchemaResource>;
  schemaToBindingsToTypeMap: Map<
    JsonRootSchema | JsonSchema,
    Map<string, TypeMetadata>
  >;
}
