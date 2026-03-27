import { type OpenApi3Dot1SecuritySchemeObjectBase } from './OpenApi3Dot1SecuritySchemeObjectBase.js';

// https://github.com/OAI/OpenAPI-Specification/blob/main/versions/3.1.1.md#securitySchemeObject
export interface OpenApi3Dot1SecuritySchemeObjectOpenIdConnect extends OpenApi3Dot1SecuritySchemeObjectBase<'openIdConnect'> {
  openIdConnectUrl: string;
}
