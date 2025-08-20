import { OpenApi3Dot1PathItemObject } from './OpenApi3Dot1PathItemObject';
import { OpenApi3Dot1ReferenceObject } from './OpenApi3Dot1ReferenceObject';

// https://github.com/OAI/OpenAPI-Specification/blob/main/versions/3.1.0.md#callbackObject
export interface OpenApi3Dot1CallbackObject {
  [expression: string]:
    | OpenApi3Dot1PathItemObject
    | OpenApi3Dot1ReferenceObject;
}
