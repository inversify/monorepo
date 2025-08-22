import { JsonValue } from '@inversifyjs/json-schema-types';

import { OpenApi3Dot1DiscriminatorObject } from './OpenApi3Dot1DiscriminatorObject';
import { OpenApi3Dot1ExternalDocumentationObject } from './OpenApi3Dot1ExternalDocumentationObject';
import { OpenApi3Dot1XmlObject } from './OpenApi3Dot1XmlObject';

// https://github.com/OAI/OpenAPI-Specification/blob/main/versions/3.1.0.md#baseVocabulary
export interface OpenApi3Dot1SchemaObjectBaseVocabulary {
  discriminator?: OpenApi3Dot1DiscriminatorObject;
  example?: JsonValue;
  externalDocs?: OpenApi3Dot1ExternalDocumentationObject;
  xml?: OpenApi3Dot1XmlObject;
}
