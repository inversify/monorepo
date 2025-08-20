import { JsonValue } from '@inversifyjs/json-schema-types';

import { OpenApi3Dot1EncodingObject } from './OpenApi3Dot1EncodingObject';
import { OpenApi3Dot1ExampleObject } from './OpenApi3Dot1ExampleObject';
import { OpenApi3Dot1ReferenceObject } from './OpenApi3Dot1ReferenceObject';
import { OpenApi3Dot1SchemaObject } from './OpenApi3Dot1SchemaObject';

// https://github.com/OAI/OpenAPI-Specification/blob/main/versions/3.1.0.md#mediaTypeObject
export interface OpenApi3Dot1MediaTypeObject {
  encoding?: Record<string, OpenApi3Dot1EncodingObject>;
  example?: JsonValue;
  examples?: Record<
    string,
    OpenApi3Dot1ExampleObject | OpenApi3Dot1ReferenceObject
  >;
  schema?: OpenApi3Dot1SchemaObject;
}
