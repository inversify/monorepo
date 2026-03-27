import { type OpenApi3Dot2ServerVariableObject } from './OpenApi3Dot2ServerVariableObject.js';

// https://github.com/OAI/OpenAPI-Specification/blob/main/versions/3.2.0.md#serverObject
export interface OpenApi3Dot2ServerObject {
  description?: string;
  name?: string;
  url: string;
  variables?: Record<string, OpenApi3Dot2ServerVariableObject>;
}
