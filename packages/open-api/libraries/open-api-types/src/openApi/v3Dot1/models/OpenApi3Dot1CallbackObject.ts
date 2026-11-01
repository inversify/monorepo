import { type OpenApi3Dot1PathItemObject } from './OpenApi3Dot1PathItemObject.js';
import { type OpenApi3Dot1ReferenceObject } from './OpenApi3Dot1ReferenceObject.js';

// https://github.com/OAI/OpenAPI-Specification/blob/main/versions/3.1.1.md#callbackObject
export interface OpenApi3Dot1CallbackObject {
  [expression: string]:
    | OpenApi3Dot1PathItemObject
    | OpenApi3Dot1ReferenceObject;
}
