// https://github.com/OAI/OpenAPI-Specification/blob/main/versions/3.2.0.md#serverVariableObject
export interface OpenApi3Dot2ServerVariableObject {
  default: string;
  description?: string;
  enum?: [string, ...string[]];
}
