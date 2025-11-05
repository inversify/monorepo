import { HttpStatusCode } from '../../http/models/HttpStatusCode';
import { SuccessHttpResponse } from './SuccessHttpResponse';

export class OkHttpResponse extends SuccessHttpResponse {
  constructor(
    body?: object | string | number | boolean,
    headers?: Record<string, string>,
  ) {
    super(HttpStatusCode.OK, body, headers);
  }
}
