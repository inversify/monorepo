import { type OpenApi3Dot2SecuritySchemeObjectBase } from './OpenApi3Dot2SecuritySchemeObjectBase.js';

// https://github.com/OAI/OpenAPI-Specification/blob/main/versions/3.2.0.md#securitySchemeObject
export interface OpenApi3Dot2SecuritySchemeObjectOpenIdConnect extends OpenApi3Dot2SecuritySchemeObjectBase<'openIdConnect'> {
  openIdConnectUrl: string;
}
