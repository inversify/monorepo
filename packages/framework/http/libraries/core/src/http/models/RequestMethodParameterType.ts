export enum RequestMethodParameterType {
  Body = 'body',
  Cookies = 'cookies',
  Custom = 'custom',
  Headers = 'headers',
  Next = 'next',
  Params = 'params',
  Request = 'request',
  Response = 'response',
  Query = 'query',
}

export type CustomRequestMethodParameterType =
  RequestMethodParameterType.Custom;
export type NonCustomRequestMethodParameterType = Exclude<
  RequestMethodParameterType,
  CustomRequestMethodParameterType
>;
