import { HttpStatusCode } from '../../http/models/HttpStatusCode.js';
import { SuccessHttpResponse } from './SuccessHttpResponse.js';

export class ContentDifferentHttpResponse extends SuccessHttpResponse {
  constructor(
    body?: object | string | number | boolean,
    headers?: Record<string, string>,
  ) {
    super(HttpStatusCode.CONTENT_DIFFERENT, body, headers);
  }
}
