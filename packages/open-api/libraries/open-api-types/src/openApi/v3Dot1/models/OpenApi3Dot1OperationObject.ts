import { OpenApi3Dot1CallbackObject } from './OpenApi3Dot1CallbackObject';
import { OpenApi3Dot1ExternalDocumentationObject } from './OpenApi3Dot1ExternalDocumentationObject';
import { OpenApi3Dot1ParameterObject } from './OpenApi3Dot1ParameterObject';
import { OpenApi3Dot1ReferenceObject } from './OpenApi3Dot1ReferenceObject';
import { OpenApi3Dot1RequestBodyObject } from './OpenApi3Dot1RequestBodyObject';
import { OpenApi3Dot1ResponsesObject } from './OpenApi3Dot1ResponsesObject';
import { OpenApi3Dot1SecurityRequirementObject } from './OpenApi3Dot1SecurityRequirementObject';
import { OpenApi3Dot1ServerObject } from './OpenApi3Dot1ServerObject';

// https://github.com/OAI/OpenAPI-Specification/blob/main/versions/3.1.0.md#operationObject
export interface OpenApi3Dot1OperationObject {
  callbacks?: Record<
    string,
    OpenApi3Dot1CallbackObject | OpenApi3Dot1ReferenceObject
  >;
  deprecated?: boolean;
  description?: string;
  externalDocs?: OpenApi3Dot1ExternalDocumentationObject;
  operationId?: string;
  parameters?: (OpenApi3Dot1ParameterObject | OpenApi3Dot1ReferenceObject)[];
  requestBody?: OpenApi3Dot1RequestBodyObject | OpenApi3Dot1ReferenceObject;
  responses?: OpenApi3Dot1ResponsesObject;
  security?: OpenApi3Dot1SecurityRequirementObject[];
  servers?: OpenApi3Dot1ServerObject[];
  summary?: string;
  tags?: string[];
}
