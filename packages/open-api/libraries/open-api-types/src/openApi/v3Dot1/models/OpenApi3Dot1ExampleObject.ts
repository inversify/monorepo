import { JsonValue } from '@inversifyjs/json-schema-types';

// https://github.com/OAI/OpenAPI-Specification/blob/main/versions/3.1.0.md#exampleObject
export interface OpenApi3Dot1ExampleObject {
  description?: string;
  externalValue?: string;
  summary?: string;
  value?: JsonValue;
}
