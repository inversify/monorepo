import { OpenApi3Dot1OauthFlowsObject } from './OpenApi3Dot1OauthFlowsObject';
import { OpenApi3Dot1SecuritySchemeObjectBase } from './OpenApi3Dot1SecuritySchemeObjectBase';

// https://github.com/OAI/OpenAPI-Specification/blob/main/versions/3.1.0.md#securitySchemeObject
export interface OpenApi3Dot1SecuritySchemeObjectOauth2 extends OpenApi3Dot1SecuritySchemeObjectBase<'oauth2'> {
  flows: OpenApi3Dot1OauthFlowsObject;
}
