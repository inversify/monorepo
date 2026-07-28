import { type TypeMetadata } from '@inversifyjs/json-schema-type-metadata';
import {
  type JsonRootSchema,
  type JsonSchema,
} from '@inversifyjs/json-schema-types/2020-12';

export interface TransformJsonSchemaContext {
  jsonSchemaToTypeMap: Map<JsonRootSchema | JsonSchema, TypeMetadata>;
  referenceMap: Map<string, JsonRootSchema | JsonSchema>;
}
