import { type OpenApi3Dot2HeaderObject } from './OpenApi3Dot2HeaderObject.js';
import { type OpenApi3Dot2ReferenceObject } from './OpenApi3Dot2ReferenceObject.js';

// https://github.com/OAI/OpenAPI-Specification/blob/main/versions/3.2.0.md#encodingObject
export interface OpenApi3Dot2EncodingObject {
  allowReserved?: boolean;
  contentType?: string;
  encoding?: Record<string, OpenApi3Dot2EncodingObject>;
  explode?: boolean;
  headers?: Record<
    string,
    OpenApi3Dot2HeaderObject | OpenApi3Dot2ReferenceObject
  >;
  style?: string;
}
