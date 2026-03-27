import { type OpenApi3Dot2CallbackObject } from './OpenApi3Dot2CallbackObject.js';
import { type OpenApi3Dot2ExternalDocumentationObject } from './OpenApi3Dot2ExternalDocumentationObject.js';
import { type OpenApi3Dot2ParameterObject } from './OpenApi3Dot2ParameterObject.js';
import { type OpenApi3Dot2ReferenceObject } from './OpenApi3Dot2ReferenceObject.js';
import { type OpenApi3Dot2RequestBodyObject } from './OpenApi3Dot2RequestBodyObject.js';
import { type OpenApi3Dot2ResponsesObject } from './OpenApi3Dot2ResponsesObject.js';
import { type OpenApi3Dot2SecurityRequirementObject } from './OpenApi3Dot2SecurityRequirementObject.js';
import { type OpenApi3Dot2ServerObject } from './OpenApi3Dot2ServerObject.js';

// https://github.com/OAI/OpenAPI-Specification/blob/main/versions/3.2.0.md#operationObject
export interface OpenApi3Dot2OperationObject {
  callbacks?: Record<
    string,
    OpenApi3Dot2CallbackObject | OpenApi3Dot2ReferenceObject
  >;
  deprecated?: boolean;
  description?: string;
  externalDocs?: OpenApi3Dot2ExternalDocumentationObject;
  operationId?: string;
  parameters?: (OpenApi3Dot2ParameterObject | OpenApi3Dot2ReferenceObject)[];
  requestBody?: OpenApi3Dot2RequestBodyObject | OpenApi3Dot2ReferenceObject;
  responses?: OpenApi3Dot2ResponsesObject;
  security?: OpenApi3Dot2SecurityRequirementObject[];
  servers?: OpenApi3Dot2ServerObject[];
  summary?: string;
  tags?: string[];
}
