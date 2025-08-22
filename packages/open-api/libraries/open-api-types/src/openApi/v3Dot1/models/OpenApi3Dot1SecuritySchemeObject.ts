import { OpenApi3Dot1SecuritySchemeObjectApiKey } from './OpenApi3Dot1SecuritySchemeObjectApiKey';
import { OpenApi3Dot1SecuritySchemeObjectHttp } from './OpenApi3Dot1SecuritySchemeObjectHttp';
import { OpenApi3Dot1SecuritySchemeObjectMutualTls } from './OpenApi3Dot1SecuritySchemeObjectMutualTls';
import { OpenApi3Dot1SecuritySchemeObjectOpenIdConnect } from './OpenApi3Dot1SecuritySchemeObjectOpenIdConnect';

// https://github.com/OAI/OpenAPI-Specification/blob/main/versions/3.1.0.md#securitySchemeObject
export type OpenApi3Dot1SecuritySchemeObject =
  | OpenApi3Dot1SecuritySchemeObjectApiKey
  | OpenApi3Dot1SecuritySchemeObjectHttp
  | OpenApi3Dot1SecuritySchemeObjectMutualTls
  | OpenApi3Dot1SecuritySchemeObjectOpenIdConnect;
