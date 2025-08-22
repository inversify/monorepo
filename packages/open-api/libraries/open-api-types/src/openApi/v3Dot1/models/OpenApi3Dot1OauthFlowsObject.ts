import { OpenApi3Dot1OauthFlowObjectAuthorizationCode } from './OpenApi3Dot1OauthFlowObjectAuthorizationCode';
import { OpenApi3Dot1OauthFlowObjectClientCredentials } from './OpenApi3Dot1OauthFlowObjectClientCredentials';
import { OpenApi3Dot1OauthFlowObjectImplicit } from './OpenApi3Dot1OauthFlowObjectImplicit';
import { OpenApi3Dot1OauthFlowObjectPassword } from './OpenApi3Dot1OauthFlowObjectPassword';

// https://github.com/OAI/OpenAPI-Specification/blob/main/versions/3.1.0.md#oauthFlowsObject
export interface OpenApi3Dot1OauthFlowsObject {
  authorizationCode: OpenApi3Dot1OauthFlowObjectAuthorizationCode;
  clientCredentials: OpenApi3Dot1OauthFlowObjectClientCredentials;
  implicit: OpenApi3Dot1OauthFlowObjectImplicit;
  password: OpenApi3Dot1OauthFlowObjectPassword;
}
