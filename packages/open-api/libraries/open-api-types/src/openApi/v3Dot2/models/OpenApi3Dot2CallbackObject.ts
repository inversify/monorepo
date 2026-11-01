import { type OpenApi3Dot2PathItemObject } from './OpenApi3Dot2PathItemObject.js';
import { type OpenApi3Dot2ReferenceObject } from './OpenApi3Dot2ReferenceObject.js';

// https://github.com/OAI/OpenAPI-Specification/blob/main/versions/3.2.0.md#callbackObject
export interface OpenApi3Dot2CallbackObject {
  [expression: string]:
    | OpenApi3Dot2PathItemObject
    | OpenApi3Dot2ReferenceObject;
}
