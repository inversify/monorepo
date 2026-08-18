import {
  type JsonRootSchema,
  type JsonSchema,
} from '@inversifyjs/json-schema-types/2020-12';

export interface BuildTransformJsonSchemaContextParams {
  /**
   * Schemas the transformer is not able to dereference on its own, keyed by
   * the exact `$ref` or `$dynamicRef` value that refers to them. Every value
   * is indexed along with the entry schema.
   */
  referenceMap?: Map<string, JsonRootSchema | JsonSchema>;
  schema: JsonRootSchema | JsonSchema;
}
