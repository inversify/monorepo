// https://github.com/OAI/OpenAPI-Specification/blob/main/versions/3.1.1.md#serverVariableObject
export interface OpenApi3Dot1ServerVariableObject {
  enum?: [string, ...string[]];
  default: string;
  description?: string;
}
