import { type OpenApi3Dot2ExternalDocumentationObject } from './OpenApi3Dot2ExternalDocumentationObject.js';

// https://github.com/OAI/OpenAPI-Specification/blob/main/versions/3.2.0.md#tagObject
export interface OpenApi3Dot2TagObject {
  description?: string;
  externalDocs?: OpenApi3Dot2ExternalDocumentationObject;
  kind?: string;
  name: string;
  parent?: string;
  summary?: string;
}
