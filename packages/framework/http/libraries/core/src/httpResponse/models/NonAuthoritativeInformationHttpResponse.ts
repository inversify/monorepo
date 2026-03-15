import { HttpStatusCode } from '../../http/models/HttpStatusCode.js';
import { SuccessHttpResponse } from './SuccessHttpResponse.js';

export class NonAuthoritativeInformationHttpResponse extends SuccessHttpResponse {
  constructor(
    body?: object | string | number | boolean,
    headers?: Record<string, string>,
  ) {
    super(HttpStatusCode.NON_AUTHORITATIVE_INFORMATION, body, headers);
  }
}
