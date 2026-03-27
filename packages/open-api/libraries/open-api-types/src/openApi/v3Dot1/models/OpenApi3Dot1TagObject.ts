import { type OpenApi3Dot1ExternalDocumentationObject } from './OpenApi3Dot1ExternalDocumentationObject.js';

// https://github.com/OAI/OpenAPI-Specification/blob/main/versions/3.1.1.md#tagObject
export interface OpenApi3Dot1TagObject {
  externalDocs?: OpenApi3Dot1ExternalDocumentationObject;
  description?: string;
  name: string;
}
