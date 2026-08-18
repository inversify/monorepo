import {
  type JsonRootSchema,
  type JsonSchema,
} from '@inversifyjs/json-schema-types/2020-12';

/**
 * A JSON Schema resource, as delimited by `$id`.
 *
 * Resources are identified by object identity rather than by their `$id`
 * value: an `$id` is a URI the transformer is not able to resolve, since the
 * document it points at might never be supplied.
 */
export interface JsonSchemaResource {
  anchorMap: Map<string, JsonRootSchema | JsonSchema>;
  dynamicAnchorMap: Map<string, JsonRootSchema | JsonSchema>;
  index: number;
}
