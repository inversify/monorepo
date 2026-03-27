import { type OpenApi3Dot2MediaTypeObject } from './OpenApi3Dot2MediaTypeObject.js';
import { type OpenApi3Dot2ReferenceObject } from './OpenApi3Dot2ReferenceObject.js';

// https://github.com/OAI/OpenAPI-Specification/blob/main/versions/3.2.0.md#requestBodyObject
export interface OpenApi3Dot2RequestBodyObject {
  content: Record<
    string,
    OpenApi3Dot2MediaTypeObject | OpenApi3Dot2ReferenceObject
  >;
  description?: string;
  required?: boolean;
}
