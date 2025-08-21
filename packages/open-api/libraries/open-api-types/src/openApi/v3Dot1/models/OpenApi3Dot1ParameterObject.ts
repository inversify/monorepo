import { JsonValue } from '@inversifyjs/json-schema-types';

import { OpenApi3Dot1ExampleObject } from './OpenApi3Dot1ExampleObject';
import { OpenApi3Dot1MediaTypeObject } from './OpenApi3Dot1MediaTypeObject';
import { OpenApi3Dot1ParameterObjectIn } from './OpenApi3Dot1ParameterObjectIn';
import { OpenApi3Dot1ReferenceObject } from './OpenApi3Dot1ReferenceObject';
import { OpenApi3Dot1SchemaObject } from './OpenApi3Dot1SchemaObject';

// https://github.com/OAI/OpenAPI-Specification/blob/main/versions/3.1.0.md#parameterObject
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
