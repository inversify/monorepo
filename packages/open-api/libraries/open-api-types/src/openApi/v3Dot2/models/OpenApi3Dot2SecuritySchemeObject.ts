import { type OpenApi3Dot2SecuritySchemeObjectApiKey } from './OpenApi3Dot2SecuritySchemeObjectApiKey.js';
import { type OpenApi3Dot2SecuritySchemeObjectHttp } from './OpenApi3Dot2SecuritySchemeObjectHttp.js';
import { type OpenApi3Dot2SecuritySchemeObjectMutualTls } from './OpenApi3Dot2SecuritySchemeObjectMutualTls.js';
import { type OpenApi3Dot2SecuritySchemeObjectOauth2 } from './OpenApi3Dot2SecuritySchemeObjectOauth2.js';
import { type OpenApi3Dot2SecuritySchemeObjectOpenIdConnect } from './OpenApi3Dot2SecuritySchemeObjectOpenIdConnect.js';

// https://github.com/OAI/OpenAPI-Specification/blob/main/versions/3.2.0.md#securitySchemeObject
export type OpenApi3Dot2SecuritySchemeObject =
  | OpenApi3Dot2SecuritySchemeObjectApiKey
  | OpenApi3Dot2SecuritySchemeObjectHttp
  | OpenApi3Dot2SecuritySchemeObjectMutualTls
  | OpenApi3Dot2SecuritySchemeObjectOauth2
  | OpenApi3Dot2SecuritySchemeObjectOpenIdConnect;
