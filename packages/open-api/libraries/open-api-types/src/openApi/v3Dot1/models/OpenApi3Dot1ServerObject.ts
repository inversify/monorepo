import { OpenApi3Dot1ServerVariableObject } from './OpenApi3Dot1ServerVariableObject';

// https://github.com/OAI/OpenAPI-Specification/blob/main/versions/3.1.0.md#serverObject
export interface OpenApi3Dot1ServerObject {
  description?: string;
  url: string;
  variables?: Record<string, OpenApi3Dot1ServerVariableObject>;
}
