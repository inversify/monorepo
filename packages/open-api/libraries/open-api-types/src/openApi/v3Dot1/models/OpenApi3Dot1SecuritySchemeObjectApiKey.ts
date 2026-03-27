import { type OpenApi3Dot1SecuritySchemeObjectApiKeyIn } from './OpenApi3Dot1SecuritySchemeObjectApiKeyIn.js';
import { type OpenApi3Dot1SecuritySchemeObjectBase } from './OpenApi3Dot1SecuritySchemeObjectBase.js';

// https://github.com/OAI/OpenAPI-Specification/blob/main/versions/3.1.1.md#securitySchemeObject
export interface OpenApi3Dot1SecuritySchemeObjectApiKey extends OpenApi3Dot1SecuritySchemeObjectBase<'apiKey'> {
  in: OpenApi3Dot1SecuritySchemeObjectApiKeyIn;
  name: string;
}
