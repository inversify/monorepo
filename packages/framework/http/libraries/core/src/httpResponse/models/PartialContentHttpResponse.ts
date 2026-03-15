import { HttpStatusCode } from '../../http/models/HttpStatusCode.js';
import { SuccessHttpResponse } from './SuccessHttpResponse.js';

export class PartialContentHttpResponse extends SuccessHttpResponse {
  constructor(
    body?: object | string | number | boolean,
    headers?: Record<string, string>,
  ) {
    super(HttpStatusCode.PARTIAL_CONTENT, body, headers);
  }
}
