import { type JsonValue } from '@inversifyjs/json-schema-types';

import { type OpenApi3Dot2ExampleObject } from './OpenApi3Dot2ExampleObject.js';
import { type OpenApi3Dot2MediaTypeObject } from './OpenApi3Dot2MediaTypeObject.js';
import { type OpenApi3Dot2ParameterObjectIn } from './OpenApi3Dot2ParameterObjectIn.js';
import { type OpenApi3Dot2ReferenceObject } from './OpenApi3Dot2ReferenceObject.js';
import { type OpenApi3Dot2SchemaObject } from './OpenApi3Dot2SchemaObject.js';

// https://github.com/OAI/OpenAPI-Specification/blob/main/versions/3.2.0.md#parameterObject
export interface OpenApi3Dot2ParameterObject {
  allowEmptyValue?: boolean;
  allowReserved?: boolean;
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
  in: OpenApi3Dot2ParameterObjectIn;
  name: string;
  required?: boolean;
  schema?: OpenApi3Dot2SchemaObject;
  style?: string;
}
