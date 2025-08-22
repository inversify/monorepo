import {
  JsonSchema,
  JsonSchemaObject,
} from '@inversifyjs/json-schema-types/2020-12';

import { OpenApi3Dot1SchemaObjectBaseVocabulary } from './OpenApi3Dot1SchemaObjectBaseVocabulary';

// https://github.com/OAI/OpenAPI-Specification/blob/main/versions/3.1.0.md#schemaObject
export type OpenApi3Dot1SchemaObject =
  | JsonSchema
  | (JsonSchemaObject & OpenApi3Dot1SchemaObjectBaseVocabulary);
