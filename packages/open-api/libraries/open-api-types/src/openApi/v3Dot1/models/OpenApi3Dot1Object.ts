import { OpenApi3Dot1ComponentsObject } from './OpenApi3Dot1ComponentsObject';
import { OpenApi3Dot1ExternalDocumentationObject } from './OpenApi3Dot1ExternalDocumentationObject';
import { OpenApi3Dot1InfoObject } from './OpenApi3Dot1InfoObject';
import { OpenApi3Dot1PathItemObject } from './OpenApi3Dot1PathItemObject';
import { OpenApi3Dot1PathsObject } from './OpenApi3Dot1PathsObject';
import { OpenApi3Dot1ReferenceObject } from './OpenApi3Dot1ReferenceObject';
import { OpenApi3Dot1SecurityRequirementObject } from './OpenApi3Dot1SecurityRequirementObject';
import { OpenApi3Dot1ServerObject } from './OpenApi3Dot1ServerObject';
import { OpenApi3Dot1TagObject } from './OpenApi3Dot1TagObject';

// https://github.com/OAI/OpenAPI-Specification/blob/main/versions/3.1.0.md#openapi-object
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
