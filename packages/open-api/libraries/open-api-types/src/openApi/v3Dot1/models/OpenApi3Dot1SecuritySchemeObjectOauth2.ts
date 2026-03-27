import { type OpenApi3Dot1OauthFlowsObject } from './OpenApi3Dot1OauthFlowsObject.js';
import { type OpenApi3Dot1SecuritySchemeObjectBase } from './OpenApi3Dot1SecuritySchemeObjectBase.js';

// https://github.com/OAI/OpenAPI-Specification/blob/main/versions/3.1.1.md#securitySchemeObject
export interface OpenApi3Dot1SecuritySchemeObjectOauth2 extends OpenApi3Dot1SecuritySchemeObjectBase<'oauth2'> {
  flows: OpenApi3Dot1OauthFlowsObject;
}
