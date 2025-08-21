import { JsonValue } from '@inversifyjs/json-schema-types';

import { OpenApi3Dot1ServerObject } from './OpenApi3Dot1ServerObject';

// https://github.com/OAI/OpenAPI-Specification/blob/main/versions/3.1.0.md#linkObject
export interface OpenApi3Dot1LinkObject {
  description?: string;
  operationId?: string;
  operationRef?: string;
  parameters?: Record<string, JsonValue>;
  requestBody?: JsonValue;
  server?: OpenApi3Dot1ServerObject;
}
