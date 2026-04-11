import {
  type JsonRootSchema,
  type JsonSchema,
} from '@inversifyjs/json-schema-types/2020-12';

export interface TraverseJsonSchemaParams {
  jsonPointer?: string;
  schema: JsonRootSchema | JsonSchema;
}
