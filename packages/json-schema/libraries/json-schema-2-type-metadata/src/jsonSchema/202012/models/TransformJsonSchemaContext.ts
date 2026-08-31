import { type JsonSchemaResolver } from '@inversifyjs/json-schema-utils/2020-12';

export interface TransformJsonSchemaContext {
  resolver: JsonSchemaResolver;
}
