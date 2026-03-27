import { type OpenApi3Dot2ComponentsObject } from './OpenApi3Dot2ComponentsObject.js';
import { type OpenApi3Dot2ExternalDocumentationObject } from './OpenApi3Dot2ExternalDocumentationObject.js';
import { type OpenApi3Dot2InfoObject } from './OpenApi3Dot2InfoObject.js';
import { type OpenApi3Dot2PathItemObject } from './OpenApi3Dot2PathItemObject.js';
import { type OpenApi3Dot2PathsObject } from './OpenApi3Dot2PathsObject.js';
import { type OpenApi3Dot2ReferenceObject } from './OpenApi3Dot2ReferenceObject.js';
import { type OpenApi3Dot2SecurityRequirementObject } from './OpenApi3Dot2SecurityRequirementObject.js';
import { type OpenApi3Dot2ServerObject } from './OpenApi3Dot2ServerObject.js';
import { type OpenApi3Dot2TagObject } from './OpenApi3Dot2TagObject.js';

// https://github.com/OAI/OpenAPI-Specification/blob/main/versions/3.2.0.md#openapi-object
export interface OpenApi3Dot2Object {
  $self?: string;
  components?: OpenApi3Dot2ComponentsObject;
  externalDocs?: OpenApi3Dot2ExternalDocumentationObject;
  info: OpenApi3Dot2InfoObject;
  jsonSchemaDialect?: string;
  openapi: string;
  paths?: OpenApi3Dot2PathsObject;
  security?: OpenApi3Dot2SecurityRequirementObject[];
  servers?: OpenApi3Dot2ServerObject[];
  tags?: OpenApi3Dot2TagObject[];
  webhooks?: Record<
    string,
    OpenApi3Dot2PathItemObject | OpenApi3Dot2ReferenceObject
  >;
}
