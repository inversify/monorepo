import { type JsonValue } from '@inversifyjs/json-schema-types';

import { type OpenApi3Dot2ExampleObject } from './OpenApi3Dot2ExampleObject.js';
import { type OpenApi3Dot2MediaTypeObject } from './OpenApi3Dot2MediaTypeObject.js';
import { type OpenApi3Dot2ReferenceObject } from './OpenApi3Dot2ReferenceObject.js';
import { type OpenApi3Dot2SchemaObject } from './OpenApi3Dot2SchemaObject.js';

// https://github.com/OAI/OpenAPI-Specification/blob/main/versions/3.2.0.md#headerObject
export interface OpenApi3Dot2HeaderObject {
  content?: Record<
    string,
    OpenApi3Dot2MediaTypeObject | OpenApi3Dot2ReferenceObject
  >;
  deprecated?: boolean;
  description?: string;
  example?: JsonValue;
  examples?: Record<
    string,
    OpenApi3Dot2ExampleObject | OpenApi3Dot2ReferenceObject
  >;
  explode?: boolean;
  required?: boolean;
  schema?: OpenApi3Dot2SchemaObject;
  style?: string;
}
