import {
  type JsonSchema,
  type JsonSchemaObject,
} from '@inversifyjs/json-schema-types/2020-12';

import { type OpenApi3Dot1SchemaObjectBaseVocabulary } from './OpenApi3Dot1SchemaObjectBaseVocabulary.js';

// https://github.com/OAI/OpenAPI-Specification/blob/main/versions/3.1.1.md#schemaObject
export type OpenApi3Dot1SchemaObject =
  | JsonSchema
  | (JsonSchemaObject & OpenApi3Dot1SchemaObjectBaseVocabulary);
