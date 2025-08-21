// https://github.com/OAI/OpenAPI-Specification/blob/main/versions/3.1.0.md#securitySchemeObject
export type OpenApi3Dot1SecuritySchemeObjectType =
  | 'apiKey'
  | 'http'
  | 'mutualTLS'
  | 'oauth2'
  | 'openIdConnect';
