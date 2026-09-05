import { type JsonValue } from '@inversifyjs/json-schema-types';

export interface BuildOpenApiUriToSchemaMapResult {
  readonly documentBaseUri: string;
  readonly uriToSchemaMap: Map<string, JsonValue>;
}
