import { HttpStatusCode } from '../../http/models/HttpStatusCode.js';
import { SuccessHttpResponse } from './SuccessHttpResponse.js';

export class CreatedHttpResponse extends SuccessHttpResponse {
  constructor(
    body?: object | string | number | boolean,
    headers?: Record<string, string>,
  ) {
    super(HttpStatusCode.CREATED, body, headers);
  }
}
