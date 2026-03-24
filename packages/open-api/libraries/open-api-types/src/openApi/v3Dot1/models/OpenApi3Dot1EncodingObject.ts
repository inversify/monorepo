import { type OpenApi3Dot1HeaderObject } from './OpenApi3Dot1HeaderObject.js';
import { type OpenApi3Dot1ReferenceObject } from './OpenApi3Dot1ReferenceObject.js';

// https://github.com/OAI/OpenAPI-Specification/blob/main/versions/3.1.0.md#encodingObject
export interface OpenApi3Dot1EncodingObject {
  allowReserved?: boolean;
  contentType?: string;
  explode?: boolean;
  headers?: Record<
    string,
    OpenApi3Dot1HeaderObject | OpenApi3Dot1ReferenceObject
  >;
  style?: string;
}
