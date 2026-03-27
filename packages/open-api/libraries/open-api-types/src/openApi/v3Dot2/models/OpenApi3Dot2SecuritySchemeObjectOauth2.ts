import { type OpenApi3Dot2OauthFlowsObject } from './OpenApi3Dot2OauthFlowsObject.js';
import { type OpenApi3Dot2SecuritySchemeObjectBase } from './OpenApi3Dot2SecuritySchemeObjectBase.js';

// https://github.com/OAI/OpenAPI-Specification/blob/main/versions/3.2.0.md#securitySchemeObject
export interface OpenApi3Dot2SecuritySchemeObjectOauth2 extends OpenApi3Dot2SecuritySchemeObjectBase<'oauth2'> {
  flows: OpenApi3Dot2OauthFlowsObject;
  oauth2MetadataUrl?: string;
}
