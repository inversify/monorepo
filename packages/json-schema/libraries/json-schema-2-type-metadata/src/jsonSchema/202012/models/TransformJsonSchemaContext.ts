import {
  type DynamicScopeEntry,
  type JsonSchemaResolver,
} from '@inversifyjs/json-schema-utils/2020-12';

export interface TransformJsonSchemaContext {
  dynamicScopeEntries?: DynamicScopeEntry[];
  resolver: JsonSchemaResolver;
}
