import { OpenApi3Dot1ReferenceObject } from './OpenApi3Dot1ReferenceObject';
import { OpenApi3Dot1ResponseObject } from './OpenApi3Dot1ResponseObject';

type Digit = '0' | '1' | '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9';
type HttpFirstDigit = '1' | '2' | '3' | '4' | '5';
type HttpWildcardDigit = 'X';

export type HttpStatusCode = `${HttpFirstDigit}${Digit}${Digit}`;
export type HttpStatusCodeWildCard =
  `${HttpFirstDigit}${HttpWildcardDigit}${HttpWildcardDigit}`;

// https://github.com/OAI/OpenAPI-Specification/blob/main/versions/3.1.0.md#responsesObject
export type OpenApi3Dot1ResponsesObject = {
  [statusCode in HttpStatusCode | HttpStatusCodeWildCard]?:
    | OpenApi3Dot1ReferenceObject
    | OpenApi3Dot1ResponseObject;
} & {
  default?: OpenApi3Dot1ReferenceObject | OpenApi3Dot1ResponseObject;
};
