import { type OpenApi3Dot2HeaderObject } from './OpenApi3Dot2HeaderObject.js';
import { type OpenApi3Dot2LinkObject } from './OpenApi3Dot2LinkObject.js';
import { type OpenApi3Dot2MediaTypeObject } from './OpenApi3Dot2MediaTypeObject.js';
import { type OpenApi3Dot2ReferenceObject } from './OpenApi3Dot2ReferenceObject.js';

// https://github.com/OAI/OpenAPI-Specification/blob/main/versions/3.2.0.md#responseObject
export interface OpenApi3Dot2ResponseObject {
  content?: Record<
    string,
    OpenApi3Dot2MediaTypeObject | OpenApi3Dot2ReferenceObject
  >;
  description?: string;
  headers?: Record<
    string,
    OpenApi3Dot2HeaderObject | OpenApi3Dot2ReferenceObject
  >;
  links?: Record<string, OpenApi3Dot2LinkObject | OpenApi3Dot2ReferenceObject>;
  summary?: string;
}
