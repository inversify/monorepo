import { type OpenApi3Dot2ReferenceObject } from './OpenApi3Dot2ReferenceObject.js';
import { type OpenApi3Dot2ResponseObject } from './OpenApi3Dot2ResponseObject.js';

type Digit = '0' | '1' | '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9';
type HttpFirstDigit = '1' | '2' | '3' | '4' | '5';
type HttpWildcardDigit = 'X';

export type HttpStatusCode = `${HttpFirstDigit}${Digit}${Digit}`;
export type HttpStatusCodeWildCard =
  `${HttpFirstDigit}${HttpWildcardDigit}${HttpWildcardDigit}`;

// https://github.com/OAI/OpenAPI-Specification/blob/main/versions/3.2.0.md#responsesObject
export type OpenApi3Dot2ResponsesObject = {
  [statusCode in HttpStatusCode | HttpStatusCodeWildCard]?:
    | OpenApi3Dot2ReferenceObject
    | OpenApi3Dot2ResponseObject;
} & {
  default?: OpenApi3Dot2ReferenceObject | OpenApi3Dot2ResponseObject;
};
