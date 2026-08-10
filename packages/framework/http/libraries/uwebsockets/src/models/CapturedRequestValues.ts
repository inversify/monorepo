import { type CapturedRequestBody } from './CapturedRequestBody.js';

export interface CapturedRequestValues {
  body: CapturedRequestBody | undefined;
  caseSensitiveMethod: string | undefined;
  headers: Record<string, string> | undefined;
  method: string | undefined;
  paramNameList: string[] | undefined;
  params: Record<string, string> | undefined;
  query: string | undefined;
  url: string | undefined;
}
