import { type JsonValue } from '@inversifyjs/json-schema-types';

import { type OpenApi3Dot2DiscriminatorObject } from './OpenApi3Dot2DiscriminatorObject.js';
import { type OpenApi3Dot2ExternalDocumentationObject } from './OpenApi3Dot2ExternalDocumentationObject.js';
import { type OpenApi3Dot2XmlObject } from './OpenApi3Dot2XmlObject.js';

// https://github.com/OAI/OpenAPI-Specification/blob/main/versions/3.2.0.md#baseVocabulary
export interface OpenApi3Dot2SchemaObjectBaseVocabulary {
  discriminator?: OpenApi3Dot2DiscriminatorObject;
  example?: JsonValue;
  externalDocs?: OpenApi3Dot2ExternalDocumentationObject;
  xml?: OpenApi3Dot2XmlObject;
}
