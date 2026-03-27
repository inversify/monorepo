// https://github.com/OAI/OpenAPI-Specification/blob/main/versions/3.2.0.md#oauthFlowObject
export interface OpenApi3Dot2OauthFlowObjectBase {
  refreshUrl?: string;
  scopes: Record<string, string>;
}
