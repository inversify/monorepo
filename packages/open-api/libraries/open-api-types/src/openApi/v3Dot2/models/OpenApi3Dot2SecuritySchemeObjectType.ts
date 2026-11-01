// https://github.com/OAI/OpenAPI-Specification/blob/main/versions/3.2.0.md#securitySchemeObject
export type OpenApi3Dot2SecuritySchemeObjectType =
  | 'apiKey'
  | 'http'
  | 'mutualTLS'
  | 'oauth2'
  | 'openIdConnect';
