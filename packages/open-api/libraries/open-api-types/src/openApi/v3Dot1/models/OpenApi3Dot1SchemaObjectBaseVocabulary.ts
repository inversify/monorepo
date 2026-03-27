import { type JsonValue } from '@inversifyjs/json-schema-types';

import { type OpenApi3Dot1DiscriminatorObject } from './OpenApi3Dot1DiscriminatorObject.js';
import { type OpenApi3Dot1ExternalDocumentationObject } from './OpenApi3Dot1ExternalDocumentationObject.js';
import { type OpenApi3Dot1XmlObject } from './OpenApi3Dot1XmlObject.js';

// https://github.com/OAI/OpenAPI-Specification/blob/main/versions/3.1.1.md#baseVocabulary
export interface OpenApi3Dot1SchemaObjectBaseVocabulary {
  discriminator?: OpenApi3Dot1DiscriminatorObject;
  example?: JsonValue;
  externalDocs?: OpenApi3Dot1ExternalDocumentationObject;
  xml?: OpenApi3Dot1XmlObject;
}
