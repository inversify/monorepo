import { type JsonValue } from '@inversifyjs/json-schema-types';

// https://github.com/OAI/OpenAPI-Specification/blob/main/versions/3.2.0.md#exampleObject
export interface OpenApi3Dot2ExampleObject {
  dataValue?: JsonValue;
  description?: string;
  externalValue?: string;
  serializedValue?: string;
  summary?: string;
  value?: JsonValue;
}
