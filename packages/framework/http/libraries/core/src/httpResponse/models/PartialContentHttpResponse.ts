import { HttpStatusCode } from '../../http/models/HttpStatusCode';
import { SuccessHttpResponse } from './SuccessHttpResponse';

export class PartialContentHttpResponse extends SuccessHttpResponse {
  constructor(
    body?: object | string | number | boolean,
    headers?: Record<string, string>,
  ) {
    super(HttpStatusCode.PARTIAL_CONTENT, body, headers);
  }
}
