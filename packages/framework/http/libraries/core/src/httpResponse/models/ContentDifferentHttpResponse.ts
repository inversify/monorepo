import { HttpStatusCode } from '../../http/models/HttpStatusCode';
import { SuccessHttpResponse } from './SuccessHttpResponse';

export class ContentDifferentHttpResponse extends SuccessHttpResponse {
  constructor(
    body?: object | string | number | boolean,
    headers?: Record<string, string>,
  ) {
    super(HttpStatusCode.CONTENT_DIFFERENT, body, headers);
  }
}
