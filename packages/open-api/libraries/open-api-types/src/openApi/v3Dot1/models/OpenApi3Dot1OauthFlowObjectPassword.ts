import { type OpenApi3Dot1OauthFlowObjectBase } from './OpenApi3Dot1OauthFlowObjectBase.js';

// https://github.com/OAI/OpenAPI-Specification/blob/main/versions/3.1.1.md#oauthFlowObject
export interface OpenApi3Dot1OauthFlowObjectPassword extends OpenApi3Dot1OauthFlowObjectBase {
  tokenUrl: string;
}
