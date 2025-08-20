// https://github.com/OAI/OpenAPI-Specification/blob/main/versions/3.1.0.md#oauthFlowObject
export interface OpenApi3Dot1OauthFlowObjectBase {
  refreshUrl?: string;
  scopes: Record<string, string>;
}
