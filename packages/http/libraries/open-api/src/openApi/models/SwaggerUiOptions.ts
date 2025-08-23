export interface SwaggerUiOptions {
  [key: string]: unknown;
  /**
   * @see https://swagger.io/docs/open-source-tools/swagger-ui/usage/oauth2/
   **/
  initOAuth?: {
    clientId?: string;
    clientSecret?: string;
    realm?: string;
    appName?: string;
    scopeSeparator?: string;
    scopes?: string[];
    additionalQueryStringParams?: Record<string, string>;
    useBasicAuthenticationWithAccessCodeGrant?: boolean;
    usePkceWithAuthorizationCodeGrant?: boolean;
  };
  persistAuthorization?: boolean;
}
