import { type OpenApi3Dot1SecuritySchemeObjectApiKey } from './OpenApi3Dot1SecuritySchemeObjectApiKey.js';
import { type OpenApi3Dot1SecuritySchemeObjectHttp } from './OpenApi3Dot1SecuritySchemeObjectHttp.js';
import { type OpenApi3Dot1SecuritySchemeObjectMutualTls } from './OpenApi3Dot1SecuritySchemeObjectMutualTls.js';
import { type OpenApi3Dot1SecuritySchemeObjectOauth2 } from './OpenApi3Dot1SecuritySchemeObjectOauth2.js';
import { type OpenApi3Dot1SecuritySchemeObjectOpenIdConnect } from './OpenApi3Dot1SecuritySchemeObjectOpenIdConnect.js';

// https://github.com/OAI/OpenAPI-Specification/blob/main/versions/3.1.1.md#securitySchemeObject
export type OpenApi3Dot1SecuritySchemeObject =
  | OpenApi3Dot1SecuritySchemeObjectApiKey
  | OpenApi3Dot1SecuritySchemeObjectHttp
  | OpenApi3Dot1SecuritySchemeObjectMutualTls
  | OpenApi3Dot1SecuritySchemeObjectOauth2
  | OpenApi3Dot1SecuritySchemeObjectOpenIdConnect;
