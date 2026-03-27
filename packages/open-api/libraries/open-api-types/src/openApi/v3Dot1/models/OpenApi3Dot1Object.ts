import { type OpenApi3Dot1ComponentsObject } from './OpenApi3Dot1ComponentsObject.js';
import { type OpenApi3Dot1ExternalDocumentationObject } from './OpenApi3Dot1ExternalDocumentationObject.js';
import { type OpenApi3Dot1InfoObject } from './OpenApi3Dot1InfoObject.js';
import { type OpenApi3Dot1PathItemObject } from './OpenApi3Dot1PathItemObject.js';
import { type OpenApi3Dot1PathsObject } from './OpenApi3Dot1PathsObject.js';
import { type OpenApi3Dot1ReferenceObject } from './OpenApi3Dot1ReferenceObject.js';
import { type OpenApi3Dot1SecurityRequirementObject } from './OpenApi3Dot1SecurityRequirementObject.js';
import { type OpenApi3Dot1ServerObject } from './OpenApi3Dot1ServerObject.js';
import { type OpenApi3Dot1TagObject } from './OpenApi3Dot1TagObject.js';

// https://github.com/OAI/OpenAPI-Specification/blob/main/versions/3.1.1.md#openapi-object
export interface OpenApi3Dot1Object {
  components?: OpenApi3Dot1ComponentsObject;
  externalDocs?: OpenApi3Dot1ExternalDocumentationObject;
  info: OpenApi3Dot1InfoObject;
  jsonSchemaDialect?: string;
  openapi: string;
  paths?: OpenApi3Dot1PathsObject;
  security?: OpenApi3Dot1SecurityRequirementObject[];
  servers?: OpenApi3Dot1ServerObject[];
  tags?: OpenApi3Dot1TagObject[];
  webhooks?: Record<
    string,
    OpenApi3Dot1PathItemObject | OpenApi3Dot1ReferenceObject
  >;
}
