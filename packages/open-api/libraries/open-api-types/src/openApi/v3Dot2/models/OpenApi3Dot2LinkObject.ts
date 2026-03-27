import { type JsonValue } from '@inversifyjs/json-schema-types';

import { type OpenApi3Dot2ServerObject } from './OpenApi3Dot2ServerObject.js';

// https://github.com/OAI/OpenAPI-Specification/blob/main/versions/3.2.0.md#linkObject
export interface OpenApi3Dot2LinkObject {
  description?: string;
  operationId?: string;
  operationRef?: string;
  parameters?: Record<string, JsonValue>;
  requestBody?: JsonValue;
  server?: OpenApi3Dot2ServerObject;
}
