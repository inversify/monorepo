import { type JsonValue } from '@inversifyjs/json-schema-types';

import { type OpenApi3Dot1ExampleObject } from './OpenApi3Dot1ExampleObject.js';
import { type OpenApi3Dot1MediaTypeObject } from './OpenApi3Dot1MediaTypeObject.js';
import { type OpenApi3Dot1ParameterObjectIn } from './OpenApi3Dot1ParameterObjectIn.js';
import { type OpenApi3Dot1ReferenceObject } from './OpenApi3Dot1ReferenceObject.js';
import { type OpenApi3Dot1SchemaObject } from './OpenApi3Dot1SchemaObject.js';

// https://github.com/OAI/OpenAPI-Specification/blob/main/versions/3.1.1.md#parameterObject
export interface OpenApi3Dot1ParameterObject {
  allowEmptyValue?: boolean;
  allowReserved?: boolean;
  content?: Record<string, OpenApi3Dot1MediaTypeObject>;
  deprecated?: boolean;
  description?: string;
  example?: JsonValue;
  examples?: Record<
    string,
    OpenApi3Dot1ExampleObject | OpenApi3Dot1ReferenceObject
  >;
  explode?: boolean;
  in: OpenApi3Dot1ParameterObjectIn;
  name: string;
  required?: boolean;
  schema?: OpenApi3Dot1SchemaObject;
  style?: string;
}
