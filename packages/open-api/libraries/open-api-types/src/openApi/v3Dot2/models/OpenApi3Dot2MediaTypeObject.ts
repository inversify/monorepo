import { type JsonValue } from '@inversifyjs/json-schema-types';

import { type OpenApi3Dot2EncodingObject } from './OpenApi3Dot2EncodingObject.js';
import { type OpenApi3Dot2ExampleObject } from './OpenApi3Dot2ExampleObject.js';
import { type OpenApi3Dot2ReferenceObject } from './OpenApi3Dot2ReferenceObject.js';
import { type OpenApi3Dot2SchemaObject } from './OpenApi3Dot2SchemaObject.js';

// https://github.com/OAI/OpenAPI-Specification/blob/main/versions/3.2.0.md#mediaTypeObject
export interface OpenApi3Dot2MediaTypeObject {
  encoding?: Record<string, OpenApi3Dot2EncodingObject>;
  example?: JsonValue;
  examples?: Record<
    string,
    OpenApi3Dot2ExampleObject | OpenApi3Dot2ReferenceObject
  >;
  itemEncoding?: OpenApi3Dot2EncodingObject;
  itemSchema?: OpenApi3Dot2SchemaObject;
  prefixEncoding?: OpenApi3Dot2EncodingObject[];
  schema?: OpenApi3Dot2SchemaObject;
}
