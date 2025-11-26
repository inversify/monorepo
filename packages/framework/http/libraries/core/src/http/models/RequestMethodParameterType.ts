export enum RequestMethodParameterType {
  Body = 'body',
  Cookies = 'cookies',
  Custom = 'custom',
  CustomNative = 'customNative',
  Headers = 'headers',
  Next = 'next',
  Params = 'params',
  Request = 'request',
  Response = 'response',
  Query = 'query',
}

export type NonCustomRequestMethodParameterType = Exclude<
  RequestMethodParameterType,
  RequestMethodParameterType.Custom | RequestMethodParameterType.CustomNative
>;
