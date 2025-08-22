import { OpenApi3Dot1MediaTypeObject } from './OpenApi3Dot1MediaTypeObject';

// https://github.com/OAI/OpenAPI-Specification/blob/main/versions/3.1.0.md#requestBodyObject
export interface OpenApi3Dot1RequestBodyObject {
  content: Record<string, OpenApi3Dot1MediaTypeObject>;
  description?: string;
  required?: boolean;
}
