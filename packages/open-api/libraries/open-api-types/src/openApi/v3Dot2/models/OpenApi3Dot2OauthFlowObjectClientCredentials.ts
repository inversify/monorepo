import { type OpenApi3Dot2OauthFlowObjectBase } from './OpenApi3Dot2OauthFlowObjectBase.js';

// https://github.com/OAI/OpenAPI-Specification/blob/main/versions/3.2.0.md#oauthFlowObject
export interface OpenApi3Dot2OauthFlowObjectClientCredentials extends OpenApi3Dot2OauthFlowObjectBase {
  tokenUrl: string;
}
