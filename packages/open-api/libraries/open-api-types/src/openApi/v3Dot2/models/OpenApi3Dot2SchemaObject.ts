import {
  type JsonSchema,
  type JsonSchemaObject,
} from '@inversifyjs/json-schema-types/2020-12';

import { type OpenApi3Dot2SchemaObjectBaseVocabulary } from './OpenApi3Dot2SchemaObjectBaseVocabulary.js';

// https://github.com/OAI/OpenAPI-Specification/blob/main/versions/3.2.0.md#schemaObject
export type OpenApi3Dot2SchemaObject =
  | JsonSchema
  | (JsonSchemaObject & OpenApi3Dot2SchemaObjectBaseVocabulary);
