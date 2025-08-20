import { OpenApi3Dot1HeaderObject } from './OpenApi3Dot1HeaderObject';
import { OpenApi3Dot1LinkObject } from './OpenApi3Dot1LinkObject';
import { OpenApi3Dot1MediaTypeObject } from './OpenApi3Dot1MediaTypeObject';
import { OpenApi3Dot1ReferenceObject } from './OpenApi3Dot1ReferenceObject';

// https://github.com/OAI/OpenAPI-Specification/blob/main/versions/3.1.0.md#responseObject
export interface OpenApi3Dot1ResponseObject {
  content?: Record<string, OpenApi3Dot1MediaTypeObject>;
  description: string;
  headers?: Record<
    string,
    OpenApi3Dot1HeaderObject | OpenApi3Dot1ReferenceObject
  >;
  links?: Record<string, OpenApi3Dot1LinkObject | OpenApi3Dot1ReferenceObject>;
}
