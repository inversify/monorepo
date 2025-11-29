import { OpenApi3Dot1OauthFlowObjectBase } from './OpenApi3Dot1OauthFlowObjectBase';

// https://github.com/OAI/OpenAPI-Specification/blob/main/versions/3.1.0.md#oauthFlowObject
export interface OpenApi3Dot1OauthFlowObjectAuthorizationCode extends OpenApi3Dot1OauthFlowObjectBase {
  authorizationUrl: string;
  tokenUrl: string;
}
