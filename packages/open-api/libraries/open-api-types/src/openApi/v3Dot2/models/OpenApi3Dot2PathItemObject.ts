import { type OpenApi3Dot2OperationObject } from './OpenApi3Dot2OperationObject.js';
import { type OpenApi3Dot2ParameterObject } from './OpenApi3Dot2ParameterObject.js';
import { type OpenApi3Dot2ReferenceObject } from './OpenApi3Dot2ReferenceObject.js';
import { type OpenApi3Dot2ServerObject } from './OpenApi3Dot2ServerObject.js';

// https://github.com/OAI/OpenAPI-Specification/blob/main/versions/3.2.0.md#pathItemObject
export interface OpenApi3Dot2PathItemObject {
  $ref?: string;
  additionalOperations?: Record<string, OpenApi3Dot2OperationObject>;
  delete?: OpenApi3Dot2OperationObject;
  description?: string;
  get?: OpenApi3Dot2OperationObject;
  head?: OpenApi3Dot2OperationObject;
  options?: OpenApi3Dot2OperationObject;
  parameters?: (OpenApi3Dot2ParameterObject | OpenApi3Dot2ReferenceObject)[];
  patch?: OpenApi3Dot2OperationObject;
  post?: OpenApi3Dot2OperationObject;
  put?: OpenApi3Dot2OperationObject;
  query?: OpenApi3Dot2OperationObject;
  servers?: OpenApi3Dot2ServerObject[];
  summary?: string;
  trace?: OpenApi3Dot2OperationObject;
}
