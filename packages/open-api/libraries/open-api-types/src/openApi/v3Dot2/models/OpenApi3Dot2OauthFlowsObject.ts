import { type OpenApi3Dot2OauthFlowObjectAuthorizationCode } from './OpenApi3Dot2OauthFlowObjectAuthorizationCode.js';
import { type OpenApi3Dot2OauthFlowObjectClientCredentials } from './OpenApi3Dot2OauthFlowObjectClientCredentials.js';
import { type OpenApi3Dot2OauthFlowObjectDeviceAuthorization } from './OpenApi3Dot2OauthFlowObjectDeviceAuthorization.js';
import { type OpenApi3Dot2OauthFlowObjectImplicit } from './OpenApi3Dot2OauthFlowObjectImplicit.js';
import { type OpenApi3Dot2OauthFlowObjectPassword } from './OpenApi3Dot2OauthFlowObjectPassword.js';

// https://github.com/OAI/OpenAPI-Specification/blob/main/versions/3.2.0.md#oauthFlowsObject
export interface OpenApi3Dot2OauthFlowsObject {
  authorizationCode?: OpenApi3Dot2OauthFlowObjectAuthorizationCode;
  clientCredentials?: OpenApi3Dot2OauthFlowObjectClientCredentials;
  deviceAuthorization?: OpenApi3Dot2OauthFlowObjectDeviceAuthorization;
  implicit?: OpenApi3Dot2OauthFlowObjectImplicit;
  password?: OpenApi3Dot2OauthFlowObjectPassword;
}
