import { type OpenApi3Dot1OperationObject } from './OpenApi3Dot1OperationObject.js';
import { type OpenApi3Dot1ParameterObject } from './OpenApi3Dot1ParameterObject.js';
import { type OpenApi3Dot1ReferenceObject } from './OpenApi3Dot1ReferenceObject.js';
import { type OpenApi3Dot1ServerObject } from './OpenApi3Dot1ServerObject.js';

// https://github.com/OAI/OpenAPI-Specification/blob/main/versions/3.1.1.md#pathItemObject
export interface OpenApi3Dot1PathItemObject {
  $ref?: string;
  delete?: OpenApi3Dot1OperationObject;
  description?: string;
  get?: OpenApi3Dot1OperationObject;
  head?: OpenApi3Dot1OperationObject;
  options?: OpenApi3Dot1OperationObject;
  parameters?: (OpenApi3Dot1ParameterObject | OpenApi3Dot1ReferenceObject)[];
  patch?: OpenApi3Dot1OperationObject;
  put?: OpenApi3Dot1OperationObject;
  post?: OpenApi3Dot1OperationObject;
  trace?: OpenApi3Dot1OperationObject;
  servers?: OpenApi3Dot1ServerObject[];
  summary?: string;
}
